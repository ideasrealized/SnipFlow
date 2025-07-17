import React, { useState, useEffect } from 'react';
import { Settings } from '../types';

interface OverlayNodePreviewProps {
  settings: Settings;
  onSettingChange: (key: string, value: any) => void;
}

const OverlayNodePreview: React.FC<OverlayNodePreviewProps> = ({ settings, onSettingChange }) => {
  const [previewScale, setPreviewScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tempDimensions, setTempDimensions] = useState({
    width: settings.overlay.nodeWidth || 180,
    height: settings.overlay.nodeHeight || 90
  });

  // Node style options with visual representations
  const nodeStyles = [
    { 
      value: 'square', 
      label: 'Square', 
      icon: '⬜',
      description: 'Clean, modern square edges'
    },
    { 
      value: 'rounded', 
      label: 'Rounded', 
      icon: '▢',
      description: 'Soft rounded corners'
    },
    { 
      value: 'circle', 
      label: 'Circle', 
      icon: '⭕',
      description: 'Perfect circular shape'
    },
    { 
      value: 'hexagon', 
      label: 'Hexagon', 
      icon: '⬡',
      description: 'Modern hexagonal design'
    }
  ];

  const animationSpeeds = [
    { value: 'instant', label: 'Instant', duration: '0s' },
    { value: 'fast', label: 'Fast', duration: '0.15s' },
    { value: 'normal', label: 'Normal', duration: '0.3s' },
    { value: 'slow', label: 'Slow', duration: '0.5s' }
  ];

  // Handle resize drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    const newWidth = Math.max(120, Math.min(400, tempDimensions.width + deltaX));
    const newHeight = Math.max(60, Math.min(200, tempDimensions.height + deltaY));
    
    setTempDimensions({ width: newWidth, height: newHeight });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      onSettingChange('overlay.nodeWidth', tempDimensions.width);
      onSettingChange('overlay.nodeHeight', tempDimensions.height);
      setIsDragging(false);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    // Return undefined when not dragging to satisfy TypeScript
    return undefined;
  }, [isDragging, dragStart, tempDimensions]);

  // Sync temp dimensions with settings when not dragging
  useEffect(() => {
    if (!isDragging) {
      setTempDimensions({
        width: settings.overlay.nodeWidth || 180,
        height: settings.overlay.nodeHeight || 90
      });
    }
  }, [settings.overlay.nodeWidth, settings.overlay.nodeHeight, isDragging]);

  const getNodeStyle = (nodeStyle: string) => {
    const baseStyle = {
      width: `${tempDimensions.width * previewScale}px`,
      height: `${tempDimensions.height * previewScale}px`,
      backgroundColor: 'rgba(20, 20, 20, 0.98)',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '12px',
      fontWeight: 'bold',
      textAlign: 'center' as const,
      cursor: isDragging ? 'nw-resize' : 'default',
      transition: `all ${animationSpeeds.find(speed => speed.value === settings.overlay.animationSpeed)?.duration || '0.3s'} ease`,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      position: 'relative' as const,
      userSelect: 'none' as const,
    };

    switch (nodeStyle) {
      case 'square':
        return { ...baseStyle, borderRadius: '0' };
      case 'rounded':
        return { ...baseStyle, borderRadius: `${(settings.overlay.nodeRadius || 12) * previewScale}px` };
      case 'circle':
        return { ...baseStyle, borderRadius: '50%', aspectRatio: '1' };
      case 'hexagon':
        return { 
          ...baseStyle, 
          borderRadius: '0',
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)'
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Node Customization</h3>
        
        {/* Preview Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-gray-300">Live Preview</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewScale(Math.max(0.5, previewScale - 0.1))}
                className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600"
              >
                -
              </button>
              <span className="text-xs text-gray-400">{Math.round(previewScale * 100)}%</span>
              <button
                onClick={() => setPreviewScale(Math.min(2, previewScale + 0.1))}
                className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 bg-gray-900 min-h-[200px] flex items-center justify-center relative">
            {/* Preview Grid */}
            <div 
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${Math.min(3, settings.overlay.gridCols || 2)}, 1fr)`,
                gap: `${(settings.overlay.nodeGap || 8) * previewScale}px`
              }}
            >
              {[...Array(Math.min(6, (settings.overlay.gridCols || 2) * (settings.overlay.gridRows || 3)))].map((_, i) => (
                <div
                  key={i}
                  style={getNodeStyle(settings.overlay.nodeStyle || 'rounded')}
                  className="hover:transform hover:scale-105 transition-transform"
                >
                  {i === 0 ? 'Preview' : `Node ${i + 1}`}
                </div>
              ))}
            </div>
            
            {/* Resize Handle */}
            <div
              className="absolute bottom-2 right-2 w-4 h-4 bg-blue-500 rounded cursor-nw-resize hover:bg-blue-400 transition-colors"
              onMouseDown={handleMouseDown}
              title="Drag to resize nodes"
            />
          </div>
          
          <div className="mt-2 text-xs text-gray-400 text-center">
            Drag the blue handle to resize • Use zoom controls to scale preview
          </div>
        </div>

        {/* Node Style Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Node Style</label>
          <div className="grid grid-cols-2 gap-3">
            {nodeStyles.map((style) => (
              <button
                key={style.value}
                onClick={() => onSettingChange('overlay.nodeStyle', style.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  settings.overlay.nodeStyle === style.value
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{style.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{style.label}</div>
                    <div className="text-xs text-gray-400">{style.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Width: {tempDimensions.width}px
            </label>
            <input
              type="range"
              min="120"
              max="400"
              value={tempDimensions.width}
              onChange={(e) => {
                const width = parseInt(e.target.value);
                setTempDimensions(prev => ({ ...prev, width }));
                onSettingChange('overlay.nodeWidth', width);
              }}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Height: {tempDimensions.height}px
            </label>
            <input
              type="range"
              min="60"
              max="200"
              value={tempDimensions.height}
              onChange={(e) => {
                const height = parseInt(e.target.value);
                setTempDimensions(prev => ({ ...prev, height }));
                onSettingChange('overlay.nodeHeight', height);
              }}
              className="w-full"
            />
          </div>
        </div>

        {/* Gap and Border Radius */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Gap: {settings.overlay.nodeGap || 8}px
            </label>
            <input
              type="range"
              min="0"
              max="24"
              value={settings.overlay.nodeGap || 8}
              onChange={(e) => onSettingChange('overlay.nodeGap', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Border Radius: {settings.overlay.nodeRadius || 12}px
            </label>
            <input
              type="range"
              min="0"
              max="24"
              value={settings.overlay.nodeRadius || 12}
              onChange={(e) => onSettingChange('overlay.nodeRadius', parseInt(e.target.value))}
              className="w-full"
              disabled={settings.overlay.nodeStyle === 'square' || settings.overlay.nodeStyle === 'circle' || settings.overlay.nodeStyle === 'hexagon'}
            />
          </div>
        </div>

        {/* Animation Speed */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Animation Speed</label>
          <div className="flex space-x-2">
            {animationSpeeds.map((speed) => (
              <button
                key={speed.value}
                onClick={() => onSettingChange('overlay.animationSpeed', speed.value)}
                className={`px-3 py-2 rounded text-sm transition-all ${
                  settings.overlay.animationSpeed === speed.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {speed.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Grid Columns: {settings.overlay.gridCols || 2}
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={settings.overlay.gridCols || 2}
              onChange={(e) => onSettingChange('overlay.gridCols', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Grid Rows: {settings.overlay.gridRows || 3}
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={settings.overlay.gridRows || 3}
              onChange={(e) => onSettingChange('overlay.gridRows', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverlayNodePreview;
