require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Auxiliary = require('./models/Auxiliary.js');
const Augment = require('./models/Augments.js');
const Ship = require('./models/Ships.js');

async function importData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const auxiliaryDataRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../Data-Files/Auxiliary.json'), 'utf8'));
    const augmentsDataRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../Data-Files/Augments.json'), 'utf8'));
    const shipsDataRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../Data-Files/dump.json'), 'utf8'));

    const auxiliaryData = Object.values(auxiliaryDataRaw);
    const augmentsData = Object.values(augmentsDataRaw);
    
    // Handle both array format and object with Ships property
    const shipsData = Array.isArray(shipsDataRaw) ? shipsDataRaw : shipsDataRaw.Ships;
    
    if (!shipsData || shipsData.length === 0) {
      throw new Error('No ships data found in dump.json');
    }
    console.log(`📦 Found ${shipsData.length} ships in dump.json`);

    // Import auxiliaries
    console.log('🔥 Importing/updating auxiliaries...');
    let auxCount = 0;
    for (const aux of auxiliaryData) {
      await Auxiliary.findOneAndUpdate(
        { name: aux.Name },
        {
          name: aux.Name,
          hp: aux.HP,
          heal: aux.HPBoost,
          eva: aux.EVA,
          lck: aux.LCK
        },
        { upsert: true, new: true }
      );
      auxCount++;
    }
    console.log(`✅ Processed ${auxCount} auxiliaries`);

    // Import augments
    console.log('🔥 Importing/updating augments...');
    let augCount = 0;
    for (const aug of augmentsData) {
      await Augment.findOneAndUpdate(
        { name: aug.Name },
        {
          name: aug.Name,
          hp: aug.HP,
          eva: aug.EVA,
          lck: aug.LCK
        },
        { upsert: true, new: true }
      );
      augCount++;
    }
    console.log(`✅ Processed ${augCount} augments`);

    // Import ships with extra fields
    console.log('🔥 Importing/updating ships...');
    let shipCount = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const ship of shipsData) {
      try {
        // Handle both "Name" and "name" fields
        const shipName = ship.Name || ship.name;
        
        // Skip invalid entries (numeric names like "22", "33")
        if (!shipName || !isNaN(shipName)) {
          console.log(`⚠️  Skipping invalid ship: ${shipName}`);
          skipped++;
          continue;
        }

        const shipData = {
          name: shipName,
          // Map Nationality to faction (correct field name for schema)
          faction: ship.Nationality || ship.nationality || ship.faction,
          shipType: ship.TYP || ship.typ || ship.shipType,
          armor: ship.ARMOR || ship.Armor || ship.armor,
          hp: ship.HP || ship.hp,
          eva: ship.EVA || ship.eva,
          lck: ship.LCK || ship.lck,
          lvl: ship.LVL || ship.lvl
        };

        // Add default equipment fields
        if (ship.DefaultEq1) shipData.defaultEq1 = ship.DefaultEq1;
        if (ship.DefaultEq2) shipData.defaultEq2 = ship.DefaultEq2;
        if (ship.DefaultAug) shipData.defaultAug = ship.DefaultAug;

        // Add extra fields if they exist (for future use)
        if (ship.AA !== undefined) shipData.aa = ship.AA;
        if (ship.HPExtra !== undefined) shipData.hpExtra = ship.HPExtra;
        if (ship.eHPRaw !== undefined) shipData.ehpRaw = ship.eHPRaw;
        if (ship.Uptime) shipData.uptime = ship.Uptime;
        if (ship.EVABoost) shipData.evaBoost = ship.EVABoost;
        if (ship.EVARate) shipData.evaRate = ship.EVARate;
        if (ship.AABoost) shipData.aaBoost = ship.AABoost;
        if (ship.DmgRed) shipData.dmgRed = ship.DmgRed;
        if (ship.FPDmgRed) shipData.fpDmgRed = ship.FPDmgRed;
        if (ship.TRPDmgRed) shipData.trpDmgRed = ship.TRPDmgRed;
        if (ship.AVIDmgRed) shipData.aviDmgRed = ship.AVIDmgRed;

        await Ship.findOneAndUpdate(
          { name: shipName },
          shipData,
          { upsert: true, new: true }
        );
        shipCount++;
        
        // Progress indicator every 50 ships
        if (shipCount % 50 === 0) {
          console.log(`  ✓ Processed ${shipCount} ships...`);
        }
      } catch (err) {
        console.error(`❌ Error importing ${ship.Name || ship.name}:`, err.message);
        errors++;
      }
    }
    console.log(`✅ Processed ${shipCount} ships`);
    if (skipped > 0) console.log(`⚠️  Skipped ${skipped} invalid ships`);
    if (errors > 0) console.log(`❌ Errors: ${errors} ships`);

    console.log('🎉 All data imported/updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
}

importData();