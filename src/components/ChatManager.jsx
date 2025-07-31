import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Smartphone, Users, Settings, Building2, Phone } from 'lucide-react';
import { useWhatsAppInstance } from '../contexts/WhatsAppInstanceContext';
import WhatsAppInstanceSelector from './WhatsAppInstanceSelector';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

const ChatManager = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [stats, setStats] = useState({
    totalConversations: 0,
    unreadMessages: 0,
    activeGroups: 0
  });

  const {
    currentInstance,
    currentInstanceName,
    currentInstanceColor,
    currentInstanceIcon,
    isLogistics,
    isCommercial,
    fetchWithInstance
  } = useWhatsAppInstance();

  // Carregar estatísticas quando a instância mudar
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetchWithInstance('/stats');
        const data = await response.json();
        setStats({
          totalConversations: data.conversations?.total || 0,
          unreadMessages: data.conversations?.unread || 0,
          activeGroups: data.conversations?.groups || 0
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        // Manter valores padrão em caso de erro
      }
    };

    loadStats();
  }, [currentInstance, fetchWithInstance]);

  // Limpar conversa selecionada quando mudar de instância
  useEffect(() => {
    setSelectedConversation(null);
    setShowMobileChat(false);
  }, [currentInstance]);

  const handleSelectChat = (conversation) => {
    setSelectedConversation(conversation);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedConversation(null);
  };

  const getInstanceIcon = () => {
    if (isLogistics) return <Building2 className="w-6 h-6" style={{ color: currentInstanceColor }} />;
    if (isCommercial) return <Phone className="w-6 h-6" style={{ color: currentInstanceColor }} />;
    return <MessageCircle className="w-6 h-6" style={{ color: currentInstanceColor }} />;
  };

  return (
    <div className="space-y-6">
      {/* Header do Chat Manager */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            {getInstanceIcon()}
            <span>WhatsApp {currentInstanceName}</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Gerencie conversas da instância {currentInstanceName} (ID: {currentInstance.phoneId})
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge 
            variant="outline" 
            className="flex items-center space-x-1"
            style={{ borderColor: currentInstanceColor }}
          >
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentInstanceColor }}
            ></div>
            <span>Conectado</span>
          </Badge>
          
          {/* Seletor de instância - versão completa para desktop */}
          <div className="hidden sm:block">
            <WhatsAppInstanceSelector />
          </div>
          
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Seletor de instância - versão mobile */}
      <div className="block sm:hidden">
        <div className="flex justify-center">
          <WhatsAppInstanceSelector className="w-full max-w-sm" />
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Conversas</CardDescription>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" style={{ color: currentInstanceColor }} />
              <span>{stats.totalConversations}</span>
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mensagens Não Lidas</CardDescription>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <Badge className="bg-red-500">{stats.unreadMessages}</Badge>
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Grupos Ativos</CardDescription>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <Users className="w-5 h-5" style={{ color: currentInstanceColor }} />
              <span>{stats.activeGroups}</span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Interface principal do chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Lista de conversas - Desktop sempre visível, Mobile condicional */}
        <div className={`lg:col-span-1 ${showMobileChat ? 'hidden lg:block' : 'block'}`}>
          <ChatList 
            onSelectChat={handleSelectChat}
            selectedChatId={selectedConversation?.id}
          />
        </div>

        {/* Janela de chat - Desktop sempre visível, Mobile condicional */}
        <div className={`lg:col-span-2 ${showMobileChat ? 'block' : 'hidden lg:block'}`}>
          {selectedConversation ? (
            <ChatWindow 
              conversation={selectedConversation}
              onBack={handleBackToList}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <div className="space-y-4">
                  <div 
                    className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${currentInstanceColor}20` }}
                  >
                    <div style={{ color: currentInstanceColor }}>
                      {getInstanceIcon()}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      WhatsApp {currentInstanceName}
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Selecione uma conversa na lista ao lado para começar a visualizar e enviar mensagens da instância {currentInstanceName}.
                    </p>
                  </div>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p className="flex items-center justify-center space-x-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>Conversas sincronizadas em tempo real</span>
                    </p>
                    <p className="flex items-center justify-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Suporte a grupos e contatos individuais</span>
                    </p>
                    <p className="flex items-center justify-center space-x-2">
                      <span 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: currentInstanceColor }}
                      ></span>
                      <span>Instância: {currentInstance.phoneId}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatManager;

