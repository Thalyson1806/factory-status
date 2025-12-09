import React from 'react';
import { Printer } from 'lucide-react';

const PrintDashboard = ({ machines, lastUpdate, stats, sections }) => {
  
  // Função para imprimir - SIMPLES E DIRETO
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Botão de Impressão - Só aparece na tela */}
      <div className="bg-white p-4 rounded-lg shadow mb-4 print:hidden">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800">📊 RELATÓRIO PARA IMPRESSÃO</h3>
            <p className="text-sm text-gray-600">
              Dados atualizados em: {lastUpdate.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ✅ Layout otimizado para impressão em papel A4
            </p>
          </div>
          
          <button
            onClick={handlePrint}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 text-lg font-bold"
          >
            <Printer className="w-5 h-5" />
            <span>IMPRIMIR RELATÓRIO</span>
          </button>
        </div>
      </div>

      {/* Header da Logo - APENAS PARA IMPRESSÃO */}
      <div className="hidden print:block bg-white">
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-800">
          <div className="flex items-center space-x-4">
            {/* Logo da Empresa */}
            <div className="w-20 h-20  rounded-lg flex items-center justify-center">
           
             <img src="/logo.png" alt="Logo da Empresa" className="w-18 h-18 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">RELATÓRIO DE PRODUÇÃO</h1>
              <h2 className="text-lg text-gray-700 mt-1">PAINEL DE CONTROLE - SISTEMA INDUSTRIAL</h2>
            </div>
          </div>
          
          <div className="text-right text-sm text-gray-600">
            <p><strong>Data/Hora:</strong> {new Date().toLocaleString('pt-BR')}</p>
            <p><strong>Total de Máquinas:</strong> {machines.length}</p>
            <p><strong>Eficiência Geral:</strong> {stats.overall_efficiency}%</p>
            <p><strong>Máquinas Ativas:</strong> {machines.filter(m => m.status?.trim().toLowerCase() !== 'ocioso').length}</p>
          </div>
        </div>
      </div>

      {/* Tabela de Máquinas - SEMPRE VISÍVEL */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header da tabela na tela */}
        <div className="bg-gray-800 text-white p-4 print:hidden">
          <h2 className="text-xl font-bold"> MÁQUINAS COM EVENTOS ATIVOS</h2>
          <p className="text-sm opacity-90 mt-1">
            Exibindo apenas máquinas em atividade • Total: {machines.filter(m => m.status?.trim().toLowerCase() !== 'ocioso').length} de {machines.length} máquinas
          </p>
        </div>

        {/* Header da tabela para impressão */}
        <div className="hidden print:block p-4 border-b">
          <h3 className="text-lg font-bold text-gray-900">📊 MÁQUINAS COM EVENTOS ATIVOS</h3>
          <p className="text-sm text-gray-600">
            Exibindo apenas máquinas em atividade • Total: {machines.filter(m => m.status?.trim().toLowerCase() !== 'ocioso').length} de {machines.length} máquinas
          </p>
        </div>

        {/* Tabela das Máquinas */}
        <div className="overflow-x-auto">
          {machines.filter(m => m.status?.trim().toLowerCase() !== 'ocioso').length > 0 ? (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white print:bg-gray-800">
                  <th className="border border-gray-600 px-2 py-2 text-left font-bold">MÁQUINA</th>
                  <th className="border border-gray-600 px-2 py-2 text-left font-bold">STATUS</th>
                  <th className="border border-gray-600 px-2 py-2 text-left font-bold">SETOR</th>
                  <th className="border border-gray-600 px-2 py-2 text-left font-bold">OPERADOR</th>
                  <th className="border border-gray-600 px-2 py-2 text-left font-bold">REFERÊNCIA</th>
                  <th className="border border-gray-600 px-2 py-2 text-left font-bold">OP</th>
                </tr>
              </thead>
              <tbody>
                {machines
                  .filter(machine => machine.status?.trim().toLowerCase() !== 'ocioso')
                  .sort((a, b) => parseInt(a.id) - parseInt(b.id))
                  .map((machine, index) => {
                    let setor = 'OUTROS';
                    if (sections['DOBRA DE TUBOS'].machines.includes(machine.id)) setor = 'DOBRA DE TUBOS';
                    else if (sections['DOBRA DE ARAMES'].machines.includes(machine.id)) setor = 'DOBRA DE ARAMES';
                    else if (sections.CONFORMAÇÃO.machines.includes(machine.id)) setor = 'CONFORMAÇÃO';
                    else if (sections.ESTAMPARIA.machines.includes(machine.id)) setor = 'ESTAMPARIA';
                    else if (sections.SOLDA.machines.includes(machine.id)) setor = 'SOLDA';
                    else if (sections['CÉLULA HASTES'].machines.includes(machine.id)) setor = 'CÉLULAS HASTES';
                    else if (sections.CORTE.machines.includes(machine.id)) setor = 'CORTE';

                    // Definir cor de fundo baseada no status
                    let statusBg = 'bg-white';
                    const statusNormalized = machine.status?.trim().toLowerCase();
                    if (statusNormalized === 'produção') statusBg = 'bg-green-50';
                    else if (statusNormalized === 'manutenção') statusBg = 'bg-red-50';
                    else if (statusNormalized === 'falta de programação') statusBg = 'bg-orange-50';
                    else if (statusNormalized === 'falta de operador') statusBg = 'bg-yellow-50';
                    else if (statusNormalized === 'qualidade') statusBg = 'bg-purple-50';
                    else if (statusNormalized === 'setup') statusBg = 'bg-pink-50';
                    else if (statusNormalized === 'ferramentaria') statusBg = 'bg-gray-50';

                    return (
                      <tr key={machine.id} className={index % 2 === 0 ? 'bg-gray-50' : statusBg}>
                        <td className="border border-gray-400 px-3 py-3 font-bold text-blue-600 text-center">{machine.id}</td>
                        <td className="border border-gray-400 px-3 py-3 text-sm font-medium">
                          {machine.status}
                        </td>
                        <td className="border border-gray-400 px-3 py-3 text-sm font-medium text-gray-700">{setor}</td>
                        <td className="border border-gray-400 px-3 py-3 text-sm">{machine.operator || '-'}</td>
                        <td className="border border-gray-400 px-3 py-3 text-sm font-medium text-gray-700">
                          {machine.reference || '-'}
                        </td>
                        <td className="border border-gray-400 px-3 py-3 text-sm text-center font-medium">
                          {machine.op || '-'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">Nenhuma máquina com eventos ativos encontrada.</p>
              <p className="text-sm mt-2">Todas as máquinas estão ociosas ou não há dados carregados.</p>
            </div>
          )}
        </div>

        {/* Informação adicional sobre filtro */}
        <div className="p-4 bg-blue-50 border-t border-blue-200 text-sm">
          <p><strong>📌 Nota:</strong> Este relatório exibe apenas máquinas com eventos ativos. 
          Máquinas ociosas ({machines.filter(m => m.status?.trim().toLowerCase() === 'ocioso').length}) 
          foram omitidas para foco nas atividades.</p>
        </div>
      </div>

      {/* Footer - APENAS PARA IMPRESSÃO */}
      <div className="hidden print:block p-4 border-t-2 border-gray-800 text-center text-xs text-gray-600 mt-4">
        <p><strong>Metalurgica Formigari</strong> • Dados atualizados em: {lastUpdate.toLocaleString('pt-BR')}</p>
      </div>

      {/* CSS para Impressão Otimizada */}
      <style jsx>{`
        @media print {
          /* Esconder elementos da tela */
          .print\\:hidden {
            display: none !important;
          }
          
          /* Configurações da página */
          @page {
            margin: 1cm;
            size: A4 portrait;
          }
          
          /* Garantir que as cores apareçam */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Otimizar fonte para impressão */
          body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.2;
          }
          
          /* Evitar quebra de página em elementos importantes */
          h1, h2, h3 {
            page-break-after: avoid;
          }
          
          table {
            page-break-inside: avoid;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          /* Ajustar largura da tabela */
          table {
            width: 100% !important;
            font-size: 10px;
          }
          
          /* Destacar bordas para impressão */
          .border-gray-800 {
            border-color: #000 !important;
          }
          
          .bg-gray-800 {
            background-color: #000 !important;
          }
        }
      `}</style>
    </>
  );
};

export default PrintDashboard;