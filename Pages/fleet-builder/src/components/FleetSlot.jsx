import React from 'react';
import { calculateEHP } from '../utils/ehpCalculator';

function FleetSlot({ position, ship, onRemove, onClick, onDrop, slotId }) {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-400');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('border-blue-400');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400');
    const shipId = e.dataTransfer.getData('shipId');
    if (shipId) {
      onDrop(slotId, shipId);
    }
  };

  return (
    <div 
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative bg-slate-800/60 border-2 border-slate-600/50 rounded-lg p-4 h-40 cursor-pointer hover:border-blue-500/50 transition-all group"
    >
      {ship ? (
        <div className="h-full flex flex-col justify-between">
          <div>
            <p className="text-slate-200 font-semibold text-lg">{ship.name}</p>
            <p className="text-slate-400 text-sm">
              {ship.shipType} • {ship.faction || 'Unknown'}
            </p>
            <p className="text-slate-300 text-xs mt-1">
              {ship.defaultEq1 && `${ship.defaultEq1} • `}
              {ship.defaultEq2 && `${ship.defaultEq2} • `}
              {ship.defaultAug}
            </p>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-blue-400 text-sm font-medium">
              eHP: {calculateEHP(ship).toLocaleString()}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/20 hover:bg-red-500/40 text-red-300 px-2 py-1 rounded text-xs"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-slate-500">
          <p className="text-sm font-medium">{position}</p>
          <p className="text-xs mt-1">Click to select or drag ship here</p>
        </div>
      )}
    </div>
  );
}

export default FleetSlot;