import React from 'react';

function SearchFilter({ onSearchChange, onTypeChange, onFactionChange, onClear, filters }) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <input
        type="text"
        placeholder="Search ships..."
        value={filters.search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 min-w-[200px] px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
      />
      
      <select
        value={filters.type}
        onChange={(e) => onTypeChange(e.target.value)}
        className="px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-slate-200 cursor-pointer hover:border-blue-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-w-[150px]"
      >
        <option value="">All Types</option>
        <option value="DD">Destroyer</option>
        <option value="CL">Light Cruiser</option>
        <option value="CA">Heavy Cruiser</option>
        <option value="CB">Large Cruiser</option>
        <option value="BB">Battleship</option>
        <option value="BC">Battlecruiser</option>
        <option value="BBV">Aviation Battleship</option>
        <option value="CV">Aircraft Carrier</option>
        <option value="CVL">Light Carrier</option>
        <option value="AR">Repair Ship</option>
        <option value="SS">Submarine</option>
        <option value="SSV">Submarine Carrier</option>
      </select>
      
      <select
        value={filters.faction}
        onChange={(e) => onFactionChange(e.target.value)}
        className="px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-slate-200 cursor-pointer hover:border-blue-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-w-[150px]"
      >
        <option value="">All Factions</option>
        <option value="Eagle Union">Eagle Union</option>
        <option value="Royal Navy">Royal Navy</option>
        <option value="Sakura Empire">Sakura Empire</option>
        <option value="Iron Blood">Iron Blood</option>
        <option value="Dragon Empery">Dragon Empery</option>
        <option value="Northern Parliament">Northern Parliament</option>
        <option value="Iris Libre">Iris Libre</option>
        <option value="Vichya Dominion">Vichya Dominion</option>
        <option value="Sardegna Empire">Sardegna Empire</option>
      </select>
      
      <button
        onClick={onClear}
        className="px-6 py-3 bg-red-500/20 border border-red-500/40 rounded-lg text-slate-200 hover:bg-red-500/30 hover:border-red-500/60 transition-all"
      >
        Clear
      </button>
    </div>
  );
}

export default SearchFilter;