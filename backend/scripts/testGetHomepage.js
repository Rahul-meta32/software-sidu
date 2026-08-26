const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const DemoSite = require('../models/DemoSite');
const Category = require('../models/Category');

dotenv.config({ path: path.join(__dirname, '../.env') });

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB.');
    
    // Find all demo sites
    const sites = await DemoSite.find().lean();
    console.log('\n--- Raw sites in DB ---');
    for (const s of sites) {
      console.log(`Site: "${s.title}", Category Field:`, s.category, `(Type: ${typeof s.category})`);
      if (s.category) {
        const cat = await Category.findById(s.category);
        console.log(`  -> Found associated Category:`, cat ? `"${cat.name}" (ID: ${cat._id})` : 'NOT FOUND');
      }
    }

    // Try to populate
    const populated = await DemoSite.find().populate('category');
    console.log('\n--- Populated sites in Mongoose ---');
    populated.forEach(s => {
      console.log(`Site: "${s.title}", Populated Category:`, s.category ? `"${s.category.name}"` : 'null');
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

test();
