import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

const useCSVData = () => {
  const [machines, setMachines] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para gerar dados mock quando não há CSV - REMOVIDA PARA PRODUÇÃO
  const generateMockData = useCallback(() => {
    console.warn('⚠️ ATENÇÃO: Usando dados de demonstração - Carregue o CSV real!');
    setError('⚠️ DADOS DE DEMONSTRAÇÃO - Carregue o arquivo CSV real para dados oficiais');
    setMachines([]); // Não mostrar dados falsos
    setLastUpdate(new Date());
  }, []);

  // Função para processar CSV
  const processCSV = useCallback((csvContent) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = Papa.parse(csvContent, {
        header: false,
        delimiter: ';',
        skipEmptyLines: true
      });

      if (result.errors.length > 0) {
        console.warn('Avisos no CSV:', result.errors);
      }

      const [headers, ...rows] = result.data;
      console.log('Headers do CSV:', headers); // Debug
      console.log('Primeiras 3 linhas:', rows.slice(0, 3)); // Debug
      
      const processedMachines = rows.map(row => {
        // Conversão segura para números
        const planned = parseInt(row[7]) || 0;
        const produced = parseInt(row[8]) || 0;
        const rejected = parseInt(row[9]) || 0;
        const efficiency = planned > 0 ? Math.round((produced / planned) * 100) : 0;
        
        const machineData = {
          id: row[0]?.toString().trim(),
          operator: row[1]?.trim() || '',
          status: row[2]?.trim() || 'Ocioso',
          event: row[3]?.trim() || '',
          op: row[4]?.trim() || '',
          operation: row[5]?.trim() || '',
          reference: row[6]?.trim() || '',
          planned,
          produced,
          rejected,
          efficiency,
          planTime: parseInt(row[10]) || 0,
          osNumber: row[11]?.trim() || '',
          expectedDate: row[12]?.trim() || '',
          expectedTime: row[13]?.trim() || '',
          timestamp: new Date().toISOString()
        };

        console.log(`Máquina ${machineData.id}:`, {
          status: machineData.status,
          planned: machineData.planned,
          produced: machineData.produced,
          rejected: machineData.rejected,
          efficiency: machineData.efficiency
        });

        return machineData;
      }).filter(machine => machine.id && machine.id !== '');

      console.log(`Processadas ${processedMachines.length} máquinas do CSV`);
      setMachines(processedMachines);
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error('Erro ao processar CSV:', err);
      setError('Erro ao processar arquivo CSV: ' + err.message);
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  }, [generateMockData]);

  // Função para carregar dados reais do CSV
  const loadRealCSVData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/Dados.csv');
      if (!response.ok) {
        throw new Error('Arquivo CSV não encontrado');
      }
      
      const csvContent = await response.text();
      processCSV(csvContent);
      
    } catch (error) {
      console.error('Erro ao carregar CSV real:', error);
      setError('Arquivo CSV não encontrado. Usando dados de demonstração.');
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  }, [processCSV, generateMockData]);

  // Função para carregar arquivo CSV
  const loadCSVFile = useCallback((file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      processCSV(e.target.result);
    };
    reader.onerror = () => {
      setError('Erro ao ler arquivo');
      generateMockData();
    };
    reader.readAsText(file, 'UTF-8');
  }, [processCSV, generateMockData]);

  // Função para atualizar dados
  const refreshData = useCallback(() => {
    loadRealCSVData();
  }, [loadRealCSVData]);

  // Inicializar com dados reais do CSV
  useEffect(() => {
    loadRealCSVData();
  }, [loadRealCSVData]);

  // Auto-refresh a cada 20 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        loadRealCSVData();
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [loadRealCSVData, isLoading]);

  return {
    machines,
    lastUpdate,
    isLoading,
    error,
    loadCSVFile,
    refreshData,
    generateMockData
  };
};

export default useCSVData;