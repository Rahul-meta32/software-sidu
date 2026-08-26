const mongoose = require('mongoose');

const HomepageSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a section title'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please provide a section type'],
      enum: ['hero', 'categories', 'horizontal_showcase', 'statistics_highlights', 'featured_grid'],
    },
    buttonText: {
      type: String,
      trim: true,
    },
    buttonLink: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DemoSite',
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HomepageSection', HomepageSectionSchema);
