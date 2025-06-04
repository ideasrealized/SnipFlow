// Test script for overlay fixes
// Run this in the browser console of the overlay window

console.log('🧪 Testing Overlay Fixes...');

// Test 1: Check if starter chains are loaded
console.log('Test 1: Starter Chains Data');
if (window.starterChains) {
  console.log('✅ Starter chains available:', window.starterChains.length);
  window.starterChains.forEach((chain, i) => {
    console.log(`  ${i+1}. ${chain.name} (ID: ${chain.id}) - Starter: ${chain.isStarterChain}`);
  });
} else {
  console.log('❌ Starter chains not available');
}

// Test 2: Check container styling
console.log('\nTest 2: Container Styling');
const container = document.getElementById('container');
if (container) {
  console.log('✅ Container found');
  console.log('  Max Height:', container.style.maxHeight);
  console.log('  Overflow Y:', container.style.overflowY);
  console.log('  Display:', container.style.display);
} else {
  console.log('❌ Container not found');
}

// Test 3: Check starter grid visibility
console.log('\nTest 3: Starter Grid');
const starterGrid = document.getElementById('starter-grid');
if (starterGrid) {
  console.log('✅ Starter grid found');
  console.log('  Display:', starterGrid.style.display);
  console.log('  Grid boxes:', starterGrid.querySelectorAll('.grid-box').length);
} else {
  console.log('❌ Starter grid not found');
}

// Test 4: Check for chain execution function
console.log('\nTest 4: Chain Execution');
if (typeof window.handleChainSelect === 'function') {
  console.log('✅ handleChainSelect function available');
} else {
  console.log('❌ handleChainSelect function not available');
}

// Test 5: Check IPC listeners
console.log('\nTest 5: IPC Listeners');
if (window.api && typeof window.api.on === 'function') {
  console.log('✅ IPC API available');
} else {
  console.log('❌ IPC API not available');
}

console.log('\n🎯 Test Complete! Check results above.'); 