export function calculateEHP(ship) {
  if (!ship) return 0;
  
  // Backend already calculated eHP with default equipment - just use it!
  if (ship.eHP !== undefined && ship.eHP !== null) {
    return ship.eHP;
  }
  
  // Fallback if eHP not provided (shouldn't happen)
  const { hp, eva, lck, lvl } = ship;
  const numerator = hp * (1 + 0); // HEAL = 0
  const denominator = 0.1 + (125 / (125 + eva + 2)) + ((50 - lck + 126 - lvl) / 1000);
  
  return Math.round(numerator / denominator);
}