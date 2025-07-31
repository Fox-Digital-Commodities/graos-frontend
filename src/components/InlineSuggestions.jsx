import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Copy, 
  Send, 
  RefreshCw, 
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useWhatsAppInstance } from '../contexts/WhatsAppInstanceContext';

const InlineSuggestions = ({ 
  selectedMessage, 
  messages, 
  conversationId,
  contactInfo,
  businessContext,
  onSelectSuggestion,
  onClose,
  className = ''
}) => {
  const { fetchWithInstance } = useWhatsAppInstance();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedMessage) {
      generateSuggestions();
    }
  }, [selectedMessage]);

  const generateSuggestions = async () => {
    if (!selectedMessage) return;

    setLoading(true);
    setError(null);

    try {
      // Preparar contexto da conversa (últimas 10 mensagens)
      const recentMessages = messages
        .slice(-10)
        .map(msg => ({
          text: msg.message || msg.text || '',
          fromMe: msg.fromMe,
          timestamp: msg.timestamp
        }));

      const requestData = {
        conversationId: conversationId,
        selectedMessage: {
          text: selectedMessage.message || selectedMessage.text || '',
          timestamp: selectedMessage.timestamp
        },
        conversationHistory: recentMessages,
        contactInfo: {
          name: contactInfo?.name || 'Contato',
          company: contactInfo?.company,
          relationship: contactInfo?.relationship || 'cliente'
        },
        businessContext: businessContext || 'empresa de logística e transporte de grãos'
      };

      const response = await fetchWithInstance('/chatgpt/generate-suggestion', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar sugestões');
      }

      const data = await response.json();
      
      if (data.success && data.suggestions) {
        setSuggestions(data.suggestions);
      } else {
        throw new Error(data.message || 'Erro ao processar sugestões');
      }

    } catch (err) {
      console.error('Erro ao gerar sugestões:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUseSuggestion = (suggestion) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleCopySuggestion = async (suggestion) => {
    try {
      await navigator.clipboard.writeText(suggestion);
      // Você pode adicionar um toast aqui se quiser
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  if (!selectedMessage) return null;

  return (
    <Card className={`${className} border-blue-200 bg-blue-50`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Sugestões de Resposta
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={generateSuggestions}
              disabled={loading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Mensagem selecionada */}
        <div className="mb-3 p-2 bg-white rounded border-l-4 border-blue-400">
          <p className="text-xs text-gray-600 mb-1">Respondendo a:</p>
          <p className="text-sm text-gray-800">
            {selectedMessage.message || selectedMessage.text || 'Mensagem sem texto'}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm text-gray-600">Gerando sugestões...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded mb-3">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Sugestões */}
        {!loading && !error && suggestions.length > 0 && (
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 bg-white rounded border hover:border-blue-300 transition-colors"
              >
                <p className="text-sm text-gray-800 mb-2">{suggestion}</p>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopySuggestion(suggestion)}
                    className="h-7 px-2 text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUseSuggestion(suggestion)}
                    className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Usar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nenhuma sugestão */}
        {!loading && !error && suggestions.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">
              Clique em "Gerar" para obter sugestões de resposta
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InlineSuggestions;

