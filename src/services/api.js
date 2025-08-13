import axios from 'axios';

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Erro do servidor
      const message = error.response.data?.message || 'Erro no servidor';
      throw new Error(`${error.response.status}: ${message}`);
    } else if (error.request) {
      // Erro de rede
      throw new Error('Erro de conexão com o servidor');
    } else {
      // Erro de configuração
      throw new Error('Erro na requisição');
    }
  }
);

// Serviços de Upload
export const uploadService = {
  // Upload de arquivo
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    };

    const response = await api.post('/upload', formData, config);
    return response.data;
  },
};

// Serviços de Processamento
export const processingService = {
  // Processar arquivo
  analyzeFile: async (fileId) => {
    const response = await api.post('/processing/analyze-file', { fileId });
    return response.data;
  },

  // Processar texto
  analyzeText: async (text) => {
    const response = await api.post('/processing/analyze-text', { text });
    return response.data;
  },

  // Verificar status do job
  getJobStatus: async (jobId) => {
    const response = await api.get(`/processing/status/${jobId}`);
    return response.data;
  },

  // Listar todos os jobs
  getAllJobs: async () => {
    const response = await api.get('/processing/jobs');
    return response.data;
  },

  // Deletar job
  deleteJob: async (jobId) => {
    const response = await api.delete(`/processing/jobs/${jobId}`);
    return response.data;
  },

  // Testar conexão com ChatGPT
  testConnection: async () => {
    const response = await api.get('/processing/test-connection');
    return response.data;
  },

  // Limpar jobs antigos
  cleanupJobs: async () => {
    const response = await api.post('/processing/cleanup');
    return response.data;
  },

  // Polling para monitorar status do job
  pollJobStatus: async (jobId, maxAttempts = 30, interval = 2000) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const status = await processingService.getJobStatus(jobId);

        console.log(`Polling (tentativa ${attempt + 1}):`, status);
        
        if (status.status === 'completed' || status.status === 'error') {
          return status;
        }
        
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error) {
        console.error(`Erro no polling (tentativa ${attempt + 1}):`, error);
        
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    throw new Error('Timeout: Processamento demorou mais que o esperado');
  },
};

// Serviços de Cards
export const cardsService = {
  // Listar todos os cards
  getAllCards: async () => {
    const response = await api.get('/cards');
    return response.data;
  },

  // Obter card por ID
  getCardById: async (id) => {
    const response = await api.get(`/cards/${id}`);
    return response.data;
  },

  // Criar novo card
  create: async (cardData) => {
    // Primeiro salva no banco local (temporariamente desativado)
    // const response = await api.post('/cards', cardData);
    // Criando uma resposta mock para não quebrar o fluxo
    const response = { data: { id: 'mock-' + Date.now(), ...cardData } };
    
    // Depois tenta criar as ofertas na Fox
    try {
      // Verificar se temos idFoxUser e pelo menos um produto com idFoxAddresses
      const hasRequiredFields = cardData.idFoxUser && 
                               cardData.produtos && 
                               cardData.produtos.some(p => p.idFoxAddresses);
      
      if (hasRequiredFields) {
        console.log('Tentando criar ofertas na Fox...');
        const offerResults = await offerService.processCardOffers(cardData);
        response.data.offerResults = offerResults;
        
        console.log(`Ofertas processadas: ${offerResults.summary.successful} sucesso, ${offerResults.summary.failed} falhas`);
      } else {
        console.warn('Dados insuficientes para criar ofertas na Fox (falta idFoxUser ou idFoxAddresses)');
      }
    } catch (error) {
      console.error('Erro ao processar ofertas na Fox:', error);
      response.data.offerError = error.message;
    }
    
    return response.data;
  },

  // Criar novo card (método alternativo)
  createCard: async (cardData) => {
    const response = await api.post('/cards', cardData);
    return response.data;
  },

  // Atualizar card
  updateCard: async (id, cardData) => {
    const response = await api.put(`/cards/${id}`, cardData);
    return response.data;
  },

  // Deletar card
  deleteCard: async (id) => {
    const response = await api.delete(`/cards/${id}`);
    return response.data;
  },
};

// Serviços de Planilhas
export const spreadsheetService = {
  // Gerar planilha
  generateSpreadsheet: async (cardIds, template = 'standard') => {
    const response = await api.post('/spreadsheet/generate', {
      cardIds,
      template,
    }, {
      responseType: 'blob', // Para download de arquivo
    });
    
    return response.data;
  },

  // Listar templates disponíveis
  getTemplates: async () => {
    const response = await api.get('/spreadsheet/templates');
    return response.data;
  },
};

// Serviços de Ofertas
export const offerService = {
  // Mapear dados do card para o formato da oferta Fox
  mapCardToOffer: (produto, preco, cardData) => {
    // Mapear tipo de grão para o código esperado
    let grainType;
    if (produto.nome.toUpperCase().includes('MILHO')) {
      grainType = 1; // Milho
    } else if (produto.nome.toUpperCase().includes('SOJA')) {
      grainType = 2; // Soja
    } else if (produto.nome.toUpperCase().includes('SORGO')) {
      grainType = 3; // Sorgo
    } else {
      console.warn(`Tipo de grão não reconhecido: ${produto.nome}. Usando valor padrão 1 (Milho)`);
      grainType = 1; // Fallback para Milho para evitar erros
    }
    
    // Calcular quantidade padrão em sacas (pode ser ajustado)
    const amount = preco.quantidade || 2000; 
    
    // Calcular data de expiração com formato ISO completo
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 15);
    const expiresIn = expirationDate.toISOString();
    
    // Determinar se é FOB ou CIF
    const isFob = produto.modalidade?.toUpperCase() === 'FOB';
    
  // Formatar datas para o mesmo padrão (YYYY-MM-DD)
    let deliveryDeadline = preco.embarque || '';
    
    // Formatar data de pagamento igual ao formato do embarque
    let paymentDate = preco.pagamento || '';
    if (paymentDate && paymentDate.includes('T')) {
      paymentDate = paymentDate.split('T')[0]; 
    }
    
    // Calcular diferença em dias entre embarque e pagamento
    let paymentDays = '30'; 
    if (deliveryDeadline && paymentDate) {
      try {
        const embarqueDate = new Date(deliveryDeadline);
        const pagamentoDate = new Date(paymentDate);
        
        if (!isNaN(embarqueDate.getTime()) && !isNaN(pagamentoDate.getTime())) {
          
          const diffTime = pagamentoDate.getTime() - embarqueDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
          if (diffDays >= 0) {
            paymentDays = diffDays.toString();
          }
          
        }
      } catch (error) {
        console.warn(`Erro ao calcular diferença de dias entre ${deliveryDeadline} e ${paymentDate}:`, error);
      }
    }
    
    const userLocation = {
      coords: {
        latitude: -15.7801,
        longitude: -47.9292
      },
      ip: "192.168.1.1"
    };

    return {
      grain: grainType, 
      amount: amount,
      bagPrice: preco.precoBrl,
      isBuying: true,
      address: produto.idFoxAddresses,
      createdBy: cardData.idFoxUser,
      deliveryDeadline: deliveryDeadline || 'spot',
      expiresIn: expiresIn,
      stateRegistration: "12345678901",
      commissionValue: 1.5,
      isGanhaGanha: false,
      isFob: isFob,
      isFobCity: isFob,
      isFobWarehouse: false,
      paymentDeadLine: paymentDays,
      foxFee: 1.0,
      financeTax: 2.0,
      userId: cardData.idFoxUser,
      grainId: produto.idProduto || grainType.toString(),
      simulated: false,
      sign: {
        coords: {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude
        },
        ip: userLocation.ip
      }
    };
  },

  
  createOffer: async (offerData) => {
    const FOX_API_URL = import.meta.env.VITE_FOX_API_URL ;
    
    try {
      const response = await axios.post(`${FOX_API_URL}/api/offers/simpleoffers`, offerData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro ao criar oferta na Fox API:', error.response?.data || error.message);
      throw error;
    }
  },
  
 
  processCardOffers: async (cardData) => {
    if (!cardData.produtos || cardData.produtos.length === 0) {
      throw new Error('Não há produtos no card para criar ofertas');
    }

    
    if (!cardData.idFoxUser) {
      throw new Error('ID de usuário Fox não definido. Configure em Informações de Identificação.');
    }
    
    const results = {
      success: [],
      failed: [],
      summary: {
        total: 0,
        successful: 0,
        failed: 0
      }
    };
    
    // Para cada produto no card
    for (const produto of cardData.produtos) {
      if (!produto.idFoxAddresses) {
        results.failed.push({
          produto: produto.nome,
          error: 'ID Fox Addresses não definido para este produto'
        });
        continue;
      }
      
      // Para cada preço no produto
      for (const preco of produto.precos) {
        try {
          // Pular preços sem valor em BRL (este campo é obrigatório)
          if (!preco.precoBrl) {
            console.warn(`Preço BRL não definido para ${produto.nome} - ${preco.embarque}. Pulando.`);
            continue;
          }
          
          const offerData = offerService.mapCardToOffer(produto, preco, cardData);

          console.log("Dados da oferta:", offerData);

          
          results.summary.total++;
          
          // Validações para campos obrigatórios
          if (!offerData.grain) {
            throw new Error(`Tipo de grão não reconhecido ou ID inválido`);
          }
          
          if (!offerData.amount) {
            throw new Error(`Quantidade (amount) não definida`);
          }
          
          if (!offerData.bagPrice) {
            throw new Error(`Preço da saca (bagPrice) não definido`);
          }
          
          const response = await offerService.createOffer(offerData);
          
          // Verificar se a resposta indica sucesso
          const isSuccess = response && response.status !== 'ERRO';
          
          if (isSuccess) {
            console.log(`✓ Oferta criada com sucesso: ${produto.nome} - ${preco.embarque}`);
            
            results.success.push({
              produto: produto.nome,
              embarque: preco.embarque,
              preco: preco.precoBrl,
              offerId: response.id || response.data?.id || 'N/A',
              response: response
            });
            
            results.summary.successful++;
          } else {
            throw new Error(response?.message || 'Erro desconhecido na criação da oferta');
          }
        } catch (error) {
          console.error(`Erro ao processar oferta para ${produto.nome}:`, error);
          
          results.failed.push({
            produto: produto.nome,
            embarque: preco.embarque,
            preco: preco.precoBrl,
            error: error.message || 'Erro desconhecido'
          });
          
          results.summary.failed++;
        }
      }
    }
    
    console.log(`Resumo do processamento: ${results.summary.successful} ofertas criadas, ${results.summary.failed} falhas`);
    return results;
  }
};

// Utilitários
export const apiUtils = {
  // Polling para verificar status de job
  pollJobStatus: async (jobId, onUpdate, maxAttempts = 30) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const status = await processingService.getJobStatus(jobId);
        
        if (onUpdate) {
          onUpdate(status);
        }

        // Se completou ou falhou, parar o polling
        if (status.status === 'completed' || status.status === 'error' || status.status === 'failed') {

         
          return status;
        }

        // Se ainda está processando, aguardar antes da próxima tentativa
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Erro no polling (tentativa ${attempt + 1}):`, error);
        
        if (onUpdate) {
          onUpdate({ status: 'failed', error: error.message });
        }
        
        // Se é a última tentativa, lançar o erro
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        
        // Aguardar antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    throw new Error('Timeout: Processamento demorou muito para completar');
  },

  // Download de arquivo
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default api;

