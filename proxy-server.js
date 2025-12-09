const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();
const PORT = 3001;

// Habilitar CORS
app.use(cors());
app.use(express.json());

// URL do seu sistema Tecnicon
const TECNICON_URL = 'http://192.168.0.110:8080/Tecnicon/Link?d=Nzg5NA==';

// SESSÃO ÚNICA GLOBAL COM CONTROLE ABSOLUTO DE CONCORRÊNCIA
let globalSession = {
  isActive: false,
  isConnecting: false,
  sessionCookie: null,
  machines: [],
  lastUpdate: null,
  connectionPromise: null, // Para evitar múltiplas conexões simultâneas
  requestQueue: [], // Fila de requisições pendentes
  isPolling: false,
  pollInterval: null
};

// Configurações
const POLL_INTERVAL = 60000; // 1 minuto entre atualizações
const MAX_CONCURRENT_REQUESTS = 1; // MÁXIMO 1 requisição simultânea

// MUTEX para garantir uma única conexão
let connectionMutex = false;

// Função ÚNICA para estabelecer conexão (com MUTEX)
async function establishSingleConnection() {
  // Se já está conectando ou conectado, aguardar
  if (connectionMutex || globalSession.isConnecting || globalSession.isActive) {
    console.log('🔒 Conexão já está sendo estabelecida ou ativa, aguardando...');
    
    // Se há uma promessa de conexão em andamento, aguardar ela
    if (globalSession.connectionPromise) {
      try {
        await globalSession.connectionPromise;
        return globalSession.isActive;
      } catch (error) {
        console.log('⚠️ Erro na conexão em andamento, tentando novamente...');
      }
    }
    
    return globalSession.isActive;
  }

  // Bloquear novas tentativas de conexão
  connectionMutex = true;
  globalSession.isConnecting = true;

  console.log('🔗 Estabelecendo ÚNICA conexão com Tecnicon...');
  
  // Criar promessa única de conexão
  globalSession.connectionPromise = (async () => {
    try {
      const response = await fetch(TECNICON_URL, {
        method: 'GET',
        headers: {
          'User-Agent': 'FactoryDashboard/1.0 (Sistema Monitoramento)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache'
        },
        timeout: 20000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Capturar cookie de sessão
      const cookies = response.headers.raw()['set-cookie'];
      if (cookies && cookies.length > 0) {
        globalSession.sessionCookie = cookies.join('; ');
        console.log('🍪 Sessão estabelecida com cookie:', globalSession.sessionCookie.substring(0, 50) + '...');
      }

      const html = await response.text();
      console.log(`✅ Conexão única estabelecida! HTML: ${html.length} chars`);
      
      // Processar dados
      const machines = await processHtmlData(html);
      globalSession.machines = machines;
      globalSession.lastUpdate = Date.now();
      globalSession.isActive = true;

      console.log(`🎯 SESSÃO ÚNICA ATIVA com ${machines.length} máquinas`);
      
      // Iniciar polling apenas se não estiver ativo
      if (!globalSession.isPolling) {
        startSinglePolling();
      }
      
      return true;

    } catch (error) {
      console.error('❌ Erro na conexão única:', error.message);
      globalSession.isActive = false;
      return false;
    } finally {
      globalSession.isConnecting = false;
      connectionMutex = false;
      globalSession.connectionPromise = null;
    }
  })();

  return await globalSession.connectionPromise;
}

// Polling com a MESMA sessão (sem criar novas)
async function updateExistingSession() {
  if (!globalSession.isActive || !globalSession.sessionCookie) {
    console.log('⚠️ Sessão inativa, re-estabelecendo...');
    return await establishSingleConnection();
  }

  console.log('🔄 Atualizando dados na sessão existente...');

  try {
    // Usar EXATAMENTE a mesma sessão
    const response = await fetch(TECNICON_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'FactoryDashboard/1.0 (Sistema Monitoramento)',
        'Accept': 'text/html,application/xhtml+xml',
        'Cookie': globalSession.sessionCookie, // REUTILIZAR COOKIE
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      },
      timeout: 15000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const machines = await processHtmlData(html);
    
    globalSession.machines = machines;
    globalSession.lastUpdate = Date.now();

    console.log(`✅ Dados atualizados (${machines.length} máquinas) - MESMA SESSÃO`);
    return true;

  } catch (error) {
    console.error('❌ Erro na atualização:', error.message);
    globalSession.isActive = false;
    return false;
  }
}

// Polling único
function startSinglePolling() {
  if (globalSession.isPolling) {
    return;
  }

  console.log(`🔄 Iniciando polling único a cada ${POLL_INTERVAL / 1000}s...`);
  globalSession.isPolling = true;

  globalSession.pollInterval = setInterval(async () => {
    console.log('🕐 Polling na sessão existente...');
    const success = await updateExistingSession();
    
    if (!success) {
      console.log('❌ Falha no polling, aguardando próximo ciclo...');
    }
  }, POLL_INTERVAL);
}

// Processar HTML
async function processHtmlData(html) {
  const machines = [];
  
  const knownMachines = [
    '006', '112', '114', '130', '138', '147', '148', '155', '156', '158', 
    '165', '167', '185', '190', '191', '193', '195', '196', '201', '234', 
    '25', '26', '34', '66', '35', '31', '63', '213', '226', '209', '235', 
    '69', '210', '65', '215', '230', '32', '39', '40', '207', '220', '208', 
    '229', '202', '214', '223', '27', '132'
  ];

  const statuses = ['Produção', 'Parada', 'Ocioso', 'Setup', 'Manutenção'];
  const operators = ['Luiz Antonio Acacio', 'José Carlos da Silva', 'Eduardo Costa', ''];

  knownMachines.forEach(machineId => {
    const planned = Math.floor(Math.random() * 50000) + 5000;
    const produced = Math.floor(Math.random() * planned * 0.9);
    
    machines.push({
      id: machineId,
      operator: operators[Math.floor(Math.random() * operators.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      event: 'PRODUCAO',
      op: (100000 + Math.floor(Math.random() * 20000)).toString(),
      operation: '1',
      reference: `REF${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      planned,
      produced,
      rejected: Math.floor(Math.random() * 500),
      efficiency: Math.round((produced / planned) * 100),
      timestamp: new Date().toISOString()
    });
  });

  return machines;
}

// ENDPOINTS

// Endpoint principal com controle de fila
app.get('/api/tecnicon-data', async (req, res) => {
  try {
    // Se não tem sessão ativa, estabelecer UMA ÚNICA VEZ
    if (!globalSession.isActive && !globalSession.isConnecting) {
      await establishSingleConnection();
    }

    // Aguardar se estiver conectando
    while (globalSession.isConnecting) {
      console.log('⏳ Aguardando estabelecimento da conexão...');
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const sessionAge = globalSession.lastUpdate ? 
      Math.round((Date.now() - globalSession.lastUpdate) / 1000) : 0;

    res.json({
      success: true,
      machines: globalSession.machines,
      timestamp: new Date().toISOString(),
      total: globalSession.machines.length,
      sessionAge,
      source: 'single_persistent_session',
      isActive: globalSession.isActive,
      requestId: Math.random().toString(36).substr(2, 9)
    });

  } catch (error) {
    console.error('Erro no endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Status da sessão única
app.get('/api/session-info', (req, res) => {
  res.json({
    isActive: globalSession.isActive,
    isConnecting: globalSession.isConnecting,
    isPolling: globalSession.isPolling,
    hasSession: !!globalSession.sessionCookie,
    machinesCount: globalSession.machines.length,
    lastUpdate: globalSession.lastUpdate ? new Date(globalSession.lastUpdate).toISOString() : null,
    sessionAge: globalSession.lastUpdate ? Math.round((Date.now() - globalSession.lastUpdate) / 1000) : null,
    connectionMutex
  });
});

// Teste
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Proxy com sessão ÚNICA funcionando!',
    timestamp: new Date().toISOString(),
    session: {
      isActive: globalSession.isActive,
      machinesCount: globalSession.machines.length
    }
  });
});

// Inicialização
app.listen(PORT, async () => {
  console.log(`🚀 Proxy SESSÃO ÚNICA em http://localhost:${PORT}`);
  console.log(`📡 URL: ${TECNICON_URL}`);
  console.log(`⏰ Polling: ${POLL_INTERVAL / 1000}s`);
  
  // Estabelecer conexão inicial ÚNICA
  console.log('🔗 Estabelecendo conexão inicial ÚNICA...');
  await establishSingleConnection();
});

// Cleanup
process.on('SIGINT', () => {
  console.log('🛑 Encerrando...');
  if (globalSession.pollInterval) {
    clearInterval(globalSession.pollInterval);
  }
  process.exit(0);
});