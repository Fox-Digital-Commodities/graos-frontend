import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileSpreadsheet, Settings, CheckCircle, AlertCircle } from 'lucide-react';

// Dados mockados para demonstração
const mockCards = [
  {
    id: '1',
    titulo: 'Preços Grãos - 21/Jul',
    dataReferencia: new Date('2024-07-21'),
    produtos: [
      { nome: 'SOJA', safra: '2024/2025', precos: 2 },
      { nome: 'MILHO', safra: '2025/2025', precos: 2 }
    ]
  },
  {
    id: '2',
    titulo: 'Cotações Safra 25/26',
    dataReferencia: new Date('2024-07-20'),
    produtos: [
      { nome: 'SOJA', safra: '2025/2026', precos: 2 }
    ]
  }
];

const templates = [
  {
    id: 'standard',
    name: 'Planilha Padrão',
    description: 'Formato padrão com todas as informações organizadas por produto',
    columns: ['Produto', 'Safra', 'Modalidade', 'UF', 'Município', 'Embarque', 'Pagamento', 'Preço USD', 'Preço BRL']
  },
  {
    id: 'summary',
    name: 'Resumo Executivo',
    description: 'Resumo condensado com preços médios por produto',
    columns: ['Produto', 'Safra', 'Preço Médio BRL', 'Preço Médio USD', 'Qtd. Cotações']
  },
  {
    id: 'comparison',
    name: 'Comparativo de Preços',
    description: 'Comparação de preços entre diferentes períodos de embarque',
    columns: ['Produto', 'Embarque', 'Preço Atual', 'Variação', 'Tendência']
  }
];

export default function SpreadsheetGenerator() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedFile, setGeneratedFile] = useState(null);
  const [error, setError] = useState('');

  const handleCardSelection = (cardId, checked) => {
    if (checked) {
      setSelectedCards(prev => [...prev, cardId]);
    } else {
      setSelectedCards(prev => prev.filter(id => id !== cardId));
    }
  };

  const selectAllCards = () => {
    setSelectedCards(mockCards.map(card => card.id));
  };

  const clearSelection = () => {
    setSelectedCards([]);
  };

  const generateSpreadsheet = async () => {
    if (selectedCards.length === 0 || !selectedTemplate) {
      setError('Selecione pelo menos um card e um template');
      return;
    }

    setError('');
    setGenerating(true);
    setProgress(0);

    try {
      // Simular progresso de geração
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgress(i);
      }

      // Simular geração do arquivo
      const template = templates.find(t => t.id === selectedTemplate);
      const selectedCardsData = mockCards.filter(card => selectedCards.includes(card.id));
      
      setGeneratedFile({
        name: `planilha_graos_${template.name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`,
        size: '245 KB',
        template: template.name,
        cards: selectedCardsData.length,
        downloadUrl: '#' // Em produção, seria a URL real do arquivo
      });

    } catch (err) {
      setError('Erro ao gerar planilha: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const downloadFile = () => {
    // Em produção, faria o download real do arquivo
    alert('Download iniciado! (simulação)');
  };

  const resetGenerator = () => {
    setGeneratedFile(null);
    setProgress(0);
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gerador de Planilhas</h2>
        <p className="text-gray-600">
          Selecione cards e um template para gerar planilhas personalizadas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seleção de Cards */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Selecionar Cards</CardTitle>
                <CardDescription>
                  Escolha os cards que deseja incluir na planilha
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={selectAllCards}>
                  Selecionar Todos
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Limpar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCards.map((card) => (
                <div key={card.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={card.id}
                    checked={selectedCards.includes(card.id)}
                    onCheckedChange={(checked) => handleCardSelection(card.id, checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={card.id} className="font-medium cursor-pointer">
                      {card.titulo}
                    </Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500">
                        {card.dataReferencia.toLocaleDateString('pt-BR')}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {card.produtos.length} produto(s)
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedCards.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>{selectedCards.length}</strong> card(s) selecionado(s)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seleção de Template */}
        <Card>
          <CardHeader>
            <CardTitle>Template da Planilha</CardTitle>
            <CardDescription>
              Escolha o formato de saída da planilha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedTemplate && (
                <div className="p-4 border rounded-lg bg-gray-50">
                  {(() => {
                    const template = templates.find(t => t.id === selectedTemplate);
                    return (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          {template.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {template.description}
                        </p>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Colunas incluídas:
                          </Label>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {template.columns.map((column, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {column}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Erros */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Geração */}
      {!generatedFile ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              
              {generating ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Gerando Planilha...
                  </h3>
                  <Progress value={progress} className="max-w-md mx-auto" />
                  <p className="text-sm text-gray-600">
                    {progress}% concluído
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Pronto para Gerar
                  </h3>
                  <p className="text-gray-600">
                    Selecione os cards e template desejados, depois clique em gerar
                  </p>
                  <Button 
                    onClick={generateSpreadsheet}
                    disabled={selectedCards.length === 0 || !selectedTemplate}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Gerar Planilha
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Arquivo Gerado */
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Planilha Gerada com Sucesso!
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                  <div className="text-left space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Nome:</span>
                      <span className="text-sm font-medium">{generatedFile.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tamanho:</span>
                      <span className="text-sm font-medium">{generatedFile.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Template:</span>
                      <span className="text-sm font-medium">{generatedFile.template}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cards:</span>
                      <span className="text-sm font-medium">{generatedFile.cards}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center space-x-3">
                <Button onClick={downloadFile} className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Planilha
                </Button>
                <Button variant="outline" onClick={resetGenerator}>
                  Gerar Nova Planilha
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

