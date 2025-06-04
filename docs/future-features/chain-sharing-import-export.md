# Feature Request: Chain Sharing & Import/Export System

**Date**: 2025-01-26  
**Priority**: Medium-High  
**Category**: Collaboration & Data Exchange  
**Status**: Planned

## Overview
Enable users to share chains with other SnipFlow users through export/import functionality, allowing collaborative sharing of useful chain collections like referral directories, contact lists, and specialized workflows.

## User Story
> "I want the option to Share chains, and input chains that are shared. So if you really like a chain - say you have a category or chain full of recommendations, like a 'Referral Chain' which has contact info for plumbers, electricians, for different areas, different zipcodes etc all kinds of fields - and you have somebody else who uses this program, you can send them that, in a specific format or file. They can click upload or some manner where they can take shared chains and import them."

## Use Cases

### Primary Use Cases
1. **Professional Referral Sharing**: Share contact databases for contractors, services, professionals by geographic area
2. **Team Collaboration**: Share standardized response templates across team members
3. **Industry Templates**: Distribute industry-specific chain templates (legal, medical, customer service, etc.)
4. **Personal Backup**: Export chains for personal backup and restoration
5. **Cross-Device Sync**: Move chains between different installations

### Example Scenarios
- Real estate agent shares local contractor referral chains with colleagues
- Customer service team shares standardized response chains
- Medical practice shares appointment scheduling and follow-up chains
- Legal firm shares document template chains

## Technical Specifications

### Export Functionality
```typescript
interface ChainExportFormat {
  version: string;
  exportDate: string;
  exportedBy?: string;
  chains: ExportedChain[];
  metadata: {
    totalChains: number;
    categories: string[];
    tags: string[];
  };
}

interface ExportedChain {
  name: string;
  description?: string;
  options: ChainOption[];
  tags?: string[];
  category?: string;
  isStarterChain?: boolean;
  metadata: {
    originalId?: number;
    createdAt?: string;
    updatedAt?: string;
    version?: string;
  };
}
```

### File Formats
- **Primary**: `.snip` (JSON-based custom format) 🔥
- **Alternative**: `.json` (standard JSON export)
- **Compressed**: `.snippack` (ZIP containing multiple chains + metadata + images)

### Import Functionality
- **Conflict Resolution**: Handle duplicate chain names
- **Selective Import**: Choose which chains to import from a package
- **Merge Options**: Append vs. replace existing chains
- **Validation**: Verify chain integrity and compatibility
- **Image Handling**: Import embedded images and media assets

## UI/UX Design

### Export Interface
1. **Chain Selection**:
   - Individual chain export
   - Bulk selection with checkboxes
   - Category-based export
   - "Export All" option

2. **Export Options**:
   - Include/exclude metadata
   - Anonymize personal information
   - Add export notes/description
   - Choose file format

3. **Export Dialog**:
   ```
   ┌─ Export Chains ─────────────────────────┐
   │ ☑ Referral Chain                        │
   │ ☑ Customer Service Templates            │
   │ ☐ Personal Notes                        │
   │                                         │
   │ Export Format: [.snip ▼]                │
   │ Include Metadata: [☑]                   │
   │ Export Notes: [Optional description...] │
   │                                         │
   │ [Cancel] [Export to File]               │
   └─────────────────────────────────────────┘
   ```

### Import Interface
1. **File Selection**:
   - Drag & drop support
   - File browser dialog
   - URL import (future: cloud sharing)

2. **Preview & Selection**:
   ```
   ┌─ Import Chains ─────────────────────────┐
   │ File: referral-chains.snip               │
   │ Contains: 5 chains, 23 options, 8 images│
   │                                         │
   │ ☑ Plumbers - North Bay (3 options, 2📷) │
   │ ☑ Electricians - Sonoma (4 options, 1📷)│
   │ ☑ HVAC Services - All Areas (8 options) │
   │ ☐ Personal Contacts (5 options, 3📷)    │
   │ ☑ Emergency Services (3 options, 2📷)   │
   │                                         │
   │ Import Images: [☑] (1.8 MB total)       │
   │ Conflict Resolution:                    │
   │ ○ Skip duplicates ○ Rename ○ Replace   │
   │                                         │
   │ [Preview Images] [Cancel] [Import]      │
   └─────────────────────────────────────────┘
   ```

### Chain Manager Integration
- **Export Button**: Add to chain list context menu and toolbar
- **Import Button**: Add to main toolbar and file menu
- **Sharing Indicator**: Visual indicator for imported chains
- **Source Tracking**: Show origin of imported chains

## Implementation Plan

### Phase 1: Basic Export/Import
- [ ] Design export file format specification
- [ ] Implement single chain export functionality
- [ ] Create basic import dialog with file selection
- [ ] Add conflict resolution for duplicate names
- [ ] Basic validation and error handling

### Phase 2: Enhanced Features
- [ ] Bulk export with chain selection
- [ ] Import preview with selective import
- [ ] Metadata preservation and display
- [ ] Export/import history tracking
- [ ] Compressed package format support

### Phase 3: Advanced Sharing
- [ ] Cloud sharing integration (optional)
- [ ] QR code sharing for mobile
- [ ] Chain marketplace/repository (future)
- [ ] Version control for shared chains
- [ ] Collaborative editing features

## Technical Considerations

### Security & Privacy
- **Data Sanitization**: Option to remove personal/sensitive information
- **Validation**: Verify imported chains don't contain malicious content
- **Permissions**: Control what can be exported/imported
- **Audit Trail**: Track chain origins and modifications

### Compatibility
- **Version Compatibility**: Handle different SnipFlow versions
- **Schema Evolution**: Support for future chain format changes
- **Backward Compatibility**: Ensure older exports remain importable
- **Cross-Platform**: Work across Windows, Mac, Linux

### Performance
- **Large Exports**: Handle chains with many options efficiently
- **Streaming Import**: Process large files without blocking UI
- **Memory Management**: Efficient handling of bulk operations
- **Progress Indicators**: Show progress for long operations

## API Extensions

### New API Methods
```typescript
interface SnippetApi {
  // Export functionality
  exportChain: (chainId: number, options?: ExportOptions) => Promise<string>;
  exportChains: (chainIds: number[], options?: ExportOptions) => Promise<string>;
  exportAllChains: (options?: ExportOptions) => Promise<string>;
  
  // Import functionality
  importChainsFromFile: (filePath: string, options?: ImportOptions) => Promise<ImportResult>;
  previewImport: (filePath: string) => Promise<ImportPreview>;
  validateChainFile: (filePath: string) => Promise<ValidationResult>;
  
  // Image functionality
  addImageToChain: (chainId: number, optionId: string, imageData: ChainImage) => Promise<boolean>;
  removeImageFromChain: (chainId: number, optionId: string, imageId: string) => Promise<boolean>;
  getChainImages: (chainId: number) => Promise<ChainImage[]>;
  compressImage: (imageData: string, quality: number) => Promise<string>;
}

interface ExportOptions {
  includeImages?: boolean;
  compressImages?: boolean;
  imageQuality?: number; // 1-100
  includeMetadata?: boolean;
  anonymize?: boolean;
}

interface ImportOptions {
  importImages?: boolean;
  conflictResolution?: 'skip' | 'rename' | 'replace';
  selectedChains?: string[]; // Chain IDs to import
}
```

### File System Integration
- **File Associations**: Register `.snip` file type with SnipFlow
- **Context Menu**: "Import to SnipFlow" in file explorer for `.snip` files
- **Drag & Drop**: Support dropping `.snip` files onto application
- **Icon**: Custom `.snip` file icon in Windows Explorer

## Future Enhancements

### Cloud Integration
- **SnipFlow Cloud**: Optional cloud storage for chain sharing
- **Public Repository**: Community-contributed chain library
- **Team Workspaces**: Shared chain collections for organizations
- **Sync Service**: Keep chains synchronized across devices

### Social Features
- **Chain Ratings**: Community rating system for shared chains
- **Comments & Reviews**: Feedback on shared chains
- **User Profiles**: Track popular chain creators
- **Categories & Tags**: Organized browsing of shared chains

## Success Metrics
- Number of chains exported/imported per user
- User adoption rate of sharing features
- Community engagement with shared chains
- Reduction in duplicate chain creation
- User feedback and satisfaction scores

## Related Features
- **Chain Templates**: Pre-built chain templates for common use cases
- **Chain Versioning**: Track changes and updates to shared chains
- **Backup & Restore**: Automated backup with export functionality
- **Team Management**: User roles and permissions for shared chains

## Enhanced Chain Content: Images & Media Support

### Image Integration Features
1. **Embedded Images**:
   - Company logos for professional communications
   - Emojis and GIFs for social media responses
   - Screenshots for technical support chains
   - Diagrams and flowcharts for instructional content
   - Digital signatures with logos

2. **Supported Formats**:
   - **Images**: PNG, JPG, GIF, SVG, WebP
   - **Animated**: GIF, WebP animations
   - **Vector**: SVG for scalable logos
   - **Clipboard**: Paste images directly from clipboard

3. **Storage & Export**:
   - Images embedded as base64 in `.snip` files
   - External image folder for `.snippack` format
   - Automatic compression for file size optimization
   - Image preview in chain editor and overlay

### Technical Implementation for Images
```typescript
interface ChainOption {
  id: string;
  title: string;
  body: string;
  images?: ChainImage[]; // NEW: Image support
}

interface ChainImage {
  id: string;
  name: string;
  type: 'png' | 'jpg' | 'gif' | 'svg' | 'webp';
  data: string; // base64 encoded
  width?: number;
  height?: number;
  position: 'inline' | 'before' | 'after' | 'background';
  alt?: string;
}

interface ChainExportFormat {
  version: string;
  exportDate: string;
  exportedBy?: string;
  chains: ExportedChain[];
  images?: { [imageId: string]: ChainImage }; // Shared image library
  metadata: {
    totalChains: number;
    totalImages: number;
    categories: string[];
    tags: string[];
  };
}
```

### UI/UX for Image Support
1. **Chain Editor Enhancements**:
   - Drag & drop image upload
   - Image gallery/library panel
   - Inline image preview
   - Image positioning controls
   - Resize and crop tools

2. **Overlay Display**:
   - Render images in chain options
   - Thumbnail previews
   - Full-size image on hover/click
   - Copy image to clipboard option

3. **Export Dialog Updates**:
   ```
   ┌─ Export Chains ─────────────────────────┐
   │ ☑ Referral Chain (2 images)             │
   │ ☑ Customer Service Templates (5 images) │
   │ ☐ Personal Notes (0 images)             │
   │                                         │
   │ Export Format: [.snip ▼]                │
   │ Include Images: [☑] (2.3 MB)            │
   │ Compress Images: [☑] Quality: [80%]     │
   │ Export Notes: [Professional referrals]  │
   │                                         │
   │ [Cancel] [Export to File]               │
   └─────────────────────────────────────────┘
   ```

---

**Next Steps**:
1. Gather additional user feedback on specific sharing workflows
2. Create detailed technical specification for export format
3. Design mockups for export/import UI components
4. Estimate development effort and timeline
5. Plan integration with existing chain management system 