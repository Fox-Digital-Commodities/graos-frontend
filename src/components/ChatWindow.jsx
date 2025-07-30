import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  ArrowLeft,
  Loader2,
  CheckCheck,
  Check,
  Clock,
  Download,
  Play,
  Image as ImageIcon,
  FileText,
  MapPin,
  AlertCircle,
  MessageCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { maytapiService, maytapiUtils } from '../services/maytapi';
import AudioPlayer from './AudioPlayer';
import ImageViewer from './ImageViewer';

const ChatWindow = ({ conversation, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Dados de teste para mensagens
  const getMockMessages = (chatId) => [
    {
      id: 'msg1',
      message: 'Olá! Como está o preço da soja hoje?',
      timestamp: Math.floor(Date.now() / 1000) - 3600,
      fromMe: false,
      type: 'text',
      ack: 2
    },
    {
      id: 'msg2',
      message: 'Bom dia! O preço da soja está em R$ 122,50/sc para setembro.',
      timestamp: Math.floor(Date.now() / 1000) - 3500,
      fromMe: true,
      type: 'text',
      ack: 3
    },
    {
      id: 'msg3',
      message: 'E o milho?',
      timestamp: Math.floor(Date.now() / 1000) - 3400,
      fromMe: false,
      type: 'text',
      ack: 2
    },
    {
      id: 'msg4',
      message: 'Milho está R$ 47,12/sc para outubro.',
      timestamp: Math.floor(Date.now() / 1000) - 3300,
      fromMe: true,
      type: 'text',
      ack: 3
    },
    {
      id: 'msg5',
      message: 'Perfeito! Obrigado pelas informações.',
      timestamp: Math.floor(Date.now() / 1000) - 3200,
      fromMe: false,
      type: 'text',
      ack: 2
    },
    {
      id: 'msg6',
      caption: '',
      filename: 'audio_message.oga',
      mime: 'audio/ogg; codecs=opus',
      type: 'ptt',
      url: 'https://cdnydm.com/wh/GPI-ZR2xwQvCRH__1QYpuQ.oga',
      timestamp: Math.floor(Date.now() / 1000) - 3100,
      fromMe: true,
      ack: 3
    },
    {
      id: 'msg7',
      caption: 'Foto do produto',
      filename: 'produto.jpg',
      mime: 'image/jpeg',
      type: 'image',
      mediaUrl: 'https://picsum.photos/300/200',
      timestamp: Math.floor(Date.now() / 1000) - 3000,
      fromMe: false,
      ack: 2
    }
  ];

  // Carregar mensagens da conversa
  const loadMessages = async () => {
    if (!conversation) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await maytapiService.getConversationMessages(conversation.id);
      
      if (response.success && response.data?.messages) {
        const transformedMessages = response.data.messages.map(msg => ({
          id: msg.message?.id || `msg_${Date.now()}_${Math.random()}`,
          message: msg.message?.text || '',
          timestamp: msg.timestamp,
          fromMe: msg.fromMe,
          type: maytapiUtils.getMessageType(msg.message),
          ack: msg.fromMe ? 3 : 2,
          mediaUrl: msg.message?.mediaUrl,
          caption: msg.message?.caption,
          filename: msg.message?.filename,
          url: msg.message?.url,
          mime: msg.message?.mime,
          duration: msg.message?.duration
        }));
        
        setMessages(transformedMessages);
      } else {
        console.log('Usando mensagens de teste como fallback');
        setMessages(getMockMessages(conversation.id));
      }
      
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
      setError('Erro ao carregar mensagens');
      // Usar mensagens de teste como fallback
      setMessages(getMockMessages(conversation?.id || 'test'));
    } finally {
      setLoading(false);
    }
  };

  // Carregar mensagens quando a conversa mudar
  useEffect(() => {
    loadMessages();
  }, [conversation]);

  // Scroll automático para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Enviar mensagem
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    try {
      setSending(true);
      
      await maytapiService.sendMessage(conversation.id, newMessage.trim());
      
      // Adicionar mensagem localmente para feedback imediato
      const tempMessage = {
        id: Date.now().toString(),
        message: newMessage.trim(),
        fromMe: true,
        timestamp: Math.floor(Date.now() / 1000),
        type: 'text',
        ack: 0
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      // Recarregar mensagens após um breve delay
      setTimeout(() => {
        loadMessages();
      }, 1000);
      
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError(`Erro ao enviar mensagem: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  // Scroll para o final das mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Carregar mensagens quando a conversa mudar
  useEffect(() => {
    loadMessages();
  }, [conversation]);

  // Scroll para o final quando novas mensagens chegarem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Renderizar status da mensagem
  const renderMessageStatus = (message) => {
    if (!message.fromMe) return null;
    
    if (message.ack === 3) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    } else if (message.ack === 2) {
      return <CheckCheck className="w-3 h-3 text-gray-400" />;
    } else if (message.ack === 1) {
      return <Check className="w-3 h-3 text-gray-400" />;
    }
    
    return <Clock className="w-3 h-3 text-gray-400" />;
  };

  // Renderizar conteúdo da mensagem baseado no tipo
  const renderMessageContent = (message) => {
    switch (message.type) {
      case 'image':
        return (
          <ImageViewer 
            imageData={message} 
            isFromMe={message.fromMe}
          />
        );
      
      case 'document':
        return (
          <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
            <FileText className="w-4 h-4 text-gray-600" />
            <div className="flex-1">
              <p className="text-sm font-medium">{message.filename || 'Documento'}</p>
              {message.filesize && (
                <p className="text-xs text-gray-500">{message.filesize}</p>
              )}
            </div>
            {message.mediaUrl && (
              <Button size="sm" variant="ghost" asChild>
                <a href={message.mediaUrl} download>
                  <Download className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        );
      
      case 'audio':
      case 'ptt':
        return (
          <AudioPlayer 
            audioData={message} 
            isFromMe={message.fromMe}
          />
        );
      
      case 'location':
        return (
          <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
            <MapPin className="w-4 h-4 text-gray-600" />
            <span className="text-sm">Localização compartilhada</span>
          </div>
        );
      
      default:
        return <p className="whitespace-pre-wrap">{message.message}</p>;
    }
  };

  // Renderizar mensagem
  const renderMessage = (message, index) => {
    const isFromMe = message.fromMe;
    const showAvatar = !isFromMe && (index === 0 || messages[index - 1]?.fromMe);
    
    return (
      <div
        key={message.id}
        className={`flex ${isFromMe ? 'justify-end' : 'justify-start'} mb-4`}
      >
        {!isFromMe && showAvatar && (
          <Avatar className="w-8 h-8 mr-2">
            <AvatarImage src={conversation.contact?.profilePicUrl} />
            <AvatarFallback className="bg-gray-500 text-white text-xs">
              {maytapiUtils.getDefaultAvatar(conversation.contact || {})}
            </AvatarFallback>
          </Avatar>
        )}
        
        {!isFromMe && !showAvatar && <div className="w-10" />}
        
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isFromMe
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}
        >
          {renderMessageContent(message)}
          
          <div className={`flex items-center justify-end space-x-1 mt-1 ${
            isFromMe ? 'text-green-100' : 'text-gray-500'
          }`}>
            <span className="text-xs">
              {maytapiUtils.formatMessageDate(message.timestamp)}
            </span>
            {renderMessageStatus(message)}
          </div>
        </div>
      </div>
    );
  };

  if (!conversation) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <div className="text-center text-gray-500">
            <MessageCircle className="w-16 h-16 mx-auto mb-4" />
            <p>Selecione uma conversa para começar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const contact = conversation.contact || {};
  const contactName = maytapiUtils.getContactName(contact);

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Header da conversa */}
      <CardHeader className="pb-3 border-b flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="lg:hidden">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <Avatar className="w-10 h-10">
            <AvatarImage src={contact.profilePicUrl} alt={contactName} />
            <AvatarFallback className="bg-green-500 text-white">
              {maytapiUtils.getDefaultAvatar(contact)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{contactName}</h3>
            <p className="text-sm text-gray-500">
              {maytapiUtils.isGroup(conversation.id) ? 'Grupo' : 'Contato'}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {error && (
        <div className="p-4 border-b flex-shrink-0">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Área de mensagens */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                <p className="text-gray-600">Carregando mensagens...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                <p>Nenhuma mensagem encontrada</p>
              </div>
            </div>
          ) : (
            <div>
              {messages.map((message, index) => renderMessage(message, index))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Input de nova mensagem */}
      <div className="p-4 border-t flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite uma mensagem..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || sending}>
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default ChatWindow;

