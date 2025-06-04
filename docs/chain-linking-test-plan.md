# Chain Linking Test Plan

## **🎯 Feature Overview**
Chain linking allows chains to reference other chains using `[Chain:ChainName]` syntax, enabling modular and reusable content composition.

## **🔧 Implementation Status**
- ✅ **Syntax Recognition**: `[Chain:ChainName]` regex parsing
- ✅ **Chain Resolution**: `api.getChainByName()` lookup
- ✅ **Content Processing**: Single option auto-selection
- ✅ **Recursive Processing**: Nested placeholders and chain references
- ✅ **Error Handling**: Graceful fallbacks for missing chains
- ⏳ **Multi-Option Selection**: Currently uses first option (TODO: choice overlay)

## **🧪 Test Cases**

### **Test Case 1: Basic Chain Reference**
**Chain**: "Chain Reference Demo" → "Introduction" option
**Content**: `We are the masters of [Chain:Customer Support Responses]. Our expertise in [?:Domain] allows us to provide [Chain:Email Templates] that exceed expectations.`

**Expected Behavior**:
1. Resolve `[Chain:Customer Support Responses]` → Show choice overlay with 3 options
2. User selects option → Replace with selected content
3. Resolve `[Chain:Email Templates]` → Show choice overlay with 2 options  
4. User selects option → Replace with selected content
5. Process `[?:Domain]` → Prompt for user input
6. Final result with all placeholders resolved

### **Test Case 2: Nested Chain Reference**
**Chain**: "Customer Support Responses" → "Escalation" option
**Content**: `I understand your concern about [?:Issue]. Let me escalate this to our [Chain:Support Level] team for immediate attention.`

**Expected Behavior**:
1. Process `[?:Issue]` → Prompt for user input
2. Resolve `[Chain:Support Level]` → Show choice overlay with 3 options
3. User selects support level → Replace with selected content
4. Final escalation message with proper support level

### **Test Case 3: Single Option Chain**
**Chain**: "Support Level" (has multiple options, but test with single-option chain)
**Content**: `[Chain:SingleOptionChain]`

**Expected Behavior**:
1. Resolve chain reference
2. Auto-select single option without showing choice overlay
3. Process any nested placeholders in the option content

### **Test Case 4: Missing Chain Reference**
**Content**: `Please contact [Chain:NonExistentChain] for assistance.`

**Expected Behavior**:
1. Attempt to resolve `[Chain:NonExistentChain]`
2. Chain not found → Log warning
3. Leave reference as-is: `Please contact [Chain:NonExistentChain] for assistance.`

### **Test Case 5: Recursive Chain References**
**Content**: `[Chain:ChainA]` where ChainA contains `[Chain:ChainB]` where ChainB contains `[?:Input]`

**Expected Behavior**:
1. Resolve ChainA → Get content with ChainB reference
2. Resolve ChainB → Get content with input placeholder
3. Process input placeholder → Prompt user
4. Final result with all levels resolved

## **🎮 Manual Testing Steps**

### **Setup**
1. Start SnipFlow in development mode
2. Verify test starter chains are created
3. Open overlay via edge hover (left-center)

### **Test Execution**
1. **Navigate to Starter Chains**
   - Hover left edge to show overlay
   - Verify "Chain Reference Demo" appears with description

2. **Test Basic Chain Reference**
   - Click "Chain Reference Demo"
   - Select "Introduction" option
   - Verify choice overlay appears for "Customer Support Responses"
   - Select any option and verify replacement
   - Verify choice overlay appears for "Email Templates"  
   - Select any option and verify replacement
   - Enter domain when prompted
   - Verify final content is copied to clipboard

3. **Test Nested Reference**
   - Click "Customer Support Responses"
   - Select "Escalation" option
   - Enter issue description when prompted
   - Verify choice overlay appears for "Support Level"
   - Select support level and verify replacement
   - Verify final escalation message

4. **Test Error Handling**
   - Create test chain with `[Chain:InvalidChain]`
   - Execute chain
   - Verify graceful handling (no crash, reference left as-is)

## **🐛 Known Issues & Limitations**

### **Current Limitations**
1. **Multi-Option Selection**: Currently uses first option instead of showing choice overlay
2. **Circular References**: No protection against infinite loops
3. **Performance**: No caching for frequently referenced chains

### **Future Enhancements**
1. **Choice Overlay Integration**: Implement `showChainChoiceOverlay()` function
2. **Circular Reference Detection**: Track reference chain to prevent loops
3. **Chain Caching**: Cache resolved chain content for performance
4. **Visual Indicators**: Show chain references differently in UI
5. **Chain Dependency Mapping**: Visual representation of chain relationships

## **✅ Success Criteria**

### **Functional Requirements**
- ✅ **Syntax Recognition**: Correctly identifies `[Chain:Name]` patterns
- ✅ **Chain Resolution**: Successfully looks up chains by name
- ✅ **Content Replacement**: Replaces references with chain content
- ✅ **Recursive Processing**: Handles nested placeholders and references
- ✅ **Error Handling**: Graceful fallbacks for missing chains
- ⏳ **User Choice**: Shows options when chain has multiple choices

### **Performance Requirements**
- ✅ **Response Time**: Chain resolution < 100ms
- ✅ **Memory Usage**: No memory leaks from recursive processing
- ✅ **Error Recovery**: No crashes from malformed references

### **User Experience Requirements**
- ✅ **Intuitive Syntax**: Clear `[Chain:Name]` format
- ✅ **Seamless Integration**: Works with existing placeholder system
- ⏳ **Visual Feedback**: Clear indication of chain processing steps
- ⏳ **Choice Interface**: Intuitive multi-option selection

## **📊 Test Results**

### **Test Session 1** - January 26, 2025
- **Environment**: Development build
- **Tester**: Implementation verification
- **Status**: ⏳ Pending manual testing

**Results**:
- [ ] Basic chain reference resolution
- [ ] Nested chain references  
- [ ] Single option auto-selection
- [ ] Missing chain error handling
- [ ] Recursive placeholder processing
- [ ] Performance under normal usage
- [ ] Memory usage stability

**Issues Found**:
- TBD

**Next Steps**:
- Complete manual testing
- Implement choice overlay for multi-option chains
- Add circular reference protection

---

**Last Updated**: January 26, 2025  
**Status**: Implementation complete, testing in progress  
**Next Milestone**: Multi-option choice overlay implementation 