import React, { useState, useEffect } from 'react';
import Modal from './ui/modal';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Loader2, 
  Sparkles, 
  Copy, 
  Send, 
  RefreshCw, 
  MessageSquare,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const SuggestionsModal = ({ 
  isOpen, 
  onClose, 
  messages = [], 
  selectedMessage = null,
  onSelectSuggestion, 
  contactInfo = null,
  businessContext = "empresa de logística e transporte de grãos"
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationAnalysis, setConversationAnalysis] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  // Novos estados para API híbrida
  const [apiInfo, setApiInfo] = useState({
    model: null,
    assistantId: null,
    tokensUsed: 0,
    apiVersion: null,
    generatedAt: null,
    transcriptionsProcessed: 0
  });

  // Gerar sugestões quando o modal abrir
  useEffect(() => {
    if (isOpen && selectedMessage) {
      generateSuggestions();
    }
  }, [isOpen, selectedMessage]);

  // Limpar estados quando modal fechar
  useEffect(() => {
    if (!isOpen) {
      setSuggestions([]);
      setError(null);
      setConversationAnalysis(null);
      setCopiedIndex(null);
      setApiInfo({
        model: null,
        assistantId: null,
        tokensUsed: 0,
        apiVersion: null,
        generatedAt: null,
        transcriptionsProcessed: 0
      });
    }
  }, [isOpen]);

  // Função para estimar duração do áudio se não estiver disponível
  const estimateAudioDuration = (message) => {
    // Se temos informações de duração, usar
    if (message.duration) return message.duration;
    
    // Estimativa baseada no tamanho do texto (se for transcrição)
    const text = message.message || message.text || '';
    if (text && text.length > 10) {
      // Aproximadamente 150 palavras por minuto = 2.5 palavras por segundo
      const words = text.split(' ').length;
      return Math.max(5, Math.min(30, words / 2.5)); // Entre 5 e 30 segundos
    }
    
    // Valor padrão para áudios curtos
    return 15; // 15 segundos como estimativa padrão
  };

  const generateSuggestions = async () => {
    if (!selectedMessage || messages.length === 0) return;

    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      // Encontrar o índice da mensagem selecionada
      const selectedIndex = messages.findIndex(msg => msg.id === selectedMessage.id);
      
      // Pegar mensagens até o ponto selecionado (contexto)
      const contextMessages = messages.slice(0, selectedIndex + 1);
      
      // Preparar dados das mensagens para a API
      const formattedMessages = contextMessages.slice(-10).map(msg => ({
        text: msg.message || msg.text || '',
        type: msg.type === 'Áudio' ? 'audio' : 
              msg.type === 'ptt' ? 'ptt' :
              msg.type === 'voice' ? 'voice' :
              msg.type === 'Imagem' ? 'image' : 
              msg.type === 'Documento' ? 'document' : 'text',
        fromMe: msg.fromMe,
        role: msg.fromMe ? 'assistant' : 'user', // fromMe:true = assistant, fromMe:false = user
        timestamp: msg.timestamp,
        // Adicionar informações específicas de áudio
        duration: msg.duration || (msg.type === 'Áudio' || msg.type === 'ptt' || msg.type === 'voice' ? 
          estimateAudioDuration(msg) : undefined),
        mediaUrl: msg.mediaUrl || msg.url || msg.media,
        id: msg.id || msg._id
      }));

      const payload = {
        messages: formattedMessages,
        businessContext,
        tone: 'profissional',
        suggestionCount: 3,
        contactInfo,
        selectedMessage: {
          text: selectedMessage.message || selectedMessage.text || '',
          type: selectedMessage.type === 'Áudio' ? 'audio' : 
                selectedMessage.type === 'ptt' ? 'ptt' :
                selectedMessage.type === 'voice' ? 'voice' :
                selectedMessage.type,
          fromMe: selectedMessage.fromMe,
          role: selectedMessage.fromMe ? 'assistant' : 'user',
          duration: selectedMessage.duration || (selectedMessage.type === 'Áudio' || selectedMessage.type === 'ptt' || selectedMessage.type === 'voice' ? 
            estimateAudioDuration(selectedMessage) : undefined),
          mediaUrl: selectedMessage.mediaUrl || selectedMessage.url || selectedMessage.media,
          id: selectedMessage.id || selectedMessage._id
        }
      };

      console.log('Enviando para ChatGPT (modal):', payload);

      const response = await fetch('http://localhost:3001/api/chatgpt/suggest-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Resposta do ChatGPT (modal):', data);

      setSuggestions(data.suggestions || []);
      setConversationAnalysis(data.context);
      
      // Capturar informações da API híbrida
      setApiInfo({
        model: data.model || null,
        assistantId: data.assistantId || null,
        tokensUsed: data.tokensUsed || 0,
        apiVersion: data.apiVersion || null,
        generatedAt: data.generatedAt || null,
        transcriptionsProcessed: data.transcriptionsProcessed || 0
      });

    } catch (err) {
      console.error('Erro ao gerar sugestões:', err);
      setError(`Erro ao gerar sugestões: ${err.message}`);
      
      // Fallback com sugestões básicas
      setSuggestions([
        {
          text: "Obrigado pela mensagem. Vou verificar e retorno em breve.",
          tone: "profissional",
          confidence: 0.7
        },
        {
          text: "Entendi. Deixe-me analisar sua solicitação e te dou um retorno.",
          tone: "profissional", 
          confidence: 0.7
        },
        {
          text: "Recebi sua mensagem. Vou processar as informações e responder logo.",
          tone: "profissional",
          confidence: 0.7
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySuggestion = async (suggestion, index) => {
    try {
      await navigator.clipboard.writeText(suggestion.text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const handleUseSuggestion = (suggestion) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion.text);
    }
    onClose();
  };

  const getToneColor = (tone) => {
    switch (tone) {
      case 'formal': return 'bg-blue-100 text-blue-800';
      case 'informal': return 'bg-green-100 text-green-800';
      case 'profissional': return 'bg-purple-100 text-purple-800';
      case 'amigável': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Sugestões de Resposta
        </div>
      }
      size="lg"
      className="max-w-3xl"
    >
      <div className="p-6">
        {/* Mensagem selecionada */}
        {selectedMessage && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Respondendo à mensagem:
              </span>
            </div>
            <p className="text-gray-800 italic">
              "{selectedMessage.message || selectedMessage.text || 'Mensagem de mídia'}"
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {selectedMessage.type || 'Texto'}
              </Badge>
              <span className="text-xs text-gray-500">
                {new Date(selectedMessage.timestamp * 1000).toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}

        {/* Análise da conversa */}
        {conversationAnalysis && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Análise da Conversa</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs bg-white">
                Tópico: {conversationAnalysis.conversationTopic}
              </Badge>
              <Badge variant="outline" className="text-xs bg-white">
                Sentimento: {conversationAnalysis.sentiment}
              </Badge>
              <Badge variant="outline" className="text-xs bg-white">
                Urgência: {conversationAnalysis.urgency}
              </Badge>
            </div>
          </div>
        )}

        {/* Informações da API Híbrida */}
        {apiInfo.model && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Informações da Geração
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs bg-white border-green-300">
                Modelo: {apiInfo.model}
              </Badge>
              <Badge variant="outline" className="text-xs bg-white border-green-300">
                API: {apiInfo.apiVersion}
              </Badge>
              <Badge variant="outline" className="text-xs bg-white border-green-300">
                Tokens: {apiInfo.tokensUsed}
              </Badge>
              {apiInfo.assistantId && (
                <Badge variant="outline" className="text-xs bg-white border-green-300">
                  Assistente: {apiInfo.assistantId.slice(-8)}
                </Badge>
              )}
              {apiInfo.generatedAt && (
                <Badge variant="outline" className="text-xs bg-white border-green-300">
                  {new Date(apiInfo.generatedAt).toLocaleTimeString()}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Informações sobre Transcrições */}
        {apiInfo.transcriptionsProcessed > 0 && (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Transcrições Processadas
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs bg-white border-purple-300">
                Áudios transcritos: {apiInfo.transcriptionsProcessed}
              </Badge>
              <Badge variant="outline" className="text-xs bg-white border-purple-300">
                Whisper API
              </Badge>
              <Badge variant="outline" className="text-xs bg-white border-purple-300">
                Português BR
              </Badge>
            </div>
            <p className="text-xs text-purple-700 mt-2">
              Áudios menores que 30 segundos foram automaticamente transcritos para melhorar a qualidade das sugestões.
            </p>
          </div>
        )}

        {/* Controles */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Sugestões Personalizadas
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={generateSuggestions}
            disabled={loading}
            className="flex items-center gap-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {loading ? 'Gerando...' : 'Regenerar'}
          </Button>
        </div>

        {/* Erro */}
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
              <p className="text-gray-600">Gerando sugestões inteligentes...</p>
              <p className="text-sm text-gray-500 mt-1">
                Analisando contexto da conversa
              </p>
            </div>
          </div>
        )}

        {/* Sugestões */}
        {!loading && suggestions.length > 0 && (
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getToneColor(suggestion.tone)}>
                      {suggestion.tone}
                    </Badge>
                    <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                      {Math.round(suggestion.confidence * 100)}% confiança
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    #{index + 1}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {suggestion.text}
                </p>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopySuggestion(suggestion, index)}
                    className="flex items-center gap-1 text-xs"
                  >
                    {copiedIndex === index ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copiar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleUseSuggestion(suggestion)}
                    className="flex items-center gap-1 text-xs bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="w-3 h-3" />
                    Usar Resposta
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado vazio */}
        {!loading && suggestions.length === 0 && !error && (
          <div className="text-center py-12 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhuma sugestão disponível</p>
            <p className="text-sm">
              Clique em "Regenerar" para tentar novamente
            </p>
          </div>
        )}

        {/* Footer */}
        {suggestions.length > 0 && (
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-xs text-gray-500">
              Sugestões geradas por IA • Revise antes de enviar
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SuggestionsModal;

