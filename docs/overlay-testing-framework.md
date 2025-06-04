# SnipFlow Overlay Testing Framework

## **🧪 TESTING METHODOLOGY**

### **Test Categories**
1. **Visual Display Tests** - UI appearance and layout
2. **Functional Tests** - User interactions and behaviors
3. **Data Persistence Tests** - Settings and state management
4. **Integration Tests** - Cross-component functionality
5. **Performance Tests** - Responsiveness and memory usage

### **Test Environment Setup**
```bash
# Start fresh app instance
npx pnpm run dev

# Test with clean database (optional)
# Delete: %APPDATA%/Electron/.snipflow/snippets.db

# Monitor console logs in:
# - Main window (F12)
# - Overlay window (separate dev tools)
# - Terminal output
```

## **📊 CURRENT STATE ASSESSMENT**

### **✅ CONFIRMED WORKING**
1. **Overlay Positioning** ✅
   - Left-center edge detection functional
   - Right-center edge detection functional
   - Settings persistence between app launches
   - Real-time position switching

2. **Starter Chain Infrastructure** ✅
   - Database storage working
   - API endpoints responding
   - Chain Manager UI toggles functional
   - Visual indicators (🚀 icons, orange styling)

3. **Basic Visual Display** ✅
   - Overlay appears on hover
   - Starter chains grid visible
   - Grid boxes created and styled
   - Backdrop blur and modern styling

### **🔍 IDENTIFIED ISSUES**

#### **Issue #1: Content Switching Behavior**
- **Problem**: Clicking starter chain switches to snippets view
- **Expected**: Should execute the chain content
- **Status**: Logic mismatch - needs chain execution implementation

#### **Issue #2: Real-time Updates**
- **Problem**: Starter changes don't update overlay until app restart
- **Expected**: Immediate reflection of starter toggles
- **Status**: Missing live data refresh mechanism

#### **Issue #3: Overlay Scrolling**
- **Problem**: Content extends below visible area, no scroll
- **Expected**: Scrollable content or better layout management
- **Status**: CSS layout needs height constraints

#### **Issue #4: Unrelated Snippets**
- **Problem**: Snippets shown aren't related to selected chain
- **Expected**: Chain-specific content or proper chain execution
- **Status**: Chain execution logic not implemented

## **🧪 COMPREHENSIVE TEST PLAN**

### **Phase 5A: Visual Display Tests**

#### **Test 1: Overlay Appearance**
```
Steps:
1. Hover left edge of screen
2. Verify overlay appears
3. Check styling and positioning
4. Test with different themes (dark/light)

Expected Results:
- Overlay appears at correct position
- Starter chains visible with 🚀 icons
- Orange styling for starter chains
- Proper backdrop blur and shadows

Current Status: ✅ PASSING
```

#### **Test 2: Content Layout**
```
Steps:
1. Trigger overlay
2. Count visible starter chains
3. Check for scrolling capability
4. Verify grid layout responsiveness

Expected Results:
- All starter chains visible or scrollable
- Grid maintains 2-column layout
- No content cutoff

Current Status: ❌ FAILING - Content extends below visible area
```

### **Phase 5B: Functional Tests**

#### **Test 3: Chain Execution**
```
Steps:
1. Click on a starter chain
2. Verify chain content execution
3. Check for proper text insertion
4. Confirm overlay hides after execution

Expected Results:
- Chain's first option body executes
- Text inserted into active application
- Overlay disappears
- Flash message shows "Pasted!"

Current Status: ❌ FAILING - Shows snippets instead of executing
```

#### **Test 4: Real-time Updates**
```
Steps:
1. Open Chain Manager
2. Toggle a chain as starter
3. Trigger overlay without app restart
4. Verify changes reflected

Expected Results:
- New starter appears immediately
- Removed starter disappears immediately
- No app restart required

Current Status: ❌ FAILING - Requires app restart
```

### **Phase 5C: Data Persistence Tests**

#### **Test 5: Settings Persistence**
```
Steps:
1. Change overlay position to right-center
2. Restart application
3. Verify position maintained
4. Test with different settings

Expected Results:
- Position setting persists
- All settings maintain state
- No reset to defaults

Current Status: ✅ PASSING
```

#### **Test 6: Starter Chain Persistence**
```
Steps:
1. Mark chains as starters
2. Restart application
3. Verify starter status maintained
4. Check overlay content

Expected Results:
- Starter status persists
- Overlay shows correct chains
- Database maintains state

Current Status: ✅ PASSING
```

## **🔧 IMMEDIATE FIXES NEEDED**

### **Priority 1: Chain Execution Logic**
```typescript
// Current Issue: handleChainSelect switches to snippets
// Fix: Implement proper chain execution

async function handleChainSelect(chain: Chain) {
  // Should execute chain.options[0].body
  // Should insert result into active app
  // Should hide overlay
}
```

### **Priority 2: Real-time Data Refresh**
```typescript
// Add IPC listener for chain updates
api.on('chains:updated', () => {
  loadData(); // Refresh overlay data
  renderAll(); // Re-render grids
});
```

### **Priority 3: Overlay Scrolling**
```css
/* Fix overlay height and scrolling */
#container {
  max-height: 80vh;
  overflow-y: auto;
}
```

### **Priority 4: Content Visibility**
```typescript
// Ensure only starter grid shows initially
function showFloatingGrids(position: string) {
  // Hide all grids except starterGrid
  // Don't switch to snippets on chain click
}
```

## **📈 TESTING METRICS**

### **Current Test Results**
- **Visual Tests**: 1/2 passing (50%)
- **Functional Tests**: 0/2 passing (0%)
- **Persistence Tests**: 2/2 passing (100%)
- **Overall Score**: 3/6 passing (50%)

### **Target Metrics for Phase 5 Complete**
- **Visual Tests**: 2/2 passing (100%)
- **Functional Tests**: 2/2 passing (100%)
- **Persistence Tests**: 2/2 passing (100%)
- **Overall Score**: 6/6 passing (100%)

## **🚀 NEXT TESTING PHASE**

### **Phase 6: Chain Syntax Testing**
```
Test Cases:
1. [Chain:ChainName] reference resolution
2. [?:FieldName] custom prompt functionality
3. Chain navigation flow (click → execute → vanish → next)
4. Error handling for invalid chains
5. Nested chain execution
```

### **Phase 7: Performance Testing**
```
Test Cases:
1. Overlay show/hide responsiveness
2. Large chain list performance
3. Memory usage during extended use
4. Database query optimization
```

## **📋 TESTING CHECKLIST**

### **Before Each Test Session**
- [ ] Start fresh app instance
- [ ] Clear console logs
- [ ] Note current database state
- [ ] Document test environment

### **During Testing**
- [ ] Record console output
- [ ] Screenshot visual issues
- [ ] Note performance observations
- [ ] Document unexpected behaviors

### **After Testing**
- [ ] Update test results
- [ ] Log issues found
- [ ] Prioritize fixes needed
- [ ] Plan next test cycle

---

**Framework Version**: 1.0  
**Last Updated**: January 26, 2025  
**Test Coverage**: Core overlay functionality  
**Next Review**: After Priority 1-4 fixes implemented 