# Chain Options Overlay Implementation

## **New Functionality Added**

### **🎯 Chain Options Display**
When clicking a starter chain with multiple options, the overlay now:
1. **Hides starter chains grid**
2. **Shows chain options overlay** with individual option buttons
3. **Displays chain name** as header
4. **Provides back button** to return to starter chains

### **🔄 User Flow**
```
Hover Edge → Starter Chains → Click Chain → Options Overlay → Click Option → Process & Copy
                ↑                           ↓
                ← Back Button ← ← ← ← ← ← ← ←
```

### **⚙️ Processing Logic**
- **Single Option**: Execute directly (no options overlay)
- **Multiple Options**: Show options overlay for selection
- **No Options**: Fallback to chain name

## **Technical Implementation**

### **New Functions Added**

#### **`showChainOptionsOverlay(chain: Chain)`**
- Creates dynamic options overlay
- Generates buttons for each chain option
- Adds back button and header
- Handles styling and layout

#### **`handleChainOptionSelect(chain: Chain, option: ChainOption)`**
- Processes selected option content
- Handles `[?:FieldName]` placeholders
- Copies final content to clipboard
- Hides overlay after execution

#### **`processPlaceholders(content: string)`**
- Finds all `[?:FieldName]` patterns
- Prompts user for input via `presentInput()`
- Replaces placeholders with user input
- Returns processed content

#### **`showStarterChainsView()`**
- Returns to starter chains display
- Hides options overlay
- Resets current chain state

### **Enhanced Keyboard Support**
- **Escape Key**: 
  - In options view → Return to starter chains
  - In starter view → Hide overlay completely

## **Placeholder Processing**

### **Supported Syntax**
- `[?:Customer]` → Prompts for "Customer" input
- `[?:Name]` → Prompts for "Name" input
- `[?:Any Field]` → Prompts for "Any Field" input

### **Processing Flow**
1. **Detect** placeholders using regex: `/\[?\?:([^\]]+)\]/g`
2. **Extract** field name from placeholder
3. **Prompt** user with input dialog
4. **Replace** placeholder with user input
5. **Continue** with processed content

## **Example Usage**

### **Chain with Multiple Options**
```
Chain: "Inquiry"
Options:
  1. "Model" → "Please send model number"
  2. "Estimate" → "Hello [?:Customer], estimate is [?:Amount]"
  3. "Tech Update" → "Technical update for [?:Customer]"
```

### **User Experience**
1. **Click "Inquiry"** → Options overlay shows
2. **Click "Estimate"** → Prompts for Customer, then Amount
3. **Enter values** → "Hello John, estimate is $500"
4. **Content copied** → Ready to paste

## **Current Limitations & Future Enhancements**

### **✅ Working**
- Multiple option display
- Single option direct execution
- Basic placeholder processing (`[?:Field]`)
- Back navigation
- Keyboard support

### **🔄 Planned (Phase 6)**
- `[Chain:ChainName]` reference processing
- Nested chain navigation
- `[User*Name]` auto-population
- Chain linking workflows

### **🎨 UI Improvements Needed**
- Chain Manager layout fixes (long chain names)
- Pinned chains functionality
- Chain categories
- Drag-and-drop positioning

## **Testing Instructions**

### **Manual Testing**
1. **Start app** and mark chains with multiple options as starters
2. **Hover left edge** to show overlay
3. **Click multi-option starter** → Should show options overlay
4. **Click option** → Should prompt for placeholders if present
5. **Check clipboard** → Should contain processed content

### **Console Testing**
1. **Open overlay dev tools**
2. **Run**: `packages/desktop/test-chain-options.js`
3. **Verify**: Functions available and working
4. **Test**: Multi-option chain detection

### **Keyboard Testing**
1. **Show options overlay**
2. **Press Escape** → Should return to starter chains
3. **Press Escape again** → Should hide overlay

## **Code Changes Made**

### **overlay.ts Modifications**
- Added `currentChain` global variable
- Modified `handleChainSelect()` for options display
- Added chain options overlay functions
- Enhanced keyboard event handling
- Updated `showFloatingGrids()` to support chain runner

### **New Dependencies**
- Uses existing `presentInput()` function
- Leverages `chainRunner` HTML element
- Maintains existing styling variables

## **Integration Points**

### **With Existing Systems**
- ✅ **Settings System** - Respects overlay positioning
- ✅ **Real-time Updates** - Chain changes reflect immediately  
- ✅ **Clipboard Integration** - Uses existing `insertSnippet` IPC
- ✅ **Visual Feedback** - Shows flash messages on success/error

### **Future Integration**
- 🔄 **Chain Linking** - `[Chain:]` references
- 🔄 **User System** - `[User*Name]` auto-population
- 🔄 **QuickSnips** - Secondary overlay system

---

**Implementation Date**: January 26, 2025  
**Status**: Core chain options functionality complete  
**Next Phase**: Chain linking and nested navigation 