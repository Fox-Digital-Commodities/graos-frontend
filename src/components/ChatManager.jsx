import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Smartphone, Users, Settings } from 'lucide-react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

const ChatManager = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const handleSelectChat = (conversation) => {
    setSelectedConversation(conversation);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedConversation(null);
  };

  return (
    <div className="space-y-6">
      {/* Header do Chat Manager */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 text-green-600" />
            <span>WhatsApp Manager</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Gerencie suas conversas do WhatsApp através da API Maytapi
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Conectado</span>
          </Badge>
          
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Conversas</CardDescription>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <span>--</span>
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mensagens Não Lidas</CardDescription>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <Badge className="bg-red-500">--</Badge>
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Grupos Ativos</CardDescription>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <span>--</span>
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
                  <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <Smartphone className="w-12 h-12 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      WhatsApp Web
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Selecione uma conversa na lista ao lado para começar a visualizar e enviar mensagens.
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

