const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const HomepageSection = require('../models/HomepageSection');

const updateTitle = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/demo_site_db';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    
    const res = await HomepageSection.updateOne(
      { type: 'categories' },
      { $set: { title: 'Browse demos by category' } }
    );
    
    console.log('MongoDB update query complete. Match count:', res.matchedCount, 'Modified count:', res.modifiedCount);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

updateTitle();
