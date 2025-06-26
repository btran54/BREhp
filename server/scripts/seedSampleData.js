const mongoose = require('mongoose');
const Ship = require('../models/Ships');
const Auxiliary = require('../models/Auxiliary');
const Augment = require('../models/Augments');
require('dotenv').config();

const sampleShips = [
  {
    name: "Mutsuki",
    hp: 1688,
    eva: 250,
    lck: 35,
    lvl: 125,
    rarity: "Common",
    shipType: "DD",
    faction: "Sakura Empire",
    isRetrofit: false
  },
  {
    name: "Kamikaze", 
    hp: 1764,
    eva: 250,
    lck: 86,
    lvl: 125,
    rarity: "Common",
    shipType: "DD", 
    faction: "Sakura Empire",
    isRetrofit: false
  },
  {
    name: "Enterprise",
    hp: 6500,
    eva: 120,
    lck: 75,
    lvl: 125,
    rarity: "Super Rare",
    shipType: "CV",
    faction: "Eagle Union",
    isRetrofit: false
  }
];

const sampleAuxiliary = [
  {
    name: "Repair Toolkit",
    hp: 500,
    heal: 0.05,
    eva: 0,
    lck: 0,
    rarity: "T3",
    category: "Defensive"
  },
  {
    name: "550 HP Aux",
    hp: 550,
    heal: 0,
    eva: 0,
    lck: 0,
    rarity: "T3", 
    category: "Defensive"
  },
  {
    name: "Anti-Air Radar",
    hp: 0,
    heal: 0,
    eva: 12,
    lck: 0,
    rarity: "T2",
    category: "Defensive"
  }
];

const sampleAugments = [
  {
    name: "Hammer",
    hp: 0,
    eva: 0,
    lck: 0,
    rarity: "T1"
  },
  {
    name: "Dual Swords", 
    hp: 0,
    eva: 15,
    lck: 0,
    rarity: "T2"
  },
  {
    name: "Shield",
    hp: 200,
    eva: 0,
    lck: 0,
    rarity: "T3"
  }
];

async function seedSampleData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    console.log('Clearing existing data...');
    await Ship.deleteMany({});
    await Auxiliary.deleteMany({});
    await Augment.deleteMany({});
    
    console.log('Inserting sample ships...');
    await Ship.insertMany(sampleShips);
    
    console.log('Inserting sample auxiliary...');
    await Auxiliary.insertMany(sampleAuxiliary);
    
    console.log('Inserting sample augments...');
    await Augment.insertMany(sampleAugments);
    
    console.log('\n✅ Sample data seeded successfully!');
    console.log(`📊 Inserted ${sampleShips.length} ships`);
    console.log(`🔧 Inserted ${sampleAuxiliary.length} auxiliary items`);
    console.log(`⚔️ Inserted ${sampleAugments.length} augments`);
    console.log('\n🚀 Your infrastructure is ready! Frontend should now pull from MongoDB.');
    console.log('💡 Later you can replace this data by parsing your CSV files.');
    
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedSampleData();