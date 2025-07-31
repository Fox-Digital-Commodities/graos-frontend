import React, { createContext, useContext, useState, useEffect } from 'react';

// Definir as instâncias disponíveis
const WHATSAPP_INSTANCES = [
  {
    id: 'logistics',
    phoneId: '42102',
    name: 'Logística',
    description: 'WhatsApp da equipe de logística',
    color: '#10B981', // Verde
    icon: '📦'
  },
  {
    id: 'commercial',
    phoneId: '23183',
    name: 'Comercial',
    description: 'WhatsApp da equipe comercial',
    color: '#3B82F6', // Azul
    icon: '💼'
  }
];

// Criar o contexto
const WhatsAppInstanceContext = createContext();

// Hook personalizado para usar o contexto
export const useWhatsAppInstance = () => {
  const context = useContext(WhatsAppInstanceContext);
  if (!context) {
    throw new Error('useWhatsAppInstance deve ser usado dentro de WhatsAppInstanceProvider');
  }
  return context;
};

// Provider do contexto
export const WhatsAppInstanceProvider = ({ children }) => {
  // Estado para a instância atual (padrão: logística)
  const [currentInstance, setCurrentInstance] = useState(() => {
    // Tentar recuperar da localStorage
    const saved = localStorage.getItem('whatsapp-current-instance');
    if (saved) {
      try {
        const parsedInstance = JSON.parse(saved);
        // Verificar se a instância salva ainda existe
        const exists = WHATSAPP_INSTANCES.find(instance => instance.id === parsedInstance.id);
        if (exists) {
          return parsedInstance;
        }
      } catch (error) {
        console.warn('Erro ao recuperar instância salva:', error);
      }
    }
    // Padrão: logística
    return WHATSAPP_INSTANCES[0];
  });

  // Estado para controlar se está mudando de instância
  const [isChangingInstance, setIsChangingInstance] = useState(false);

  // Salvar no localStorage quando a instância mudar
  useEffect(() => {
    localStorage.setItem('whatsapp-current-instance', JSON.stringify(currentInstance));
  }, [currentInstance]);

  // Função para mudar de instância
  const changeInstance = async (instanceId) => {
    const newInstance = WHATSAPP_INSTANCES.find(instance => instance.id === instanceId);
    if (!newInstance) {
      throw new Error(`Instância ${instanceId} não encontrada`);
    }

    if (newInstance.id === currentInstance.id) {
      return; // Já é a instância atual
    }

    setIsChangingInstance(true);
    
    try {
      // Simular delay para mudança de instância (pode ser usado para chamadas de API)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentInstance(newInstance);
      
      // Disparar evento personalizado para notificar outros componentes
      window.dispatchEvent(new CustomEvent('whatsapp-instance-changed', {
        detail: { 
          previousInstance: currentInstance,
          newInstance: newInstance 
        }
      }));
      
      console.log(`Instância alterada para: ${newInstance.name} (${newInstance.phoneId})`);
    } catch (error) {
      console.error('Erro ao mudar instância:', error);
      throw error;
    } finally {
      setIsChangingInstance(false);
    }
  };

  // Função para obter instância por ID
  const getInstanceById = (instanceId) => {
    return WHATSAPP_INSTANCES.find(instance => instance.id === instanceId);
  };

  // Função para obter instância por phone_id
  const getInstanceByPhoneId = (phoneId) => {
    return WHATSAPP_INSTANCES.find(instance => instance.phoneId === phoneId);
  };

  // Função para obter URL da API baseada na instância atual
  const getApiUrl = (endpoint = '', includePhoneId = true) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const phoneId = currentInstance.phoneId;
    
    if (includePhoneId && !endpoint.startsWith('/chatgpt/')) {
      return `${baseUrl}/api/whatsapp/${phoneId}${endpoint}`;
    } else {
      return `${baseUrl}/api${endpoint}`;
    }
  };

  // Função para fazer requisições com a instância atual
  const fetchWithInstance = async (endpoint, options = {}) => {
    const url = getApiUrl(endpoint);
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-WhatsApp-Instance': currentInstance.phoneId,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error(`Erro na requisição para instância ${currentInstance.name}:`, error);
      throw error;
    }
  };

  // Valor do contexto
  const contextValue = {
    // Estado atual
    currentInstance,
    isChangingInstance,
    
    // Lista de instâncias
    instances: WHATSAPP_INSTANCES,
    
    // Funções
    changeInstance,
    getInstanceById,
    getInstanceByPhoneId,
    getApiUrl,
    fetchWithInstance,
    
    // Propriedades de conveniência
    currentPhoneId: currentInstance.phoneId,
    currentInstanceName: currentInstance.name,
    currentInstanceColor: currentInstance.color,
    currentInstanceIcon: currentInstance.icon,
    
    // Verificações
    isLogistics: currentInstance.id === 'logistics',
    isCommercial: currentInstance.id === 'commercial'
  };

  return (
    <WhatsAppInstanceContext.Provider value={contextValue}>
      {children}
    </WhatsAppInstanceContext.Provider>
  );
};

// Exportar instâncias para uso direto se necessário
export { WHATSAPP_INSTANCES };

export default WhatsAppInstanceContext;

