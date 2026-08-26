const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Category = require('../models/Category');
const DemoSite = require('../models/DemoSite');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');
    
    const categories = await Category.find();
    console.log('\n--- Categories ---');
    console.log('Count:', categories.length);
    categories.forEach(c => {
      console.log(`- ID: ${c._id}, Name: "${c.name}", Parent: ${c.parent || 'null'}`);
    });

    const sites = await DemoSite.find();
    console.log('\n--- Demo Sites Categories ---');
    console.log('Count:', sites.length);
    sites.forEach(s => {
      console.log(`- Title: "${s.title}", Category string: "${s.category}"`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkCategories();
