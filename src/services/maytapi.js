import axios from 'axios';

// Configuração da API Maytapi
const MAYTAPI_BASE_URL = 'https://api.maytapi.com/api';
const PHONE_ID = '721eb82f-5e86-40df-9be0-f2aecdb42df8';
const PRODUCT_ID = '42102';
const API_KEY = '18a8d224-90e4-4ee2-bb91-5811f9228359';

const maytapiClient = axios.create({
  baseURL: `${MAYTAPI_BASE_URL}/${PHONE_ID}/${PRODUCT_ID}`,
  timeout: 30000,
  headers: {
    'x-maytapi-key': API_KEY,
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
maytapiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Maytapi API Error:', error);
    
    if (error.response) {
      const message = error.response.data?.message || 'Erro na API do Maytapi';
      throw new Error(`${error.response.status}: ${message}`);
    } else if (error.request) {
      throw new Error('Erro de conexão com a API do Maytapi');
    } else {
      throw new Error('Erro na configuração da requisição');
    }
  }
);

// Serviços do Maytapi
export const maytapiService = {
  // Listar conversas
  getConversations: async (page = 0, count = 20) => {
    try {
      const response = await maytapiClient.get('/getConversations', {
        params: { page, count }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      throw error;
    }
  },

  // Obter mensagens de uma conversa específica
  getMessages: async (chatId, page = 0, count = 50) => {
    try {
      const response = await maytapiClient.get(`/getConversations/${encodeURIComponent(chatId)}`, {
        params: { page, count }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw error;
    }
  },

  // Alias para getMessages (compatibilidade)
  getConversationMessages: async (chatId, page = 0, count = 50) => {
    return maytapiService.getMessages(chatId, page, count);
  },

  // Enviar mensagem
  sendMessage: async (chatId, message, type = 'text') => {
    try {
      const payload = {
        to_number: chatId,
        type: type,
        message: message
      };
      
      const response = await maytapiClient.post('/sendMessage', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  },

  // Obter informações do contato
  getContact: async (chatId) => {
    try {
      const response = await maytapiClient.get(`/getContact/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar contato:', error);
      throw error;
    }
  },

  // Obter status da conta
  getAccountStatus: async () => {
    try {
      const response = await maytapiClient.get('/status');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar status da conta:', error);
      throw error;
    }
  },

  // Marcar mensagem como lida
  markAsRead: async (chatId, messageId) => {
    try {
      const response = await maytapiClient.post('/markAsRead', {
        chat_id: chatId,
        message_id: messageId
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      throw error;
    }
  }
};

// Utilitários para formatação
export const maytapiUtils = {
  // Formatar número de telefone
  formatPhoneNumber: (number) => {
    if (!number) return '';
    
    // Remove caracteres especiais
    const cleaned = number.replace(/\D/g, '');
    
    // Adiciona @c.us se não tiver
    if (!number.includes('@')) {
      return `${cleaned}@c.us`;
    }
    
    return number;
  },

  // Formatar data da mensagem
  formatMessageDate: (timestamp) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) { // 7 dias
      return date.toLocaleDateString('pt-BR', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    }
  },

  // Extrair nome do contato
  getContactName: (contact) => {
    if (contact.name) return contact.name;
    if (contact.pushname) return contact.pushname;
    if (contact.notify) return contact.notify;
    
    // Extrair número do ID e formatar para exibição
    const number = contact.id?.replace('@c.us', '') || '';
    if (number.length >= 10) {
      // Formato brasileiro: +55 (11) 99999-9999
      if (number.startsWith('55') && number.length === 13) {
        return `+55 (${number.slice(2, 4)}) ${number.slice(4, 9)}-${number.slice(9)}`;
      }
      // Formato genérico para outros países
      return `+${number.slice(0, 2)} ${number.slice(2, 4)} ${number.slice(4, 9)}-${number.slice(9)}`;
    }
    
    return number || 'Contato';
  },

  // Verificar se é grupo
  isGroup: (chatId) => {
    return chatId.includes('@g.us');
  },

  // Obter avatar padrão
  getDefaultAvatar: (contact) => {
    const name = maytapiUtils.getContactName(contact);
    return name.charAt(0).toUpperCase();
  },

  // Truncar mensagem para preview
  truncateMessage: (message, maxLength = 50) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  },

  // Verificar tipo de mensagem
  getMessageType: (message) => message.type || 'Texto'
};

export default maytapiService;

