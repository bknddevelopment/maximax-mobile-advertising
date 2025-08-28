import React, { useState, useRef, useCallback, useEffect } from 'react';

interface DesignElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'logo';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  fontSize?: number;
  fontFamily?: string;
  opacity: number;
  zIndex: number;
}

interface Template {
  id: string;
  name: string;
  thumbnail: string;
  elements: DesignElement[];
  category: string;
}

const BillboardBuilder: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [billboardSize, setBillboardSize] = useState({ width: 800, height: 400 });
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [showGrid, setShowGrid] = useState(true);
  const [previewMode, setPreviewMode] = useState<'edit' | 'day' | 'night'>('edit');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates: Template[] = [
    {
      id: 'sale-burst',
      name: 'Sale Burst',
      category: 'Retail',
      thumbnail: '💥',
      elements: [
        {
          id: 'sale-text',
          type: 'text',
          content: 'MEGA SALE',
          x: 200,
          y: 100,
          width: 400,
          height: 100,
          rotation: -5,
          color: '#FF0000',
          fontSize: 72,
          fontFamily: 'Impact, sans-serif',
          opacity: 1,
          zIndex: 2
        },
        {
          id: 'discount-text',
          type: 'text',
          content: '50% OFF',
          x: 250,
          y: 220,
          width: 300,
          height: 80,
          rotation: 0,
          color: '#FFD700',
          fontSize: 48,
          fontFamily: 'Arial Black, sans-serif',
          opacity: 1,
          zIndex: 3
        },
        {
          id: 'burst-shape',
          type: 'shape',
          content: 'burst',
          x: 150,
          y: 50,
          width: 500,
          height: 300,
          rotation: 0,
          color: '#FF6B6B',
          opacity: 0.3,
          zIndex: 1
        }
      ]
    },
    {
      id: 'event-promo',
      name: 'Event Promotion',
      category: 'Events',
      thumbnail: '🎉',
      elements: [
        {
          id: 'event-title',
          type: 'text',
          content: 'SUMMER FESTIVAL',
          x: 100,
          y: 80,
          width: 600,
          height: 80,
          rotation: 0,
          color: '#00AEEF',
          fontSize: 56,
          fontFamily: 'Helvetica, sans-serif',
          opacity: 1,
          zIndex: 2
        },
        {
          id: 'date-text',
          type: 'text',
          content: 'JULY 15-17',
          x: 200,
          y: 180,
          width: 400,
          height: 60,
          rotation: 0,
          color: '#EC008C',
          fontSize: 42,
          fontFamily: 'Arial, sans-serif',
          opacity: 1,
          zIndex: 2
        },
        {
          id: 'location-text',
          type: 'text',
          content: 'Bayfront Park',
          x: 250,
          y: 260,
          width: 300,
          height: 50,
          rotation: 0,
          color: '#333333',
          fontSize: 32,
          fontFamily: 'Georgia, serif',
          opacity: 1,
          zIndex: 2
        }
      ]
    },
    {
      id: 'restaurant',
      name: 'Restaurant Special',
      category: 'Food',
      thumbnail: '🍔',
      elements: [
        {
          id: 'restaurant-name',
          type: 'text',
          content: 'BURGER PARADISE',
          x: 150,
          y: 60,
          width: 500,
          height: 70,
          rotation: 0,
          color: '#8B4513',
          fontSize: 48,
          fontFamily: 'Courier New, monospace',
          opacity: 1,
          zIndex: 2
        },
        {
          id: 'offer-text',
          type: 'text',
          content: 'Buy 1 Get 1 FREE',
          x: 200,
          y: 160,
          width: 400,
          height: 60,
          rotation: 0,
          color: '#FF6347',
          fontSize: 42,
          fontFamily: 'Arial Black, sans-serif',
          opacity: 1,
          zIndex: 3
        },
        {
          id: 'hours-text',
          type: 'text',
          content: 'Mon-Fri 11AM-3PM',
          x: 225,
          y: 250,
          width: 350,
          height: 40,
          rotation: 0,
          color: '#228B22',
          fontSize: 28,
          fontFamily: 'Verdana, sans-serif',
          opacity: 1,
          zIndex: 2
        }
      ]
    }
  ];

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (previewMode === 'night') {
      // Night mode - darker background
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add subtle glow effect
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      gradient.addColorStop(0, 'rgba(236, 0, 140, 0.1)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (previewMode === 'day') {
      // Day mode - bright background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add sun glare effect
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.8, canvas.height * 0.2, 0,
        canvas.width * 0.8, canvas.height * 0.2, 200
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      // Edit mode
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw grid in edit mode
    if (showGrid && previewMode === 'edit') {
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let x = 0; x <= canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y <= canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw elements
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    
    sortedElements.forEach(element => {
      ctx.save();
      
      // Apply transformations
      ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.globalAlpha = element.opacity;

      // Adjust colors for night mode
      let displayColor = element.color;
      if (previewMode === 'night') {
        // Make colors more vibrant for night visibility
        displayColor = adjustColorForNight(element.color);
      }

      if (element.type === 'text') {
        ctx.font = `${element.fontSize}px ${element.fontFamily}`;
        ctx.fillStyle = displayColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add glow effect for night mode
        if (previewMode === 'night') {
          ctx.shadowColor = displayColor;
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
        
        ctx.fillText(element.content, 0, 0);
        
        // Reset shadow
        ctx.shadowBlur = 0;
      } else if (element.type === 'shape') {
        ctx.fillStyle = displayColor;
        
        if (element.content === 'burst') {
          // Draw burst shape
          const spikes = 12;
          const outerRadius = Math.min(element.width, element.height) / 2;
          const innerRadius = outerRadius * 0.5;
          
          ctx.beginPath();
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI * i) / spikes;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          ctx.fill();
        } else {
          // Default rectangle
          ctx.fillRect(-element.width / 2, -element.height / 2, element.width, element.height);
        }
      } else if (element.type === 'image') {
        // Placeholder for image
        ctx.fillStyle = '#E5E7EB';
        ctx.fillRect(-element.width / 2, -element.height / 2, element.width, element.height);
        ctx.strokeStyle = '#9CA3AF';
        ctx.strokeRect(-element.width / 2, -element.height / 2, element.width, element.height);
        
        ctx.fillStyle = '#6B7280';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Image Placeholder', 0, 0);
      }

      // Draw selection border in edit mode
      if (previewMode === 'edit' && selectedElement === element.id) {
        ctx.strokeStyle = '#EC008C';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-element.width / 2 - 5, -element.height / 2 - 5, element.width + 10, element.height + 10);
        
        // Draw resize handles
        const handleSize = 8;
        ctx.fillStyle = '#EC008C';
        ctx.setLineDash([]);
        
        // Corners
        ctx.fillRect(-element.width / 2 - handleSize / 2, -element.height / 2 - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(element.width / 2 - handleSize / 2, -element.height / 2 - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(-element.width / 2 - handleSize / 2, element.height / 2 - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(element.width / 2 - handleSize / 2, element.height / 2 - handleSize / 2, handleSize, handleSize);
      }
      
      ctx.restore();
    });

    // Draw truck frame overlay in preview modes
    if (previewMode !== 'edit') {
      ctx.strokeStyle = '#4A5568';
      ctx.lineWidth = 20;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      
      // Add LED indicators
      const ledSize = 6;
      const ledSpacing = 15;
      
      ctx.fillStyle = '#10B981';
      for (let x = ledSpacing; x < canvas.width; x += ledSpacing) {
        ctx.beginPath();
        ctx.arc(x, 10, ledSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, canvas.height - 10, ledSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      for (let y = ledSpacing; y < canvas.height; y += ledSpacing) {
        ctx.beginPath();
        ctx.arc(10, y, ledSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canvas.width - 10, y, ledSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [elements, selectedElement, backgroundColor, showGrid, previewMode]);

  const adjustColorForNight = (color: string): string => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Increase brightness for night visibility
    const brightnessBoost = 1.5;
    const newR = Math.min(255, r * brightnessBoost);
    const newG = Math.min(255, g * brightnessBoost);
    const newB = Math.min(255, b * brightnessBoost);
    
    return `rgb(${newR}, ${newG}, ${newB})`;
  };

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (previewMode !== 'edit') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find clicked element
    const clickedElement = [...elements].reverse().find(element => {
      return x >= element.x && x <= element.x + element.width &&
             y >= element.y && y <= element.y + element.height;
    });
    
    if (clickedElement) {
      setSelectedElement(clickedElement.id);
      setIsDragging(true);
      setDragOffset({
        x: x - clickedElement.x,
        y: y - clickedElement.y
      });
    } else {
      setSelectedElement(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedElement || previewMode !== 'edit') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    
    setElements(prev => prev.map(element => {
      if (element.id === selectedElement) {
        return { ...element, x, y };
      }
      return element;
    }));
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const addElement = (type: DesignElement['type']) => {
    const newElement: DesignElement = {
      id: `element-${Date.now()}`,
      type,
      content: type === 'text' ? 'Your Text Here' : type,
      x: 300,
      y: 150,
      width: 200,
      height: type === 'text' ? 60 : 100,
      rotation: 0,
      color: '#EC008C',
      fontSize: type === 'text' ? 36 : undefined,
      fontFamily: type === 'text' ? 'Arial, sans-serif' : undefined,
      opacity: 1,
      zIndex: elements.length + 1
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    setElements(prev => prev.map(element => {
      if (element.id === id) {
        return { ...element, ...updates };
      }
      return element;
    }));
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(element => element.id !== id));
    setSelectedElement(null);
  };

  const loadTemplate = (template: Template) => {
    setElements(template.elements);
    setSelectedTemplate(template.id);
  };

  const exportDesign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'billboard-design.png';
    link.href = dataUrl;
    link.click();
  };

  const selectedElementData = elements.find(e => e.id === selectedElement);

  return (
    <div className="billboard-builder">
      <div className="builder-header">
        <h2>Billboard Preview Builder</h2>
        <p>Design your perfect mobile billboard with our intuitive drag-and-drop editor</p>
      </div>

      <div className="builder-container">
        <div className="builder-sidebar">
          <div className="sidebar-section">
            <h3>Templates</h3>
            <div className="template-grid">
              {templates.map(template => (
                <button
                  key={template.id}
                  className={`template-card ${selectedTemplate === template.id ? 'active' : ''}`}
                  onClick={() => loadTemplate(template)}
                >
                  <div className="template-thumb">{template.thumbnail}</div>
                  <span>{template.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Add Elements</h3>
            <div className="element-buttons">
              <button className="element-btn" onClick={() => addElement('text')}>
                <span className="element-icon">T</span>
                Add Text
              </button>
              <button className="element-btn" onClick={() => addElement('shape')}>
                <span className="element-icon">◆</span>
                Add Shape
              </button>
              <button className="element-btn" onClick={() => addElement('image')}>
                <span className="element-icon">🖼</span>
                Add Image
              </button>
            </div>
          </div>

          {selectedElementData && (
            <div className="sidebar-section">
              <h3>Element Properties</h3>
              <div className="properties-panel">
                {selectedElementData.type === 'text' && (
                  <div className="property-group">
                    <label>Text Content</label>
                    <input
                      type="text"
                      value={selectedElementData.content}
                      onChange={(e) => updateElement(selectedElement!, { content: e.target.value })}
                    />
                  </div>
                )}
                
                <div className="property-group">
                  <label>Color</label>
                  <input
                    type="color"
                    value={selectedElementData.color}
                    onChange={(e) => updateElement(selectedElement!, { color: e.target.value })}
                  />
                </div>

                {selectedElementData.type === 'text' && (
                  <>
                    <div className="property-group">
                      <label>Font Size</label>
                      <input
                        type="range"
                        min="12"
                        max="120"
                        value={selectedElementData.fontSize}
                        onChange={(e) => updateElement(selectedElement!, { fontSize: parseInt(e.target.value) })}
                      />
                      <span>{selectedElementData.fontSize}px</span>
                    </div>

                    <div className="property-group">
                      <label>Font Family</label>
                      <select
                        value={selectedElementData.fontFamily}
                        onChange={(e) => updateElement(selectedElement!, { fontFamily: e.target.value })}
                      >
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Impact, sans-serif">Impact</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="Courier New, monospace">Courier</option>
                        <option value="Helvetica, sans-serif">Helvetica</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="property-group">
                  <label>Rotation</label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={selectedElementData.rotation}
                    onChange={(e) => updateElement(selectedElement!, { rotation: parseInt(e.target.value) })}
                  />
                  <span>{selectedElementData.rotation}°</span>
                </div>

                <div className="property-group">
                  <label>Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedElementData.opacity}
                    onChange={(e) => updateElement(selectedElement!, { opacity: parseFloat(e.target.value) })}
                  />
                  <span>{Math.round(selectedElementData.opacity * 100)}%</span>
                </div>

                <div className="property-group">
                  <label>Layer Order</label>
                  <input
                    type="number"
                    min="1"
                    max={elements.length}
                    value={selectedElementData.zIndex}
                    onChange={(e) => updateElement(selectedElement!, { zIndex: parseInt(e.target.value) })}
                  />
                </div>

                <button 
                  className="delete-btn"
                  onClick={() => deleteElement(selectedElement!)}
                >
                  Delete Element
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="builder-main">
          <div className="canvas-controls">
            <div className="control-group">
              <label>Background Color</label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
            </div>

            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                />
                Show Grid
              </label>
            </div>

            <div className="preview-modes">
              <button
                className={`preview-btn ${previewMode === 'edit' ? 'active' : ''}`}
                onClick={() => setPreviewMode('edit')}
              >
                Edit Mode
              </button>
              <button
                className={`preview-btn ${previewMode === 'day' ? 'active' : ''}`}
                onClick={() => setPreviewMode('day')}
              >
                Day View
              </button>
              <button
                className={`preview-btn ${previewMode === 'night' ? 'active' : ''}`}
                onClick={() => setPreviewMode('night')}
              >
                Night View
              </button>
            </div>

            <button className="export-btn" onClick={exportDesign}>
              Export Design
            </button>
          </div>

          <div className="canvas-wrapper">
            <canvas
              ref={canvasRef}
              width={billboardSize.width}
              height={billboardSize.height}
              className="design-canvas"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
          </div>

          <div className="size-presets">
            <h4>Billboard Size Presets</h4>
            <div className="preset-buttons">
              <button onClick={() => setBillboardSize({ width: 800, height: 400 })}>
                Standard (800×400)
              </button>
              <button onClick={() => setBillboardSize({ width: 1000, height: 300 })}>
                Wide (1000×300)
              </button>
              <button onClick={() => setBillboardSize({ width: 600, height: 600 })}>
                Square (600×600)
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .billboard-builder {
          background: linear-gradient(135deg, #F8F9FA, #E9ECEF);
          border-radius: 20px;
          padding: 30px;
          margin: 20px 0;
        }

        .builder-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .builder-header h2 {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #EC008C, #00AEEF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }

        .builder-header p {
          color: #6B7280;
          font-size: 1.125rem;
        }

        .builder-container {
          display: flex;
          gap: 20px;
          background: white;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .builder-sidebar {
          width: 300px;
          background: #F8F9FA;
          border-radius: 10px;
          padding: 20px;
        }

        .sidebar-section {
          margin-bottom: 30px;
        }

        .sidebar-section h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 15px;
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .template-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px;
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .template-card:hover {
          border-color: #EC008C;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(236, 0, 140, 0.2);
        }

        .template-card.active {
          border-color: #EC008C;
          background: linear-gradient(135deg, #EC008C10, #00AEEF10);
        }

        .template-thumb {
          font-size: 2rem;
          margin-bottom: 5px;
        }

        .template-card span {
          font-size: 0.875rem;
          color: #6B7280;
          text-align: center;
        }

        .element-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .element-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .element-btn:hover {
          border-color: #00AEEF;
          background: linear-gradient(135deg, #00AEEF10, #EC008C10);
        }

        .element-icon {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #EC008C, #00AEEF);
          color: white;
          border-radius: 6px;
          font-weight: bold;
        }

        .properties-panel {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .property-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .property-group label {
          font-size: 0.875rem;
          color: #6B7280;
          font-weight: 600;
        }

        .property-group input,
        .property-group select {
          padding: 8px;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .property-group input[type="range"] {
          margin-right: 10px;
        }

        .delete-btn {
          padding: 10px;
          background: linear-gradient(135deg, #EF4444, #DC2626);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .delete-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .builder-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .canvas-controls {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 15px;
          background: #F8F9FA;
          border-radius: 10px;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .control-group label {
          font-size: 0.875rem;
          color: #6B7280;
          font-weight: 600;
        }

        .preview-modes {
          display: flex;
          gap: 5px;
          margin-left: auto;
        }

        .preview-btn {
          padding: 8px 16px;
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          color: #6B7280;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .preview-btn.active {
          background: linear-gradient(135deg, #EC008C, #00AEEF);
          color: white;
          border-color: transparent;
        }

        .export-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #10B981, #059669);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .canvas-wrapper {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .design-canvas {
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          cursor: ${isDragging ? 'grabbing' : 'grab'};
          background: white;
        }

        .size-presets {
          padding: 15px;
          background: #F8F9FA;
          border-radius: 10px;
        }

        .size-presets h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 10px;
        }

        .preset-buttons {
          display: flex;
          gap: 10px;
        }

        .preset-buttons button {
          padding: 8px 16px;
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          color: #6B7280;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .preset-buttons button:hover {
          border-color: #EC008C;
          color: #EC008C;
        }

        @media (max-width: 1024px) {
          .builder-container {
            flex-direction: column;
          }

          .builder-sidebar {
            width: 100%;
          }

          .template-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .canvas-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .preview-modes {
            margin-left: 0;
            justify-content: center;
          }

          .preset-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default BillboardBuilder;