import { validationResult } from 'express-validator';
import Project from '../models/Project.js';
import User from '../models/User.js';

export const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, members } = req.body;
    const adminId = req.userId;

    // Create project
    const project = new Project({
      name,
      description,
      admin: adminId,
      members: [adminId, ...(members || [])],
    });

    await project.save();
    await project.populate(['admin', 'members']);

    res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const userId = req.userId;

    // Get projects where user is admin or member
    const projects = await Project.find({
      $or: [{ admin: userId }, { members: userId }],
    }).populate(['admin', 'members']);

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const project = await Project.findById(projectId).populate(['admin', 'members']);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is admin or member
    const isMember =
      project.admin._id.toString() === userId || project.members.some((m) => m._id.toString() === userId);

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;
    const userId = req.userId;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.admin.toString() !== userId) {
      return res.status(403).json({ message: 'Only admin can update project' });
    }

    project.name = name || project.name;
    project.description = description || project.description;

    await project.save();
    await project.populate(['admin', 'members']);

    res.json({
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.admin.toString() !== userId) {
      return res.status(403).json({ message: 'Only admin can delete project' });
    }

    await Project.findByIdAndDelete(projectId);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { memberId } = req.body;
    const userId = req.userId;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.admin.toString() !== userId) {
      return res.status(403).json({ message: 'Only admin can add members' });
    }

    if (project.members.includes(memberId)) {
      return res.status(400).json({ message: 'Member already in project' });
    }

    project.members.push(memberId);
    await project.save();
    await project.populate(['admin', 'members']);

    res.json({
      message: 'Member added successfully',
      project,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const userId = req.userId;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.admin.toString() !== userId) {
      return res.status(403).json({ message: 'Only admin can remove members' });
    }

    if (!project.members.includes(memberId)) {
      return res.status(400).json({ message: 'Member not in project' });
    }

    project.members = project.members.filter((m) => m.toString() !== memberId);
    await project.save();
    await project.populate(['admin', 'members']);

    res.json({
      message: 'Member removed successfully',
      project,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
