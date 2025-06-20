let shipsData = [];
let auxiliaryData = [];
let augmentsData = [];

// Sample data
const sampleData = {
    ships: [
        { "Name": "Mutsuki", "HP": 1688, "EVA": 250, "LCK": 35, "LVL": 125 },
        { "Name": "Kamikaze", "HP": 1764, "EVA": 250, "LCK": 86, "LVL": 125 }
    ],
    auxiliary: [
        { "Name": "None", "HP": 0, "HEAL": 0, "EVA": 0, "LCK": 0 },
        { "Name": "Repair Toolkit", "HP": 500, "HEAL": 0.05, "EVA": 0, "LCK": 0 },
        { "Name": "550 HP Aux", "HP": 550, "HEAL": 0, "EVA": 0, "LCK": 0 }
    ],
    augments: [
        { "Name": "None", "HP": 0, "EVA": 0, "LCK": 0 },
        { "Name": "Hammer", "HP": 0, "EVA": 0, "LCK": 0 },
        { "Name": "Dual Swords", "HP": 0, "EVA": 15, "LCK": 0 }
    ]
};

/**
 * @param {number} hp
 * @param {number} heal
 * @param {number} eva
 * @param {number} lck
 * @param {number} lvl
 * @returns {number}
 */
function calculateEHP(hp, heal, eva, lck, lvl) {
    const numerator = hp * (1 + heal);
    const denominator = 0.1 + (125 / (125 + eva + 2)) + ((50 - lck + 126 - lvl) / 1000);
    return numerator / denominator;
}

/**
 * Create dropdown HTML for equipment selection
 * @param {Array} items
 * @param {string} id
 * @param {number} defaultIndex
 * @returns {string}
 */
function createDropdown(items, id, defaultIndex = 0) {
    let options = '';
    items.forEach((item, index) => {
        const selected = index === defaultIndex ? 'selected' : '';
        options += `<option value="${index}" ${selected}>${item.Name}</option>`;
    });
    return `<select class="dropdown" id="${id}">${options}</select>`;
}

/**
 * Update eHP calculation and visual display for a specific ship
 * @param {number} shipIndex
 */
function updateEHP(shipIndex) {
    const ship = sampleData.ships[shipIndex];
    
    // Get selected equipment indices
    const aux1Index = parseInt(document.getElementById(`aux1-${shipIndex}`).value);
    const aux2Index = parseInt(document.getElementById(`aux2-${shipIndex}`).value);
    const augIndex = parseInt(document.getElementById(`aug-${shipIndex}`).value);

    // Get equipment data
    const auxiliary1 = sampleData.auxiliary[aux1Index];
    const auxiliary2 = sampleData.auxiliary[aux2Index];
    const augment = sampleData.augments[augIndex];

    const totalHP = ship.HP + auxiliary1.HP + auxiliary2.HP + augment.HP;
    const totalHEAL = (auxiliary1.HEAL || 0) + (auxiliary2.HEAL || 0);
    const totalEVA = ship.EVA + auxiliary1.EVA + auxiliary2.EVA + augment.EVA;
    const totalLCK = ship.LCK + auxiliary1.LCK + auxiliary2.LCK + augment.LCK;

    const ehp = calculateEHP(totalHP, totalHEAL, totalEVA, totalLCK, ship.LVL);

    updateBarDisplay(shipIndex, ehp);
}

/**
 * Update the visual bar chart display
 * @param {number} shipIndex
 * @param {number} ehp
 */
function updateBarDisplay(shipIndex, ehp) {
    const barElement = document.getElementById(`bar-${shipIndex}`);
    const textElement = document.getElementById(`text-${shipIndex}`);
    
    textElement.textContent = ehp.toFixed(3);
    
    const maxEHP = 16000;
    const barWidth = Math.min((ehp / maxEHP) * 100, 100);
    barElement.style.width = `${barWidth}%`;

    // Performance tiers
    if (ehp > 12000) {
        // Very high performance
        barElement.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
    } else if (ehp > 8000) {
        // High performance
        barElement.style.background = 'linear-gradient(90deg, #059669, #10b981)';
    } else if (ehp > 6000) {
        // Medium performance
        barElement.style.background = 'linear-gradient(90deg, #3b82f6, #60a5fa)';
    } else if (ehp > 4000) {
        // Lower medium performance
        barElement.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    } else {
        // Low performance
        barElement.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
    }
}

/**
 * Create HTML for a single ship calculator row
 * @param {Object} ship
 * @param {number} index
 * @returns {string}
 */
function createShipRow(ship, index) {
    return `
        <div class="ship-row">
            <div class="ship-name">${ship.Name}</div>
            <div class="dropdown-group">
                ${createDropdown(sampleData.auxiliary, `aux1-${index}`, 1)}
                ${createDropdown(sampleData.auxiliary, `aux2-${index}`, 2)}
                ${createDropdown(sampleData.augments, `aug-${index}`, 2)}
            </div>
            <div class="ehp-result">
                <div class="ehp-bar-container">
                    <div class="ehp-bar" id="bar-${index}"></div>
                    <div class="ehp-text" id="text-${index}">0</div>
                </div>
                <div class="ehp-scale">
                    <span class="scale-min">0</span>
                    <span class="scale-max">16000</span>
                </div>
            </div>
        </div>
    `;
}

function initializeCalculator() {
    const container = document.getElementById('ship-calculators');
    const loading = document.getElementById('loading');
    
    let html = '';
    sampleData.ships.forEach((ship, index) => {
        html += createShipRow(ship, index);
    });
    
    container.innerHTML = html;
    loading.style.display = 'none';

    sampleData.ships.forEach((ship, index) => {
        document.getElementById(`aux1-${index}`).addEventListener('change', () => updateEHP(index));
        document.getElementById(`aux2-${index}`).addEventListener('change', () => updateEHP(index));
        document.getElementById(`aug-${index}`).addEventListener('change', () => updateEHP(index));
        
        updateEHP(index);
    });
}

/**
 * Load JSON data files (for future implementation)
 * @returns {Promise}
 */
async function loadJSONData() {
    try {
        // Uncomment and modify these paths when you have the JSON files ready
        // const shipsResponse = await fetch('../../data/Ships.json');
        // const auxiliaryResponse = await fetch('../../data/Auxiliary.json');
        // const augmentsResponse = await fetch('../../data/Augments.json');
        
        // shipsData = await shipsResponse.json();
        // auxiliaryData = await auxiliaryResponse.json();
        // augmentsData = await augmentsResponse.json();
        
        // Replace sampleData with loaded data
        // sampleData.ships = shipsData.Ships;
        // sampleData.auxiliary = auxiliaryData.Auxiliary;
        // sampleData.augments = augmentsData.Augments;
        
        console.log('JSON data loading functionality ready');
        return Promise.resolve();
        
    } catch (error) {
        console.error('Error loading JSON data:', error);
        return Promise.reject(error);
    }
}

/**
 * Add a new ship to the calculator (for future expansion)
 * @param {Object} shipData - Ship data object
 */
function addShip(shipData) {
    const currentIndex = sampleData.ships.length;
    sampleData.ships.push(shipData);
    
    const container = document.getElementById('ship-calculators');
    container.innerHTML += createShipRow(shipData, currentIndex);
    
    // Add event listeners for new ship
    document.getElementById(`aux1-${currentIndex}`).addEventListener('change', () => updateEHP(currentIndex));
    document.getElementById(`aux2-${currentIndex}`).addEventListener('change', () => updateEHP(currentIndex));
    document.getElementById(`aug-${currentIndex}`).addEventListener('change', () => updateEHP(currentIndex));
    
    // Initial calculation
    updateEHP(currentIndex);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateEHP,
        initializeCalculator,
        loadJSONData,
        addShip
    };
}