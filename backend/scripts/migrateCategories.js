const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Category = require('../models/Category');
const DemoSite = require('../models/DemoSite');

dotenv.config({ path: path.join(__dirname, '../.env') });

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const db = mongoose.connection.db;
    const rawSites = await db.collection('demosites').find().toArray();
    console.log(`Found ${rawSites.length} raw demo sites to migrate.`);

    for (const rawSite of rawSites) {
      const rawCategory = rawSite.category;

      if (!rawCategory) {
        console.log(`- Site "${rawSite.title}" has no category field. Skipping.`);
        continue;
      }

      // Check if it's already a valid ObjectId hex string (24 chars) or ObjectId class
      if (mongoose.Types.ObjectId.isValid(rawCategory) && String(rawCategory).length === 24) {
        const exists = await Category.findById(rawCategory);
        if (exists) {
          console.log(`- Site "${rawSite.title}" already has a valid Category reference (${exists.name}).`);
          continue;
        }
      }

      // If it's a string category name, find/create Category by name
      const categoryName = String(rawCategory).trim();
      if (!categoryName) {
        console.log(`- Site "${rawSite.title}" has empty category string. Skipping.`);
        continue;
      }

      console.log(`- Migrating site "${rawSite.title}" with category name "${categoryName}"...`);
      let categoryDoc = await Category.findOne({ name: new RegExp('^' + categoryName + '$', 'i') });

      if (!categoryDoc) {
        console.log(`  Category "${categoryName}" not found in database. Creating a new Category document.`);
        categoryDoc = await Category.create({
          name: categoryName,
          description: `Automatically created during category hierarchy migration.`,
          parentCategory: null
        });
      }

      // Update directly via raw update to bypass any validation issues before schema transitions
      await db.collection('demosites').updateOne(
        { _id: rawSite._id },
        { $set: { category: categoryDoc._id } }
      );
      console.log(`  Success: Associated "${rawSite.title}" with category ID: ${categoryDoc._id} ("${categoryDoc.name}")`);
    }

    console.log('\nMigration successfully finished!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
