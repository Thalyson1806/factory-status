import React, { useState, useCallback } from 'react';
import { Move, Save, RotateCcw, Grid, Eye, Edit3, CheckCircle, X } from 'lucide-react';
import MachineCard from './MachineCard';

const LayoutEditor = ({ machines, sections, onSaveLayout, onClose }) => {
  const [editMode, setEditMode] = useState(false);
  const [currentLayout, setCurrentLayout] = useState(JSON.parse(JSON.stringify(sections)));
  const [draggedMachine, setDraggedMachine] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [dragOverSection, setDragOverSection] = useState(null);

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

  // Iniciar arraste - VERSÃO MAIS ROBUSTA
  const handleDragStart = (e, machineId, sectionName) => {
    if (!editMode) {
      e.preventDefault();
      return false;
    }
    
    console.log('🔥 DRAG START:', machineId, 'de', sectionName);
    
    // Parar qualquer propagação
    e.stopPropagation();
    
    // Definir dados do drag
    const dragData = { machineId, sourceSectionName: sectionName };
    setDraggedMachine(dragData);
    
    // Configurar dataTransfer de forma mais robusta
    try {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.dropEffect = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
      e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    } catch (error) {
      console.warn('Erro ao configurar dataTransfer:', error);
    }
    
    // Criar imagem de drag customizada
    const dragImage = document.createElement('div');
    dragImage.className = 'bg-blue-600 text-white p-2 rounded font-bold text-sm shadow-lg';
    dragImage.innerHTML = `📦 Máquina ${machineId}`;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    dragImage.style.zIndex = '9999';
    
    document.body.appendChild(dragImage);
    
    try {
      e.dataTransfer.setDragImage(dragImage, 60, 20);
    } catch (error) {
      console.warn('Erro ao definir drag image:', error);
    }
    
    // Remover a imagem após um tempo
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 100);
    
    // Aplicar estilos visuais ao elemento
    const target = e.currentTarget;
    target.style.opacity = '0.5';
    target.style.transform = 'scale(0.95) rotate(5deg)';
    target.style.zIndex = '1000';
    
    return true;
  };

  // Permitir drop - SIMPLIFICADO
  const handleDragOver = (e) => {
    if (!editMode || !draggedMachine) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Entrar na área de drop - MELHORADO
  const handleDragEnter = (e, sectionName) => {
    if (!editMode || !draggedMachine) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOverSection(sectionName);
    console.log('🎯 Entrando na seção:', sectionName);
  };

  // Sair da área de drop - MELHORADO
  const handleDragLeave = (e, sectionName) => {
    if (!editMode || !draggedMachine) return;
    
    // Verificar se realmente saiu da seção
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverSection(null);
      console.log('🚪 Saindo da seção:', sectionName);
    }
  };

  // Finalizar drop - CORRIGIDO E SIMPLIFICADO
  const handleDrop = useCallback((e, targetSectionName) => {
    if (!editMode || !draggedMachine) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎯 Drop realizado:', draggedMachine.machineId, 'para', targetSectionName);
    
    const { machineId, sourceSectionName } = draggedMachine;
    
    // Se soltar na mesma seção, não fazer nada
    if (sourceSectionName === targetSectionName) {
      console.log('⚠️ Mesmo setor, cancelando');
      setDraggedMachine(null);
      setDragOverSection(null);
      return;
    }

    // Atualizar o layout
    setCurrentLayout(prev => {
      const newLayout = JSON.parse(JSON.stringify(prev));
      
      console.log('📝 Layout antes:', {
        source: newLayout[sourceSectionName].machines,
        target: newLayout[targetSectionName].machines
      });
      
      // Remover da seção original
      newLayout[sourceSectionName].machines = newLayout[sourceSectionName].machines.filter(
        id => id !== machineId
      );
      
      // Adicionar na nova seção
      if (!newLayout[targetSectionName].machines.includes(machineId)) {
        newLayout[targetSectionName].machines.push(machineId);
      }
      
      console.log('📝 Layout depois:', {
        source: newLayout[sourceSectionName].machines,
        target: newLayout[targetSectionName].machines
      });
      
      return newLayout;
    });
    
    setUnsavedChanges(true);
    setDraggedMachine(null);
    setDragOverSection(null);
    
    console.log('✅ Drop concluído com sucesso');
  }, [editMode, draggedMachine]);

  // Finalizar arraste - LIMPAR ESTILOS
  const handleDragEnd = (e) => {
    console.log('🏁 Drag finalizado');
    e.target.style.opacity = '1';
    e.target.style.transform = 'scale(1)';
    setDraggedMachine(null);
    setDragOverSection(null);
  };

  // Resetar layout original
  const resetLayout = () => {
    if (!window.confirm('Tem certeza que deseja resetar o layout?')) return;
    setCurrentLayout(JSON.parse(JSON.stringify(sections)));
    setUnsavedChanges(false);
    console.log('🔄 Layout resetado');
  };

  // Salvar layout
  const saveLayout = () => {
    onSaveLayout(currentLayout);
    setUnsavedChanges(false);
    setEditMode(false);
    console.log('💾 Layout salvo');
  };

  // Função para obter cor do status (simplificada para o editor)
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

  // Componente de máquina editável - SIMPLIFICADO SEM MACHINECARD
  const EditableMachineCard = ({ machineId, sectionName, index }) => {
    const machine = getMachineData(machineId);
    const isDragging = draggedMachine?.machineId === machineId;
    const statusColor = getStatusColor(machine.status);
    
    return (
      <div
        draggable={editMode}
        onDragStart={(e) => {
          e.stopPropagation();
          handleDragStart(e, machineId, sectionName);
        }}
        onDragEnd={(e) => {
          e.stopPropagation();
          handleDragEnd(e);
        }}
        className={`
          relative transition-all duration-200 select-none
          ${statusColor} text-white
          rounded-lg p-2 font-bold text-center
          min-w-[50px] h-16 flex flex-col justify-center items-center
          ${editMode ? 'cursor-move hover:shadow-lg hover:scale-105 border-2 border-blue-300' : 'cursor-pointer'}
          ${isDragging ? 'opacity-30 scale-90 z-50 rotate-3' : ''}
        `}
        style={{ 
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          touchAction: 'none',
          WebkitUserDrag: editMode ? 'element' : 'none'
        }}
      >
        {/* Número da máquina */}
        <div className="text-sm font-bold">{machineId}</div>
        
        {/* Eficiência */}
        <div className="text-xs opacity-90">{machine.efficiency}%</div>
        
        {editMode && (
          <>
            {/* Indicador de que pode ser arrastado */}
            <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs pointer-events-none border border-white">
              <Move className="w-2 h-2" />
            </div>
            
            {/* Overlay de arrastar */}
            {isDragging && (
              <div className="absolute inset-0 bg-blue-600 bg-opacity-80 rounded-lg pointer-events-none flex items-center justify-center">
                <div className="text-white text-xs font-bold animate-pulse">
                  📦
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Área de drop para seção - MELHORADA
  const DropZone = ({ sectionName, children, className = "" }) => {
    const isActive = editMode && draggedMachine && dragOverSection === sectionName;
    const canDrop = editMode && draggedMachine;
    
    return (
      <div
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, sectionName)}
        onDragLeave={(e) => handleDragLeave(e, sectionName)}
        onDrop={(e) => handleDrop(e, sectionName)}
        className={`
          ${className}
          transition-all duration-200 rounded-lg
          ${canDrop ? 'border-2 border-dashed' : ''}
          ${isActive ? 'border-blue-500 bg-blue-100 shadow-lg scale-[1.02]' : ''}
          ${canDrop && !isActive ? 'border-gray-300 bg-gray-50' : ''}
        `}
      >
        {children}
        
        {/* Indicador visual quando está sendo arrastado sobre */}
        {isActive && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg pointer-events-none flex items-center justify-center">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
              💫 Solte aqui para mover para {sectionName}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl border w-full max-w-7xl max-h-[95vh] overflow-hidden">
        
        {/* Header do Editor */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold flex items-center">
                <Grid className="w-6 h-6 mr-3" />
                EDITOR DE LAYOUT DA FÁBRICA
              </h2>
              <p className="text-sm opacity-90 mt-1">
                {editMode ? '🖱️ Arraste as máquinas para reorganizar o layout' : 'Visualize e edite o layout das máquinas'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {unsavedChanges && (
                <span className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs font-medium animate-pulse">
                  ⚠️ Alterações não salvas
                </span>
              )}
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-lg transition-colors ${
                  showGrid ? 'bg-white/20' : 'bg-white/10'
                }`}
                title="Mostrar/Ocultar Grade"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Ferramentas - MELHORADA */}
        <div className="bg-gray-50 border-b p-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  console.log('🔘 Alternando modo de edição. Atual:', editMode);
                  setEditMode(!editMode);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                  editMode 
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                }`}
              >
                {editMode ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                <span>{editMode ? '👁️ Modo Visualização' : '✏️ Modo Edição'}</span>
              </button>
              
              {/* Badge de status */}
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                editMode ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {editMode ? '🟢 EDIÇÃO ATIVA' : '🔒 APENAS VISUALIZAÇÃO'}
              </div>
              
              {editMode && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={resetLayout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>🔄 Resetar</span>
                  </button>
                  
                  <button
                    onClick={saveLayout}
                    disabled={!unsavedChanges}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>💾 Salvar Layout</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              {editMode ? (
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-2 text-blue-600 font-medium">
                    <Move className="w-4 h-4" />
                    <span>🖱️ Arraste as máquinas entre os setores</span>
                  </span>
                  {draggedMachine && (
                    <span className="flex items-center space-x-2 text-green-600 font-medium animate-pulse">
                      <span>📦 Arrastando máquina {draggedMachine.machineId}</span>
                    </span>
                  )}
                </div>
              ) : (
                <span>📊 Total de máquinas: {Object.values(currentLayout).reduce((acc, section) => acc + section.machines.length, 0)}</span>
              )}
            </div>
          </div>
          
          {editMode && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-800 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="font-medium">📋 Instruções:</span>
                <span>1️⃣ Clique e arraste as máquinas para movê-las entre setores. 2️⃣ As áreas ficam destacadas quando você arrasta sobre elas. 3️⃣ Solte sobre o setor desejado.</span>
              </div>
              
              {/* Debug info */}
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <strong>🐛 DEBUG:</strong> Modo Edição = {editMode ? 'ATIVO' : 'INATIVO'} | 
                Arrastando = {draggedMachine ? `Máquina ${draggedMachine.machineId}` : 'Nenhuma'} | 
                Área Ativa = {dragOverSection || 'Nenhuma'}
              </div>
            </div>
          )}
        </div>

        {/* Layout da Fábrica */}
        <div className="p-4 overflow-auto max-h-[calc(95vh-200px)]">
          <div className={`grid grid-cols-12 gap-4 ${showGrid ? 'bg-gray-50' : ''}`}>
            
            {/* CORTE - Esquerda */}
            <div className="col-span-1">
              <DropZone sectionName="CORTE" className="h-full relative">
                <div className="bg-white rounded-lg shadow overflow-hidden h-full">
                  <div className={`${currentLayout.CORTE.color} text-white p-2 text-center font-bold text-sm`}>
                    CORTE ({currentLayout.CORTE.machines.length})
                  </div>
                  <div className="p-2 space-y-2 min-h-[200px]">
                    {currentLayout.CORTE.machines.map((machineId, index) => (
                      <EditableMachineCard 
                        key={`corte-${machineId}`}
                        machineId={machineId}
                        sectionName="CORTE"
                        index={index}
                      />
                    ))}
                    {editMode && currentLayout.CORTE.machines.length === 0 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 text-xs">
                        📦 Arraste máquinas aqui
                      </div>
                    )}
                  </div>
                </div>
              </DropZone>
            </div>

            {/* Centro - Área Principal */}
            <div className="col-span-10 space-y-4">
              
              {/* DOBRA DE TUBOS */}
              <DropZone sectionName="DOBRA DE TUBOS" className="relative">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className={`${currentLayout['DOBRA DE TUBOS'].color} text-white p-3 text-center font-bold`}>
                    DOBRA DE TUBOS ({currentLayout['DOBRA DE TUBOS'].machines.length})
                  </div>
                  <div className="p-4 min-h-[120px]">
                    <div className="grid grid-cols-6 gap-2">
                      {currentLayout['DOBRA DE TUBOS'].machines.map((machineId, index) => (
                        <EditableMachineCard 
                          key={`dobra-tubos-${machineId}`}
                          machineId={machineId}
                          sectionName="DOBRA DE TUBOS"
                          index={index}
                        />
                      ))}
                      {editMode && currentLayout['DOBRA DE TUBOS'].machines.length === 0 && (
                        <div className="col-span-6 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                          📦 Arraste máquinas aqui
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DropZone>

              {/* DOBRA DE ARAMES */}
              <DropZone sectionName="DOBRA DE ARAMES" className="relative">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className={`${currentLayout['DOBRA DE ARAMES'].color} text-white p-3 text-center font-bold`}>
                    DOBRA DE ARAMES ({currentLayout['DOBRA DE ARAMES'].machines.length})
                  </div>
                  <div className="p-4 min-h-[120px]">
                    <div className="grid grid-cols-10 gap-2">
                      {currentLayout['DOBRA DE ARAMES'].machines.map((machineId, index) => (
                        <EditableMachineCard 
                          key={`dobra-arames-${machineId}`}
                          machineId={machineId}
                          sectionName="DOBRA DE ARAMES"
                          index={index}
                        />
                      ))}
                      {editMode && currentLayout['DOBRA DE ARAMES'].machines.length === 0 && (
                        <div className="col-span-10 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                          📦 Arraste máquinas aqui
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DropZone>

              {/* CONFORMAÇÃO e ESTAMPARIA */}
              <div className="grid grid-cols-2 gap-4">
                
                <DropZone sectionName="CONFORMAÇÃO" className="relative">
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className={`${currentLayout.CONFORMAÇÃO.color} text-white p-3 text-center font-bold`}>
                      CONFORMAÇÃO ({currentLayout.CONFORMAÇÃO.machines.length})
                    </div>
                    <div className="p-4 min-h-[120px]">
                      <div className="grid grid-cols-4 gap-2">
                        {currentLayout.CONFORMAÇÃO.machines.map((machineId, index) => (
                          <EditableMachineCard 
                            key={`conformacao-${machineId}`}
                            machineId={machineId}
                            sectionName="CONFORMAÇÃO"
                            index={index}
                          />
                        ))}
                        {editMode && currentLayout.CONFORMAÇÃO.machines.length === 0 && (
                          <div className="col-span-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 text-sm">
                            📦 Arraste máquinas aqui
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </DropZone>

                <DropZone sectionName="ESTAMPARIA" className="relative">
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className={`${currentLayout.ESTAMPARIA.color} text-white p-3 text-center font-bold`}>
                      ESTAMPARIA ({currentLayout.ESTAMPARIA.machines.length})
                    </div>
                    <div className="p-4 min-h-[120px]">
                      <div className="grid grid-cols-3 gap-2">
                        {currentLayout.ESTAMPARIA.machines.map((machineId, index) => (
                          <EditableMachineCard 
                            key={`estamparia-${machineId}`}
                            machineId={machineId}
                            sectionName="ESTAMPARIA"
                            index={index}
                          />
                        ))}
                        {editMode && currentLayout.ESTAMPARIA.machines.length === 0 && (
                          <div className="col-span-3 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 text-sm">
                            📦 Arraste máquinas aqui
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </DropZone>

              </div>

              {/* SOLDA HORIZONTAL */}
              <DropZone sectionName="SOLDA" className="relative">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className={`${currentLayout.SOLDA.color} text-white p-2 text-center font-bold text-sm`}>
                    SOLDA ({currentLayout.SOLDA.machines.length})
                  </div>
                  <div className="p-3 min-h-[100px]">
                    <div className="grid grid-cols-6 gap-2">
                      {currentLayout.SOLDA.machines.map((machineId, index) => (
                        <EditableMachineCard 
                          key={`solda-${machineId}`}
                          machineId={machineId}
                          sectionName="SOLDA"
                          index={index}
                        />
                      ))}
                      {editMode && currentLayout.SOLDA.machines.length === 0 && (
                        <div className="col-span-6 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 text-sm">
                          📦 Arraste máquinas aqui
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DropZone>
            </div>

            {/* Direita - CÉLULA HASTES */}
            <div className="col-span-1">
              <DropZone sectionName="CÉLULA HASTES" className="h-full relative">
                <div className="bg-white rounded-lg shadow overflow-hidden h-full">
                  <div className={`${currentLayout['CÉLULA HASTES'].color} text-white p-2 text-center font-bold text-sm`}>
                    CÉLULA HASTES ({currentLayout['CÉLULA HASTES'].machines.length})
                  </div>
                  <div className="p-2 space-y-2 min-h-[200px]">
                    {currentLayout['CÉLULA HASTES'].machines.map((machineId, index) => (
                      <EditableMachineCard 
                        key={`celula-hastes-${machineId}`}
                        machineId={machineId}
                        sectionName="CÉLULA HASTES"
                        index={index}
                      />
                    ))}
                    {editMode && currentLayout['CÉLULA HASTES'].machines.length === 0 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 text-xs">
                        📦 Arraste máquinas aqui
                      </div>
                    )}
                  </div>
                </div>
              </DropZone>
            </div>

          </div>
        </div>

        {/* Footer - MELHORADO */}
        <div className="bg-gray-50 border-t p-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              {editMode ? (
                <span className="text-blue-600 font-medium">💡 <strong>Dica:</strong> Arraste as máquinas entre os setores para reorganizar. As áreas ficam destacadas quando você arrasta sobre elas.</span>
              ) : (
                <span>Clique em "✏️ Modo Edição" para reorganizar as máquinas</span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span>📊 Máquinas configuradas: {Object.values(currentLayout).reduce((acc, section) => acc + section.machines.length, 0)}</span>
              {unsavedChanges && (
                <span className="text-orange-600 font-medium animate-pulse">● Alterações pendentes</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutEditor;