import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Loader2, Lightbulb, Copy, Send, RefreshCw, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const ResponseSuggestions = ({ 
  messages = [], 
  onSelectSuggestion, 
  contactInfo = null,
  businessContext = "empresa de logística e transporte de grãos"
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationAnalysis, setConversationAnalysis] = useState(null);

  // Gerar sugestões automaticamente quando há mensagens novas
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Só gera sugestões se a última mensagem não for nossa
      if (!lastMessage.fromMe) {
        generateSuggestions();
      }
    }
  }, [messages]);

  const generateSuggestions = async () => {
    if (messages.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Preparar dados das mensagens para a API
      const formattedMessages = messages.slice(-10).map(msg => ({
        text: msg.message || msg.text || '',
        type: msg.type === 'Áudio' ? 'audio' : 
              msg.type === 'Imagem' ? 'image' : 
              msg.type === 'Documento' ? 'document' : 'text',
        fromMe: msg.fromMe,
        timestamp: msg.timestamp
      }));

      const payload = {
        messages: formattedMessages,
        businessContext,
        tone: 'profissional',
        suggestionCount: 3,
        contactInfo
      };

      console.log('Enviando para ChatGPT:', payload);

       const baseUrl = import.meta.env.VITE_API_URL;


      const response = await fetch(`${baseUrl}/chatgpt/suggest-response`, {
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
      console.log('Resposta do ChatGPT:', data);

      setSuggestions(data.suggestions || []);
      setConversationAnalysis(data.context);

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
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySuggestion = (suggestion) => {
    navigator.clipboard.writeText(suggestion.text);
    // Feedback visual poderia ser adicionado aqui
  };

  const handleUseSuggestion = (suggestion) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion.text);
    }
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

  if (messages.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center text-gray-500">
          <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Inicie uma conversa para receber sugestões de resposta</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Sugestões de Resposta
          </CardTitle>
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
            {loading ? 'Gerando...' : 'Atualizar'}
          </Button>
        </div>
        
        {conversationAnalysis && (
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              Tópico: {conversationAnalysis.conversationTopic}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Tipo: {conversationAnalysis.messageType}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="ml-2 text-sm text-gray-600">
              Gerando sugestões inteligentes...
            </span>
          </div>
        )}

        {!loading && suggestions.length === 0 && !error && (
          <div className="text-center py-6 text-gray-500">
            <Lightbulb className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma sugestão disponível</p>
          </div>
        )}

        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge className={getToneColor(suggestion.tone)}>
                  {suggestion.tone}
                </Badge>
                <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                  {Math.round(suggestion.confidence * 100)}% confiança
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">
              {suggestion.text}
            </p>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopySuggestion(suggestion)}
                className="flex items-center gap-1 text-xs"
              >
                <Copy className="w-3 h-3" />
                Copiar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleUseSuggestion(suggestion)}
                className="flex items-center gap-1 text-xs bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-3 h-3" />
                Usar
              </Button>
            </div>
          </div>
        ))}

        {suggestions.length > 0 && (
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              💡 Sugestões geradas por IA • Revise antes de enviar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResponseSuggestions;

