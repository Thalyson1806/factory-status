import React from 'react';

const HeaderWithLogo = ({ currentTime, stats, activeTab, setActiveTab, showUpload, setShowUpload, refreshData, isLoading }) => {
  return (
    <>
      {/* Header Principal - Desktop */}
      <div className="hidden lg:flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-6">
          {/* Logo da Empresa */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center">
              <img src="/logo.png" alt="Logo da Empresa" className="w-14 h-14 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">STATUS DE FÁBRICA</h1>
              <p className="text-sm text-gray-600"></p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm bg-gray-100 px-3 py-1 rounded">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>{currentTime.toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded font-medium">
            {stats.overall_efficiency}% Eficiência Geral
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
              Análise de Dados
            </button>
            <button
              onClick={() => setActiveTab('relatorio')}
              className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                activeTab === 'relatorio' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Relatório Gerencial
            </button>
          </div>
          
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            Carregar CSV
          </button>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Header Compacto - Tablet */}
      <div className="hidden md:flex lg:hidden justify-between items-center mb-6 bg-white p-3 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">STATUS DE FÁBRICA</h1>
            <div className="flex items-center space-x-2 text-xs bg-gray-100 px-2 py-1 rounded mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>{currentTime.toLocaleTimeString('pt-BR')}</span>
              <span>•</span>
              <span>{stats.overall_efficiency}% Eficiência</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Abas de Navegação Compactas */}
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded font-medium text-xs transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📊
            </button>
            <button
              onClick={() => setActiveTab('dados')}
              className={`px-3 py-2 rounded font-medium text-xs transition-colors ${
                activeTab === 'dados' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📋
            </button>
            <button
              onClick={() => setActiveTab('relatorio')}
              className={`px-3 py-2 rounded font-medium text-xs transition-colors ${
                activeTab === 'relatorio' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📄
            </button>
          </div>
          
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs transition-colors"
          >
            CSV
          </button>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs transition-colors disabled:opacity-50"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Header Mobile - Minimal */}
      <div className="md:hidden mb-4 bg-white p-3 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">FÁBRICA</h1>
              <div className="text-xs text-gray-600 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span>{currentTime.toLocaleTimeString('pt-BR')}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-bold text-green-600">{stats.overall_efficiency}%</div>
            <div className="text-xs text-gray-500">Eficiência</div>
          </div>
        </div>

        {/* Navegação Mobile */}
        <div className="flex mt-3 space-x-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-colors ${
              activeTab === 'dashboard' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('dados')}
            className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-colors ${
              activeTab === 'dados' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            📋 Dados
          </button>
          <button
            onClick={() => setActiveTab('relatorio')}
            className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-colors ${
              activeTab === 'relatorio' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            📄 Relatório
          </button>
        </div>

        {/* Controles Mobile */}
        <div className="flex mt-3 space-x-2">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-xs transition-colors"
          >
            📁 CSV
          </button>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-xs transition-colors disabled:opacity-50"
          >
            {isLoading ? '⏳' : '🔄'} {isLoading ? 'Carregando' : 'Atualizar'}
          </button>
        </div>
      </div>
    </>
  );
};

export default HeaderWithLogo;