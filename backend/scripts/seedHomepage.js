const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const DemoSite = require('../models/DemoSite');
const HomepageSection = require('../models/HomepageSection');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedHomepage = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for homepage seeding...');

    // Clear existing sections
    await HomepageSection.deleteMany({});
    console.log('Cleared existing homepage sections.');

    // Fetch existing demo sites
    let sites = await DemoSite.find();
    console.log(`Found ${sites.length} existing demo sites.`);

    // If no sites exist, seed some mock records so the site looks gorgeous
    if (sites.length < 6) {
      console.log('Seeding mock Demo Sites first...');
      const mockSites = [
        {
          title: 'SmartSoft Software Commerce Gateway',
          description: 'A cutting-edge decentralized storefront supporting multichain smart contract wallets, gasless transactions, and dynamic Web3 product tokenization structures.',
          images: [],
          video: null,
          liveDemoLink: 'https://metablocktech.com',
        },
        {
          title: 'Vibrant Pharmacy Admin Portal',
          description: 'Secure dashboard with granular HIPAA compliant access logs, live temperature IoT drug shipment maps, and real-time inventory threshold alerts.',
          images: [],
          video: null,
          liveDemoLink: 'https://metablocktech.com',
        },
        {
          title: 'SaaS Finance & Accounting Hub',
          description: 'A financial platform for modern startups offering automated invoice reconciliation, ledger syncing, and predictive cashflow visualizations.',
          images: [],
          video: null,
          liveDemoLink: 'https://metablocktech.com',
        },
        {
          title: '3D Metaverse Virtual Gallery',
          description: 'An interactive virtual real estate showroom built using Three.js and WebGL, allowing clients to preview volumetric spatial layouts on web browsers.',
          images: [],
          video: null,
          liveDemoLink: 'https://metablocktech.com',
        },
        {
          title: 'AI Smart Health Diagnostics Dashboard',
          description: 'Enterprise healthcare portal integrating patient vitals monitoring, machine learning clinical triage assistants, and end-to-end encrypted telehealth pipelines.',
          images: [],
          video: null,
          liveDemoLink: 'https://metablocktech.com',
        },
        {
          title: 'Next-Gen Logistics Freight Manager',
          description: 'Real-time supply chain optimizer orchestrating cargo routing algorithms, weather disruption triggers, and automated bill of lading generation.',
          images: [],
          video: null,
          liveDemoLink: 'https://metablocktech.com',
        }
      ];

      sites = await DemoSite.insertMany(mockSites);
      console.log(`Successfully seeded ${sites.length} mock demo sites.`);
    }

    // Assign IDs for sections
    const siteIds = sites.map(s => s._id);

    // Create default homepage sections
    const defaultSections = [
      {
        title: 'Professional SmartSoft Themes & Website Templates for any project',
        subtitle: 'Discover thousands of easy to customize themes, templates & CMS products, made by world-class developers.',
        type: 'hero',
        order: 1,
        items: [],
      },
      {
        title: 'Browse demos by category',
        subtitle: 'Explore elite site categories populated dynamically from our portfolio database.',
        type: 'categories',
        order: 2,
        items: [],
      },
      {
        title: 'Featured Software',
        subtitle: 'Every week, our staff personally hand-pick some of the best new website themes from our collection.',
        type: 'featured_grid',
        items: siteIds.slice(0, 6),
        order: 3,
      }
    ];

    await HomepageSection.insertMany(defaultSections);
    console.log('Homepage sections seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Homepage seeding error:', error);
    process.exit(1);
  }
};

seedHomepage();
