import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Eye, Edit, Trash2, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Dados mockados para demonstração
const mockCards = [
  {
    id: '1',
    titulo: 'Preços Grãos - 21/Jul',
    dataReferencia: new Date('2024-07-21'),
    cotacaoDolar: 5.56,
    cbot: -14.50,
    observacoes: 'Preços sujeitos a alterações conforme variações na bolsa',
    arquivoOriginal: 'card_precos_21jul.png',
    produtos: [
      {
        id: '1',
        nome: 'SOJA',
        safra: '2024/2025',
        modalidade: 'FOB',
        uf: 'GO',
        municipio: 'PADRE BERNARDO',
        precos: [
          { embarque: 'SETEMBRO', pagamento: new Date('2025-09-22'), precoBrl: 122.55, precoUsd: 21.70 },
          { embarque: 'SETEMBRO', pagamento: new Date('2025-09-30'), precoBrl: 123.06, precoUsd: 21.75 }
        ]
      },
      {
        id: '2',
        nome: 'MILHO',
        safra: '2025/2025',
        modalidade: 'FOB',
        uf: 'GO',
        municipio: 'PADRE BERNARDO',
        precos: [
          { embarque: 'SETEMBRO', pagamento: new Date('2025-09-30'), precoBrl: 47.12, precoUsd: 8.33 },
          { embarque: 'OUTUBRO', pagamento: new Date('2025-10-30'), precoBrl: 47.01, precoUsd: 8.25 }
        ]
      }
    ],
    createdAt: new Date('2024-07-21T10:30:00'),
    updatedAt: new Date('2024-07-21T10:30:00')
  },
  {
    id: '2',
    titulo: 'Cotações Safra 25/26',
    dataReferencia: new Date('2024-07-20'),
    cotacaoDolar: 5.52,
    cbot: -12.30,
    produtos: [
      {
        id: '3',
        nome: 'SOJA',
        safra: '2025/2026',
        modalidade: 'FOB',
        uf: 'GO',
        municipio: 'PADRE BERNARDO',
        precos: [
          { embarque: 'FEVEREIRO', pagamento: new Date('2026-03-05'), precoBrl: 110.40, precoUsd: 18.85 },
          { embarque: 'MARÇO', pagamento: new Date('2026-03-31'), precoBrl: 110.82, precoUsd: 18.79 }
        ]
      }
    ],
    createdAt: new Date('2024-07-20T14:15:00'),
    updatedAt: new Date('2024-07-20T14:15:00')
  }
];

export default function CardsList({ uploadedData = [] }) {
  const [cards] = useState(mockCards);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);

  // Combinar dados mockados com dados reais do upload
  const allCards = [
    ...uploadedData.map(item => ({
      id: item.id,
      titulo: `Processamento - ${item.name}`,
      dataReferencia: new Date(item.uploadedAt),
      cotacaoDolar: item.extractedData?.cotacaoDolar || null,
      cbot: item.extractedData?.cbot || null,
      observacoes: item.extractedData?.observacoes || null,
      arquivoOriginal: item.name,
      produtos: item.extractedData?.produtos || [],
      createdAt: new Date(item.uploadedAt),
      updatedAt: new Date(item.uploadedAt),
      isFromUpload: true
    })),
    ...cards
  ];

  const filteredCards = allCards.filter(card =>
    card.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.produtos.some(produto => 
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatCurrency = (value, currency = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  const formatDate = (date) => {
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const getTotalProducts = (card) => {
    return card.produtos.length;
  };

  const getTotalPrices = (card) => {
    return card.produtos.reduce((total, produto) => total + produto.precos.length, 0);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Busca */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cards Processados</h2>
          <p className="text-gray-600">
            {filteredCards.length} card(s) encontrado(s)
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por título ou produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Dados Recém-Processados */}
      {uploadedData.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">📊 Dados Recém-Processados</CardTitle>
            <CardDescription className="text-green-600">
              {uploadedData.length} arquivo(s) processado(s) recentemente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedData.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        Processado em {new Date(item.uploadedAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {item.extractedData?.produtos?.length || 0} produto(s)
                    </Badge>
                  </div>
                  
                  {item.extractedData?.produtos && item.extractedData.produtos.length > 0 && (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead>Safra</TableHead>
                            <TableHead>UF</TableHead>
                            <TableHead>Endereço</TableHead>
                            <TableHead>Janela de Retirada</TableHead>
                            <TableHead>Preços</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {item.extractedData.produtos.map((produto, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{produto.nome}</TableCell>
                              <TableCell>{produto.safra}</TableCell>
                              <TableCell>{produto.uf}</TableCell>
                              <TableCell>{produto.endereco || '-'}</TableCell>
                              <TableCell>{produto.janelaRetirada || '-'}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {produto.precos?.map((preco, precoIdx) => (
                                    <div key={precoIdx} className="text-sm">
                                      {preco.precoBrl && (
                                        <span className="font-medium">
                                          {formatCurrency(preco.precoBrl)}
                                        </span>
                                      )}
                                      {preco.precoUsd && (
                                        <span className="text-gray-600 ml-2">
                                          ({formatCurrency(preco.precoUsd, 'USD')})
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Cards */}
      <div className="grid gap-6">
        {filteredCards.map((card) => (
          <Card key={card.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{card.titulo}</span>
                    <Badge variant="outline">
                      {getTotalProducts(card)} produto(s)
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(card.dataReferencia)}</span>
                    </span>
                    {card.cotacaoDolar && (
                      <span className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>USD {card.cotacaoDolar.toFixed(2)}</span>
                      </span>
                    )}
                    {card.cbot && (
                      <span className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>CBOT {card.cbot > 0 ? '+' : ''}{card.cbot}</span>
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedCard(card)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{card.titulo}</DialogTitle>
                        <DialogDescription>
                          Detalhes do card processado em {formatDate(card.createdAt)}
                        </DialogDescription>
                      </DialogHeader>
                      {selectedCard && <CardDetails card={selectedCard} />}
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Resumo dos Produtos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {card.produtos.slice(0, 3).map((produto) => (
                    <div key={produto.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{produto.nome}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {produto.modalidade}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {produto.safra} • {produto.uf} - {produto.municipio}
                      </p>
                      <div className="text-sm">
                        <p className="text-gray-600">
                          {produto.precos.length} cotação(ões)
                        </p>
                        {produto.precos[0] && (
                          <p className="font-medium text-green-600">
                            {formatCurrency(produto.precos[0].precoBrl)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {card.observacoes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Observação:</strong> {card.observacoes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum card encontrado
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Tente ajustar os termos de busca ou limpar o filtro.'
                : 'Faça upload de arquivos para começar a processar cards de preços.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CardDetails({ card }) {
  const formatCurrency = (value, currency = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  const formatDate = (date) => {
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      {/* Informações Gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Data de Referência</label>
          <p className="text-sm text-gray-900">{formatDate(card.dataReferencia)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Cotação Dólar</label>
          <p className="text-sm text-gray-900">
            {card.cotacaoDolar ? `R$ ${card.cotacaoDolar.toFixed(2)}` : '-'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">CBOT</label>
          <p className="text-sm text-gray-900">
            {card.cbot ? `${card.cbot > 0 ? '+' : ''}${card.cbot}` : '-'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Arquivo Original</label>
          <p className="text-sm text-gray-900">{card.arquivoOriginal || '-'}</p>
        </div>
      </div>

      {/* Produtos e Preços */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Produtos e Preços</h3>
        <div className="space-y-6">
          {card.produtos.map((produto) => (
            <div key={produto.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{produto.nome}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>Safra: {produto.safra}</span>
                    <span>Modalidade: {produto.modalidade}</span>
                    <span>Local: {produto.uf} - {produto.municipio}</span>
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Embarque</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Preço USD</TableHead>
                    <TableHead>Preço BRL</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Janela de Retirada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produto.precos.map((preco, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{preco.embarque}</TableCell>
                      <TableCell>{formatDate(preco.pagamento)}</TableCell>
                      <TableCell>
                        {preco.precoUsd ? `$ ${preco.precoUsd.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(preco.precoBrl)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {preco.endereco || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {preco.janelaRetirada || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      </div>

      {card.observacoes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Observações</h4>
          <p className="text-sm text-yellow-700">{card.observacoes}</p>
        </div>
      )}
    </div>
  );
}

