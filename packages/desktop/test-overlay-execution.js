// Test script for overlay starter chain execution
// Run this in the browser console of the overlay window

console.log('🧪 Testing Overlay Starter Chain Execution...');

// Test 1: Check if insert-snippet IPC is working
console.log('Test 1: IPC Insert Snippet Function');
if (window.api && typeof window.api.insertSnippet === 'function') {
  console.log('✅ insertSnippet function available');
  
  // Test the function
  console.log('Testing insertSnippet with sample text...');
  window.api.insertSnippet('Test clipboard content from overlay');
  console.log('✅ insertSnippet called - check clipboard!');
} else {
  console.log('❌ insertSnippet function not available');
}

// Test 2: Check if handleChainSelect is working
console.log('\nTest 2: Chain Selection Handler');
if (typeof window.handleChainSelect === 'function') {
  console.log('✅ handleChainSelect function available');
} else {
  console.log('❌ handleChainSelect function not available');
  console.log('Available functions:', Object.keys(window).filter(k => typeof window[k] === 'function'));
}

// Test 3: Check starter chains data
console.log('\nTest 3: Starter Chains Data');
if (window.starterChains && window.starterChains.length > 0) {
  console.log('✅ Starter chains available:', window.starterChains.length);
  window.starterChains.forEach((chain, i) => {
    console.log(`  ${i+1}. ${chain.name} (ID: ${chain.id})`);
    if (chain.options && chain.options.length > 0) {
      console.log(`     First option: "${chain.options[0].body?.substring(0, 50)}..."`);
    }
  });
  
  // Test executing the first starter chain
  if (window.starterChains[0]) {
    console.log('\nTesting execution of first starter chain...');
    const testChain = window.starterChains[0];
    console.log(`Executing: ${testChain.name}`);
    
    // Simulate clicking the chain
    if (typeof window.handleChainSelect === 'function') {
      window.handleChainSelect(testChain);
      console.log('✅ Chain execution triggered - check clipboard!');
    } else {
      console.log('❌ Cannot test execution - handleChainSelect not available');
    }
  }
} else {
  console.log('❌ No starter chains available');
}

// Test 4: Check overlay display state
console.log('\nTest 4: Overlay Display State');
const starterGrid = document.getElementById('starter-grid');
const otherGrids = ['snippets-grid', 'chains-grid', 'history-grid'].map(id => document.getElementById(id));

if (starterGrid) {
  console.log('✅ Starter grid found');
  console.log('  Display:', starterGrid.style.display);
  console.log('  Visible boxes:', starterGrid.querySelectorAll('.grid-box').length);
} else {
  console.log('❌ Starter grid not found');
}

otherGrids.forEach((grid, i) => {
  const names = ['snippets', 'chains', 'history'];
  if (grid) {
    console.log(`${grid.style.display === 'none' ? '✅' : '❌'} ${names[i]} grid hidden: ${grid.style.display}`);
  }
});

console.log('\n🎯 Test Complete! Check results above.');
console.log('💡 If insertSnippet worked, check your clipboard for test content!'); 