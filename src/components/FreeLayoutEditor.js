import React, { useState, useRef, useCallback } from 'react';
import { Move, Save, RotateCcw, Grid, Eye, Edit3, CheckCircle, X, Plus, Trash2, Settings } from 'lucide-react';

const FreeLayoutEditor = ({ machines, sections, onSaveLayout, onClose }) => {
  const [editMode, setEditMode] = useState(false);
  const [currentLayout, setCurrentLayout] = useState(() => {
    // Converter layout atual para posições livres
    const freeLayout = {};
    let yOffset = 100;
    
    Object.entries(sections).forEach(([sectionName, sectionData], sectionIndex) => {
      freeLayout[sectionName] = {
        ...sectionData,
        position: { x: 50, y: yOffset },
        size: { width: 300, height: 150 },
        machines: sectionData.machines.map((machineId, machineIndex) => ({
          id: machineId,
          position: { 
            x: 50 + (machineIndex % 6) * 60, 
            y: 30 + Math.floor(machineIndex / 6) * 50 
          }
        }))
      };
      yOffset += 200;
    });
    
    return freeLayout;
  });
  
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const canvasRef = useRef(null);

  // Função para obter dados de uma máquina específica
  const getMachineData = (machineId) => {
    return machines.find(m => m.id === machineId) || {
      id: machineId,
      status: 'Ocioso',
      operator: '',
      produced: 0,
      planned: 0,
      efficiency: 0
    };
  };

  // Função para obter cor do status
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-500';
    
    const statusNormalized = status.toString().toLowerCase().trim();
    
    if (statusNormalized.includes('produ')) return 'bg-green-500';
    if (statusNormalized.includes('manut') || statusNormalized.includes('parad')) return 'bg-red-500';
    if (statusNormalized.includes('qualid')) return 'bg-purple-500';
    if (statusNormalized.includes('setup')) return 'bg-pink-500';
    if (statusNormalized.includes('falta') && statusNormalized.includes('programa')) return 'bg-orange-500';
    if (statusNormalized.includes('falta') && statusNormalized.includes('operador')) return 'bg-yellow-500';
    if (statusNormalized.includes('refeic') || statusNormalized.includes('almoc')) return 'bg-blue-500';
    if (statusNormalized === 'ocioso' || statusNormalized === 'ociosa') return 'bg-black';
    
    return 'bg-gray-500';
  };

  // Iniciar drag de item (máquina ou setor)
  const handleMouseDown = (e, item, type, sectionName = null) => {
    if (!editMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    setDraggedItem({
      item,
      type, // 'machine' ou 'section'
      sectionName,
      startPos: {
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top
      }
    });
    
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setSelectedItem({ item, type, sectionName });
    
    console.log('🖱️ Iniciando drag:', type, item);
  };

  // Movimentar item
  const handleMouseMove = useCallback((e) => {
    if (!draggedItem || !editMode) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;
    
    setCurrentLayout(prev => {
      const newLayout = { ...prev };
      
      if (draggedItem.type === 'section') {
        // Mover setor inteiro
        newLayout[draggedItem.item] = {
          ...newLayout[draggedItem.item],
          position: { x: Math.max(0, newX), y: Math.max(0, newY) }
        };
      } else if (draggedItem.type === 'machine') {
        // Mover máquina dentro do setor
        const section = newLayout[draggedItem.sectionName];
        const machineId = typeof draggedItem.item === 'object' ? draggedItem.item.id : draggedItem.item;
        const machineIndex = section.machines.findIndex(m => 
          (typeof m === 'object' ? m.id : m) === machineId
        );
        
        if (machineIndex !== -1) {
          newLayout[draggedItem.sectionName] = {
            ...section,
            machines: section.machines.map((machine, index) => {
              if (index === machineIndex) {
                // Garantir que seja um objeto com position
                const currentMachine = typeof machine === 'object' ? machine : { id: machine, position: { x: 50, y: 50 } };
                return { 
                  ...currentMachine, 
                  position: { 
                    x: Math.max(5, newX - section.position.x), 
                    y: Math.max(25, newY - section.position.y) 
                  } 
                };
              }
              return machine;
            })
          };
        }
      }
      
      return newLayout;
    });
    
    setUnsavedChanges(true);
  }, [draggedItem, dragOffset, editMode]);

  // Finalizar drag
  const handleMouseUp = useCallback(() => {
    if (draggedItem) {
      console.log('🎯 Finalizando drag:', draggedItem.type, draggedItem.item);
      setDraggedItem(null);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [draggedItem]);

  // Event listeners para mouse
  React.useEffect(() => {
    if (editMode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [editMode, handleMouseMove, handleMouseUp]);

  // Adicionar novo setor
  const addNewSection = () => {
    const newSectionName = prompt('Nome do novo setor:');
    if (!newSectionName || currentLayout[newSectionName]) return;
    
    setCurrentLayout(prev => ({
      ...prev,
      [newSectionName]: {
        machines: [],
        color: 'bg-gray-600',
        position: { x: 100, y: 100 },
        size: { width: 300, height: 150 }
      }
    }));
    
    setUnsavedChanges(true);
  };

  // Renomear setor
  const renameSection = (oldName) => {
    const newName = prompt('Novo nome do setor:', oldName);
    if (!newName || newName === oldName || currentLayout[newName]) return;
    
    setCurrentLayout(prev => {
      const newLayout = { ...prev };
      newLayout[newName] = { ...newLayout[oldName] };
      delete newLayout[oldName];
      return newLayout;
    });
    
    setUnsavedChanges(true);
  };

  // Remover setor
  const removeSection = (sectionName) => {
    if (!window.confirm(`Tem certeza que deseja remover o setor "${sectionName}"?`)) return;
    
    setCurrentLayout(prev => {
      const newLayout = { ...prev };
      delete newLayout[sectionName];
      return newLayout;
    });
    
    setUnsavedChanges(true);
  };

  // Alterar cor do setor
  const changeSectionColor = (sectionName) => {
    const colors = [
      'bg-blue-600', 'bg-red-600', 'bg-green-600', 'bg-yellow-600', 
      'bg-purple-600', 'bg-pink-600', 'bg-orange-600', 'bg-gray-600',
      'bg-indigo-600', 'bg-teal-600', 'bg-cyan-600', 'bg-emerald-600'
    ];
    
    const currentColor = currentLayout[sectionName].color;
    const currentIndex = colors.indexOf(currentColor);
    const nextColor = colors[(currentIndex + 1) % colors.length];
    
    setCurrentLayout(prev => ({
      ...prev,
      [sectionName]: {
        ...prev[sectionName],
        color: nextColor
      }
    }));
    
    setUnsavedChanges(true);
  };

  // Adicionar máquina ao setor
  const addMachineToSection = (sectionName) => {
    const machineId = prompt('Número da máquina:');
    if (!machineId) return;
    
    // Verificar se a máquina já existe em outro setor
    const existingSection = Object.entries(currentLayout).find(([name, section]) => 
      section.machines.some(m => (typeof m === 'object' ? m.id : m) === machineId)
    );
    
    if (existingSection) {
      alert(`Máquina ${machineId} já está no setor ${existingSection[0]}`);
      return;
    }
    
    setCurrentLayout(prev => ({
      ...prev,
      [sectionName]: {
        ...prev[sectionName],
        machines: [
          ...prev[sectionName].machines,
          {
            id: machineId,
            position: { x: 50, y: 50 }
          }
        ]
      }
    }));
    
    setUnsavedChanges(true);
    console.log(`➕ Máquina ${machineId} adicionada ao setor ${sectionName}`);
  };

  // Remover máquina
  const removeMachine = (sectionName, machineId) => {
    setCurrentLayout(prev => ({
      ...prev,
      [sectionName]: {
        ...prev[sectionName],
        machines: prev[sectionName].machines.filter(m => 
          (typeof m === 'object' ? m.id : m) !== machineId
        )
      }
    }));
    
    setUnsavedChanges(true);
    console.log(`➖ Máquina ${machineId} removida do setor ${sectionName}`);
  };

  // Resetar layout
  const resetLayout = () => {
    if (!window.confirm('Tem certeza que deseja resetar o layout?')) return;
    
    // Recriar layout padrão
    const defaultLayout = {};
    let yOffset = 100;
    
    Object.entries(sections).forEach(([sectionName, sectionData], sectionIndex) => {
      defaultLayout[sectionName] = {
        ...sectionData,
        position: { x: 50, y: yOffset },
        size: { width: 300, height: 150 },
        machines: sectionData.machines.map((machineId, machineIndex) => ({
          id: machineId,
          position: { 
            x: 50 + (machineIndex % 6) * 60, 
            y: 30 + Math.floor(machineIndex / 6) * 50 
          }
        }))
      };
      yOffset += 200;
    });
    
    setCurrentLayout(defaultLayout);
    setUnsavedChanges(false);
  };

  // Salvar layout
  const saveLayout = () => {
    // Converter layout livre de volta para formato original
    const convertedLayout = {};
    
    Object.entries(currentLayout).forEach(([sectionName, sectionData]) => {
      convertedLayout[sectionName] = {
        machines: sectionData.machines.map(m => m.id), // Extrair apenas os IDs
        color: sectionData.color
      };
    });
    
    console.log('🔄 Convertendo layout livre para formato Dashboard:');
    console.log('Layout livre atual:', currentLayout);
    console.log('Layout convertido:', convertedLayout);
    
    onSaveLayout(convertedLayout);
    setUnsavedChanges(false);
    setEditMode(false);
    console.log('💾 Layout salvo com sucesso');
    
    // Fechar editor após salvar
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl border w-full max-w-7xl max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold flex items-center">
                <Move className="w-6 h-6 mr-3" />
                EDITOR DE LAYOUT LIVRE
              </h2>
              <p className="text-sm opacity-90 mt-1">
                {editMode ? '🖱️ Arraste livremente máquinas e setores pela tela' : 'Visualize o layout da fábrica'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {unsavedChanges && (
                <span className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs font-medium animate-pulse">
                  ⚠️ Não salvo
                </span>
              )}
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-white/20' : 'bg-white/10'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Ferramentas */}
        <div className="bg-gray-50 border-b p-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  editMode ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'
                }`}
              >
                {editMode ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                <span>{editMode ? '👁️ Visualizar' : '✏️ Editar'}</span>
              </button>
              
              {editMode && (
                <>
                  <button
                    onClick={addNewSection}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novo Setor</span>
                  </button>
                  
                  <button
                    onClick={resetLayout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-200"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Resetar</span>
                  </button>
                  
                  <button
                    onClick={saveLayout}
                    disabled={!unsavedChanges}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar</span>
                  </button>
                </>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              Setores: {Object.keys(currentLayout).length} | 
              Máquinas: {Object.values(currentLayout).reduce((acc, section) => acc + section.machines.length, 0)}
            </div>
          </div>
        </div>

        {/* Canvas do Layout */}
        <div className="relative overflow-auto" style={{ height: 'calc(95vh - 160px)' }}>
          <div
            ref={canvasRef}
            className={`relative w-full min-h-full ${showGrid ? 'bg-grid-pattern' : 'bg-gray-50'}`}
            style={{ 
              minWidth: '1200px', 
              minHeight: '800px',
              backgroundImage: showGrid ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' : 'none',
              backgroundSize: showGrid ? '20px 20px' : 'none'
            }}
          >
            
            {/* Renderizar Setores */}
            {Object.entries(currentLayout).map(([sectionName, sectionData]) => (
              <div key={sectionName}>
                
                {/* Setor */}
                <div
                  className={`absolute border-2 border-dashed border-gray-300 rounded-lg ${
                    editMode ? 'cursor-move hover:border-purple-500' : ''
                  } ${sectionData.color} bg-opacity-10`}
                  style={{
                    left: sectionData.position.x,
                    top: sectionData.position.y,
                    width: sectionData.size.width,
                    height: sectionData.size.height,
                    zIndex: draggedItem?.item === sectionName ? 1000 : 1
                  }}
                  onMouseDown={(e) => handleMouseDown(e, sectionName, 'section')}
                >
                  {/* Header do Setor */}
                  <div className={`${sectionData.color} text-white p-2 rounded-t-lg flex justify-between items-center`}>
                    <div className="font-bold text-sm">{sectionName}</div>
                    
                    {editMode && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            changeSectionColor(sectionName);
                          }}
                          className="w-5 h-5 bg-white bg-opacity-20 rounded hover:bg-opacity-30"
                          title="Alterar cor"
                        >
                          🎨
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addMachineToSection(sectionName);
                          }}
                          className="w-5 h-5 bg-white bg-opacity-20 rounded hover:bg-opacity-30 text-xs"
                          title="Adicionar máquina"
                        >
                          +
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            renameSection(sectionName);
                          }}
                          className="w-5 h-5 bg-white bg-opacity-20 rounded hover:bg-opacity-30 text-xs"
                          title="Renomear"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSection(sectionName);
                          }}
                          className="w-5 h-5 bg-red-500 bg-opacity-80 rounded hover:bg-opacity-100 text-xs"
                          title="Remover setor"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Área das Máquinas */}
                  <div className="relative p-2" style={{ height: 'calc(100% - 40px)' }}>
                    {sectionData.machines.map((machine) => {
                      // Compatibilidade: machine pode ser objeto {id, position} ou apenas string
                      const machineId = typeof machine === 'object' ? machine.id : machine;
                      const machinePos = typeof machine === 'object' ? machine.position : { x: 50, y: 50 };
                      
                      const machineData = getMachineData(machineId);
                      const statusColor = getStatusColor(machineData.status);
                      
                      console.log(`🔧 Renderizando máquina ${machineId} no setor ${sectionName}`);
                      
                      return (
                        <div
                          key={machineId}
                          className={`absolute ${statusColor} text-white rounded p-2 text-xs font-bold text-center min-w-[40px] h-12 flex flex-col justify-center items-center ${
                            editMode ? 'cursor-move hover:scale-110 border-2 border-white border-opacity-50' : ''
                          }`}
                          style={{
                            left: machinePos.x,
                            top: machinePos.y,
                            zIndex: draggedItem?.item?.id === machineId ? 1000 : 10
                          }}
                          onMouseDown={(e) => handleMouseDown(e, machine, 'machine', sectionName)}
                        >
                          <div>{machineId}</div>
                          <div className="text-xs opacity-80">{machineData.efficiency}%</div>
                          
                          {editMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeMachine(sectionName, machineId);
                              }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs hover:bg-red-600"
                              title="Remover máquina"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Área vazia para adicionar máquinas */}
                    {editMode && sectionData.machines.length === 0 && (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        Clique no + para adicionar máquinas
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t p-3 text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <div>
              {editMode ? (
                <span className="text-purple-600 font-medium">
                  💡 Arraste setores e máquinas livremente. Clique nos botões dos setores para editar.
                </span>
              ) : (
                <span>Visualização do layout. Clique em "Editar" para modificar.</span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {selectedItem && (
                <span className="text-blue-600">
                  Selecionado: {selectedItem.type === 'section' ? `Setor ${selectedItem.item}` : `Máquina ${selectedItem.item.id}`}
                </span>
              )}
              {unsavedChanges && (
                <span className="text-orange-600 font-medium">● Alterações não salvas</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeLayoutEditor;