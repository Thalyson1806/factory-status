import React, { useState, useEffect } from 'react';
import { User, MapPin, Users, Clock, Search, Filter } from 'lucide-react';

const OndeEstou = ({ machines, sections }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar horário
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
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

  // Função para determinar setor de uma máquina
  const getSectorForMachine = (machineId) => {
    for (const [sectionName, sectionData] of Object.entries(sections)) {
      if (sectionData.machines.includes(machineId)) {
        return sectionName;
      }
    }
    return 'OUTROS';
  };

  // Obter funcionários ativos (com operador definido)
  const getActiveFunctionarios = () => {
    return machines
      .filter(machine => machine.operator && machine.operator.trim() !== '')
      .map(machine => ({
        ...machine,
        setor: getSectorForMachine(machine.id)
      }))
      .filter(funcionario => {
        const matchesSearch = !searchTerm || 
          funcionario.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
          funcionario.id.includes(searchTerm);
        
        const matchesSection = !selectedSection || funcionario.setor === selectedSection;
        
        const matchesOperator = !selectedOperator || funcionario.operator === selectedOperator;
        
        return matchesSearch && matchesSection && matchesOperator;
      });
  };

  // Obter lista de operadores únicos
  const getUniqueOperators = () => {
    return [...new Set(machines
      .filter(m => m.operator && m.operator.trim() !== '')
      .map(m => m.operator)
    )].sort();
  };

  // Obter cores baseadas no status - FUNÇÃO CORRIGIDA E UNIFICADA
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-500 border-gray-400';
    
    // Normalização robusta igual aos outros componentes
    const statusNormalized = status
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();
    
    console.log(`🔍 OndeEstou Status Debug - Original: "${status}" | Normalizado: "${statusNormalized}"`);
    
    // MAPEAMENTO COMPLETO PARA CARDS DE FUNCIONÁRIO (cores mais vibrantes)
    const statusColorMap = {
      // PRODUÇÃO - Verde
      'producao': 'bg-green-500 border-green-400',
      'produção': 'bg-green-500 border-green-400',
      'produca': 'bg-green-500 border-green-400',
      
      // MANUTENÇÃO - Vermelho
      'manutencao': 'bg-red-500 border-red-400',
      'manutenção': 'bg-red-500 border-red-400',
      'manutenc': 'bg-red-500 border-red-400',
      'mnt': 'bg-red-500 border-red-400',
      'quebrada': 'bg-red-500 border-red-400',
      'defeito': 'bg-red-500 border-red-400',
      'reparo': 'bg-red-500 border-red-400',
      'conserto': 'bg-red-500 border-red-400',
      'parada': 'bg-red-500 border-red-400',
      'aguardando manutencao': 'bg-red-600 border-red-500',
      'aguardando manutenção': 'bg-red-600 border-red-500',
      
      // FALTA DE PROGRAMAÇÃO - Laranja
      'falta de programacao': 'bg-orange-500 border-orange-400',
      'falta de programação': 'bg-orange-500 border-orange-400',
      'falta programacao': 'bg-orange-500 border-orange-400',
      'sem programacao': 'bg-orange-500 border-orange-400',
      
      // FALTA DE OPERADOR - Amarelo
      'falta de operador': 'bg-yellow-500 border-yellow-400',
      'falta operador': 'bg-yellow-500 border-yellow-400',
      'sem operador': 'bg-yellow-500 border-yellow-400',
      
      // QUALIDADE - Roxo (ESSENCIAL!)
      'qualidade': 'bg-purple-500 border-purple-400',
      'quality': 'bg-purple-500 border-purple-400',
      'controle qualidade': 'bg-purple-500 border-purple-400',
      'inspecao': 'bg-purple-500 border-purple-400',
      'inspeção': 'bg-purple-500 border-purple-400',
      
      // DESENVOLVIMENTO/ENGENHARIA - Cinza
      'desenvolvimento': 'bg-gray-400 border-gray-300',
      'engenharia': 'bg-gray-400 border-gray-300',
      'desenvolvimento engenharia': 'bg-gray-400 border-gray-300',
      'desenvolvimento / engenharia': 'bg-gray-400 border-gray-300',
      'desenvolvimento/engenharia': 'bg-gray-400 border-gray-300',
      
      // FERRAMENTARIA - Cinza Escuro
      'ferramentaria': 'bg-gray-800 border-gray-700',
      'ferramenta': 'bg-gray-800 border-gray-700',
      'tooling': 'bg-gray-800 border-gray-700',
      
      // SETUP - Rosa
      'setup': 'bg-pink-500 border-pink-400',
      'preparacao': 'bg-pink-500 border-pink-400',
      'preparação': 'bg-pink-500 border-pink-400',
      'ajuste': 'bg-pink-500 border-pink-400',
      'aguardando setup': 'bg-pink-600 border-pink-500',
      
      // AJUSTE DE PERFIL - Laranja Escuro
      'ajuste de perfil': 'bg-orange-800 border-orange-700',
      'ajuste perfil': 'bg-orange-800 border-orange-700',
      
      // ABASTECIMENTO - Amarelo Escuro
      'abastecimento': 'bg-yellow-600 border-yellow-500',
      'abastecimento de insumo': 'bg-yellow-600 border-yellow-500',
      'abastecimento insumo': 'bg-yellow-600 border-yellow-500',
      'reabastecimento': 'bg-yellow-600 border-yellow-500',
      
      // REFEIÇÃO - Azul
      'refeicao': 'bg-blue-500 border-blue-400',
      'refeição': 'bg-blue-500 border-blue-400',
      'almoco': 'bg-blue-500 border-blue-400',
      'almoço': 'bg-blue-500 border-blue-400',
      'lanche': 'bg-blue-500 border-blue-400',
      'intervalo': 'bg-blue-500 border-blue-400',
      
      // TREINAMENTO - Índigo
      'treinamento': 'bg-indigo-500 border-indigo-400',
      'treinamento reuniao': 'bg-indigo-500 border-indigo-400',
      'treinamento/reuniao': 'bg-indigo-500 border-indigo-400',
      'treinamento/reunião': 'bg-indigo-500 border-indigo-400',
      'reuniao': 'bg-indigo-500 border-indigo-400',
      'reunião': 'bg-indigo-500 border-indigo-400',
      'capacitacao': 'bg-indigo-500 border-indigo-400',
      'capacitação': 'bg-indigo-500 border-indigo-400',
      
      // FALTA DE ENERGIA - Vermelho Escuro
      'falta de energia': 'bg-red-700 border-red-600',
      'falta energia': 'bg-red-700 border-red-600',
      'sem energia': 'bg-red-700 border-red-600',
      'queda energia': 'bg-red-700 border-red-600',
      
      // REVEZAMENTO - Roxo Escuro
      'revezamento': 'bg-purple-700 border-purple-600',
      'revesamento': 'bg-purple-700 border-purple-600',
      'troca turno': 'bg-purple-700 border-purple-600',
      
      // AGUARDANDO PROCESSO - Amarelo Escuro
      'aguardando processo em linha': 'bg-yellow-700 border-yellow-600',
      'aguardando processo': 'bg-yellow-700 border-yellow-600',
      'aguardando linha': 'bg-yellow-700 border-yellow-600',
      
      // FALTA DE MP - Laranja Escuro
      'falta de mp': 'bg-orange-600 border-orange-500',
      'falta mp': 'bg-orange-600 border-orange-500',
      'abastecimento de mp': 'bg-orange-600 border-orange-500',
      'abastecimento mp': 'bg-orange-600 border-orange-500',
      'sem materia prima': 'bg-orange-600 border-orange-500',
      'sem mp': 'bg-orange-600 border-orange-500',
      
      // FALTA DE EMBALAGEM - Laranja Claro
      'falta de embalagem': 'bg-orange-400 border-orange-300',
      'falta embalagem': 'bg-orange-400 border-orange-300',
      'sem embalagem': 'bg-orange-400 border-orange-300',
      
      // RETRABALHO - Roxo Médio
      'retrabalho': 'bg-purple-600 border-purple-500',
      'refazer': 'bg-purple-600 border-purple-500',
      'correcao': 'bg-purple-600 border-purple-500',
      'correção': 'bg-purple-600 border-purple-500',
      
      // 5S - Verde-azulado
      '5s': 'bg-teal-500 border-teal-400',
      '5 s': 'bg-teal-500 border-teal-400',
      'cinco s': 'bg-teal-500 border-teal-400',
      'limpeza': 'bg-teal-500 border-teal-400',
      'organizacao': 'bg-teal-500 border-teal-400',
      'organização': 'bg-teal-500 border-teal-400',
      
      // EVENTO NÃO PRODUTIVO - Preto
      'evento nao produtivo': 'bg-black border-gray-600',
      'evento não produtivo': 'bg-black border-gray-600',
      'nao produtivo': 'bg-black border-gray-600',
      'não produtivo': 'bg-black border-gray-600',
      
      // AJUSTE DE PERFIL - MARROM (NÃO LARANJA!)
      'ajuste de perfil': 'bg-amber-800 border-amber-700',
      'ajuste perfil': 'bg-amber-800 border-amber-700',
      
      // ABASTECIMENTO - Amarelo Escuro
      'abastecimento': 'bg-yellow-600 border-yellow-500',
      'abastecimento de insumo': 'bg-yellow-600 border-yellow-500',
      'abastecimento insumo': 'bg-yellow-600 border-yellow-500',
      'reabastecimento': 'bg-yellow-600 border-yellow-500',
      
      // REFEIÇÃO - Azul
      'refeicao': 'bg-blue-500 border-blue-400',
      'refeição': 'bg-blue-500 border-blue-400',
      'almoco': 'bg-blue-500 border-blue-400',
      'almoço': 'bg-blue-500 border-blue-400',
      'lanche': 'bg-blue-500 border-blue-400',
      'intervalo': 'bg-blue-500 border-blue-400',
      
      // TREINAMENTO - Índigo
      'treinamento': 'bg-indigo-500 border-indigo-400',
      'treinamento reuniao': 'bg-indigo-500 border-indigo-400',
      'treinamento/reuniao': 'bg-indigo-500 border-indigo-400',
      'treinamento/reunião': 'bg-indigo-500 border-indigo-400',
      'reuniao': 'bg-indigo-500 border-indigo-400',
      'reunião': 'bg-indigo-500 border-indigo-400',
      'capacitacao': 'bg-indigo-500 border-indigo-400',
      'capacitação': 'bg-indigo-500 border-indigo-400',
      
      // FALTA DE ENERGIA - Vermelho Escuro
      'falta de energia': 'bg-red-700 border-red-600',
      'falta energia': 'bg-red-700 border-red-600',
      'sem energia': 'bg-red-700 border-red-600',
      'queda energia': 'bg-red-700 border-red-600',
      
      // REVEZAMENTO - Roxo Escuro
      'revezamento': 'bg-purple-700 border-purple-600',
      'revesamento': 'bg-purple-700 border-purple-600',
      'troca turno': 'bg-purple-700 border-purple-600',
      
      // AGUARDANDO PROCESSO - Amarelo Escuro
      'aguardando processo em linha': 'bg-yellow-700 border-yellow-600',
      'aguardando processo': 'bg-yellow-700 border-yellow-600',
      'aguardando linha': 'bg-yellow-700 border-yellow-600',
      
      // FALTA DE MP - Laranja Escuro
      'falta de mp': 'bg-orange-600 border-orange-500',
      'falta mp': 'bg-orange-600 border-orange-500',
      'abastecimento de mp': 'bg-orange-600 border-orange-500',
      'abastecimento mp': 'bg-orange-600 border-orange-500',
      'sem materia prima': 'bg-orange-600 border-orange-500',
      'sem mp': 'bg-orange-600 border-orange-500',
      
      // FALTA DE EMBALAGEM - Laranja Claro
      'falta de embalagem': 'bg-orange-400 border-orange-300',
      'falta embalagem': 'bg-orange-400 border-orange-300',
      'sem embalagem': 'bg-orange-400 border-orange-300',
      
      // RETRABALHO - Roxo Médio
      'retrabalho': 'bg-purple-600 border-purple-500',
      'refazer': 'bg-purple-600 border-purple-500',
      'correcao': 'bg-purple-600 border-purple-500',
      'correção': 'bg-purple-600 border-purple-500',
      
      // 5S - Verde-azulado
      '5s': 'bg-teal-500 border-teal-400',
      '5 s': 'bg-teal-500 border-teal-400',
      'cinco s': 'bg-teal-500 border-teal-400',
      'limpeza': 'bg-teal-500 border-teal-400',
      'organizacao': 'bg-teal-500 border-teal-400',
      'organização': 'bg-teal-500 border-teal-400',
      
      // APENAS OCIOSO DEVE SER PRETO!
      'ocioso': 'bg-black border-gray-600',
      'ociosa': 'bg-black border-gray-600',
      
      // EVENTO NÃO PRODUTIVO - Preto
      'evento nao produtivo': 'bg-black border-gray-600',
      'evento não produtivo': 'bg-black border-gray-600',
      'nao produtivo': 'bg-black border-gray-600',
      'não produtivo': 'bg-black border-gray-600'
    };
    
    // Buscar cor exata
    const color = statusColorMap[statusNormalized];
    
    if (color) {
      console.log(`✅ OndeEstou Status mapeado: "${statusNormalized}" -> ${color}`);
      return color;
    }
    
    // Se não encontrou, tentar busca parcial
    for (const [key, value] of Object.entries(statusColorMap)) {
      if (statusNormalized.includes(key) || key.includes(statusNormalized)) {
        console.log(`✅ OndeEstou Status mapeado (parcial): "${statusNormalized}" -> ${value} (chave: ${key})`);
        return value;
      }
    }
    
    // Se ainda não encontrou, log e usar padrão cinza
    console.warn(`⚠️ OndeEstou Status NÃO MAPEADO: "${status}" (normalizado: "${statusNormalized}") - usando cinza padrão`);
    return 'bg-gray-500 border-gray-400'; // Padrão cinza normal
  };

  // Componente do Funcionário
  const FuncionarioCard = ({ funcionario, isCompact = false }) => {
    const [showDetails, setShowDetails] = useState(false);
    
    return (
      <div className="relative">
        <div
          className={`
            ${getStatusColor(funcionario.status)} 
            rounded-lg p-2 text-white font-bold text-center cursor-pointer
            transform transition-all duration-200 hover:scale-105 hover:shadow-lg
            border-2 ${isCompact ? 'min-w-[80px] h-20' : 'min-w-[120px] h-24'}
            flex flex-col justify-center items-center relative
          `}
          onClick={() => setShowDetails(!showDetails)}
        >
          {/* Bonequinho do Funcionário */}
          <div className={`${isCompact ? 'w-8 h-8' : 'w-10 h-10'} bg-white rounded-full flex items-center justify-center mb-1`}>
            <User className={`${isCompact ? 'w-5 h-5' : 'w-6 h-6'} text-gray-700`} />
          </div>
          
          {/* Nome do Funcionário */}
          <div className={`${isCompact ? 'text-xs' : 'text-sm'} font-bold truncate w-full px-1`}>
            {funcionario.operator.split(' ')[0]} {/* Primeiro nome */}
          </div>
          
          {/* Número da Máquina */}
          <div className={`${isCompact ? 'text-xs' : 'text-sm'} opacity-90`}>
            M{funcionario.id}
          </div>

          {/* Indicador de Eficiência */}
          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
            funcionario.efficiency >= 80 ? 'bg-green-600' :
            funcionario.efficiency >= 60 ? 'bg-yellow-600' :
            'bg-red-600'
          }`}>
            {funcionario.efficiency}
          </div>
        </div>

        {/* Tooltip com Detalhes */}
        {showDetails && (
          <div className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border p-4 min-w-[280px]">
            <div className="text-center">
              <h3 className="font-bold text-gray-800 text-lg">{funcionario.operator}</h3>
              <p className="text-gray-600 text-sm">Máquina {funcionario.id} • {funcionario.setor}</p>
              
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-2 ${getStatusColor(funcionario.status)} text-white`}>
                {funcionario.status}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-blue-600">{funcionario.efficiency}%</div>
                  <div className="text-gray-600">Eficiência</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">{funcionario.produced || 0}</div>
                  <div className="text-gray-600">Produzido</div>
                </div>
              </div>
              
              {funcionario.reference && (
                <div className="mt-3 p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Referência:</div>
                  <div className="font-medium text-gray-800">{funcionario.reference}</div>
                </div>
              )}
              
              <button
                onClick={() => setShowDetails(false)}
                className="mt-3 text-xs text-gray-500 hover:text-gray-700"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const funcionariosAtivos = getActiveFunctionarios();
  const operadoresUnicos = getUniqueOperators();

  return (
    <div className="space-y-6">
      {/* Header da Aba */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center">
              <MapPin className="w-6 h-6 mr-3 text-blue-600" />
              ONDE ESTOU - LOCALIZAÇÃO DOS FUNCIONÁRIOS
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Mapa em tempo real • {funcionariosAtivos.length} funcionários ativos • Atualizado: {currentTime.toLocaleTimeString('pt-BR')}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
            <Users className="w-4 h-4" />
            <span className="font-semibold">{funcionariosAtivos.length} Pessoas</span>
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar funcionário ou máquina..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os Setores</option>
            {Object.keys(sections).map(section => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
          
          <select
            value={selectedOperator}
            onChange={(e) => setSelectedOperator(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os Funcionários</option>
            {operadoresUnicos.map(operator => (
              <option key={operator} value={operator}>{operator}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mapa da Fábrica - Layout Responsivo */}
      
      {/* Mobile: Layout Vertical */}
      <div className="block lg:hidden space-y-4">
        {Object.entries(sections).map(([sectionName, sectionData]) => {
          const funcionariosSetor = funcionariosAtivos.filter(f => f.setor === sectionName);
          
          return (
            <div key={sectionName} className="bg-white rounded-lg shadow overflow-hidden">
              <div className={`${sectionData.color} text-white p-3 text-center relative`}>
                <div className="font-bold text-sm">{sectionName}</div>
                <div className="text-xs opacity-90 mt-1">
                  {funcionariosSetor.length} funcionário{funcionariosSetor.length !== 1 ? 's' : ''} ativo{funcionariosSetor.length !== 1 ? 's' : ''}
                </div>
                
                {/* Badge com contador */}
                {funcionariosSetor.length > 0 && (
                  <div className="absolute top-2 right-2 bg-white text-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {funcionariosSetor.length}
                  </div>
                )}
              </div>
              
              <div className="p-3">
                {funcionariosSetor.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {funcionariosSetor.map(funcionario => (
                      <FuncionarioCard 
                        key={funcionario.id} 
                        funcionario={funcionario}
                        isCompact={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum funcionário ativo neste setor</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: Layout Original com Funcionários */}
      <div className="hidden lg:grid grid-cols-12 gap-4">
        
        {/* CORTE - Esquerda */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className={`${sections.CORTE.color} text-white p-2 text-center font-bold text-sm relative`}>
              CORTE
              {funcionariosAtivos.filter(f => f.setor === 'CORTE').length > 0 && (
                <div className="absolute top-1 right-1 bg-white text-gray-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {funcionariosAtivos.filter(f => f.setor === 'CORTE').length}
                </div>
              )}
            </div>
            <div className="p-2 space-y-2">
              {funcionariosAtivos
                .filter(f => f.setor === 'CORTE')
                .map(funcionario => (
                  <FuncionarioCard 
                    key={funcionario.id} 
                    funcionario={funcionario}
                    isCompact={true}
                  />
                ))}
              
              {funcionariosAtivos.filter(f => f.setor === 'CORTE').length === 0 && (
                <div className="text-center py-4 text-gray-400">
                  <Users className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">Sem funcionários</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Centro */}
        <div className="col-span-10 space-y-4">
          
          {/* DOBRA DE TUBOS */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className={`${sections['DOBRA DE TUBOS'].color} text-white p-3 text-center font-bold relative`}>
              DOBRA DE TUBOS
              {funcionariosAtivos.filter(f => f.setor === 'DOBRA DE TUBOS').length > 0 && (
                <div className="absolute top-2 right-2 bg-white text-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {funcionariosAtivos.filter(f => f.setor === 'DOBRA DE TUBOS').length}
                </div>
              )}
            </div>
            <div className="p-4">
              {funcionariosAtivos.filter(f => f.setor === 'DOBRA DE TUBOS').length > 0 ? (
                <div className="grid grid-cols-6 gap-3">
                  {funcionariosAtivos
                    .filter(f => f.setor === 'DOBRA DE TUBOS')
                    .map(funcionario => (
                      <FuncionarioCard 
                        key={funcionario.id} 
                        funcionario={funcionario}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum funcionário ativo neste setor</p>
                </div>
              )}
            </div>
          </div>

          {/* DOBRA DE ARAMES */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className={`${sections['DOBRA DE ARAMES'].color} text-white p-3 text-center font-bold relative`}>
              DOBRA DE ARAMES
              {funcionariosAtivos.filter(f => f.setor === 'DOBRA DE ARAMES').length > 0 && (
                <div className="absolute top-2 right-2 bg-white text-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {funcionariosAtivos.filter(f => f.setor === 'DOBRA DE ARAMES').length}
                </div>
              )}
            </div>
            <div className="p-4">
              {funcionariosAtivos.filter(f => f.setor === 'DOBRA DE ARAMES').length > 0 ? (
                <div className="grid grid-cols-10 gap-2">
                  {funcionariosAtivos
                    .filter(f => f.setor === 'DOBRA DE ARAMES')
                    .map(funcionario => (
                      <FuncionarioCard 
                        key={funcionario.id} 
                        funcionario={funcionario}
                        isCompact={true}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum funcionário ativo neste setor</p>
                </div>
              )}
            </div>
          </div>

          {/* CONFORMAÇÃO e ESTAMPARIA */}
          <div className="grid grid-cols-2 gap-4">
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className={`${sections.CONFORMAÇÃO.color} text-white p-3 text-center font-bold relative`}>
                CONFORMAÇÃO
                {funcionariosAtivos.filter(f => f.setor === 'CONFORMAÇÃO').length > 0 && (
                  <div className="absolute top-2 right-2 bg-white text-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {funcionariosAtivos.filter(f => f.setor === 'CONFORMAÇÃO').length}
                  </div>
                )}
              </div>
              <div className="p-4">
                {funcionariosAtivos.filter(f => f.setor === 'CONFORMAÇÃO').length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {funcionariosAtivos
                      .filter(f => f.setor === 'CONFORMAÇÃO')
                      .map(funcionario => (
                        <FuncionarioCard 
                          key={funcionario.id} 
                          funcionario={funcionario}
                          isCompact={true}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <p className="text-xs">Sem funcionários</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className={`${sections.ESTAMPARIA.color} text-white p-3 text-center font-bold relative`}>
                ESTAMPARIA
                {funcionariosAtivos.filter(f => f.setor === 'ESTAMPARIA').length > 0 && (
                  <div className="absolute top-2 right-2 bg-white text-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {funcionariosAtivos.filter(f => f.setor === 'ESTAMPARIA').length}
                  </div>
                )}
              </div>
              <div className="p-4">
                {funcionariosAtivos.filter(f => f.setor === 'ESTAMPARIA').length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {funcionariosAtivos
                      .filter(f => f.setor === 'ESTAMPARIA')
                      .map(funcionario => (
                        <FuncionarioCard 
                          key={funcionario.id} 
                          funcionario={funcionario}
                          isCompact={true}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <p className="text-xs">Sem funcionários</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Direita */}
        <div className="col-span-1 space-y-4">
          
          {/* CÉLULA HASTES */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className={`${sections['CÉLULA HASTES'].color} text-white p-2 text-center font-bold text-sm relative`}>
              CÉLULA HASTES
              {funcionariosAtivos.filter(f => f.setor === 'CÉLULA HASTES').length > 0 && (
                <div className="absolute top-1 right-1 bg-white text-gray-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {funcionariosAtivos.filter(f => f.setor === 'CÉLULA HASTES').length}
                </div>
              )}
            </div>
            <div className="p-2">
              {funcionariosAtivos.filter(f => f.setor === 'CÉLULA HASTES').length > 0 ? (
                <div className="grid grid-cols-1 gap-1">
                  {funcionariosAtivos
                    .filter(f => f.setor === 'CÉLULA HASTES')
                    .map(funcionario => (
                      <FuncionarioCard 
                        key={funcionario.id} 
                        funcionario={funcionario}
                        isCompact={true}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <Users className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">Sem funcionários</p>
                </div>
              )}
            </div>
          </div>

          {/* SOLDA */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className={`${sections.SOLDA.color} text-white p-2 text-center font-bold text-sm relative`}>
              SOLDA
              {funcionariosAtivos.filter(f => f.setor === 'SOLDA').length > 0 && (
                <div className="absolute top-1 right-1 bg-white text-gray-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {funcionariosAtivos.filter(f => f.setor === 'SOLDA').length}
                </div>
              )}
            </div>
            <div className="p-2 space-y-1">
              {funcionariosAtivos.filter(f => f.setor === 'SOLDA').length > 0 ? (
                funcionariosAtivos
                  .filter(f => f.setor === 'SOLDA')
                  .map(funcionario => (
                    <FuncionarioCard 
                      key={funcionario.id} 
                      funcionario={funcionario}
                      isCompact={true}
                    />
                  ))
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <Users className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">Sem funcionários</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Lista de Funcionários - Resumo */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gray-800 text-white p-4">
          <h3 className="text-lg font-bold flex items-center">
            <Users className="w-5 h-5 mr-2" />
            RESUMO DOS FUNCIONÁRIOS ATIVOS
          </h3>
          <p className="text-sm opacity-90 mt-1">
            Lista completa de funcionários em atividade • {funcionariosAtivos.length} pessoas
          </p>
        </div>

        {funcionariosAtivos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">FUNCIONÁRIO</th>
                  <th className="px-4 py-3 text-center">MÁQUINA</th>
                  <th className="px-4 py-3 text-left">SETOR</th>
                  <th className="px-4 py-3 text-left">STATUS</th>
                  <th className="px-4 py-3 text-center">EFICIÊNCIA</th>
                  <th className="px-4 py-3 text-center">PRODUÇÃO</th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left">REFERÊNCIA</th>
                </tr>
              </thead>
              <tbody>
                {funcionariosAtivos
                  .sort((a, b) => a.operator.localeCompare(b.operator))
                  .map((funcionario, index) => (
                    <tr key={funcionario.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{funcionario.operator}</div>
                            <div className="text-xs text-gray-500">
                              <Clock className="inline w-3 h-3 mr-1" />
                              {currentTime.toLocaleTimeString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-blue-600 text-lg">{funcionario.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700 font-medium text-xs lg:text-sm">{funcionario.setor}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(funcionario.status)} text-white`}>
                          {funcionario.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${
                          funcionario.efficiency >= 80 ? 'text-green-600' :
                          funcionario.efficiency >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {funcionario.efficiency}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="text-sm">
                          <div className="font-semibold text-blue-600">{funcionario.produced || 0}</div>
                          <div className="text-gray-500 text-xs">/ {funcionario.planned || 0}</div>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3">
                        <span className="text-gray-600 text-xs">{funcionario.reference || '-'}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhum funcionário ativo encontrado</h3>
            <p className="text-sm">
              {searchTerm || selectedSection || selectedOperator 
                ? 'Tente ajustar os filtros para encontrar funcionários.' 
                : 'Não há funcionários com operador definido no momento.'}
            </p>
          </div>
        )}
      </div>

      {/* Estatísticas por Setor */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(sections).map(([sectionName, sectionData]) => {
          const funcionariosSetor = funcionariosAtivos.filter(f => f.setor === sectionName);
          const eficienciaMedia = funcionariosSetor.length > 0 
            ? Math.round(funcionariosSetor.reduce((acc, f) => acc + f.efficiency, 0) / funcionariosSetor.length)
            : 0;

          return (
            <div key={sectionName} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-800 text-sm">{sectionName}</h4>
                <div className={`w-3 h-3 rounded-full ${sectionData.color.replace('bg-', 'bg-')}`}></div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Funcionários:</span>
                  <span className="font-bold text-blue-600">{funcionariosSetor.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Eficiência Média:</span>
                  <span className={`font-bold ${
                    eficienciaMedia >= 80 ? 'text-green-600' :
                    eficienciaMedia >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {eficienciaMedia}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Produção Total:</span>
                  <span className="font-bold text-green-600">
                    {funcionariosSetor.reduce((acc, f) => acc + (f.produced || 0), 0)}
                  </span>
                </div>
              </div>

              {/* Barra de Progresso da Eficiência do Setor */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      eficienciaMedia >= 80 ? 'bg-green-500' :
                      eficienciaMedia >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(eficienciaMedia, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rodapé com Informações */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2 text-blue-800">
            <MapPin className="w-5 h-5" />
            <span className="font-semibold">Localização em Tempo Real</span>
          </div>
          
          <div className="text-sm text-blue-700 space-y-1 sm:space-y-0 sm:flex sm:space-x-4">
            <div>📊 {funcionariosAtivos.length} funcionários ativos</div>
            <div>🏭 {Object.keys(sections).length} setores monitorados</div>
            <div>⏰ Atualização automática a cada 20s</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OndeEstou;