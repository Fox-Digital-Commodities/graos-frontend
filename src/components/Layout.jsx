import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Table, MessageCircle, Settings } from 'lucide-react';
import { CompactWhatsAppInstanceSelector, WhatsAppInstanceStatus } from './WhatsAppInstanceSelector';

export default function Layout({ children }) {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Grãos</h1>
                <p className="text-sm text-gray-500">Processamento de Cards de Preços</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Mostrar seletor de instância apenas na aba de chat */}
              {activeTab === 'chat' && (
                <div className="flex items-center space-x-3">
                  <WhatsAppInstanceStatus />
                  <CompactWhatsAppInstanceSelector />
                </div>
              )}
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Cards</span>
            </TabsTrigger>
            <TabsTrigger value="spreadsheets" className="flex items-center space-x-2">
              <Table className="w-4 h-4" />
              <span>Planilhas</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Chat</span>
            </TabsTrigger>
          </TabsList>

          {children}
        </Tabs>
      </main>
    </div>
  );
}

