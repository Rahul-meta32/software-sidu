const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const DemoSite = require('../models/DemoSite');
const HomepageSection = require('../models/HomepageSection');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkSections = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');
    const sections = await HomepageSection.find().populate('items');
    console.log('Total sections:', sections.length);
    sections.forEach((sec, index) => {
      console.log(`\nSection #${index + 1}:`);
      console.log('ID:', sec._id);
      console.log('Title:', sec.title);
      console.log('Type:', sec.type);
      console.log('Items Count:', sec.items ? sec.items.length : 0);
      if (sec.items) {
        sec.items.forEach(item => {
          console.log(`  - Item: ${item.title} (ID: ${item._id}), Images:`, item.images);
        });
      }
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkSections();
