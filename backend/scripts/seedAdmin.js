const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected for seeding...');

    // Clear existing User records
    await User.deleteMany({});
    console.log('Cleared existing user/admin accounts.');

    // Superadmin credentials
    const adminUsername = 'superadmin';
    const adminEmail = 'admin@smartsoft.com';
    const adminPassword = 'adminpassword123';

    // Create Superadmin user
    const superadmin = new User({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
      rawPassword: adminPassword,
      role: 'superadmin',
    });

    await superadmin.save();

    console.log('--------------------------------------------------');
    console.log('Superadmin account seeded successfully!');
    console.log(`Username: ${adminUsername}`);
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Failed to seed Superadmin account:', error.message);
    process.exit(1);
  }
};

seedAdmin();
