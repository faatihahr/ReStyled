'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import html2canvas from 'html2canvas';
import { v4 as uuidv4 } from 'uuid';

interface OutfitItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface SavedOutfit {
  id: string;
  name: string;
  canvasImage: string | null;
  items: OutfitItem[];
  date: string;
  createdAt: string;
}

interface OutfitCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOutfit: OutfitItem[];
  wardrobeItems: any[];
  onSave: (outfit: SavedOutfit) => void;
  editingOutfit?: any;
  isEditingMode?: boolean;
}

export default function OutfitCanvasModal({
  isOpen,
  onClose,
  currentOutfit,
  wardrobeItems,
  onSave,
  editingOutfit,
  isEditingMode = false
}: OutfitCanvasModalProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showAccessories, setShowAccessories] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });

  // Filter accessories from wardrobe
  const accessories = wardrobeItems.filter(item => 
    ['jewelry', 'bags', 'hats', 'glasses', 'nails'].includes(item.category.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      // Initialize with current outfit items
      setOutfitItems(currentOutfit.map((item, index) => ({
        ...item,
        position: { x: 50 + (index % 3) * 150, y: 50 + Math.floor(index / 3) * 150 },
        size: { width: 120, height: 120 }
      })));
    }
  }, [isOpen, currentOutfit]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!selectedItem || !canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      
      if (isResizing && resizeHandle) {
        // Handle resizing
        const deltaX = e.clientX - initialMousePos.x;
        const deltaY = e.clientY - initialMousePos.y;
        
        setOutfitItems(prev => prev.map(item => {
          if (item.id === selectedItem) {
            let newWidth = initialSize.width;
            let newHeight = initialSize.height;
            
            if (resizeHandle.includes('right')) {
              newWidth = Math.max(50, initialSize.width + deltaX);
            }
            if (resizeHandle.includes('left')) {
              newWidth = Math.max(50, initialSize.width - deltaX);
            }
            if (resizeHandle.includes('bottom')) {
              newHeight = Math.max(50, initialSize.height + deltaY);
            }
            if (resizeHandle.includes('top')) {
              newHeight = Math.max(50, initialSize.height - deltaY);
            }
            
            return { ...item, size: { width: newWidth, height: newHeight } };
          }
          return item;
        }));
      } else if (isDragging) {
        // Handle dragging
        const newX = e.clientX - rect.left - dragOffset.x;
        const newY = e.clientY - rect.top - dragOffset.y;

        setOutfitItems(prev => prev.map(item => 
          item.id === selectedItem 
            ? { ...item, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
            : item
        ));
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
      // Don't clear selectedItem here - keep it selected until user clicks elsewhere
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [selectedItem, isDragging, isResizing, resizeHandle, dragOffset, initialSize, initialMousePos]);

  const handleMouseDown = (e: React.MouseEvent, itemId: string, handle?: string) => {
    const item = outfitItems.find(i => i.id === itemId);
    if (!item) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setSelectedItem(itemId);
    
    if (handle) {
      // Resizing
      setIsResizing(true);
      setResizeHandle(handle);
      setInitialSize({ width: item.size.width, height: item.size.height });
      setInitialMousePos({ x: e.clientX, y: e.clientY });
    } else {
      // Dragging
      setIsDragging(true);
      setIsResizing(false);
      setDragOffset({
        x: e.clientX - rect.left - item.position.x,
        y: e.clientY - rect.top - item.position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // This function is kept to prevent reference errors
    // Actual mouse handling is done by global event listeners
  };

  
  
  const addAccessory = (accessory: any) => {
    const newItem: OutfitItem = {
      id: uuidv4(),
      name: accessory.name,
      category: accessory.category,
      imageUrl: accessory.imageUrl,
      position: { x: 50, y: 50 },
      size: { width: 80, height: 80 }
    };
    setOutfitItems(prev => [...prev, newItem]);
  };

  const handleSave = () => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
    
    // Try to capture the actual DOM canvas with all images
    html2canvas(canvasElement, {
      backgroundColor: '#f8f9fa',
      scale: 1.5,
      useCORS: true,
      allowTaint: false,
      foreignObjectRendering: false,
      logging: false,
      ignoreElements: (element) => {
        // Ignore elements with problematic CSS
        return false;
      },
      onclone: (clonedDoc) => {
        // Remove problematic CSS classes and replace gradients
        const elements = clonedDoc.querySelectorAll('*');
        elements.forEach(el => {
          if (el instanceof HTMLElement) {
            // Remove all problematic CSS
            el.style.removeProperty('backdrop-filter');
            el.style.removeProperty('background');
            el.style.removeProperty('background-image');
            el.style.removeProperty('background-color');
            
            // Set simple solid background for all elements
            el.style.backgroundColor = '#f8f9fa';
            el.style.backgroundImage = 'none';
            
            // Remove all CSS classes that might contain gradients
            el.className = '';
          }
        });
      }
    })
    .then(canvas => {
      const dataUrl = canvas.toDataURL('image/png');
      
      onSave({
        id: isEditingMode && editingOutfit ? editingOutfit.id : uuidv4(),
        name: isEditingMode && editingOutfit ? editingOutfit.name : `Outfit ${new Date().toLocaleDateString()}`,
        canvasImage: dataUrl,
        items: outfitItems,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      
      onClose();
    })
    .catch(error => {
      console.error('html2canvas failed, trying manual approach:', error);
      
      // Manual canvas creation with actual images
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;
      
      tempCanvas.width = 800;
      tempCanvas.height = 600;
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Load images one by one and draw them
      const loadAndDrawImage = (item: OutfitItem): Promise<void> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          
          img.onload = () => {
            ctx.drawImage(
              img,
              item.position.x,
              item.position.y,
              item.size.width,
              item.size.height
            );
            resolve();
          };
          
          img.onerror = () => {
            // Draw placeholder if image fails
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(item.position.x, item.position.y, item.size.width, item.size.height);
            
            ctx.fillStyle = '#666';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw category name instead of full name
            const category = item.category.charAt(0) + item.category.slice(1).toLowerCase();
            ctx.fillText(
              category,
              item.position.x + item.size.width / 2,
              item.position.y + item.size.height / 2
            );
            resolve();
          };
          
          img.src = item.imageUrl;
        });
      };
      
      // Process all items sequentially
      outfitItems.reduce((promise, item) => {
        return promise.then(() => loadAndDrawImage(item));
      }, Promise.resolve())
      .then(() => {
        const dataUrl = tempCanvas.toDataURL('image/png');
        
        onSave({
          id: isEditingMode && editingOutfit ? editingOutfit.id : uuidv4(),
          name: isEditingMode && editingOutfit ? editingOutfit.name : `Outfit ${new Date().toLocaleDateString()}`,
          canvasImage: dataUrl,
          items: outfitItems,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
        
        onClose();
      })
      .catch(error => {
        console.error('Manual canvas creation failed:', error);
        
        // Final fallback - save without image
        onSave({
          id: isEditingMode && editingOutfit ? editingOutfit.id : uuidv4(),
          name: isEditingMode && editingOutfit ? editingOutfit.name : `Outfit ${new Date().toLocaleDateString()}`,
          canvasImage: null,
          items: outfitItems,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
        
        onClose();
      });
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#aace67]/30 via-pink-200/30 to-[#ffa4a4]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditingMode ? 'Edit Outfit' : 'Outfit Canvas'}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAccessories(!showAccessories)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Accessories
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save to Calendar
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-88px)]">
          {/* Main Canvas Area */}
          <div className="flex-1 p-6">
            <div
              ref={canvasRef}
              className="relative w-full h-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden"
              onClick={(e) => {
                // Deselect if clicking on empty canvas
                if (e.target === e.currentTarget) {
                  setSelectedItem(null);
                }
              }}
            >
              {outfitItems.map((item) => (
                <div
                  key={item.id}
                  className={`absolute cursor-move transition-shadow ${
                    selectedItem === item.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
                  }`}
                  style={{
                    left: `${item.position.x}px`,
                    top: `${item.position.y}px`,
                    width: `${item.size.width}px`,
                    height: `${item.size.height}px`
                  }}
                  onMouseDown={(e) => handleMouseDown(e, item.id)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                  {selectedItem === item.id && (
                    <>
                      {/* Resize handles */}
                      <div 
                        className="absolute w-4 h-4 bg-blue-500 rounded-full -top-2 -left-2 cursor-nw-resize z-10 hover:bg-blue-600"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleMouseDown(e, item.id, 'top-left');
                        }}
                      />
                      <div 
                        className="absolute w-4 h-4 bg-blue-500 rounded-full -top-2 -right-2 cursor-ne-resize z-10 hover:bg-blue-600"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleMouseDown(e, item.id, 'top-right');
                        }}
                      />
                      <div 
                        className="absolute w-4 h-4 bg-blue-500 rounded-full -bottom-2 -left-2 cursor-sw-resize z-10 hover:bg-blue-600"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleMouseDown(e, item.id, 'bottom-left');
                        }}
                      />
                      <div 
                        className="absolute w-4 h-4 bg-blue-500 rounded-full -bottom-2 -right-2 cursor-se-resize z-10 hover:bg-blue-600"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleMouseDown(e, item.id, 'bottom-right');
                        }}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Accessories Panel */}
          {showAccessories && (
            <div className="w-80 border-l p-4 overflow-y-auto">
              <h3 className="font-semibold text-gray-700 mb-4">Accessories</h3>
              <div className="grid grid-cols-2 gap-3">
                {accessories.map((accessory) => (
                  <div
                    key={accessory.id}
                    onClick={() => addAccessory(accessory)}
                    className="cursor-pointer hover:bg-gray-100 rounded-lg p-3 border transition-colors"
                  >
                    <img
                      src={accessory.imageUrl}
                      alt={accessory.name}
                      className="w-full h-20 object-contain mb-2"
                    />
                    <p className="text-xs text-center text-gray-600">{accessory.name}</p>
                  </div>
                ))}
              </div>
              {accessories.length === 0 && (
                <p className="text-gray-500 text-center py-8">No accessories found in wardrobe</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
