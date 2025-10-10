import React, { useState, useEffect } from 'react';
import SearchFilter from './components/SearchFilter';
import FleetSlot from './components/FleetSlot';
import ShipSelector from './components/ShipSelector';
import { calculateEHP } from './utils/ehpCalculator';
import './App.css';

const API_BASE_URL = 'https://brehp.onrender.com/api';

function App() {
  const [allShips, setAllShips] = useState([]);
  const [filteredShips, setFilteredShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    faction: ''
  });
  
  const [fleet, setFleet] = useState({
    vanguard1: null,
    vanguard2: null,
    vanguard3: null,
    main1: null,
    main2: null,
    main3: null
  });
  
  const [selectingSlot, setSelectingSlot] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/ships`)
      .then(res => res.json())
      .then(data => {
        console.log('Ships loaded:', data.ships.length);
        setAllShips(data.ships);  // Changed from data to data.ships
        setFilteredShips(data.ships);  // Changed from data to data.ships
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading ships:', err);
        setAllShips([]);
        setFilteredShips([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = allShips.filter(ship => {
      const matchesSearch = ship.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchesType = !filters.type || ship.shipType === filters.type;
      const matchesFaction = !filters.faction || ship.faction === filters.faction;      
      return matchesSearch && matchesType && matchesFaction;
    });
    
    setFilteredShips(filtered);
  }, [filters, allShips]);

  const handleClear = () => {
    setFilters({ search: '', type: '', faction: '' });
  };
  
  const handleSelectShip = (ship) => {
    if (selectingSlot) {
      setFleet(prev => ({ ...prev, [selectingSlot]: ship }));
      setSelectingSlot(null);
    }
  };

  const handleDrop = (slotId, shipId) => {
    const ship = allShips.find(s => s._id === shipId);
    if (ship) {
      setFleet(prev => ({ ...prev, [slotId]: ship }));
    }
  };
  
  const handleRemoveShip = (slot) => {
    setFleet(prev => ({ ...prev, [slot]: null }));
  };
  
  const handleClearFleet = () => {
    setFleet({
      vanguard1: null,
      vanguard2: null,
      vanguard3: null,
      main1: null,
      main2: null,
      main3: null
    });
  };
  
  const totalEhp = Object.values(fleet).reduce((sum, ship) => {
    return sum + calculateEHP(ship);
  }, 0);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-300 text-xl">Loading ships...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative mb-8">
          <div className="flex-1">
            <h1 className="text-5xl font-light text-center">Fleet Builder</h1>
            <p className="text-slate-300 text-center">Build and optimize your Azur Lane fleet</p>
          </div>
          <p className="absolute top-0 right-0 text-slate-400 italic text-left max-w-[250px] leading-tight" style={{ fontSize: '0.95rem' }}>
            *These default configurations are the most common and readily accessible <br/>items
          </p>
        </div>

        {/* Fleet Display */}
        <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light">Your Fleet</h2>
            <div className="flex gap-4 items-center">
              <p className="text-lg text-blue-400 font-semibold">
                Total eHP: {totalEhp.toLocaleString()}
              </p>
              <button
                onClick={handleClearFleet}
                className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg text-slate-200 hover:bg-red-500/30 transition-all text-sm"
              >
                Clear Fleet
              </button>
            </div>
          </div>
          
          {/* Main Fleet */}
          <div className="mb-6">
            <h3 className="text-slate-300 mb-3 font-medium">Main Fleet</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FleetSlot 
                position="Main 1" 
                ship={fleet.main1}
                slotId="main1" 
                onRemove={() => handleRemoveShip('main1')}
                onClick={() => setSelectingSlot('main1')}
                onDrop={handleDrop}
              />
              <FleetSlot 
                position="Main 2" 
                ship={fleet.main2}
                slotId="main2" 
                onRemove={() => handleRemoveShip('main2')}
                onClick={() => setSelectingSlot('main2')}
                onDrop={handleDrop}
              />
              <FleetSlot 
                position="Main 3" 
                ship={fleet.main3}
                slotId="main3" 
                onRemove={() => handleRemoveShip('main3')}
                onClick={() => setSelectingSlot('main3')}
                onDrop={handleDrop}
              />
            </div>
          </div>
          
          {/* Vanguard Fleet */}
          <div>
            <h3 className="text-slate-300 mb-3 font-medium">Vanguard</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FleetSlot 
                position="Vanguard 1" 
                ship={fleet.vanguard1}
                slotId="vanguard1" 
                onRemove={() => handleRemoveShip('vanguard1')}
                onClick={() => setSelectingSlot('vanguard1')}
                onDrop={handleDrop}
              />
              <FleetSlot 
                position="Vanguard 2" 
                ship={fleet.vanguard2}
                slotId="vanguard2" 
                onRemove={() => handleRemoveShip('vanguard2')}
                onClick={() => setSelectingSlot('vanguard2')}
                onDrop={handleDrop}
              />
              <FleetSlot 
                position="Vanguard 3" 
                ship={fleet.vanguard3}
                slotId="vanguard3" 
                onRemove={() => handleRemoveShip('vanguard3')}
                onClick={() => setSelectingSlot('vanguard3')}
                onDrop={handleDrop}
              />
            </div>
          </div>
        </div>
        
        {/* Search/Filter Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10">
          <h2 className="text-2xl font-light mb-4">Ship Database</h2>
          <SearchFilter
            filters={filters}
            onSearchChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
            onTypeChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            onFactionChange={(value) => setFilters(prev => ({ ...prev, faction: value }))}
            onClear={handleClear}
          />
          <p className="text-slate-300 mt-4 mb-4">
            {filteredShips.length} ship{filteredShips.length !== 1 ? 's' : ''} available
          </p>
          
          {/* Ship List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
            {filteredShips.map(ship => (
              <div
                key={ship._id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('shipId', ship._id);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 hover:bg-slate-700/50 hover:border-blue-500/50 transition-all cursor-grab active:cursor-grabbing"
              >
                <p className="text-slate-200 font-semibold text-sm">{ship.name}</p>
                <p className="text-slate-400 text-xs mt-1">{ship.shipType} • {ship.faction || 'Unknown'}</p>
                <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                  {ship.defaultEq1 && <span className="block">• {ship.defaultEq1}</span>}
                  {ship.defaultEq2 && <span className="block">• {ship.defaultEq2}</span>}
                  {ship.defaultAug && <span className="block">• {ship.defaultAug}</span>}
                </p>
                <p className="text-blue-400 text-xs font-medium mt-2">
                  eHP: {calculateEHP(ship).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
        </div>

      {/* Ship Selector Modal */}
      {selectingSlot && (
        <ShipSelector
          ships={filteredShips}
          onSelect={handleSelectShip}
          onClose={() => setSelectingSlot(null)}
        />
      )}
      </div>
  );
}

export default App;