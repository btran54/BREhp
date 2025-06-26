// server/scripts/importFromJSON.js
// Script to import your existing JSON data

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Ship = require('../models/Ship');
const Auxiliary = require('../models/Auxiliary');
const Augment = require('../models/Augment');
require('dotenv').config();

// Function to map your existing data structure to new schema
function mapShipData(oldShip) {
  return {
    name: oldShip.Name || oldShip.name,
    hp: parseInt(oldShip.HP || oldShip.hp),
    eva: parseInt(oldShip.EVA || oldShip.eva),
    lck: parseInt(oldShip.LCK || oldShip.lck),
    lvl: parseInt(oldShip.LVL || oldShip.lvl) || 125,
    // You'll need to add these fields or derive them from your data
    rarity: oldShip.Rarity || oldShip.rarity || 'Unknown',
    shipType: oldShip.Type || oldShip.shipType || oldShip.Hull || 'Unknown',
    faction: oldShip.Faction || oldShip.faction || 'Unknown',
    isRetrofit: oldShip.Retrofit || oldShip.isRetrofit || false
  };
}

function mapAuxiliaryData(oldAux) {
  return {
    name: oldAux.Name || oldAux.name,
    hp: parseInt(oldAux.HP || oldAux.hp) || 0,
    heal: parseFloat(oldAux.HEAL || oldAux.heal) || 0,
    eva: parseInt(oldAux.EVA || oldAux.eva) || 0,
    lck: parseInt(oldAux.LCK || oldAux.lck) || 0,
    rarity: oldAux.Rarity || oldAux.rarity || 'T1',
    category: oldAux.Category || oldAux.category || 'Support'
  };
}

function mapAugmentData(oldAug) {
  return {
    name: oldAug.Name || oldAug.name,
    hp: parseInt(oldAug.HP || oldAug.hp) || 0,
    eva: parseInt(oldAug.EVA || oldAug.eva) || 0,
    lck: parseInt(oldAug.LCK || oldAug.lck) || 0,
    rarity: oldAug.Rarity || oldAug.rarity || 'T1'
  };
}

async function importExistingData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Path to your existing JSON files (adjust these paths based on your actual file names)
    const jsonPath = path.join(__dirname, '../../json');
    
    // Try to read common file names - adjust these based on your actual files
    const possibleShipFiles = ['Ships.json', 'ships.json', 'ship_data.json'];
    const possibleAuxFiles = ['Auxiliary.json', 'auxiliary.json', 'aux_data.json'];
    const possibleAugFiles = ['Augments.json', 'augments.json', 'augment_data.json'];
    
    // Import Ships
    let shipsImported = 0;
    for (const fileName of possibleShipFiles) {
      const filePath = path.join(jsonPath, fileName);
      if (fs.existsSync(filePath)) {
        console.log(`Found ship data file: ${fileName}`);
        const rawData = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(rawData);
        
        // Handle different JSON structures
        let shipsData = jsonData;
        if (jsonData.Ships) shipsData = jsonData.Ships;
        if (jsonData.ships) shipsData = jsonData.ships;
        if (Array.isArray(jsonData)) shipsData = jsonData;
        
        console.log(`Processing ${shipsData.length} ships...`);
        
        // Clear existing ships
        await Ship.deleteMany({});
        
        // Map and insert ships in batches
        const batchSize = 100;
        for (let i = 0; i < shipsData.length; i += batchSize) {
          const batch = shipsData.slice(i, i + batchSize).map(mapShipData);
          await Ship.insertMany(batch, { ordered: false });
          console.log(`Imported ships batch ${Math.floor(i/batchSize) + 1}`);
        }
        
        shipsImported = shipsData.length;
        break;
      }
    }
    
    // Import Auxiliary
    let auxImported = 0;
    for (const fileName of possibleAuxFiles) {
      const filePath = path.join(jsonPath, fileName);
      if (fs.existsSync(filePath)) {
        console.log(`Found auxiliary data file: ${fileName}`);
        const rawData = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(rawData);
        
        let auxData = jsonData;
        if (jsonData.Auxiliary) auxData = jsonData.Auxiliary;
        if (jsonData.auxiliary) auxData = jsonData.auxiliary;
        if (Array.isArray(jsonData)) auxData = jsonData;
        
        await Auxiliary.deleteMany({});
        const mappedAux = auxData.map(mapAuxiliaryData);
        await Auxiliary.insertMany(mappedAux);
        auxImported = mappedAux.length;
        break;
      }
    }
    
    // Import Augments
    let augImported = 0;
    for (const fileName of possibleAugFiles) {
      const filePath = path.join(jsonPath, fileName);
      if (fs.existsSync(filePath)) {
        console.log(`Found augment data file: ${fileName}`);
        const rawData = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(rawData);
        
        let augData = jsonData;
        if (jsonData.Augments) augData = jsonData.Augments;
        if (jsonData.augments) augData = jsonData.augments;
        if (Array.isArray(jsonData)) augData = jsonData;
        
        await Augment.deleteMany({});
        const mappedAug = augData.map(mapAugmentData);
        await Augment.insertMany(mappedAug);
        augImported = mappedAug.length;
        break;
      }
    }
    
    console.log('\n=== Import Summary ===');
    console.log(`Ships imported: ${shipsImported}`);
    console.log(`Auxiliary imported: ${auxImported}`);
    console.log(`Augments imported: ${augImported}`);
    console.log('Import completed successfully!');
    
  } catch (error) {
    console.error('Import error:', error);
    
    // If the error is about missing fields, let's show what the data looks like
    if (error.message.includes('validation')) {
      console.log('\nSample data structure needed:');
      console.log('Ships should have: name, hp, eva, lck, lvl, rarity, shipType, faction');
      console.log('Auxiliary should have: name, hp, heal, eva, lck, rarity, category');
      console.log('Augments should have: name, hp, eva, lck, rarity');
    }
  } finally {
    await mongoose.disconnect();
  }
}

// Helper function to inspect your JSON structure
function inspectJSONFiles() {
  const jsonPath = path.join(__dirname, '../../json');
  const files = fs.readdirSync(jsonPath);
  
  console.log('=== JSON Files Found ===');
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(jsonPath, file);
      const rawData = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(rawData);
      
      console.log(`\nFile: ${file}`);
      console.log('Structure:', Object.keys(jsonData));
      
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        console.log('First item keys:', Object.keys(jsonData[0]));
        console.log('Sample item:', jsonData[0]);
      } else if (typeof jsonData === 'object') {
        Object.keys(jsonData).forEach(key => {
          if (Array.isArray(jsonData[key])) {
            console.log(`${key}: Array with ${jsonData[key].length} items`);
            if (jsonData[key].length > 0) {
              console.log(`First ${key} item:`, jsonData[key][0]);
            }
          }
        });
      }
    }
  });
}

// Command line usage
if (process.argv[2] === 'inspect') {
  inspectJSONFiles();
} else {
  importExistingData();
}

module.exports = { importExistingData, inspectJSONFiles };