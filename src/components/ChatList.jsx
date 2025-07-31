import { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWhatsAppInstance } from '../contexts/WhatsAppInstanceContext';
import { maytapiService, maytapiUtils } from '../services/maytapi';

const ChatList = ({ onSelectChat, selectedChatId }) => {
  const { currentInstance, fetchWithInstance } = useWhatsAppInstance();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalConversations, setTotalConversations] = useState(0);
  
  // Refs para scroll infinito
  const scrollAreaRef = useRef(null);
  const loadingRef = useRef(false);
  
  const CONVERSATIONS_PER_PAGE = 20; // Reduzido para melhor performance
  const SCROLL_THRESHOLD = 200; // Pixels antes do fim para carregar mais

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

  // Carregar conversas com paginação otimizada
  const loadConversations = useCallback(async (page = 0, append = false, showRefreshLoader = false) => {
    // Evitar múltiplas chamadas simultâneas
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await maytapiService.getConversations(page, CONVERSATIONS_PER_PAGE);
      
      console.log('Resposta da API (página', page, '):', response); // Debug
      
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
        
        if (append) {
          // Adicionar à lista existente (scroll infinito) - evitar duplicatas
          setConversations(prev => {
            const existingIds = new Set(prev.map(conv => conv.id));
            const newConversations = transformedConversations.filter(conv => !existingIds.has(conv.id));
            // Inverter ordenação para mostrar conversas mais recentes primeiro
            return [...prev, ...newConversations.reverse()];
          });
        } else {
          // Substituir lista (primeira carga ou refresh) - inverter ordenação
          setConversations(transformedConversations.reverse());
        }
        
        // Verificar se há mais páginas
        setHasMore(transformedConversations.length === CONVERSATIONS_PER_PAGE);
        setCurrentPage(page);
        
        // Estimar total baseado na primeira página
        if (page === 0 && transformedConversations.length > 0) {
          setTotalConversations(transformedConversations.length === CONVERSATIONS_PER_PAGE ? '650+' : transformedConversations.length);
        }
        
      } else if (response && Array.isArray(response)) {
        // Caso a resposta seja diretamente um array - inverter ordenação
        const reversedResponse = [...response].reverse();
        if (append) {
          setConversations(prev => [...prev, ...reversedResponse]);
        } else {
          setConversations(reversedResponse);
        }
        setHasMore(response.length === CONVERSATIONS_PER_PAGE);
      } else {
        console.warn('Formato de resposta inesperado, usando dados de teste:', response);
        if (!append) {
          setConversations(mockConversations);
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar conversas, usando dados de teste:', err);
      setError(`API indisponível (usando dados de teste): ${err.message}`);
      if (!append) {
        setConversations(mockConversations);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [CONVERSATIONS_PER_PAGE]);

  // Carregar conversas ao montar o componente
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Carregar mais conversas (scroll infinito) com throttling
  const loadMoreConversations = useCallback(async () => {
    if (!loadingRef.current && hasMore && !loadingMore) {
      await loadConversations(currentPage + 1, true);
    }
  }, [currentPage, hasMore, loadingMore, loadConversations]);

  // Refresh das conversas
  const handleRefresh = useCallback(() => {
    setCurrentPage(0);
    setHasMore(true);
    setConversations([]);
    loadConversations(0, false, true);
  }, [loadConversations]);

  // Detectar scroll para carregar mais com throttling
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD;
    
    if (isNearBottom && hasMore && !loadingMore && !loadingRef.current) {
      loadMoreConversations();
    }
  }, [hasMore, loadingMore, loadMoreConversations, SCROLL_THRESHOLD]);

  // Filtrar conversas com memoização para performance
  const filteredConversations = useMemo(() => {
    if (!Array.isArray(conversations)) return [];
    
    if (!searchTerm.trim()) return conversations;
    
    const searchLower = searchTerm.toLowerCase();
    return conversations.filter(conv => {
      const contactName = maytapiUtils.getContactName(conv.contact || {});
      const lastMessage = conv.lastMessage?.message || '';
      
      return (
        contactName.toLowerCase().includes(searchLower) ||
        lastMessage.toLowerCase().includes(searchLower)
      );
    });
  }, [conversations, searchTerm]);

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

  // Renderizar item da conversa com memoização
  const renderConversationItem = useCallback((conversation) => {
    const contact = conversation.contact || {};
    const lastMessage = conversation.lastMessage;
    const contactName = maytapiUtils.getContactName(contact);
    const isGroup = maytapiUtils.isGroup(conversation.id);
    const isSelected = selectedChatId === conversation.id;
    
    return (
      <div
        key={conversation.id}
        className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
          isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
        }`}
        onClick={() => onSelectChat(conversation)}
      >
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={contact.profilePicUrl} alt={contactName} />
            <AvatarFallback className="bg-green-500 text-white text-sm">
              {maytapiUtils.getDefaultAvatar(contact)}
            </AvatarFallback>
          </Avatar>

          {/* Conteúdo da conversa */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate text-sm">
                  {contactName}
                </h3>
                {isGroup && (
                  <Users className="w-3 h-3 text-gray-500 flex-shrink-0" />
                )}
              </div>
              
              {lastMessage && (
                <div className="flex items-center space-x-1 flex-shrink-0">
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
                <p className="text-xs text-gray-600 truncate flex-1">
                  {lastMessage.fromMe && 'Você: '}
                  {lastMessage.type === 'text' 
                    ? maytapiUtils.truncateMessage(lastMessage.message, 40)
                    : maytapiUtils.getMessageType(lastMessage)
                  }
                </p>
                
                {conversation.unreadCount > 0 && (
                  <Badge variant="default" className="bg-green-500 text-white ml-2 text-xs px-1.5 py-0.5">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [selectedChatId, onSelectChat]);

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
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Conversas do WhatsApp</span>
            </CardTitle>
            <CardDescription>
              {filteredConversations.length} de {totalConversations || conversations.length} conversa(s)
              {searchTerm && ` (filtradas)`}
            </CardDescription>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
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
        <div className="px-6 pb-4 flex-shrink-0">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar conversas: {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea 
          className="h-full" 
          ref={scrollAreaRef}
          onScrollCapture={handleScroll}
        >
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
              {filteredConversations.map((conversation) => 
                renderConversationItem(conversation)
              )}
              
              {/* Indicador de carregamento para scroll infinito */}
              {loadingMore && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin text-green-500 mr-2" />
                  <span className="text-gray-600">Carregando mais conversas...</span>
                </div>
              )}
              
              {/* Indicador de fim da lista */}
              {!hasMore && conversations.length > 0 && !searchTerm && (
                <div className="flex items-center justify-center p-4 text-gray-500">
                  <CheckCheck className="w-4 h-4 mr-2" />
                  <span className="text-sm">Todas as conversas foram carregadas</span>
                </div>
              )}
              
              {/* Botão para carregar mais (fallback) */}
              {hasMore && !loadingMore && conversations.length >= CONVERSATIONS_PER_PAGE && (
                <div className="flex items-center justify-center p-4">
                  <Button 
                    variant="outline" 
                    onClick={loadMoreConversations}
                    className="w-full"
                  >
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Carregar mais conversas
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChatList;

