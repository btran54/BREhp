// calculator.js - API version that pulls from MongoDB
// This replaces the hardcoded sample data with API calls

// Global variables
let shipsData = [];
let auxiliaryData = [];
let augmentsData = [];
let pinnedShips = [];
let currentShipsPage = 1;
let totalShips = 0;
let isLoading = false;

// API configuration
const API_BASE_URL = 'http://localhost:3001/api';

// API utility functions
const api = {
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API GET error for ${endpoint}:`, error);
      throw error;
    }
  }
};

/**
 * Load data from API instead of hardcoded data
 */
async function loadDataFromAPI() {
  try {
    showLoading(true, 'Loading ship data from database...');
    
    // Load auxiliary and augments data
    console.log('Loading auxiliary and augments...');
    const [auxiliaryResponse, augmentsResponse] = await Promise.all([
      api.get('/auxiliary'),
      api.get('/augments')
    ]);
    
    auxiliaryData = auxiliaryResponse;
    augmentsData = augmentsResponse;
    
    // Add "None" options to the beginning of arrays
    auxiliaryData.unshift({ name: "None", hp: 0, heal: 0, eva: 0, lck: 0 });
    augmentsData.unshift({ name: "None", hp: 0, eva: 0, lck: 0 });
    
    // Load initial ships data
    console.log('Loading ships...');
    await loadShipsData({ limit: 20 });
    
    console.log('✅ Data loaded successfully from MongoDB!');
    showLoading(false);
    return true;
  } catch (error) {
    console.error('❌ Error loading data from API:', error);
    showError('Failed to load ship data from database. Make sure the backend server is running on port 3001.');
    return false;
  }
}

/**
 * Load ships data with optional filters
 */
async function loadShipsData(options = {}) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      shipType, 
      faction, 
      rarity, 
      search,
      append = false 
    } = options;
    
    let endpoint = `/ships?page=${page}&limit=${limit}`;
    if (shipType) endpoint += `&shipType=${shipType}`;
    if (faction) endpoint += `&faction=${faction}`;
    if (rarity) endpoint += `&rarity=${rarity}`;
    if (search) endpoint += `&search=${encodeURIComponent(search)}`;
    
    const response = await api.get(endpoint);
    
    if (append) {
      shipsData = [...shipsData, ...response.ships];
    } else {
      shipsData = response.ships;
    }
    
    totalShips = response.total;
    currentShipsPage = page;
    
    return response;
  } catch (error) {
    console.error('Error loading ships data:', error);
    throw error;
  }
}

/**
 * Calculate effective HP using the Blue Road formula
 */
function calculateEHP(hp, heal, eva, lck, lvl) {
  const numerator = hp * (1 + heal);
  const denominator = 0.1 + (125 / (125 + eva + 2)) + ((50 - lck + 126 - lvl) / 1000);
  return numerator / denominator;
}

/**
 * Create dropdown HTML for equipment selection
 */
function createDropdown(items, id, defaultIndex = 0) {
  let options = '';
  items.forEach((item, index) => {
    const selected = index === defaultIndex ? 'selected' : '';
    const itemName = item.name || item.Name;
    options += `<option value="${index}" ${selected}>${itemName}</option>`;
  });
  return `<select class="dropdown" id="${id}">${options}</select>`;
}

/**
 * Update eHP calculation and visual display for a specific ship
 */
function updateEHP(shipIndex) {
  const ship = shipsData[shipIndex];
  
  // Get selected equipment indices
  const aux1Index = parseInt(document.getElementById(`aux1-${shipIndex}`).value);
  const aux2Index = parseInt(document.getElementById(`aux2-${shipIndex}`).value);
  const augIndex = parseInt(document.getElementById(`aug-${shipIndex}`).value);

  // Get equipment data
  const auxiliary1 = auxiliaryData[aux1Index];
  const auxiliary2 = auxiliaryData[aux2Index];
  const augment = augmentsData[augIndex];

  // Calculate total stats
  const totalHP = ship.hp + auxiliary1.hp + auxiliary2.hp + augment.hp;
  const totalHEAL = (auxiliary1.heal || 0) + (auxiliary2.heal || 0);
  const totalEVA = ship.eva + auxiliary1.eva + auxiliary2.eva + augment.eva;
  const totalLCK = ship.lck + auxiliary1.lck + auxiliary2.lck + augment.lck;

  // Calculate eHP using the formula
  const ehp = calculateEHP(totalHP, totalHEAL, totalEVA, totalLCK, ship.lvl);

  // Update visual display
  updateBarDisplay(shipIndex, ehp);
  
  // Update pinned ship if this ship is currently pinned
  updatePinnedShipIfExists(shipIndex, ehp);
}

/**
 * Update the visual bar chart display
 */
function updateBarDisplay(shipIndex, ehp) {
  const barElement = document.getElementById(`bar-${shipIndex}`);
  const textElement = document.getElementById(`text-${shipIndex}`);
  
  // Calculate actual percentage (can exceed 100%)
  const percentage = (ehp / 12000) * 100;
  textElement.textContent = `${percentage.toFixed(1)}%`;
  
  // Calculate bar width (still capped for visual display)
  const maxEHP = 16000;
  const barWidth = Math.min((ehp / maxEHP) * 100, 100);
  barElement.style.width = `${barWidth}%`;

  // Update bar color based on performance tiers
  if (ehp > 12000) {
    barElement.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
  } else if (ehp > 10000) {
    barElement.style.background = 'linear-gradient(90deg, #059669, #10b981)';
  } else if (ehp > 8000) {
    barElement.style.background = 'linear-gradient(90deg, #3b82f6, #60a5fa)';
  } else if (ehp > 6000) {
    barElement.style.background = 'linear-gradient(90deg, #0ea5e9, #3b82f6)';
  } else if (ehp > 4000) {
    barElement.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
  } else {
    barElement.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
  }
}

/**
 * Create HTML for a single ship calculator row
 */
function createShipRow(ship, index) {
  return `
    <div class="ship-row">
      <div class="ship-controls">
        <div class="ship-info">
          <span class="pin-star" id="star-${index}" onclick="togglePin(${index})" title="Pin this ship">☆</span>
          <div class="ship-name">${ship.name}</div>
        </div>
        <div class="dropdown-group">
          ${createDropdown(auxiliaryData, `aux1-${index}`, 1)}
          ${createDropdown(auxiliaryData, `aux2-${index}`, 2)}
          ${createDropdown(augmentsData, `aug-${index}`, 1)}
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

/**
 * Initialize the calculator interface and event listeners
 */
async function initializeCalculator() {
  const container = document.getElementById('ship-calculators');
  const loading = document.getElementById('loading');
  
  try {
    // Load data from API instead of hardcoded data
    const success = await loadDataFromAPI();
    if (!success) return;
    
    // Create ship calculator rows
    renderShipRows();
    
    loading.style.display = 'none';
    
    // Show success message
    console.log(`🚀 Calculator initialized with ${shipsData.length} ships from MongoDB!`);
    
  } catch (error) {
    console.error('Error initializing calculator:', error);
    showError('Failed to initialize calculator. Please make sure the backend server is running.');
  }
}

/**
 * Render ship rows in the container
 */
function renderShipRows(append = false) {
  const container = document.getElementById('ship-calculators');
  
  let html = '';
  shipsData.forEach((ship, index) => {
    html += createShipRow(ship, index);
  });
  
  if (append) {
    container.innerHTML += html;
  } else {
    container.innerHTML = html;
  }

  // Add event listeners for dropdown changes
  shipsData.forEach((ship, index) => {
    const aux1Element = document.getElementById(`aux1-${index}`);
    const aux2Element = document.getElementById(`aux2-${index}`);
    const augElement = document.getElementById(`aug-${index}`);
    
    if (aux1Element) aux1Element.addEventListener('change', () => updateEHP(index));
    if (aux2Element) aux2Element.addEventListener('change', () => updateEHP(index));
    if (augElement) augElement.addEventListener('change', () => updateEHP(index));
    
    // Perform initial calculation
    updateEHP(index);
  });
}

/**
 * Show/hide loading indicator with custom message
 */
function showLoading(show, message = 'Loading ship data...') {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.textContent = message;
    loading.style.display = show ? 'block' : 'none';
  }
}

/**
 * Show error message
 */
function showError(message) {
  const container = document.getElementById('ship-calculators');
  container.innerHTML = `
    <div class="error-message">
      <h3>⚠️ Connection Error</h3>
      <p>${message}</p>
      <div style="margin-top: 1rem;">
        <button onclick="location.reload()" class="btn btn-primary">Retry</button>
        <p style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.8;">
          Make sure your backend server is running: <code>npm run dev</code> in the server folder
        </p>
      </div>
    </div>
  `;
}

// Keep all the existing pinning functions unchanged
function togglePin(shipIndex) {
  const ship = shipsData[shipIndex];
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
      shipName: ship.name,
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

function getCurrentShipConfig(shipIndex) {
  const aux1Index = parseInt(document.getElementById(`aux1-${shipIndex}`).value);
  const aux2Index = parseInt(document.getElementById(`aux2-${shipIndex}`).value);
  const augIndex = parseInt(document.getElementById(`aug-${shipIndex}`).value);
  
  return {
    aux1: auxiliaryData[aux1Index],
    aux2: auxiliaryData[aux2Index],
    augment: augmentsData[augIndex],
    aux1Index: aux1Index,
    aux2Index: aux2Index,
    augIndex: augIndex
  };
}

function calculateEHPForConfig(ship, config) {
  const totalHP = ship.hp + config.aux1.hp + config.aux2.hp + config.augment.hp;
  const totalHEAL = (config.aux1.heal || 0) + (config.aux2.heal || 0);
  const totalEVA = ship.eva + config.aux1.eva + config.aux2.eva + config.augment.eva;
  const totalLCK = ship.lck + config.aux1.lck + config.aux2.lck + config.augment.lck;
  
  return calculateEHP(totalHP, totalHEAL, totalEVA, totalLCK, ship.lvl);
}

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
          • ${pinned.config.aux1.name}<br>
          • ${pinned.config.aux2.name}<br>
          • ${pinned.config.augment.name}
        </div>
        <div class="pinned-ship-ehp">
          eHP: ${pinned.eHP.toFixed(0)} (${percentage}%)
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

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

// Make functions available globally
window.togglePin = togglePin;
window.unpinShip = unpinShip;
window.togglePinnedSidebar = togglePinnedSidebar;
window.closePinnedSidebar = closePinnedSidebar;