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

// Utilitários
export const apiUtils = {
  // Polling para verificar status de job
  pollJobStatus: async (jobId, onUpdate, maxAttempts = 30) => {
    let attempts = 0;
    
    const poll = async () => {
      try {
        const status = await processingService.getJobStatus(jobId);
        
        if (onUpdate) {
          onUpdate(status);
        }

        // Se completou ou falhou, parar o polling
        if (status.status === 'completed' || status.status === 'failed') {
          return status;
        }

        // Se ainda está processando e não excedeu tentativas, continuar
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000); // Verificar a cada 2 segundos
        } else {
          throw new Error('Timeout: Processamento demorou muito para completar');
        }
      } catch (error) {
        if (onUpdate) {
          onUpdate({ status: 'failed', error: error.message });
        }
        throw error;
      }
    };

    return poll();
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

