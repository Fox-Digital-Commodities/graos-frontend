import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  MessageCircle, 
  Users, 
  Clock, 
  CheckCheck,
  Check,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { maytapiService, maytapiUtils } from '../services/maytapi';

const ChatList = ({ onSelectChat, selectedChatId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Dados de teste para desenvolvimento
  const mockConversations = [
    {
      id: '556295625399@c.us',
      contact: {
        id: '556295625399@c.us',
        name: 'João Silva',
        pushname: 'João Silva',
        profilePicUrl: null
      },
      lastMessage: {
        id: 'msg1',
        message: 'Olá! Como está o preço da soja hoje?',
        timestamp: Math.floor(Date.now() / 1000) - 3600,
        fromMe: false,
        type: 'text',
        ack: 2
      },
      unreadCount: 2
    },
    {
      id: '5511999888777@c.us',
      contact: {
        id: '5511999888777@c.us',
        name: 'Maria Santos',
        pushname: 'Maria Santos',
        profilePicUrl: null
      },
      lastMessage: {
        id: 'msg2',
        message: 'Preciso do relatório de preços do milho',
        timestamp: Math.floor(Date.now() / 1000) - 7200,
        fromMe: false,
        type: 'text',
        ack: 1
      },
      unreadCount: 0
    },
    {
      id: '5511888777666@c.us',
      contact: {
        id: '5511888777666@c.us',
        name: 'Pedro Oliveira',
        pushname: 'Pedro Oliveira',
        profilePicUrl: null
      },
      lastMessage: {
        id: 'msg3',
        message: 'Obrigado pelas informações!',
        timestamp: Math.floor(Date.now() / 1000) - 86400,
        fromMe: true,
        type: 'text',
        ack: 3
      },
      unreadCount: 0
    }
  ];

  // Carregar conversas
  const loadConversations = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await maytapiService.getConversations();
      
      console.log('Resposta da API:', response); // Debug
      
      if (response && response.success && Array.isArray(response.data)) {
        // Transformar dados da API para formato esperado pelo componente
        const transformedConversations = response.data.map(conv => ({
          id: conv._serialized,
          contact: {
            id: conv._serialized,
            name: conv.name || conv.user,
            pushname: conv.name || conv.user,
            profilePicUrl: null
          },
          lastMessage: {
            id: 'temp',
            message: 'Clique para ver mensagens',
            timestamp: Math.floor(Date.now() / 1000),
            fromMe: false,
            type: 'text',
            ack: 1
          },
          unreadCount: 0
        }));
        setConversations(transformedConversations);
      } else if (response && Array.isArray(response)) {
        // Caso a resposta seja diretamente um array
        setConversations(response);
      } else {
        console.warn('Formato de resposta inesperado, usando dados de teste:', response);
        setConversations(mockConversations);
      }
    } catch (err) {
      console.error('Erro ao carregar conversas, usando dados de teste:', err);
      setError(`API indisponível (usando dados de teste): ${err.message}`);
      setConversations(mockConversations);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Carregar conversas ao montar o componente
  useEffect(() => {
    loadConversations();
  }, []);

  // Filtrar conversas
  const filteredConversations = (Array.isArray(conversations) ? conversations : []).filter(conv => {
    const contactName = maytapiUtils.getContactName(conv.contact || {});
    const lastMessage = conv.lastMessage?.message || '';
    
    return (
      contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Renderizar status da mensagem
  const renderMessageStatus = (message) => {
    if (!message.fromMe) return null;
    
    if (message.ack === 3) {
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    } else if (message.ack === 2) {
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    } else if (message.ack === 1) {
      return <Check className="w-4 h-4 text-gray-400" />;
    }
    
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  // Renderizar item da conversa
  const renderConversationItem = (conversation) => {
    const contact = conversation.contact || {};
    const lastMessage = conversation.lastMessage;
    const contactName = maytapiUtils.getContactName(contact);
    const isGroup = maytapiUtils.isGroup(conversation.id);
    const isSelected = selectedChatId === conversation.id;
    
    return (
      <div
        key={conversation.id}
        className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
          isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
        }`}
        onClick={() => onSelectChat(conversation)}
      >
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <Avatar className="w-12 h-12">
            <AvatarImage src={contact.profilePicUrl} alt={contactName} />
            <AvatarFallback className="bg-green-500 text-white">
              {maytapiUtils.getDefaultAvatar(contact)}
            </AvatarFallback>
          </Avatar>

          {/* Conteúdo da conversa */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {contactName}
                </h3>
                {isGroup && (
                  <Users className="w-4 h-4 text-gray-500" />
                )}
              </div>
              
              {lastMessage && (
                <div className="flex items-center space-x-1">
                  {renderMessageStatus(lastMessage)}
                  <span className="text-xs text-gray-500">
                    {maytapiUtils.formatMessageDate(lastMessage.timestamp)}
                  </span>
                </div>
              )}
            </div>

            {/* Última mensagem */}
            {lastMessage && (
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 truncate">
                  {lastMessage.fromMe && 'Você: '}
                  {lastMessage.type === 'text' 
                    ? maytapiUtils.truncateMessage(lastMessage.message)
                    : maytapiUtils.getMessageType(lastMessage)
                  }
                </p>
                
                {conversation.unreadCount > 0 && (
                  <Badge variant="default" className="bg-green-500 text-white ml-2">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Conversas do WhatsApp</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            <p className="text-gray-600">Carregando conversas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Conversas do WhatsApp</span>
            </CardTitle>
            <CardDescription>
              {filteredConversations.length} conversa(s) encontrada(s)
            </CardDescription>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadConversations(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Barra de pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      {error && (
        <div className="px-6 pb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar conversas: {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <MessageCircle className="w-12 h-12 mb-4" />
              <p>Nenhuma conversa encontrada</p>
              {searchTerm && (
                <p className="text-sm">Tente buscar por outro termo</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredConversations.map((conversation, index) => (
                <div key={conversation.id}>
                  {renderConversationItem(conversation)}
                  {index < filteredConversations.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChatList;

