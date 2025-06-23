let shipsData = [];
let auxiliaryData = [];
let augmentsData = [];
let pinnedShips = [];

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
 * @param {number} shipIndex
 */
function updateEHP(shipIndex) {
    const ship = sampleData.ships[shipIndex];
    
    // Equipment indices
    const aux1Index = parseInt(document.getElementById(`aux1-${shipIndex}`).value);
    const aux2Index = parseInt(document.getElementById(`aux2-${shipIndex}`).value);
    const augIndex = parseInt(document.getElementById(`aug-${shipIndex}`).value);

    // Equipment data
    const auxiliary1 = sampleData.auxiliary[aux1Index];
    const auxiliary2 = sampleData.auxiliary[aux2Index];
    const augment = sampleData.augments[augIndex];

    const totalHP = ship.HP + auxiliary1.HP + auxiliary2.HP + augment.HP;
    const totalHEAL = (auxiliary1.HEAL || 0) + (auxiliary2.HEAL || 0); // Multiple repair tools CANNOT stack healing || Need to fix
    const totalEVA = ship.EVA + auxiliary1.EVA + auxiliary2.EVA + augment.EVA;
    const totalLCK = ship.LCK + auxiliary1.LCK + auxiliary2.LCK + augment.LCK;

    const ehp = calculateEHP(totalHP, totalHEAL, totalEVA, totalLCK, ship.LVL);

    updateBarDisplay(shipIndex, ehp);
    
    updatePinnedShipIfExists(shipIndex, ehp);
}

/**
 * @param {number} shipIndex
 * @param {number} ehp
 */
function updateBarDisplay(shipIndex, ehp) {
    const barElement = document.getElementById(`bar-${shipIndex}`);
    const textElement = document.getElementById(`text-${shipIndex}`);
    
    const percentage = Math.min((ehp / 12000) * 100, 100);
    
    textElement.textContent = `${percentage.toFixed(1)}%`;
    
    const maxEHP = 16000;
    const barWidth = Math.min((ehp / maxEHP) * 100, 100);
    barElement.style.width = `${barWidth}%`;

    // Performance tiers
    if (ehp > 12000) {
        // > 100%
        barElement.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
    } else if (ehp > 10000) {
        // 83% - 100%
        barElement.style.background = 'linear-gradient(90deg, #059669, #10b981)';
    } else if (ehp > 8000) {
        // 67% - 83%
        barElement.style.background = 'linear-gradient(90deg, #3b82f6, #60a5fa)';
    } else if (ehp > 6000) {
        // 50% - 67%
        barElement.style.background = 'linear-gradient(90deg, #0ea5e9, #3b82f6)';
    } else if (ehp > 4000) {
        // 33% - 50%
        barElement.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    } else {
        // 0% - 33%
        barElement.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
    }
}

/**
 * @param {Object} ship
 * @param {number} index
 * @returns {string}
 */
function createShipRow(ship, index) {
    return `
        <div class="ship-row">
            <div class="ship-controls">
                <div class="ship-info">
                    <span class="pin-star" id="star-${index}" onclick="togglePin(${index})" title="Pin this ship">☆</span>
                    <div class="ship-name">${ship.Name}</div>
                </div>
                <div class="dropdown-group">
                    ${createDropdown(sampleData.auxiliary, `aux1-${index}`, 1)}
                    ${createDropdown(sampleData.auxiliary, `aux2-${index}`, 2)}
                    ${createDropdown(sampleData.augments, `aug-${index}`, 2)}
                </div>
            </div>
            <div class="ehp-result">
                <div class="ehp-bar-container">
                    <div class="ehp-bar" id="bar-${index}"></div>
                    <div class="ehp-text" id="text-${index}">0%</div>
                    <div class="ehp-100-line"></div>
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
 * @param {number} shipInde
 */
function togglePin(shipIndex) {
    const ship = sampleData.ships[shipIndex];
    const starElement = document.getElementById(`star-${shipIndex}`);
    
    if (!starElement) {
        console.error(`Star element not found for ship ${shipIndex}`);
        return;
    }
    
    const existingIndex = pinnedShips.findIndex(pinned => pinned.shipIndex === shipIndex);
    
    if (existingIndex !== -1) {
        pinnedShips.splice(existingIndex, 1);
        starElement.textContent = '☆';
        starElement.classList.remove('pinned');
    } else {
        const config = getCurrentShipConfig(shipIndex);
        const ehp = calculateEHPForConfig(ship, config);
        pinnedShips.push({
            shipIndex: shipIndex,
            shipName: ship.Name,
            config: config,
            eHP: ehp,
            timestamp: Date.now()
        });
        starElement.textContent = '★';
        starElement.classList.add('pinned');
    }
    
    updatePinnedDisplay();
    updatePinToggleButton();
}

/**
 * @param {number} shipIndex
 * @returns {Object}
 */
function getCurrentShipConfig(shipIndex) {
    const aux1Index = parseInt(document.getElementById(`aux1-${shipIndex}`).value);
    const aux2Index = parseInt(document.getElementById(`aux2-${shipIndex}`).value);
    const augIndex = parseInt(document.getElementById(`aug-${shipIndex}`).value);
    
    return {
        aux1: sampleData.auxiliary[aux1Index],
        aux2: sampleData.auxiliary[aux2Index],
        augment: sampleData.augments[augIndex],
        aux1Index: aux1Index,
        aux2Index: aux2Index,
        augIndex: augIndex
    };
}

/**
 * @param {Object} ship
 * @param {Object} config
 * @returns {number}
 */
function calculateEHPForConfig(ship, config) {
    const totalHP = ship.HP + config.aux1.HP + config.aux2.HP + config.augment.HP;
    const totalHEAL = (config.aux1.HEAL || 0) + (config.aux2.HEAL || 0);
    const totalEVA = ship.EVA + config.aux1.EVA + config.aux2.EVA + config.augment.EVA;
    const totalLCK = ship.LCK + config.aux1.LCK + config.aux2.LCK + config.augment.LCK;
    
    return calculateEHP(totalHP, totalHEAL, totalEVA, totalLCK, ship.LVL);
}

/**
 * @param {number} shipIndex
 * @param {number} newEHP
 */
function updatePinnedShipIfExists(shipIndex, newEHP) {
    const pinnedIndex = pinnedShips.findIndex(pinned => pinned.shipIndex === shipIndex);
    if (pinnedIndex !== -1) {
        const config = getCurrentShipConfig(shipIndex);
        pinnedShips[pinnedIndex].config = config;
        pinnedShips[pinnedIndex].eHP = newEHP;
        updatePinnedDisplay();
    }
}

function updatePinnedDisplay() {
    const container = document.getElementById('pinnedShipsContainer');
    const emptyMessage = document.getElementById('pinnedEmpty');
    
    if (pinnedShips.length === 0) {
        container.innerHTML = '<div class="pinned-empty" id="pinnedEmpty">No ships pinned yet. Click the ★ next to any ship to add it here for easy comparison!</div>';
        return;
    }
    
    const sortedPinned = [...pinnedShips].sort((a, b) => b.eHP - a.eHP);
    
    let html = '';
    sortedPinned.forEach((pinned, index) => {
        const percentage = ((pinned.eHP / 12000) * 100).toFixed(1);
        html += `
            <div class="pinned-ship">
                <div class="pinned-ship-header">
                    <div class="pinned-ship-name">${pinned.shipName}</div>
                    <button class="unpin-btn" onclick="unpinShip(${pinned.shipIndex})" title="Unpin ship">★</button>
                </div>
                <div class="pinned-ship-config">
                    <strong>Equipment:</strong><br>
                    • ${pinned.config.aux1.Name}<br>
                    • ${pinned.config.aux2.Name}<br>
                    • ${pinned.config.augment.Name}
                </div>
                <div class="pinned-ship-ehp">
                    eHP: ${pinned.eHP.toFixed(0)} (${percentage}%)
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * @param {number} shipIndex
 */
function unpinShip(shipIndex) {
    const starElement = document.getElementById(`star-${shipIndex}`);
    const existingIndex = pinnedShips.findIndex(pinned => pinned.shipIndex === shipIndex);
    
    if (existingIndex !== -1) {
        pinnedShips.splice(existingIndex, 1);
        if (starElement) {
            starElement.textContent = '☆';
            starElement.classList.remove('pinned');
        }
        updatePinnedDisplay();
        updatePinToggleButton();
    }
}

function updatePinToggleButton() {
    const button = document.getElementById('pinToggleBtn');
    if (button) {
        if (pinnedShips.length > 0) {
            button.classList.add('has-pinned');
            button.title = `View ${pinnedShips.length} Pinned Ship${pinnedShips.length !== 1 ? 's' : ''}`;
        } else {
            button.classList.remove('has-pinned');
            button.title = 'View Pinned Ships';
        }
    }
}

function togglePinnedSidebar() {
    const sidebar = document.getElementById('pinnedSidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

function closePinnedSidebar() {
    const sidebar = document.getElementById('pinnedSidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
}

/**
 * Load JSON data files (for future implementation)
 * @returns {Promise} Promise that resolves when data is loaded
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
 * @param {Object} shipData
 */
function addShip(shipData) {
    const currentIndex = sampleData.ships.length;
    sampleData.ships.push(shipData);
    
    const container = document.getElementById('ship-calculators');
    container.innerHTML += createShipRow(shipData, currentIndex);
    
    document.getElementById(`aux1-${currentIndex}`).addEventListener('change', () => updateEHP(currentIndex));
    document.getElementById(`aux2-${currentIndex}`).addEventListener('change', () => updateEHP(currentIndex));
    document.getElementById(`aug-${currentIndex}`).addEventListener('change', () => updateEHP(currentIndex));
    
    updateEHP(currentIndex);
}

window.togglePin = togglePin;
window.unpinShip = unpinShip;
window.togglePinnedSidebar = togglePinnedSidebar;
window.closePinnedSidebar = closePinnedSidebar;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateEHP,
        initializeCalculator,
        loadJSONData,
        addShip,
        togglePin,
        unpinShip
    };
}