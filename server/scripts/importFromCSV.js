// scripts/importFromCSV.js
// Script to import ship data from CSV files

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Ship = require('../models/Ship');
const Auxiliary = require('../models/Auxiliary');
const Augment = require('../models/Augment');
require('dotenv').config();

// Install this package: npm install csv-parser
const csv = require('csv-parser');

/**
 * Import ships from CSV file
 * Expected CSV columns: Name, HP, EVA, LCK, LVL, Rarity, Type, Faction, Retrofit
 */
async function importShipsFromCSV(csvFilePath) {
  const ships = [];
  
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(csvFilePath)) {
      reject(new Error(`CSV file not found: ${csvFilePath}`));
      return;
    }

    console.log(`📁 Reading CSV file: ${csvFilePath}`);
    
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Map CSV columns to ship schema
          // Adjust these column names to match your CSV headers
          const ship = {
            name: row.Name || row.name || row.SHIP_NAME,
            hp: parseInt(row.HP || row.hp || row.HEALTH) || 0,
            eva: parseInt(row.EVA || row.eva || row.EVASION) || 0,
            lck: parseInt(row.LCK || row.lck || row.LUCK) || 0,
            lvl: parseInt(row.LVL || row.lvl || row.LEVEL) || 125,
            rarity: row.Rarity || row.rarity || row.RARITY || 'Common',
            shipType: row.Type || row.type || row.SHIP_TYPE || row.Hull || 'DD',
            faction: row.Faction || row.faction || row.FACTION || 'Unknown',
            isRetrofit: (row.Retrofit || row.retrofit || row.IS_RETROFIT || 'false').toLowerCase() === 'true'
          };

          // Validate required fields
          if (!ship.name) {
            console.warn(`⚠️ Skipping row with missing name:`, row);
            return;
          }

          ships.push(ship);
        } catch (error) {
          console.error(`❌ Error parsing row:`, row, error);
        }
      })
      .on('end', async () => {
        try {
          console.log(`✅ Parsed ${ships.length} ships from CSV`);
          
          if (ships.length === 0) {
            reject(new Error('No valid ships found in CSV'));
            return;
          }

          // Connect to MongoDB
          await mongoose.connect(process.env.MONGODB_URI);
          console.log('🔗 Connected to MongoDB');

          // Clear existing ships
          const deletedCount = await Ship.deleteMany({});
          console.log(`🗑️ Removed ${deletedCount.deletedCount} existing ships`);

          // Insert new ships in batches for better performance
          const batchSize = 100;
          let importedCount = 0;
          
          for (let i = 0; i < ships.length; i += batchSize) {
            const batch = ships.slice(i, i + batchSize);
            try {
              await Ship.insertMany(batch, { ordered: false }); // Continue on duplicates
              importedCount += batch.length;
              console.log(`📦 Imported batch ${Math.floor(i/batchSize) + 1}: ${batch.length} ships`);
            } catch (error) {
              // Handle duplicate key errors and other validation errors
              if (error.writeErrors) {
                const successful = batch.length - error.writeErrors.length;
                importedCount += successful;
                console.log(`⚠️ Batch ${Math.floor(i/batchSize) + 1}: ${successful}/${batch.length} ships imported (${error.writeErrors.length} duplicates/errors)`);
              } else {
                console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message);
              }
            }
          }

          console.log(`\n🎉 Import completed!`);
          console.log(`📊 Successfully imported ${importedCount} ships`);
          console.log(`📋 Sample ships in database:`);
          
          // Show sample of imported data
          const sampleShips = await Ship.find({}).limit(5);
          sampleShips.forEach(ship => {
            console.log(`  • ${ship.name} (${ship.shipType}) - HP: ${ship.hp}, EVA: ${ship.eva}`);
          });

          await mongoose.disconnect();
          resolve(importedCount);
        } catch (error) {
          await mongoose.disconnect();
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Import auxiliary equipment from CSV
 */
async function importAuxiliaryFromCSV(csvFilePath) {
  const auxiliaryItems = [];
  
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(csvFilePath)) {
      reject(new Error(`CSV file not found: ${csvFilePath}`));
      return;
    }

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        const aux = {
          name: row.Name || row.name,
          hp: parseInt(row.HP || row.hp) || 0,
          heal: parseFloat(row.HEAL || row.heal) || 0,
          eva: parseInt(row.EVA || row.eva) || 0,
          lck: parseInt(row.LCK || row.lck) || 0,
          rarity: row.Rarity || row.rarity || 'T1',
          category: row.Category || row.category || 'Support'
        };

        if (aux.name) {
          auxiliaryItems.push(aux);
        }
      })
      .on('end', async () => {
        try {
          await mongoose.connect(process.env.MONGODB_URI);
          await Auxiliary.deleteMany({});
          await Auxiliary.insertMany(auxiliaryItems);
          await mongoose.disconnect();
          
          console.log(`✅ Imported ${auxiliaryItems.length} auxiliary items`);
          resolve(auxiliaryItems.length);
        } catch (error) {
          await mongoose.disconnect();
          reject(error);
        }
      })
      .on('error', reject);
  });
}

/**
 * Import augments from CSV
 */
async function importAugmentsFromCSV(csvFilePath) {
  const augments = [];
  
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(csvFilePath)) {
      reject(new Error(`CSV file not found: ${csvFilePath}`));
      return;
    }

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        const augment = {
          name: row.Name || row.name,
          hp: parseInt(row.HP || row.hp) || 0,
          eva: parseInt(row.EVA || row.eva) || 0,
          lck: parseInt(row.LCK || row.lck) || 0,
          rarity: row.Rarity || row.rarity || 'T1'
        };

        if (augment.name) {
          augments.push(augment);
        }
      })
      .on('end', async () => {
        try {
          await mongoose.connect(process.env.MONGODB_URI);
          await Augment.deleteMany({});
          await Augment.insertMany(augments);
          await mongoose.disconnect();
          
          console.log(`✅ Imported ${augments.length} augments`);
          resolve(augments.length);
        } catch (error) {
          await mongoose.disconnect();
          reject(error);
        }
      })
      .on('error', reject);
  });
}

/**
 * Preview CSV data without importing
 */
function previewCSV(csvFilePath, maxRows = 5) {
  return new Promise((resolve, reject) => {
    const rows = [];
    
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        if (rows.length < maxRows) {
          rows.push(row);
        }
      })
      .on('end', () => {
        console.log(`\n📋 Preview of ${csvFilePath}:`);
        console.log(`📊 Headers:`, Object.keys(rows[0] || {}));
        console.log(`📄 Sample rows:`);
        rows.forEach((row, index) => {
          console.log(`  ${index + 1}:`, row);
        });
        resolve(rows);
      })
      .on('error', reject);
  });
}

// Command line usage
async function main() {
  const command = process.argv[2];
  const filePath = process.argv[3];

  try {
    switch (command) {
      case 'ships':
        if (!filePath) {
          console.error('❌ Usage: npm run import-csv ships path/to/ships.csv');
          process.exit(1);
        }
        await importShipsFromCSV(filePath);
        break;

      case 'auxiliary':
        if (!filePath) {
          console.error('❌ Usage: npm run import-csv auxiliary path/to/auxiliary.csv');
          process.exit(1);
        }
        await importAuxiliaryFromCSV(filePath);
        break;

      case 'augments':
        if (!filePath) {
          console.error('❌ Usage: npm run import-csv augments path/to/augments.csv');
          process.exit(1);
        }
        await importAugmentsFromCSV(filePath);
        break;

      case 'preview':
        if (!filePath) {
          console.error('❌ Usage: npm run import-csv preview path/to/file.csv');
          process.exit(1);
        }
        await previewCSV(filePath);
        break;

      default:
        console.log(`
🚀 CSV Import Tool

Usage:
  npm run import-csv ships path/to/ships.csv       - Import ship data
  npm run import-csv auxiliary path/to/aux.csv     - Import auxiliary data  
  npm run import-csv augments path/to/aug.csv      - Import augment data
  npm run import-csv preview path/to/file.csv      - Preview CSV structure

Examples:
  npm run import-csv ships ../data/all_ships.csv
  npm run import-csv preview ../data/ships.csv
        `);
    }
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  importShipsFromCSV,
  importAuxiliaryFromCSV,
  importAugmentsFromCSV,
  previewCSV
};