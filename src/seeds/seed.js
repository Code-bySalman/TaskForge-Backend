import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskforge');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@taskforge.com',
      password: 'password123',
      role: 'admin',
    });

    const member1 = await User.create({
      name: 'Salman Usmani',
      email: 'salman@taskforge.com',
      password: 'password123',
      role: 'member',
    });

    const member2 = await User.create({
      name: 'Albert6 Turd',
      email: 'jane@taskforge.com',
      password: 'password123',
      role: 'member',
    });

    console.log('Created users');

    // Create projects
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Redesign company website with modern UI/UX',
      admin: admin._id,
      members: [admin._id, member1._id, member2._id],
    });

    const project2 = await Project.create({
      name: 'Mobile App Development',
      description: 'Develop cross-platform mobile application',
      admin: admin._id,
      members: [admin._id, member1._id],
    });

    console.log('Created projects');

    // Create tasks
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    await Task.create([
      {
        title: 'Design mockups',
        description: 'Create UI mockups for homepage',
        project: project1._id,
        assignedTo: member1._id,
        status: 'in-progress',
        dueDate: tomorrow,
      },
      {
        title: 'Frontend implementation',
        description: 'Implement responsive design',
        project: project1._id,
        assignedTo: member2._id,
        status: 'todo',
        dueDate: nextWeek,
      },
      {
        title: 'Backend API',
        description: 'Set up backend API endpoints',
        project: project1._id,
        assignedTo: member1._id,
        status: 'done',
        dueDate: lastWeek,
      },
      {
        title: 'App architecture',
        description: 'Design app architecture and tech stack',
        project: project2._id,
        assignedTo: member1._id,
        status: 'in-progress',
        dueDate: tomorrow,
      },
      {
        title: 'Database schema',
        description: 'Design database schema',
        project: project2._id,
        assignedTo: member1._id,
        status: 'todo',
        dueDate: nextWeek,
      },
      {
        title: 'Authentication system',
        description: 'Implement user authentication',
        project: project2._id,
        assignedTo: member1._id,
        status: 'todo',
        dueDate: lastWeek,
      },
    ]);

    console.log('Created tasks');

    console.log('Database seeded successfully!');
    console.log('\nTest User Credentials:');
    console.log('Admin - Email: admin@taskforge.com, Password: password123');
    console.log('Member - Email: salman@taskforge.com, Password: password123');
    console.log('Member - Email: jane@taskforge.com, Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
