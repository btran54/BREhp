import React from 'react';
import { calculateEHP } from '../utils/ehpCalculator';

function ShipSelector({ ships, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-200">Select Ship</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(80vh-5rem)] p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ships.map(ship => (
              <div
                key={ship._id}
                onClick={() => onSelect(ship)}
                className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-slate-700 transition-all"
              >
                <p className="text-slate-200 font-semibold">{ship.name}</p>
                <p className="text-slate-400 text-sm mt-1">{ship.shipType} • {ship.faction || 'Unknown'}</p>
                <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                  {ship.defaultEq1 && <span className="block">• {ship.defaultEq1}</span>}
                  {ship.defaultEq2 && <span className="block">• {ship.defaultEq2}</span>}
                  {ship.defaultAug && <span className="block">• {ship.defaultAug}</span>}
                </p>
                <p className="text-blue-400 text-sm font-medium mt-2">
                  eHP: {calculateEHP(ship).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          
          {ships.length === 0 && (
            <p className="text-center text-slate-400 py-8">No ships match your filters</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShipSelector;