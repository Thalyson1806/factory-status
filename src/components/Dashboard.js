import React, { useState, useEffect } from 'react';
import { Upload, RefreshCw, Clock, Activity, AlertCircle, Menu, X, Grid } from 'lucide-react';
import useCSVData from '../hooks/useCSVData';
import MachineCard from './MachineCard';
import FileUpload from './FileUpload';
import PrintDashboard from './PrintDashboard';
import HeaderWithLogo from './HeaderWithLogo';
import OndeEstou from './OndeEstou';
import FreeLayoutEditor from './FreeLayoutEditor';

const Dashboard = () => {
  const { machines, lastUpdate, isLoading, error, loadCSVFile, refreshData } = useCSVData();
  const [showUpload, setShowUpload] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  
  // Estados para filtros da análise de dados
  const [filtros, setFiltros] = useState({
    setor: '',
    status: '',
    operador: '',
    busca: ''
  });


const [sections, setSections] = useState({
  'DOBRA DE TUBOS': {
    machines: ['95', '203', '204', '212', '218', '219', '222', '228', '232', '233'], // 10 máquinas em ordem numérica
    color: 'bg-blue-600',
  },
  'DOBRA DE ARAMES': {
    machines: ['25', '26', '31', '63', '138', '155', '185', '190', '195', '196', '201', '206', '209', '213', '226', '234', '235'], // 19 máquinas em ordem numérica
    color: 'bg-yellow-600',
  },
  'CONFORMAÇÃO': {
    machines: ['32', '65', '69', '130', '147', '191', '210', '215', '221', '230', '231', '237', '238'], // 13 máquinas em ordem numérica
    color: 'bg-blue-500',
  },
  'ESTAMPARIA': {
    machines: ['39', '40', '207', '208', '220'], // 5 máquinas em ordem numérica
    color: 'bg-orange-600',
  },
  'SOLDA': {
    machines: ['29', '148', '165', '193', '202', '214', '217', '227', '229', '236', '239'], // 11 máquinas em ordem numérica
    color: 'bg-green-600',
  },
  'CÉLULA HASTES': {
    machines: ['27', '223', '224', '225'], // 4 máquinas em ordem numérica
    color: 'bg-orange-500',
  },
  'CORTE': {
    machines: ['132', '156', '158', '167'], // 4 máquinas em ordem numérica
    color: 'bg-blue-400',
  }
});

  // Atualizar horário atual
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Função para normalizar status - UNIFICADA E ROBUSTA
  const normalizeStatus = (status) => {
    if (!status) return '';
    return status
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();
  };

  // DEBUG: Log todos os status únicos
  useEffect(() => {
    if (machines.length > 0) {
      console.log('🔍 === DEBUG COMPLETO DOS STATUS ===');
      
      // Filtrar apenas máquinas do layout
      const layoutMachines = Object.values(sections).flatMap(section => section.machines);
      const filteredMachines = machines.filter(m => layoutMachines.includes(m.id));
      
      console.log(`📊 MÁQUINAS TOTAIS NO CSV: ${machines.length}`);
      console.log(`📊 MÁQUINAS NO LAYOUT CONFIGURADO: ${layoutMachines.length}`);
      console.log(`📊 MÁQUINAS ENCONTRADAS NO CSV: ${filteredMachines.length}`);
      
      // Mostrar detalhes por seção
      Object.entries(sections).forEach(([sectionName, sectionData]) => {
        const sectionMachines = machines.filter(m => sectionData.machines.includes(m.id));
        console.log(`🏭 ${sectionName}: ${sectionData.machines.length} configuradas, ${sectionMachines.length} encontradas no CSV`);
        console.log(`   Configuradas: [${sectionData.machines.join(', ')}]`);
        console.log(`   Encontradas: [${sectionMachines.map(m => m.id).join(', ')}]`);
        
        // Máquinas faltando
        const missing = sectionData.machines.filter(id => !sectionMachines.find(m => m.id === id));
        if (missing.length > 0) {
          console.log(`   ❌ FALTANDO NO CSV: [${missing.join(', ')}]`);
        }
      });
      
      // Máquinas extras no CSV que não estão no layout
      const extraMachines = machines.filter(m => !layoutMachines.includes(m.id));
      if (extraMachines.length > 0) {
        console.log(`⚠️ MÁQUINAS EXTRAS NO CSV (não estão no layout): [${extraMachines.map(m => m.id).join(', ')}]`);
      }
      
      console.log(`📊 MÁQUINAS DO LAYOUT: [${layoutMachines.sort((a, b) => parseInt(a) - parseInt(b)).join(', ')}]`);
      
      const statusUnicos = [...new Set(filteredMachines.map(m => m.status))];
      console.log('📋 TODOS OS STATUS ÚNICOS (LAYOUT):', statusUnicos);
    }
  }, [machines, sections]);

  // Calcular estatísticas gerais - APENAS MÁQUINAS DO LAYOUT
  const layoutMachines = Object.values(sections).flatMap(section => section.machines);
  const filteredMachines = machines.filter(m => layoutMachines.includes(m.id));
  
  const stats = {
    total: filteredMachines.length, // APENAS MÁQUINAS DO LAYOUT!
    
    // PRODUÇÃO - Verde
    producing: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'producao' || status === 'produção' || status === 'produca' || 
             status.includes('produ');
    }).length,
    
    // MANUTENÇÃO - Vermelho (APENAS status específicos de manutenção)
    maintenance: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'manutencao' || status === 'manutenção' || status === 'mnt' ||
             (status === 'parada' && !status.includes('falta')) || // Parada não é falta
             status === 'aguardando manutencao' || status === 'aguardando manutenção' ||
             status.includes('quebra') || status.includes('defeito') || status.includes('reparo');
    }).length,
    
    // FALTA DE PROGRAMAÇÃO - Laranja  
    faltaProgramacao: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'falta de programacao' || status === 'falta de programação' ||
             status.includes('falta') && status.includes('programa');
    }).length,
    
    // FALTA DE OPERADOR - Amarelo
    faltaOperador: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'falta de operador' || 
             (status.includes('falta') && status.includes('operador'));
    }).length,
    
    // QUALIDADE - Roxo
    qualidade: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'qualidade' || status.includes('qualid');
    }).length,
    
    // DESENVOLVIMENTO - Cinza
    desenvolvimento: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'desenvolvimento / engenharia' || status === 'desenvolvimento' || 
             status === 'engenharia' || status.includes('desenvolv') || status.includes('engenhar');
    }).length,
    
    // FERRAMENTARIA - Cinza escuro
    ferramentaria: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'ferramentaria' || status.includes('ferramenta');
    }).length,
    
    // SETUP - Rosa
    setup: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'setup' || status === 'aguardando setup' || status.includes('setup');
    }).length,
    
    // AJUSTE DE PERFIL - Marrom
    ajustePerfil: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'ajuste de perfil' || 
             (status.includes('ajuste') && status.includes('perfil'));
    }).length,
    
    // ABASTECIMENTO - Amarelo escuro
    abastecimento: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'abastecimento de insumo' || status === 'abastecimento' ||
             status.includes('abastec');
    }).length,
    
    // REFEIÇÃO - Azul
    refeicao: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'refeicao' || status === 'refeição' || status === 'almoco' || 
             status === 'almoço' || status.includes('refeic') || status.includes('almoc');
    }).length,
    
    // TREINAMENTO - Índigo
    treinamento: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'treinamento/reuniao' || status === 'treinamento/reunião' || 
             status === 'treinamento' || status.includes('treinam') || status.includes('reunia');
    }).length,
    
    // FALTA DE ENERGIA - Vermelho escuro
    faltaEnergia: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'falta de energia' || 
             (status.includes('falta') && status.includes('energia'));
    }).length,
    
    // REVEZAMENTO - Roxo escuro
    revesamento: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'revesamento' || status === 'revezamento' || status.includes('revez');
    }).length,
    
    // AGUARDANDO PROCESSO - Laranja claro (mudou do amarelo escuro)
    aguardandoProcesso: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'aguardando processo em linha' || 
             (status.includes('aguardando') && status.includes('processo'));
    }).length,
    
    // FALTA DE MP - Laranja escuro
    faltaMP: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'falta de mp' || status === 'abastecimento de mp' ||
             (status.includes('falta') && status.includes('mp')) ||
             (status.includes('abastec') && status.includes('mp'));
    }).length,
    
    // FALTA DE EMBALAGEM - Laranja claro
    faltaEmbalagem: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'falta de embalagem' || 
             (status.includes('falta') && status.includes('embalag'));
    }).length,
    
    // RETRABALHO - Roxo médio
    retrabalho: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'retrabalho' || status.includes('retrab');
    }).length,
    
    // AGUARDANDO MANUTENÇÃO - Vermelho médio
    aguardandoManutencao: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'aguardando manutencao' || status === 'aguardando manutenção' ||
             (status.includes('aguardando') && status.includes('manut'));
    }).length,
    
    // AGUARDANDO SETUP - Rosa escuro
    aguardandoSetup: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'aguardando setup' || 
             (status.includes('aguardando') && status.includes('setup'));
    }).length,
    
    // 5S - Verde-azulado
    cincoS: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === '5 s' || status === '5s' || status.includes('5s') || status.includes('5 s');
    }).length,
    
    // OCIOSO - PRETO (apenas ocioso, não outros status)
    idle: filteredMachines.filter(m => {
      const status = normalizeStatus(m.status);
      return status === 'ocioso' || status === 'ociosa';
    }).length,
    
    overall_efficiency: filteredMachines.length > 0 ? 
      Math.round(filteredMachines.reduce((acc, m) => acc + (m.efficiency || 0), 0) / filteredMachines.length) : 0
  };

  // Função para filtrar máquinas na análise de dados
  const filtrarMaquinas = () => {
    return machines.filter(machine => {
      // Determinar setor
      let setor = 'OUTROS';
      if (sections['DOBRA DE TUBOS'].machines.includes(machine.id)) setor = 'DOBRA DE TUBOS';
      else if (sections['DOBRA DE ARAMES'].machines.includes(machine.id)) setor = 'DOBRA DE ARAMES';
      else if (sections.CONFORMAÇÃO.machines.includes(machine.id)) setor = 'CONFORMAÇÃO';
      else if (sections.ESTAMPARIA.machines.includes(machine.id)) setor = 'ESTAMPARIA';
      else if (sections.SOLDA.machines.includes(machine.id)) setor = 'SOLDA';
      else if (sections['CÉLULA HASTES'].machines.includes(machine.id)) setor = 'CÉLULAS HASTES';
      else if (sections.CORTE.machines.includes(machine.id)) setor = 'CORTE';

      // Aplicar filtros
      const passaSetor = filtros.setor === '' || setor === filtros.setor;
      const passaStatus = filtros.status === '' || machine.status?.trim().toLowerCase().includes(filtros.status.toLowerCase());
      const passaOperador = filtros.operador === '' || machine.operator?.toLowerCase().includes(filtros.operador.toLowerCase());
      const passaBusca = filtros.busca === '' || 
        machine.id.includes(filtros.busca) || 
        machine.reference?.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        machine.operator?.toLowerCase().includes(filtros.busca.toLowerCase());

      return passaSetor && passaStatus && passaOperador && passaBusca;
    });
  };

  // Obter listas únicas para os filtros
  const setoresUnicos = [...new Set(machines.map(machine => {
    if (sections['DOBRA DE TUBOS'].machines.includes(machine.id)) return 'DOBRA DE TUBOS';
    else if (sections['DOBRA DE ARAMES'].machines.includes(machine.id)) return 'DOBRA DE ARAMES';
    else if (sections.CONFORMAÇÃO.machines.includes(machine.id)) return 'CONFORMAÇÃO';
    else if (sections.ESTAMPARIA.machines.includes(machine.id)) return 'ESTAMPARIA';
    else if (sections.SOLDA.machines.includes(machine.id)) return 'SOLDA';
    else if (sections['CÉLULA HASTES'].machines.includes(machine.id)) return 'CÉLULAS HASTES';
    else if (sections.CORTE.machines.includes(machine.id)) return 'CORTE';
    return 'OUTROS';
  }))].sort();

  const statusUnicos = [...new Set(machines.map(m => m.status).filter(Boolean))].sort();
  const operadoresUnicos = [...new Set(machines.map(m => m.operator).filter(Boolean))].sort();

  // Função para salvar novo layout
  const handleSaveLayout = (newLayout) => {
    setSections(newLayout);
    localStorage.setItem('factoryLayout', JSON.stringify(newLayout));
    console.log('Layout salvo:', newLayout);
  };


  // Função getStatusColor PARA A TABELA (cores suaves)
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-600';
    
    const statusNormalized = normalizeStatus(status);
    
    // Mapeamento para tabela (cores suaves)
    const colorMap = {
      'retrabalho': 'bg-purple-100 text-purple-800',
      'aguardando processo em linha': 'bg-teal-500 border-teal-400 text-white',
      'aguardando processo': 'bg-teal-500 border-teal-400 text-white',
      'aguardando linha': 'bg-teal-500 border-teal-400 text-white',
      'producao': 'bg-green-100 text-green-800',
      'produção': 'bg-green-100 text-green-800',
      'manutencao': 'bg-red-100 text-red-800',
      'manutenção': 'bg-red-100 text-red-800',
      'qualidade': 'bg-purple-100 text-purple-800',
      'setup': 'bg-pink-100 text-pink-800',
      'falta de programacao': 'bg-orange-100 text-orange-800',
      'falta de programação': 'bg-orange-100 text-orange-800',
      'falta de operador': 'bg-yellow-100 text-yellow-800',
      'ferramentaria': 'bg-gray-200 text-gray-800',
      'desenvolvimento': 'bg-gray-100 text-gray-800',
      'engenharia': 'bg-gray-100 text-gray-800',
      'refeicao': 'bg-blue-100 text-blue-800',
      'refeição': 'bg-blue-100 text-blue-800',
      'treinamento': 'bg-indigo-100 text-indigo-800',
      'refeição': 'bg-blue-100 text-blue-800',
      'treinamento': 'bg-indigo-100 text-indigo-800',
      'abastecimento': 'bg-yellow-200 text-yellow-800',
      'ajuste de perfil': 'bg-amber-100 text-amber-800', // MARROM!
      'ajuste perfil': 'bg-amber-100 text-amber-800', // MARROM!
      'ocioso': 'bg-black text-white', // APENAS OCIOSO PRETO!
      'ociosa': 'bg-black text-white', // APENAS OCIOSA PRETO!
      'evento nao produtivo': 'bg-black text-white',
      'evento não produtivo': 'bg-black text-white',
      'nao produtivo': 'bg-black text-white',
      'não produtivo': 'bg-black text-white'
    };
    
    // Busca exata
    if (colorMap[statusNormalized]) {
      return colorMap[statusNormalized];
    }
    
    // Busca parcial
    for (const [key, color] of Object.entries(colorMap)) {
      if (statusNormalized.includes(key.split(' ')[0]) || key.includes(statusNormalized)) {
        return color;
      }
    }
    
    return 'bg-gray-100 text-gray-600'; // Padrão cinza normal
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Responsivo */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-16 lg:h-20">
            
            {/* Logo e Título - Responsivo */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="w-10 h-10 lg:w-16 lg:h-16 rounded-lg flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 lg:w-14 lg:h-14 object-contain" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg lg:text-2xl font-bold text-gray-800">STATUS DE FÁBRICA</h1>
                <div className="flex items-center space-x-2 text-xs lg:text-sm bg-gray-100 px-2 py-1 rounded mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span>{currentTime.toLocaleTimeString('pt-BR')}</span>
                </div>
              </div>
            </div>

            {/* Desktop: Navegação e Controles */}
            <div className="hidden lg:flex items-center space-x-3">
              <div className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded font-medium">
                {stats.overall_efficiency}% Eficiência
              </div>
              
              {/* Abas de Navegação */}
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                    activeTab === 'dashboard' 
                      ? 'bg-white text-blue-600 shadow' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('dados')}
                  className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                    activeTab === 'dados' 
                      ? 'bg-white text-blue-600 shadow' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Dados
                </button>
                <button
                  onClick={() => setActiveTab('relatorio')}
                  className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                    activeTab === 'relatorio' 
                      ? 'bg-white text-blue-600 shadow' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Relatório
                </button>
                <button
                  onClick={() => setActiveTab('onde-estou')}
                  className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                    activeTab === 'onde-estou' 
                      ? 'bg-white text-blue-600 shadow' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Onde Estou
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowUpload(!showUpload)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  CSV
                </button>
                <button
                  onClick={() => setShowLayoutEditor(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm transition-colors flex items-center space-x-2"
                >
                  <Grid className="w-4 h-4" />
                  <span>Layout</span>
                </button>
                <button
                  onClick={refreshData}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Atualizando...' : 'Atualizar'}
                </button>
              </div>
            </div>

            {/* Mobile: Menu Hamburger */}
            <div className="lg:hidden flex items-center space-x-2">
              <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                {stats.overall_efficiency}%
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile: Sidebar/Menu */}
        {sidebarOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 px-4 py-3 space-y-2">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded ${
                activeTab === 'dashboard' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('dados');
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded ${
                activeTab === 'dados' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
            >
              📋 Análise de Dados
            </button>
            <button
              onClick={() => {
                setActiveTab('relatorio');
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded ${
                activeTab === 'relatorio' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
            >
              📄 Relatório
            </button>
            <button
              onClick={() => {
                setActiveTab('onde-estou');
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded ${
                activeTab === 'onde-estou' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
            >
              📍 Onde Estou
            </button>
            <div className="flex space-x-2 pt-2 border-t">
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm"
              >
                📁 CSV
              </button>
              <button
                onClick={() => setShowLayoutEditor(true)}
                className="flex-1 bg-purple-600 text-white px-3 py-2 rounded text-sm"
              >
                Layout
              </button>
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
              >
                {isLoading ? 'Carregando...' : 'Atualizar'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo Principal */}
      <div className="p-2 sm:p-4 lg:p-6">
        
        {/* Upload Modal */}
        {showUpload && (
          <FileUpload 
            onFileUpload={loadCSVFile}
            onClose={() => setShowUpload(false)}
          />
        )}

        {/* Layout Editor Modal */}
        {showLayoutEditor && (
          <FreeLayoutEditor 
            machines={machines}
            sections={sections}
            onSaveLayout={handleSaveLayout}
            onClose={() => setShowLayoutEditor(false)}
          />
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Estatísticas Responsivas - EVENTOS PRINCIPAIS COM CORES ÚNICAS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-1 sm:gap-2 mb-4 lg:mb-6">
              <div className="bg-white p-2 lg:p-3 rounded-lg shadow text-center border-l-4 border-green-500">
                <div className="text-sm lg:text-xl font-bold text-green-500">{stats.producing}</div>
                <div className="text-xs text-gray-600">PRODUÇÃO</div>
              </div>
              <div className="bg-white p-2 lg:p-3 rounded-lg shadow text-center border-l-4 border-red-500">
                <div className="text-sm lg:text-xl font-bold text-red-500">{stats.maintenance}</div>
                <div className="text-xs text-gray-600">MANUTENÇÃO</div>
              </div>
              <div className="bg-white p-2 lg:p-3 rounded-lg shadow text-center border-l-4 border-orange-500">
                <div className="text-sm lg:text-xl font-bold text-orange-500">{stats.faltaProgramacao}</div>
                <div className="text-xs text-gray-600">FALTA PROG.</div>
              </div>
              <div className="bg-white p-2 lg:p-3 rounded-lg shadow text-center border-l-4 border-yellow-500">
                <div className="text-sm lg:text-xl font-bold text-yellow-600">{stats.faltaOperador}</div>
                <div className="text-xs text-gray-600">FALTA OPER.</div>
              </div>
              <div className="bg-white p-2 lg:p-3 rounded-lg shadow text-center border-l-4 border-purple-500">
                <div className="text-sm lg:text-xl font-bold text-purple-500">{stats.qualidade}</div>
                <div className="text-xs text-gray-600">QUALIDADE</div>
              </div>
              <div className="bg-white p-2 lg:p-3 rounded-lg shadow text-center border-l-4 border-pink-500">
                <div className="text-sm lg:text-xl font-bold text-pink-500">{stats.setup}</div>
                <div className="text-xs text-gray-600">SETUP</div>
              </div>
              <div className="bg-white p-2 lg:p-3 rounded-lg shadow text-center border-l-4 border-blue-500">
                <div className="text-sm lg:text-xl font-bold text-blue-500">{stats.refeicao}</div>
                <div className="text-xs text-gray-600">REFEIÇÃO</div>
              </div>
              <div className="bg-white p-2 lg:p-3 rounded-lg shadow text-center border-l-4 border-black">
                <div className="text-sm lg:text-xl font-bold text-black">{stats.idle}</div>
                <div className="text-xs text-gray-600">OCIOSO</div>
              </div>
            </div>

            {/* Estatísticas Secundárias - CORES ÚNICAS PARA CADA EVENTO */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-1 sm:gap-2 mb-4 lg:mb-6">
  
  {/* DESENVOLVIMENTO - CINZA MÉDIO */}
  <div className="bg-white p-2 rounded-lg shadow text-center border-l-4 border-gray-400">
    <div className="text-xs lg:text-sm font-bold text-gray-600">{stats.desenvolvimento}</div>
    <div className="text-xs text-gray-600">DESENV./ENG.</div>
  </div>
  
  {/* FERRAMENTARIA - CINZA ESCURO */}
  <div className="bg-white p-2 rounded-lg shadow text-center border-l-4 border-blue-900">
    <div className="text-xs lg:text-sm font-bold text-blue-900">{stats.ferramentaria}</div>
    <div className="text-xs text-gray-600">FERRAMENTARIA</div>
  </div>
  
  {/* AJUSTE DE PERFIL - MARROM/AMBER */}
  <div className="bg-white p-2 rounded-lg shadow text-center border-l-4 border-amber-800">
    <div className="text-xs lg:text-sm font-bold text-amber-800">{stats.ajustePerfil}</div>
    <div className="text-xs text-gray-600">AJUSTE PERFIL</div>
  </div>
  
  {/* ABASTECIMENTO - AMARELO ESCURO */}
  <div className="bg-white p-2 rounded-lg shadow text-center border-l-4 border-yellow-600">
    <div className="text-xs lg:text-sm font-bold text-yellow-700">{stats.abastecimento}</div>
    <div className="text-xs text-gray-600">ABASTECIMENTO</div>
  </div>
  
  {/* TREINAMENTO - ÍNDIGO */}
  <div className="bg-white p-2 rounded-lg shadow text-center border-l-4 border-indigo-500">
    <div className="text-xs lg:text-sm font-bold text-indigo-600">{stats.treinamento}</div>
    <div className="text-xs text-gray-600">TREINAMENTO</div>
  </div>
  
  {/* FALTA DE ENERGIA - VERMELHO ESCURO */}
  <div className="bg-white p-2 rounded-lg shadow text-center border-l-4 border-red-700">
    <div className="text-xs lg:text-sm font-bold text-red-700">{stats.faltaEnergia}</div>
    <div className="text-xs text-gray-600">FALTA ENERGIA</div>
  </div>
  
  {/* FALTA DE MP - LARANJA ESCURO */}
  <div className="bg-white p-2 rounded-lg shadow text-center border-l-4 border-orange-600">
    <div className="text-xs lg:text-sm font-bold text-orange-700">{stats.faltaMP}</div>
    <div className="text-xs text-gray-600">FALTA MP</div>
  </div>
  
  {/* RETRABALHO - ROXO ESCURO */}
  <div className="bg-white p-2 rounded-lg shadow text-center border-l-4 border-purple-800">
    <div className="text-xs lg:text-sm font-bold text-purple-800">{stats.retrabalho}</div>
    <div className="text-xs text-gray-600">RETRABALHO</div>
  </div>

  {/* FALTA EMBALAGEM - ROSA */}
  <div className="bg-white p-2 rounded-lg shadow text-center border-l-4 border-pink-400">
  <div className="text-xs lg:text-sm font-bold text-pink-600">{stats.faltaEmbalagem}</div>
  <div className="text-xs text-gray-600">FALTA EMBAL.</div>
  </div>

  {/* AGUARDANDO PROCESSO - VERDE CLARO/TEAL */}
  <div className="bg-white p-2 rounded-lg shadow text-center border-l-4 border-teal-500">
    <div className="text-xs lg:text-sm font-bold text-teal-600">{stats.aguardandoProcesso}</div>
    <div className="text-xs text-gray-600">AGUARD. PROC.</div>
  </div>
  
  {/* 5S - VERDE-AZULADO */}
  <div className="bg-white p-2 rounded-lg shadow text-center border-l-4 border-teal-600">
    <div className="text-xs lg:text-sm font-bold text-teal-600">{stats.cincoS}</div>
    <div className="text-xs text-gray-600">5S</div>
  </div>
  
  {/* TOTAL - AZUL */}
  <div className="bg-white p-2 rounded-lg shadow text-center border-l-4 border-blue-700">
    <div className="text-xs lg:text-sm font-bold text-blue-700">{stats.total}</div>
    <div className="text-xs text-gray-600">TOTAL</div>
  </div>
</div>

            {/* Legenda Responsiva */}
            <div className="bg-white p-2 lg:p-3 rounded-lg shadow mb-4 lg:mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-1 lg:gap-2 text-xs">
                <div className="flex items-center space-x-1 p-2 bg-green-100 rounded">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="truncate">PRODUÇÃO</span>
                </div>
                <div className="flex items-center space-x-1 p-2 bg-red-100 rounded">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="truncate">MANUTENÇÃO</span>
                </div>
                <div className="flex items-center space-x-1 p-2 bg-orange-100 rounded">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="truncate">FALTA PROG.</span>
                </div>
                <div className="flex items-center space-x-1 p-2 bg-yellow-100 rounded">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="truncate">FALTA OPER.</span>
                </div>
                <div className="flex items-center space-x-1 p-2 bg-purple-100 rounded">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="truncate">QUALIDADE</span>
                </div>
                <div className="flex items-center space-x-1 p-2 bg-gray-100 rounded">
                  <div className="w-3 h-3 bg-gray-400 rounded"></div>
                  <span className="truncate">DESENV./ENG.</span>
                </div>
                <div className="flex items-center space-x-1 p-2 bg-gray-200 rounded">
                  <div className="w-3 h-3 bg-gray-600 rounded"></div>
                  <span className="truncate">FERRAMENTARIA</span>
                </div>
                <div className="flex items-center space-x-1 p-2 bg-pink-100 rounded">
                  <div className="w-3 h-3 bg-pink-500 rounded"></div>
                  <span className="truncate">SETUP</span>
                </div>
                <div className="flex items-center space-x-1 p-2 bg-amber-100 rounded">
                  <div className="w-3 h-3 bg-amber-800 rounded"></div>
                  <span className="truncate">AJUSTE PERFIL</span>
                </div>
                <div className="flex items-center space-x-1 p-2 bg-black rounded">
                  <div className="w-3 h-3 bg-black rounded"></div>
                  <span className="truncate text-white">OCIOSO/NÃO PROD.</span>
                </div>
              </div>
            </div>

            {/* Layout das Máquinas - Responsivo */}
            
            {/* Mobile: Layout Vertical */}
            <div className="block lg:hidden space-y-4">
              {Object.entries(sections).map(([sectionName, sectionData]) => (
                <div key={sectionName} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className={`${sectionData.color} text-white p-3 text-center font-bold text-sm`}>
                    {sectionName}
                  </div>
                  <div className="p-3">
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {sectionData.machines.map(machineId => (
                        <MachineCard 
                          key={machineId} 
                          machine={getMachineData(machineId)}
                          size="small"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Layout EXATO da Primeira Imagem */}
            <div className="hidden lg:grid grid-cols-12 gap-4">
              
              {/* CORTE - Esquerda (4 máquinas verticais) */}
              <div className="col-span-1">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className={`${sections.CORTE.color} text-white p-2 text-center font-bold text-sm`}>
                    CORTE
                  </div>
                  <div className="p-2 space-y-2">
                    {sections.CORTE.machines.map(machineId => (
                      <MachineCard 
                        key={machineId} 
                        machine={getMachineData(machineId)}
                        size="small"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Centro - Área Principal */}
              <div className="col-span-10 space-y-4">
                
                {/* DOBRA DE TUBOS - Conforme imagem: 2 linhas de 6 */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className={`${sections['DOBRA DE TUBOS'].color} text-white p-3 text-center font-bold`}>
                    DOBRA DE TUBOS
                  </div>
                  <div className="p-4">
                    {/* Primeira linha: primeiras 6 máquinas */}
                    <div className="grid grid-cols-6 gap-2 mb-2">
                      {sections['DOBRA DE TUBOS'].machines.slice(0, 6).map(machineId => (
                        <MachineCard 
                          key={machineId} 
                          machine={getMachineData(machineId)}
                          size="small"
                        />
                      ))}
                    </div>
                    {/* Segunda linha: próximas 6 máquinas */}
                    <div className="grid grid-cols-6 gap-2">
                      {sections['DOBRA DE TUBOS'].machines.slice(6, 12).map(machineId => (
                        <MachineCard 
                          key={machineId} 
                          machine={getMachineData(machineId)}
                          size="small"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* DOBRA DE ARAMES - Conforme imagem */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className={`${sections['DOBRA DE ARAMES'].color} text-white p-3 text-center font-bold`}>
                    DOBRA DE ARAMES
                  </div>
                  <div className="p-4">
                    {/* Primeira linha: primeiras 10 máquinas */}
                    <div className="grid grid-cols-10 gap-2 mb-2">
                      {sections['DOBRA DE ARAMES'].machines.slice(0, 10).map(machineId => (
                        <MachineCard 
                          key={machineId} 
                          machine={getMachineData(machineId)}
                          size="small"
                        />
                      ))}
                    </div>
                    {/* Segunda linha: próximas 10 máquinas */}
                    <div className="grid grid-cols-10 gap-2">
                      {sections['DOBRA DE ARAMES'].machines.slice(10, 20).map(machineId => (
                        <MachineCard 
                          key={machineId} 
                          machine={getMachineData(machineId)}
                          size="small"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* CONFORMAÇÃO e ESTAMPARIA lado a lado */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* CONFORMAÇÃO */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className={`${sections.CONFORMAÇÃO.color} text-white p-3 text-center font-bold`}>
                      CONFORMAÇÃO
                    </div>
                    <div className="p-4 space-y-2">
                      {/* Layout flexível baseado nas máquinas configuradas */}
                      <div className="grid grid-cols-4 gap-2">
                        {sections.CONFORMAÇÃO.machines.slice(0, Math.min(8, sections.CONFORMAÇÃO.machines.length)).map(machineId => (
                          <MachineCard 
                            key={machineId} 
                            machine={getMachineData(machineId)}
                            size="small"
                          />
                        ))}
                      </div>
                      {sections.CONFORMAÇÃO.machines.length > 8 && (
                        <div className="grid grid-cols-5 gap-1">
                          {sections.CONFORMAÇÃO.machines.slice(8).map(machineId => (
                            <MachineCard 
                              key={machineId} 
                              machine={getMachineData(machineId)}
                              size="small"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ESTAMPARIA */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className={`${sections.ESTAMPARIA.color} text-white p-3 text-center font-bold`}>
                      ESTAMPARIA
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-2">
                        {sections.ESTAMPARIA.machines.slice(0, 3).map(machineId => (
                          <MachineCard 
                            key={machineId} 
                            machine={getMachineData(machineId)}
                            size="small"
                          />
                        ))}
                      </div>
                      {sections.ESTAMPARIA.machines.length > 3 && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {sections.ESTAMPARIA.machines.slice(3).map(machineId => (
                            <MachineCard 
                              key={machineId} 
                              machine={getMachineData(machineId)}
                              size="small"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* SOLDA - Parte Horizontal (embaixo) */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className={`${sections.SOLDA.color} text-white p-2 text-center font-bold text-sm`}>
                    SOLDA
                  </div>
                  <div className="p-3">
                    <div className="grid grid-cols-6 gap-2">
                      {sections.SOLDA.machines.map(machineId => (
                        <MachineCard 
                          key={machineId} 
                          machine={getMachineData(machineId)}
                          size="small"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Direita - CÉLULA HASTES */}
              <div className="col-span-1">
                <div className="bg-white rounded-lg shadow overflow-hidden h-full">
                  <div className={`${sections['CÉLULA HASTES'].color} text-white p-2 text-center font-bold text-sm`}>
                    CÉLULA HASTES
                  </div>
                  <div className="p-2 space-y-1">
                    {sections['CÉLULA HASTES'].machines.map(machineId => (
                      <MachineCard 
                        key={machineId} 
                        machine={getMachineData(machineId)}
                        size="small"
                      />
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

        {/* Análise de Dados Tab */}
        {activeTab === 'dados' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-800 text-white p-3 lg:p-4">
              <h2 className="text-lg lg:text-xl font-bold">ANÁLISE DE DADOS - TODAS AS MÁQUINAS</h2>
              <p className="text-xs lg:text-sm opacity-90 mt-1">
                Dados detalhados de todas as máquinas • Total: {machines.length} máquinas
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs lg:text-sm">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-2 lg:px-4 py-2 lg:py-3 text-left font-bold">MÁQUINA</th>
                    <th className="px-2 lg:px-4 py-2 lg:py-3 text-left font-bold">STATUS</th>
                    <th className="hidden sm:table-cell px-2 lg:px-4 py-2 lg:py-3 text-left font-bold">SETOR</th>
                    <th className="hidden md:table-cell px-2 lg:px-4 py-2 lg:py-3 text-left font-bold">OPERADOR</th>
                    <th className="px-2 lg:px-4 py-2 lg:py-3 text-center font-bold">META</th>
                    <th className="px-2 lg:px-4 py-2 lg:py-3 text-center font-bold">PRODUZIDO</th>
                    <th className="hidden lg:table-cell px-2 lg:px-4 py-2 lg:py-3 text-center font-bold">REJEITADO</th>
                    <th className="px-2 lg:px-4 py-2 lg:py-3 text-center font-bold">EFICIÊNCIA</th>
                    <th className="hidden xl:table-cell px-2 lg:px-4 py-2 lg:py-3 text-left font-bold">REFERÊNCIA</th>
                    <th className="hidden xl:table-cell px-2 lg:px-4 py-2 lg:py-3 text-left font-bold">OP</th>
                  </tr>
                </thead>
                <tbody>
                  {machines
                    .sort((a, b) => parseInt(a.id) - parseInt(b.id))
                    .map((machine, index) => {
                      // Determinar setor
                      let setor = 'OUTROS';
                      if (sections['DOBRA DE TUBOS'].machines.includes(machine.id)) setor = 'DOBRA DE TUBOS';
                      else if (sections['DOBRA DE ARAMES'].machines.includes(machine.id)) setor = 'DOBRA DE ARAMES';
                      else if (sections.CONFORMAÇÃO.machines.includes(machine.id)) setor = 'CONFORMAÇÃO';
                      else if (sections.ESTAMPARIA.machines.includes(machine.id)) setor = 'ESTAMPARIA';
                      else if (sections.SOLDA.machines.includes(machine.id)) setor = 'SOLDA';
                      else if (sections['CÉLULA HASTES'].machines.includes(machine.id)) setor = 'CÉLULAS HASTES';
                      else if (sections.CORTE.machines.includes(machine.id)) setor = 'CORTE';

                      return (
                        <tr key={machine.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-2 lg:px-4 py-2 lg:py-3 font-bold text-blue-600">{machine.id}</td>
                          <td className="px-2 lg:px-4 py-2 lg:py-3">
                            <span className={`px-1 lg:px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(machine.status)}`}>
                              <span className="hidden sm:inline">{machine.status}</span>
                              <span className="sm:hidden">
                                {machine.status?.slice(0, 8)}{machine.status?.length > 8 ? '...' : ''}
                              </span>
                            </span>
                          </td>
                          <td className="hidden sm:table-cell px-2 lg:px-4 py-2 lg:py-3 text-gray-600 font-medium text-xs">
                            <span className="lg:hidden">{setor.slice(0, 8)}{setor.length > 8 ? '...' : ''}</span>
                            <span className="hidden lg:inline">{setor}</span>
                          </td>
                          <td className="hidden md:table-cell px-2 lg:px-4 py-2 lg:py-3 text-xs">
                            {machine.operator ? (
                              <>
                                <span className="lg:hidden">{machine.operator.slice(0, 8)}{machine.operator.length > 8 ? '...' : ''}</span>
                                <span className="hidden lg:inline">{machine.operator}</span>
                              </>
                            ) : '-'}
                          </td>
                          <td className="px-2 lg:px-4 py-2 lg:py-3 text-center font-semibold text-xs lg:text-sm">
                            {machine.planned?.toLocaleString('pt-BR') || 0}
                          </td>
                          <td className="px-2 lg:px-4 py-2 lg:py-3 text-center font-semibold text-blue-600 text-xs lg:text-sm">
                            {machine.produced?.toLocaleString('pt-BR') || 0}
                          </td>
                          <td className="hidden lg:table-cell px-2 lg:px-4 py-2 lg:py-3 text-center font-semibold text-red-600">
                            {machine.rejected?.toLocaleString('pt-BR') || 0}
                          </td>
                          <td className="px-2 lg:px-4 py-2 lg:py-3 text-center">
                            <span className={`font-bold text-xs lg:text-sm ${
                              machine.efficiency >= 80 ? 'text-green-600' :
                              machine.efficiency >= 60 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {machine.efficiency}%
                            </span>
                          </td>
                          <td className="hidden xl:table-cell px-2 lg:px-4 py-2 lg:py-3 text-gray-600 text-xs">
                            {machine.reference || '-'}
                          </td>
                          <td className="hidden xl:table-cell px-2 lg:px-4 py-2 lg:py-3 text-gray-600 text-xs">
                            {machine.op || '-'}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            
            {/* Resumo Responsivo */}
            <div className="bg-gray-50 p-3 lg:p-4 border-t">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-4 text-xs lg:text-sm">
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-800">{filteredMachines.length}</div>
                  <div className="text-gray-600">Total Máquinas</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-green-600">
                    {filteredMachines.reduce((acc, m) => acc + (m.planned || 0), 0).toLocaleString('pt-BR')}
                  </div>
                  <div className="text-gray-600">Meta Total</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-blue-600">
                    {filteredMachines.reduce((acc, m) => acc + (m.produced || 0), 0).toLocaleString('pt-BR')}
                  </div>
                  <div className="text-gray-600">Produzido Total</div>
                </div>
                <div className="text-center lg:block hidden">
                  <div className="font-bold text-lg text-red-600">
                    {filteredMachines.reduce((acc, m) => acc + (m.rejected || 0), 0).toLocaleString('pt-BR')}
                  </div>
                  <div className="text-gray-600">Rejeitado Total</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-indigo-600">{stats.overall_efficiency}%</div>
                  <div className="text-gray-600">Eficiência Geral</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba Onde Estou */}
        {activeTab === 'onde-estou' && (
          <OndeEstou 
            machines={machines}
            sections={sections}
          />
        )}

        {/* Aba de Relatório Gerencial */}
        {activeTab === 'relatorio' && (
          <PrintDashboard 
            machines={machines}
            lastUpdate={lastUpdate}
            stats={stats}
            sections={sections}
            getMachineData={getMachineData}
          />
        )}

        {/* Footer Responsivo */}
        <div className="mt-4 lg:mt-6 text-center text-xs lg:text-sm text-gray-600 bg-white p-2 lg:p-3 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-1 sm:space-y-0 sm:space-x-4">
            <span>Última atualização: {lastUpdate.toLocaleString('pt-BR')}</span>
            <span className="hidden sm:inline">•</span>
            <span>Auto-refresh: 20s</span>
            <span className="hidden sm:inline">•</span>
            <span>Máquinas: {stats.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;