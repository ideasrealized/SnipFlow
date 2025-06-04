// Test script for chain options overlay functionality
// Run this in the browser console of the overlay window

console.log('🧪 Testing Chain Options Overlay...');

// Test 1: Check if chain options functions are available
console.log('Test 1: Chain Options Functions');
const functionsToCheck = [
  'showChainOptionsOverlay',
  'showStarterChainsView', 
  'handleChainOptionSelect',
  'processPlaceholders'
];

functionsToCheck.forEach(funcName => {
  if (typeof window[funcName] === 'function') {
    console.log(`✅ ${funcName} function available`);
  } else {
    console.log(`❌ ${funcName} function not available`);
  }
});

// Test 2: Check if currentChain variable exists
console.log('\nTest 2: Current Chain State');
if (typeof window.currentChain !== 'undefined') {
  console.log('✅ currentChain variable available:', window.currentChain);
} else {
  console.log('❌ currentChain variable not available');
}

// Test 3: Check starter chains with multiple options
console.log('\nTest 3: Starter Chains with Options');
if (window.starterChains && window.starterChains.length > 0) {
  window.starterChains.forEach((chain, i) => {
    console.log(`${i+1}. ${chain.name} (ID: ${chain.id})`);
    if (chain.options && chain.options.length > 0) {
      console.log(`   Options (${chain.options.length}):`);
      chain.options.forEach((option, j) => {
        console.log(`     ${j+1}. ${option.title || 'Untitled'}`);
        if (option.body && option.body.includes('[?:')) {
          console.log(`        Contains placeholder: ${option.body.match(/\[?\?:([^\]]+)\]/g)}`);
        }
      });
    } else {
      console.log('   No options');
    }
  });
  
  // Test with a multi-option chain
  const multiOptionChain = window.starterChains.find(c => c.options && c.options.length > 1);
  if (multiOptionChain) {
    console.log(`\nTesting multi-option chain: ${multiOptionChain.name}`);
    console.log('Simulating click to show options...');
    
    if (typeof window.handleChainSelect === 'function') {
      // This should show the options overlay
      window.handleChainSelect(multiOptionChain);
      console.log('✅ Chain options should now be visible');
    } else {
      console.log('❌ handleChainSelect not available');
    }
  } else {
    console.log('❌ No multi-option starter chains found for testing');
  }
} else {
  console.log('❌ No starter chains available');
}

// Test 4: Check overlay elements
console.log('\nTest 4: Overlay Elements');
const elements = {
  'starter-grid': document.getElementById('starter-grid'),
  'chain-runner': document.getElementById('chain-runner')
};

Object.entries(elements).forEach(([name, element]) => {
  if (element) {
    console.log(`✅ ${name} found - Display: ${element.style.display}`);
  } else {
    console.log(`❌ ${name} not found`);
  }
});

// Test 5: Test placeholder processing function
console.log('\nTest 5: Placeholder Processing');
if (typeof window.processPlaceholders === 'function') {
  console.log('✅ processPlaceholders function available');
  
  // Test placeholder detection
  const testContent = "Hello [?:Customer], this is [User*Name] with Kelly's Appliance";
  console.log(`Test content: "${testContent}"`);
  
  const placeholderRegex = /\[?\?:([^\]]+)\]/g;
  const matches = [...testContent.matchAll(placeholderRegex)];
  console.log(`Found ${matches.length} placeholders:`, matches.map(m => m[0]));
} else {
  console.log('❌ processPlaceholders function not available');
}

console.log('\n🎯 Test Complete!');
console.log('💡 If multi-option chain was found, check if options overlay is now showing');
console.log('💡 Try pressing Escape to go back to starter chains view'); 