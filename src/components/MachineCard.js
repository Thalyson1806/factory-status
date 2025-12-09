import React, { useState, useEffect } from 'react';
import { User, TrendingUp, AlertTriangle, Clock, X, Activity, Settings } from 'lucide-react';

const MachineCard = ({ machine, size = 'normal' }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(machine.status);

  // Forçar re-render quando machine.status mudar
  useEffect(() => {
    setCurrentStatus(machine.status);
  }, [machine.status, machine.id]);

  // Função para obter cor baseada no status - VERSÃO ROBUSTA COM DEBUG
  const getStatusColor = (status) => {
    // Log detalhado para debug
    console.log(`🔍 MÁQUINA ${machine.id} - Status: "${status}" (${typeof status})`);
    
    if (!status) {
      console.log(`❌ MÁQUINA ${machine.id} - Status vazio, usando cinza`);
      return 'bg-gray-500 border-gray-400 text-white';
    }
    
    // Conversão robusta para string e limpeza
    const statusClean = String(status)
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, '') // Remove pontuação
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();
    
    console.log(`🔧 MÁQUINA ${machine.id} - Status limpo: "${statusClean}"`);
    
    // Mapeamento direto com verificação exata
    const statusMap = {
      // FALTA DE EMBALAGEM - ROSA CLARO
      'falta embalagem': 'bg-pink-400 border-pink-300 text-white',
      'falta de embalagem': 'bg-pink-400 border-pink-300 text-white',
      'sem embalagem': 'bg-pink-400 border-pink-300 text-white',
      'embalagem': 'bg-pink-400 border-pink-300 text-white',
      // AGUARDANDO PROCESSO EM LINHA
      'aguardando processo em linha': 'bg-teal-500 border-teal-400 text-white',
      'aguardando processo': 'bg-teal-500 border-teal-400 text-white',
      'aguardando linha': 'bg-teal-500 border-teal-400 text-white',

      // Retrabalho - Roxo escuro
      'retrabalho': 'bg-purple-800 border-purple-700 text-white',
      're-trabalho': 'bg-purple-800 border-purple-700 text-white',
      'refazer trabalho': 'bg-purple-800 border-purple-700 text-white',
      're-trabalhar': 'bg-purple-800 border-purple-700 text-white',

      // PRODUÇÃO - Verde brilhante
      'producao': 'bg-green-500 border-green-400 text-white',
      'produção': 'bg-green-500 border-green-400 text-white',
      
      // MANUTENÇÃO - Vermelho brilhante
      'manutencao': 'bg-red-500 border-red-400 text-white',
      'manutenção': 'bg-red-500 border-red-400 text-white',
      'parada': 'bg-red-500 border-red-400 text-white',
      
      // QUALIDADE - Roxo brilhante (ESSENCIAL!)
      'qualidade': 'bg-purple-500 border-purple-400 text-white',
      
      // SETUP - Rosa brilhante
      'setup': 'bg-pink-500 border-pink-400 text-white',
      
      // FALTA DE PROGRAMAÇÃO - Laranja
      'falta de programacao': 'bg-orange-500 border-orange-400 text-white',
      'falta de programação': 'bg-orange-500 border-orange-400 text-white',
      
      // FALTA DE OPERADOR - Amarelo
      'falta de operador': 'bg-yellow-500 border-yellow-400 text-black',
      
      // FERRAMENTARIA - Cinza escuro
      'ferramentaria': 'bg-blue-900 border-blue-800 text-white',
      
      // DESENVOLVIMENTO - Cinza médio
      'desenvolvimento': 'bg-gray-400 border-gray-300 text-white',
      'engenharia': 'bg-gray-400 border-gray-300 text-white',
      'desenvolvimento engenharia': 'bg-gray-400 border-gray-300 text-white',
      
      // REFEIÇÃO - Azul
      'refeicao': 'bg-blue-500 border-blue-400 text-white',
      'refeição': 'bg-blue-500 border-blue-400 text-white',
      'almoco': 'bg-blue-500 border-blue-400 text-white',
      'almoço': 'bg-blue-500 border-blue-400 text-white',
      
      // TREINAMENTO - Índigo
      'treinamento': 'bg-indigo-500 border-indigo-400 text-white',
      
      // ABASTECIMENTO - Amarelo escuro
      'abastecimento': 'bg-yellow-600 border-yellow-500 text-white',
      'abastecimento de insumo': 'bg-yellow-600 border-yellow-500 text-white',
      
      // OCIOSO - PRETO (NÃO CINZA!)
      'ocioso': 'bg-black border-gray-600 text-white',
      'ociosa': 'bg-black border-gray-600 text-white',
      
      // EVENTO NÃO PRODUTIVO - PRETO
      'evento nao produtivo': 'bg-black border-gray-600 text-white',
      'evento não produtivo': 'bg-black border-gray-600 text-white',
      'nao produtivo': 'bg-black border-gray-600 text-white',
      'não produtivo': 'bg-black border-gray-600 text-white'
    };
    
    // Busca exata primeiro
    if (statusMap[statusClean]) {
      console.log(`✅ MÁQUINA ${machine.id} - Match exato: ${statusMap[statusClean]}`);
      return statusMap[statusClean];
    }
    
    // Busca parcial como fallback
    for (const [key, color] of Object.entries(statusMap)) {
      if (statusClean.includes(key) || key.includes(statusClean)) {
        console.log(`✅ MÁQUINA ${machine.id} - Match parcial "${key}": ${color}`);
        return color;
      }
    }
    
    // Verificações especiais para casos problemáticos
    if (statusClean.includes('manut') || statusClean.includes('parad')) {
      console.log(`✅ MÁQUINA ${machine.id} - Manutenção (especial): bg-red-500`);
      return 'bg-red-500 border-red-400 text-white';
    }
    
    if (statusClean.includes('qualid')) {
      console.log(`✅ MÁQUINA ${machine.id} - Qualidade (especial): bg-purple-500`);
      return 'bg-purple-500 border-purple-400 text-white';
    }
    
    if (statusClean.includes('produ')) {
      console.log(`✅ MÁQUINA ${machine.id} - Produção (especial): bg-green-500`);
      return 'bg-green-500 border-green-400 text-white';
    }
    
    if (statusClean.includes('ajuste') && statusClean.includes('perfil')) {
      console.log(`✅ MÁQUINA ${machine.id} - Ajuste de Perfil (especial): bg-amber-800`);
      return 'bg-amber-800 border-amber-700 text-white';
    }
    
    // APENAS OCIOSO DEVE SER PRETO, NÃO OUTROS STATUS!
    if (statusClean === 'ocioso' || statusClean === 'ociosa') {
      console.log(`✅ MÁQUINA ${machine.id} - Ocioso (especial): bg-black`);
      return 'bg-black border-gray-600 text-white';
    }
    
    // Não encontrou nada - VOLTA PARA CINZA PADRÃO
    console.warn(`❌ MÁQUINA ${machine.id} - Status "${status}" (limpo: "${statusClean}") NÃO MAPEADO!`);
    return 'bg-gray-500 border-gray-400 text-white'; // Padrão cinza normal
  };

  // Função para obter ícone baseado no status
  const getStatusIcon = (status) => {
    if (!status) return null;
    
    const statusClean = String(status).toLowerCase().trim();
    
    if (statusClean.includes('produ')) return <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3" />;
    if (statusClean.includes('manut') || statusClean.includes('parad')) return <span className="text-xs">🔧</span>;
    if (statusClean.includes('qualid')) return <span className="text-xs">🔍</span>;
    if (statusClean.includes('setup')) return <span className="text-xs">⚙️</span>;
    if (statusClean.includes('programa')) return <span className="text-xs">📋</span>;
    if (statusClean.includes('operador')) return <User className="w-2 h-2 sm:w-3 sm:h-3" />;
    if (statusClean.includes('refeic') || statusClean.includes('almoc')) return <span className="text-xs">🍽️</span>;
    if (statusClean.includes('ferramenta')) return <span className="text-xs">🔨</span>;
    
    return null;
  };

  const efficiency = machine.efficiency || 0;
  const statusColor = getStatusColor(currentStatus);
  
  // Debug da cor final
  console.log(`🎨 MÁQUINA ${machine.id} - Cor final aplicada: ${statusColor}`);
  
  return (
    <>
      <div className="relative">
        <div
          className={`
            ${statusColor}
            rounded-lg p-1 sm:p-2 lg:p-3 font-bold text-center
            transform transition-all duration-200 hover:scale-105 hover:shadow-lg
            border-2
            ${size === 'small' ? 'min-w-[40px] h-12 sm:min-w-[60px] sm:h-16' : 'min-w-[60px] h-16 sm:min-w-[80px] sm:h-20'}
            flex flex-col justify-center items-center
            cursor-pointer
          `}
          onClick={() => setShowModal(true)}
        >
          <div className="flex items-center space-x-1">
            {getStatusIcon(currentStatus)}
            <div className="text-xs sm:text-sm lg:text-lg font-bold">{machine.id}</div>
          </div>
          
          {size !== 'small' && (
            <div className="text-xs sm:text-sm opacity-90 flex items-center space-x-1 mt-1">
              <span className="font-semibold">{efficiency}%</span>
              {machine.operator && <User className="w-2 h-2 sm:w-4 sm:h-4" />}
            </div>
          )}
          
        </div>
      </div>

      {/* Modal de Detalhes da Máquina - Responsivo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl border w-full max-w-4xl max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            
            {/* Header do Modal */}
            <div className={`${statusColor} p-4 sm:p-6 rounded-t-xl`}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">MÁQUINA {machine.id}</h2>
                  <p className="text-sm sm:text-lg opacity-90 mt-1">{currentStatus}</p>
                  <p className="text-xs opacity-70">Cor CSS: {statusColor}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-4 sm:p-6">
            
              {/* Informações Principais - Layout Responsivo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
                
                {/* Coluna Esquerda - Operador e Status */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <h3 className="font-bold text-gray-700 mb-3 flex items-center text-sm sm:text-base">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      OPERADOR
                    </h3>
                    <div className="text-base sm:text-lg font-semibold text-gray-800">
                      {machine.operator || 'Não informado'}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <h3 className="font-bold text-gray-700 mb-3 flex items-center text-sm sm:text-base">
                      <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      STATUS ATUAL
                    </h3>
                    <div className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${statusColor}`}>
                      {currentStatus}
                    </div>
                  </div>

                  {machine.reference && (
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <h3 className="font-bold text-gray-700 mb-3 text-sm sm:text-base">REFERÊNCIA</h3>
                      <div className="text-base sm:text-lg font-semibold text-gray-800 break-all">{machine.reference}</div>
                    </div>
                  )}
                </div>

                {/* Coluna Direita - Produção REAL */}
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-blue-700 mb-3 flex items-center text-sm sm:text-base">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      EFICIÊNCIA
                    </h3>
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">{efficiency}%</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {machine.produced}/{machine.planned} peças
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 sm:h-3 mt-2">
                      <div 
                        className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${
                          efficiency >= 80 ? 'bg-green-500' :
                          efficiency >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(efficiency, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="bg-green-50 p-2 sm:p-3 rounded-lg border border-green-200 text-center">
                      <div className="text-xs sm:text-sm text-green-700 font-medium">META</div>
                      <div className="text-lg sm:text-xl font-bold text-green-600">{machine.planned?.toLocaleString('pt-BR') || 0}</div>
                      <div className="text-xs text-green-600">peças</div>
                    </div>
                    <div className="bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-200 text-center">
                      <div className="text-xs sm:text-sm text-blue-700 font-medium">PRODUZIDO</div>
                      <div className="text-lg sm:text-xl font-bold text-blue-600">{machine.produced?.toLocaleString('pt-BR') || 0}</div>
                      <div className="text-xs text-blue-600">peças</div>
                    </div>
                  </div>

                  {(machine.rejected > 0) && (
                    <div className="bg-red-50 p-2 sm:p-3 rounded-lg border border-red-200 text-center">
                      <div className="text-xs sm:text-sm text-red-700 font-medium">REJEITADO</div>
                      <div className="text-lg sm:text-xl font-bold text-red-600">{machine.rejected?.toLocaleString('pt-BR')}</div>
                      <div className="text-xs text-red-600">
                        {machine.produced > 0 ? `${((machine.rejected / machine.produced) * 100).toFixed(1)}% do produzido` : ''}
                      </div>
                    </div>
                  )}

                  {/* Restante/Faltante */}
                  {machine.planned > machine.produced && (
                    <div className="bg-yellow-50 p-2 sm:p-3 rounded-lg border border-yellow-200 text-center">
                      <div className="text-xs sm:text-sm text-yellow-700 font-medium">RESTANTE</div>
                      <div className="text-lg sm:text-xl font-bold text-yellow-600">
                        {(machine.planned - machine.produced).toLocaleString('pt-BR')}
                      </div>
                      <div className="text-xs text-yellow-600">peças para atingir meta</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações Técnicas - Responsiva */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center text-sm sm:text-base">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  INFORMAÇÕES TÉCNICAS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {machine.op && (
                    <div>
                      <span className="font-medium text-gray-600">OP:</span>
                      <div className="font-bold text-gray-800 break-all">{machine.op}</div>
                    </div>
                  )}
                  {machine.operation && (
                    <div>
                      <span className="font-medium text-gray-600">Operação:</span>
                      <div className="font-bold text-gray-800 break-all">{machine.operation}</div>
                    </div>
                  )}
                  {machine.event && (
                    <div>
                      <span className="font-medium text-gray-600">Evento:</span>
                      <div className="font-bold text-gray-800 break-all">{machine.event}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações de Tempo - Responsiva */}
              {(machine.expectedDate || machine.expectedTime) && (
                <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg mt-4 border border-yellow-200">
                  <h3 className="font-bold text-yellow-700 mb-3 flex items-center text-sm sm:text-base">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    PROGRAMAÇÃO
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {machine.expectedDate && (
                      <div>
                        <span className="font-medium text-yellow-700">Data Prevista:</span>
                        <div className="font-bold text-yellow-800">{machine.expectedDate}</div>
                      </div>
                    )}
                    {machine.expectedTime && (
                      <div>
                        <span className="font-medium text-yellow-700">Tempo Previsto:</span>
                        <div className="font-bold text-yellow-800">{machine.expectedTime}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer com timestamp */}
              <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs sm:text-sm text-gray-500">
                Última atualização: {new Date(machine.timestamp).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MachineCard;