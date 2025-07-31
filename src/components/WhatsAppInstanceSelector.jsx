import React, { useState } from 'react';
import { useWhatsAppInstance } from '../contexts/WhatsAppInstanceContext';
import { ChevronDown, Check, Loader2, Phone, Building2 } from 'lucide-react';

const WhatsAppInstanceSelector = ({ className = '' }) => {
  const {
    currentInstance,
    instances,
    changeInstance,
    isChangingInstance
  } = useWhatsAppInstance();

  const [isOpen, setIsOpen] = useState(false);

  const handleInstanceChange = async (instanceId) => {
    if (instanceId === currentInstance.id || isChangingInstance) return;

    try {
      await changeInstance(instanceId);
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao mudar instância:', error);
      // Aqui você pode adicionar uma notificação de erro
    }
  };

  const getInstanceIcon = (instance) => {
    switch (instance.id) {
      case 'logistics':
        return <Building2 className="w-4 h-4" />;
      case 'commercial':
        return <Phone className="w-4 h-4" />;
      default:
        return <span className="text-sm">{instance.icon}</span>;
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      {/* Botão principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChangingInstance}
        className={`
          inline-flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium
          bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          transition-all duration-200 min-w-[200px]
          ${isChangingInstance ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-center space-x-3">
          {/* Ícone da instância */}
          <div 
            className="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: currentInstance.color }}
          >
            {getInstanceIcon(currentInstance)}
          </div>
          
          {/* Informações da instância */}
          <div className="flex flex-col items-start">
            <span className="text-gray-900 font-medium">
              {currentInstance.name}
            </span>
            <span className="text-xs text-gray-500">
              ID: {currentInstance.phoneId}
            </span>
          </div>
        </div>

        {/* Indicador de carregamento ou seta */}
        <div className="flex items-center ml-2">
          {isChangingInstance ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : (
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`} 
            />
          )}
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu dropdown */}
          <div className="absolute right-0 z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="py-1">
              {instances.map((instance) => (
                <button
                  key={instance.id}
                  onClick={() => handleInstanceChange(instance.id)}
                  disabled={isChangingInstance}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50
                    focus:outline-none transition-colors duration-150
                    ${instance.id === currentInstance.id ? 'bg-blue-50' : ''}
                    ${isChangingInstance ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Ícone da instância */}
                      <div 
                        className="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-medium"
                        style={{ backgroundColor: instance.color }}
                      >
                        {getInstanceIcon(instance)}
                      </div>
                      
                      {/* Informações da instância */}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {instance.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {instance.description}
                        </span>
                        <span className="text-xs text-gray-400">
                          ID: {instance.phoneId}
                        </span>
                      </div>
                    </div>

                    {/* Indicador de seleção */}
                    {instance.id === currentInstance.id && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Rodapé do dropdown */}
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                Selecione a instância do WhatsApp para usar
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Componente compacto para uso em headers
export const CompactWhatsAppInstanceSelector = ({ className = '' }) => {
  const {
    currentInstance,
    instances,
    changeInstance,
    isChangingInstance
  } = useWhatsAppInstance();

  const [isOpen, setIsOpen] = useState(false);

  const handleInstanceChange = async (instanceId) => {
    if (instanceId === currentInstance.id || isChangingInstance) return;

    try {
      await changeInstance(instanceId);
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao mudar instância:', error);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      {/* Botão compacto */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChangingInstance}
        className={`
          inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700
          bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          transition-all duration-200
          ${isChangingInstance ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {/* Indicador colorido */}
        <div 
          className="w-2 h-2 rounded-full mr-2"
          style={{ backgroundColor: currentInstance.color }}
        />
        
        <span className="mr-1">{currentInstance.name}</span>
        
        {isChangingInstance ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {/* Dropdown compacto */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 z-20 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="py-1">
              {instances.map((instance) => (
                <button
                  key={instance.id}
                  onClick={() => handleInstanceChange(instance.id)}
                  disabled={isChangingInstance}
                  className={`
                    w-full px-3 py-2 text-left text-sm hover:bg-gray-50
                    focus:bg-gray-50 focus:outline-none flex items-center justify-between
                    ${instance.id === currentInstance.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                    ${isChangingInstance ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: instance.color }}
                    />
                    <span>{instance.name}</span>
                  </div>
                  
                  {instance.id === currentInstance.id && (
                    <Check className="w-3 h-3" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Componente de status da instância atual
export const WhatsAppInstanceStatus = ({ className = '' }) => {
  const { currentInstance, isChangingInstance } = useWhatsAppInstance();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Indicador de status */}
      <div className="flex items-center space-x-2">
        <div 
          className={`w-2 h-2 rounded-full ${
            isChangingInstance ? 'animate-pulse bg-yellow-400' : 'bg-green-400'
          }`}
        />
        <span className="text-sm text-gray-600">
          {isChangingInstance ? 'Alterando...' : currentInstance.name}
        </span>
      </div>
      
      {/* ID da instância */}
      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
        {currentInstance.phoneId}
      </span>
    </div>
  );
};

export default WhatsAppInstanceSelector;

