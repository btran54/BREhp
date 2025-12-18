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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
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
        setAllShips(data.ships);
        setFilteredShips(data.ships);
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
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [filters, allShips]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredShips.length / itemsPerPage);
  const indexOfLastShip = currentPage * itemsPerPage;
  const indexOfFirstShip = indexOfLastShip - itemsPerPage;
  const currentShips = filteredShips.slice(indexOfFirstShip, indexOfLastShip);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of ship list
    document.getElementById('ship-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

  const handleSlotClick = (fleetType, index) => {
    setSelectingSlot(`${fleetType}${index + 1}`);
  }
  
  const totalEhp = Object.values(fleet).reduce((sum, ship) => {
    return sum + calculateEHP(ship);
  }, 0);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      
      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

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
          <h1 className="text-5xl font-light text-center">Fleet Builder</h1>
          <p className="text-slate-300 text-center">Build and optimize your Azur Lane fleet</p>
          
          <p className="hidden md:block absolute top-0 right-0 text-slate-400 italic text-right max-w-[250px] leading-tight" style={{ fontSize: 'clamp(0.7rem, 2vw, 0.95rem)' }}>
            *These default configurations are the most common<br/>and readily accessible items
          </p>

          <p className="md:hidden text-slate-400 italic text-center text-xs mt-2 leading-tight">
            *These default configurations are the most common<br/>and readily accessible items
          </p>
        </div>
        
        {/* Fleet Display */}
        <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-slate-200">Your Fleet</h2>
            <div className="flex items-center gap-4">
              <span className="text-blue-400 text-lg font-medium">
                Total eHP: {totalEhp}
              </span>
              <button
                onClick={handleClearFleet}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm"
              >
                Clear Fleet
              </button>
            </div>
          </div>
                    
          {/* Main Fleet */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-slate-300 mb-3">Main Fleet</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <FleetSlot
                  key={`main-${index}`}
                  position={`Main ${index + 1}`}
                  ship={fleet[`main${index + 1}`]}
                  onRemove={() => handleRemoveShip(`main${index + 1}`)}
                  onClick={() => handleSlotClick('main', index)}
                  onDrop={handleDrop}
                  slotId={`main${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Vanguard */}
          <div>
            <h3 className="text-lg font-medium text-slate-300 mb-3">Vanguard</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <FleetSlot
                  key={`vanguard-${index}`}
                  position={`Vanguard ${index + 1}`}
                  ship={fleet[`vanguard${index + 1}`]}
                  onRemove={() => handleRemoveShip(`vanguard${index + 1}`)}
                  onClick={() => handleSlotClick('vanguard', index)}
                  onDrop={handleDrop}
                  slotId={`vanguard${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Search/Filter Section */}
        <div id="ship-list" className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10">
          <h2 className="text-2xl font-light mb-4">Ship Database</h2>
          <SearchFilter
            filters={filters}
            onSearchChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
            onTypeChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            onFactionChange={(value) => setFilters(prev => ({ ...prev, faction: value }))}
            onClear={handleClear}
          />
          
          {/* Pagination Info */}
          <div className="flex justify-between items-center mt-4 mb-4">
            <p className="text-slate-300">
              Showing {indexOfFirstShip + 1}-{Math.min(indexOfLastShip, filteredShips.length)} of {filteredShips.length} ship{filteredShips.length !== 1 ? 's' : ''}
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </p>
          </div>
          
          {/* Ship List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4 mb-6">
            {currentShips.map(ship => (
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
          
          {/* Empty State */}
          {currentShips.length === 0 && (
            <p className="text-center text-slate-400 py-8">No ships match your filters</p>
          )}
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                {/* First Page */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 text-sm font-medium transition-all"
                >
                  First
                </button>
                
                {/* Previous Page */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 text-sm font-medium transition-all"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700/50 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                
                {/* Next Page */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 text-sm font-medium transition-all"
                >
                  Next
                </button>
                
                {/* Last Page */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 text-sm font-medium transition-all"
                >
                  Last
                </button>
              </div>
            </div>
          )}
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