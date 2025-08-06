import axios from 'axios';

// Configuração base da API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação (se necessário)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de Sincronização
export const syncService = {
  // Sincronizar contatos do Maytapi
  syncContacts: async (instanceId, options = {}) => {
    const response = await api.post('/api/crm/sync/contacts', {
      instanceId,
      forceSync: options.forceSync || false,
      limit: options.limit || 100,
    });
    return response.data;
  },

  // Criar board de logística
  createLogisticsBoard: async (instanceId) => {
    const response = await api.post(`/api/crm/sync/boards/logistics/${instanceId}`);
    return response.data;
  },

  // Criar board comercial
  createCommercialBoard: async (instanceId) => {
    const response = await api.post(`/api/crm/sync/boards/commercial/${instanceId}`);
    return response.data;
  },

  // Criar board personalizado
  createCustomBoard: async (boardData) => {
    const response = await api.post('/api/crm/sync/boards/from-conversations', boardData);
    return response.data;
  },

  // Obter status da sincronização
  getSyncStatus: async (instanceId) => {
    const response = await api.get(`/api/crm/sync/status/${instanceId}`);
    return response.data;
  },
};

// Serviços do Kanban
export const kanbanService = {
  // Boards
  getBoards: async (instanceId) => {
    const params = instanceId ? { instanceId } : {};
    const response = await api.get('/api/crm/kanban/boards', { params });
    return response.data;
  },

  getBoardById: async (boardId) => {
    const response = await api.get(`/api/crm/kanban/boards/${boardId}`);
    return response.data;
  },

  createBoard: async (boardData) => {
    const response = await api.post('/api/crm/kanban/boards', boardData);
    return response.data;
  },

  updateBoard: async (boardId, boardData) => {
    const response = await api.put(`/api/crm/kanban/boards/${boardId}`, boardData);
    return response.data;
  },

  deleteBoard: async (boardId) => {
    const response = await api.delete(`/api/crm/kanban/boards/${boardId}`);
    return response.data;
  },

  getBoardStats: async (boardId) => {
    const response = await api.get(`/api/crm/kanban/boards/${boardId}/stats`);
    return response.data;
  },

  // Columns
  createColumn: async (columnData) => {
    const response = await api.post('/api/crm/kanban/columns', columnData);
    return response.data;
  },

  updateColumn: async (columnId, columnData) => {
    const response = await api.put(`/api/crm/kanban/columns/${columnId}`, columnData);
    return response.data;
  },

  deleteColumn: async (columnId) => {
    const response = await api.delete(`/api/crm/kanban/columns/${columnId}`);
    return response.data;
  },

  // Cards
  getCardById: async (cardId) => {
    const response = await api.get(`/api/crm/kanban/cards/${cardId}`);
    return response.data;
  },

  createCard: async (cardData) => {
    const response = await api.post('/api/crm/kanban/cards', cardData);
    return response.data;
  },

  updateCard: async (cardId, cardData) => {
    const response = await api.put(`/api/crm/kanban/cards/${cardId}`, cardData);
    return response.data;
  },

  moveCard: async (cardId, columnId, position) => {
    const response = await api.put(`/api/crm/kanban/cards/${cardId}/move`, {
      columnId,
      position,
    });
    return response.data;
  },

  deleteCard: async (cardId) => {
    const response = await api.delete(`/api/crm/kanban/cards/${cardId}`);
    return response.data;
  },

  // Activities
  getCardActivities: async (cardId) => {
    const response = await api.get(`/api/crm/kanban/cards/${cardId}/activities`);
    return response.data;
  },

  createCardActivity: async (cardId, activityData) => {
    const response = await api.post(`/api/crm/kanban/cards/${cardId}/activities`, activityData);
    return response.data;
  },
};

// Serviços de WhatsApp (existentes)
export const whatsappService = {
  getInstances: async () => {
    const response = await api.get('/api/whatsapp/instances');
    return response.data;
  },

  getConversations: async (instanceId) => {
    const response = await api.get(`/api/whatsapp/conversations/${instanceId}`);
    return response.data;
  },

  getMessages: async (conversationId) => {
    const response = await api.get(`/api/whatsapp/messages/${conversationId}`);
    return response.data;
  },

  sendMessage: async (instanceId, messageData) => {
    const response = await api.post(`/api/whatsapp/send/${instanceId}`, messageData);
    return response.data;
  },
};

// Serviços de ChatGPT (existentes)
export const chatgptService = {
  generateSuggestion: async (instanceId, messageData) => {
    const response = await api.post('/api/chatgpt/suggest-response', {
      instanceId,
      ...messageData,
    });
    return response.data;
  },
};

// Utilitários
export const apiUtils = {
  // Verificar se a API está online
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },

  // Fazer upload de arquivo
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/upload', formData, {
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
    });

    return response.data;
  },

  // Fazer download de arquivo
  downloadFile: async (url, filename) => {
    const response = await api.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};

export default api;

