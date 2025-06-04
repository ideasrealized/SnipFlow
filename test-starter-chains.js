// Quick test script to verify starter chains functionality
// Run this in the browser console when the overlay is open

console.log('Testing Starter Chains...');

// Test 1: Check if getStarterChains API is available
if (window.api && window.api.getStarterChains) {
  console.log('✅ getStarterChains API is available');
  
  // Test 2: Try to fetch starter chains
  window.api.getStarterChains()
    .then(chains => {
      console.log('✅ Starter chains loaded:', chains.length, 'chains');
      chains.forEach(chain => {
        console.log(`  - ${chain.name} (ID: ${chain.id}, isStarterChain: ${chain.isStarterChain})`);
      });
      
      if (chains.length === 0) {
        console.log('⚠️ No starter chains found. You may need to mark some chains as starters.');
      }
    })
    .catch(error => {
      console.error('❌ Error loading starter chains:', error);
    });
} else {
  console.error('❌ getStarterChains API not found');
}

// Test 3: Check if starter grid element exists
const starterGrid = document.getElementById('starter-grid');
if (starterGrid) {
  console.log('✅ Starter grid element found');
  const boxes = starterGrid.querySelectorAll('.grid-box');
  console.log(`  - ${boxes.length} starter chain boxes rendered`);
} else {
  console.error('❌ Starter grid element not found');
}

// Test 4: Check if all chains API works
if (window.api && window.api.listChains) {
  window.api.listChains()
    .then(allChains => {
      const starterCount = allChains.filter(c => c.isStarterChain).length;
      console.log(`✅ Total chains: ${allChains.length}, Starter chains: ${starterCount}`);
    })
    .catch(error => {
      console.error('❌ Error loading all chains:', error);
    });
} 