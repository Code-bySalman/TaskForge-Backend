import { validationResult } from 'express-validator';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;
    const { title, description, assignedTo, dueDate } = req.body;
    const userId = req.userId;

    // Verify user is admin of project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.admin.toString() !== userId) {
      return res.status(403).json({ message: 'Only admin can create tasks' });
    }

    // Create task
    const task = new Task({
      title,
      description,
      project: projectId,
      assignedTo,
      dueDate,
      status: 'todo',
    });

    await task.save();
    await task.populate(['project', 'assignedTo']);

    res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    // Verify user is member of project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember =
      project.admin.toString() === userId ||
      project.members.some((m) => m.toString() === userId);

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ project: projectId }).populate(['project', 'assignedTo']);

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, assignedTo, dueDate } = req.body;
    const userId = req.userId;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);

    // Check if user is admin or assigned member
    const isAdmin = project.admin.toString() === userId;
    const isAssigned = task.assignedTo && task.assignedTo.toString() === userId;

    // Admin can update anything, members can only update status
    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!isAdmin && isAssigned) {
      // Member can only update status
      task.status = status || task.status;
    } else {
      // Admin can update everything
      task.title = title || task.title;
      task.description = description !== undefined ? description : task.description;
      task.status = status || task.status;
      task.assignedTo = assignedTo || task.assignedTo;
      task.dueDate = dueDate || task.dueDate;
    }

    await task.save();
    await task.populate(['project', 'assignedTo']);

    res.json({
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (project.admin.toString() !== userId) {
      return res.status(403).json({ message: 'Only admin can delete tasks' });
    }

    await Task.findByIdAndDelete(taskId);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all projects user is part of
    const projects = await Project.find({
      $or: [{ admin: userId }, { members: userId }],
    });

    const projectIds = projects.map((p) => p._id);

    // Get all tasks for these projects
    const allTasks = await Task.find({ project: { $in: projectIds } });

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.status === 'done').length;
    const pendingTasks = allTasks.filter((t) => t.status !== 'done').length;

    // Get overdue tasks
    const now = new Date();
    const overdueTasks = allTasks.filter(
      (t) => t.dueDate && t.dueDate < now && t.status !== 'done'
    );

    // Group tasks by status
    const tasksByStatus = {
      todo: allTasks.filter((t) => t.status === 'todo').length,
      'in-progress': allTasks.filter((t) => t.status === 'in-progress').length,
      done: allTasks.filter((t) => t.status === 'done').length,
    };

    res.json({
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks: overdueTasks.length,
        tasksByStatus,
      },
      overdueTasks: await Task.find({ project: { $in: projectIds }, dueDate: { $lt: now }, status: { $ne: 'done' } })
        .populate(['project', 'assignedTo'])
        .sort({ dueDate: 1 }),
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
