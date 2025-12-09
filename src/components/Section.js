import React from 'react';
import MachineCard from './MachineCard';

const Section = ({ name, machines = [], color, className = "", machineData = [] }) => {
  // Função para obter dados de uma máquina específica
  const getMachineData = (machineId) => {
    return machineData.find(m => m.id === machineId) || {
      id: machineId,
      status: 'Ocioso',
      operator: '',
      produced: 0,
      planned: 0,
      efficiency: 0
    };
  };

  // Calcular estatísticas da seção
  const sectionStats = {
    total: machines.length,
    producing: machines.filter(id => {
      const machine = getMachineData(id);
      return machine.status?.trim().toLowerCase() === 'produção';
    }).length,
    stopped: machines.filter(id => {
      const machine = getMachineData(id);
      return machine.status?.trim().toLowerCase() === 'parada';
    }).length,
    efficiency: machines.length > 0 ? 
      Math.round(machines.reduce((acc, id) => {
        const machine = getMachineData(id);
        return acc + (machine.efficiency || 0);
      }, 0) / machines.length) : 0
  };

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* Header da Seção */}
      <div className={`${color} text-white px-4 py-3 rounded-t-lg font-bold text-center border-b`}>
        <div className="text-lg font-bold">{name}</div>
        <div className="text-sm opacity-90 mt-1 flex justify-center space-x-4">
          <span>Total: {sectionStats.total}</span>
          <span>Produção: {sectionStats.producing}</span>
          <span>Parada: {sectionStats.stopped}</span>
          <span>Efic: {sectionStats.efficiency}%</span>
        </div>
      </div>

      {/* Grid de Máquinas */}
      <div className="p-4">
        <div className="grid grid-cols-6 gap-3 mb-4">
          {machines.map(machineId => (
            <MachineCard 
              key={machineId} 
              machine={getMachineData(machineId)}
              size="normal"
            />
          ))}
        </div>

        {/* Barra de Status da Seção */}
        <div className="bg-gray-50 rounded-lg p-3 border">
          <div className="flex justify-between items-center text-sm text-gray-700 mb-2">
            <span className="font-semibold">STATUS DA SEÇÃO</span>
            <span className="font-bold text-blue-600">{sectionStats.efficiency}% EFICIÊNCIA</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                sectionStats.efficiency >= 80 ? 'bg-green-500' :
                sectionStats.efficiency >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(sectionStats.efficiency, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section;