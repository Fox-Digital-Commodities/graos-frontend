import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Package,
  Save,
  Edit3,
  Trash2,
  User,
  Hash,
  MapPinned
} from 'lucide-react';

const ResultsTable = ({ 
  results, 
  onConfirm, 
  onEdit, 
  onReject, 
  isLoading = false 
}) => {
  const [editingItem, setEditingItem] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [editingIds, setEditingIds] = useState(false);
  const [metaData, setMetaData] = useState({
    idFoxUser: results?.idFoxUser || ''
  });

  if (!results) {
    return null;
  }

  const handleEdit = (produtoIndex, precoIndex, field, value) => {
    const key = `${produtoIndex}-${precoIndex}`;
    setEditedData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const applyEdits = () => {
    // Aplicar edições aos dados originais
    const updatedResults = { ...results };
    
    // Aplicar edições de IDs se houver
    if (editingIds) {
      updatedResults.idFoxUser = metaData.idFoxUser;
      setEditingIds(false);
    }
    
    // Aplicar edições de preços e produtos
    Object.keys(editedData).forEach(key => {
      const [produtoIndex, precoIndex] = key.split('-').map(Number);
      const edits = editedData[key];
      
      Object.keys(edits).forEach(field => {
        // Verificar se é o campo idFoxAddresses (que pertence ao produto)
        if (field === 'idFoxAddresses') {
          if (updatedResults.produtos[produtoIndex]) {
            updatedResults.produtos[produtoIndex][field] = edits[field];
          }
        }
        // Caso contrário, aplicar ao preço específico
        else if (updatedResults.produtos[produtoIndex]?.precos[precoIndex]) {
          updatedResults.produtos[produtoIndex].precos[precoIndex][field] = edits[field];
        }
      });
    });

    setEditingItem(null);
    setEditedData({});
    
    // Callback para atualizar os dados no componente pai
    onEdit && onEdit(updatedResults);
  };

  const formatCurrency = (value, currency = 'BRL') => {
    if (!value) return '-';
    
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    });
    
    return formatter.format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const getEditedValue = (produtoIndex, precoIndex, field, originalValue) => {
    const key = `${produtoIndex}-${precoIndex}`;
    return editedData[key]?.[field] ?? originalValue;
  };

  return (
    <div className="space-y-6">
      {/* Card para IDs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações de Identificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">ID Fox User</span>
            </div>
            {editingIds ? (
              <Input 
                placeholder="ID do Usuário (opcional)" 
                value={metaData.idFoxUser} 
                onChange={(e) => setMetaData(prev => ({ ...prev, idFoxUser: e.target.value }))}
                className="text-sm"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm">{results.idFoxUser || 'Não definido'}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-4">
            {!editingIds ? (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setEditingIds(true)}
                className="flex items-center gap-2"
              >
                <Edit3 className="h-3 w-3" />
                Editar IDs
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setEditingIds(false);
                    setMetaData({
                      idFoxUser: results?.idFoxUser || '',
                    });
                  }}
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => {
                    const updatedResults = { ...results, ...metaData };
                    onEdit && onEdit(updatedResults);
                    setEditingIds(false);
                  }}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Salvar IDs
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cabeçalho do Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {results.titulo || 'Dados Extraídos'}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(results.dataReferencia)}
              </Badge>
              {results.cotacaoDolar && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  US$ {results.cotacaoDolar.toFixed(2)}
                </Badge>
              )}
            </div>
          </div>
          
          {results.observacoes && (
            <p className="text-sm text-muted-foreground mt-2">
              {results.observacoes}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Tabelas por Produto */}
      {results.produtos?.map((produto, produtoIndex) => (
        <Card key={produtoIndex}>
          <CardHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {produto.nome}
                  {produto.safra && (
                    <Badge variant="outline">{produto.safra}</Badge>
                  )}
                </CardTitle>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {produto.modalidade && (
                    <Badge variant="secondary">{produto.modalidade}</Badge>
                  )}
                  {produto.uf && produto.municipio && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {produto.municipio} - {produto.uf}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <MapPinned className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">ID Fox Addresses:</span>
                </div>
                
                {editingItem === `${produtoIndex}` ? (
                  <Input 
                    placeholder="ID Fox Addresses (opcional)" 
                    value={getEditedValue(produtoIndex, 0, 'idFoxAddresses', produto.idFoxAddresses) || ''}
                    onChange={(e) => handleEdit(produtoIndex, 0, 'idFoxAddresses', e.target.value)}
                    className="max-w-xs h-7 text-xs"
                  />
                ) : (
                  <span className="text-xs font-mono">
                    {produto.idFoxAddresses || 'Não definido'}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Embarque</th>
                    <th className="text-left p-3 font-medium">Pagamento</th>
                    <th className="text-right p-3 font-medium">Preço USD</th>
                    <th className="text-right p-3 font-medium">Preço BRL</th>
                    {editingItem === `${produtoIndex}` && (
                      <th className="text-center p-3 font-medium">Ações</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {produto.precos?.map((preco, precoIndex) => (
                    <tr key={precoIndex} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        {editingItem === `${produtoIndex}` ? (
                          <input
                            type="text"
                            value={getEditedValue(produtoIndex, precoIndex, 'embarque', preco.embarque)}
                            onChange={(e) => handleEdit(produtoIndex, precoIndex, 'embarque', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        ) : (
                          <span className="font-medium">{preco.embarque}</span>
                        )}
                      </td>
                      
                      <td className="p-3">
                        {editingItem === `${produtoIndex}` ? (
                          <input
                            type="date"
                            value={getEditedValue(produtoIndex, precoIndex, 'pagamento', preco.pagamento)?.split('T')[0] || ''}
                            onChange={(e) => handleEdit(produtoIndex, precoIndex, 'pagamento', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        ) : (
                          formatDate(preco.pagamento)
                        )}
                      </td>
                      
                      <td className="p-3 text-right">
                        {editingItem === `${produtoIndex}` ? (
                          <input
                            type="number"
                            step="0.01"
                            value={getEditedValue(produtoIndex, precoIndex, 'precoUsd', preco.precoUsd) || ''}
                            onChange={(e) => handleEdit(produtoIndex, precoIndex, 'precoUsd', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border rounded text-sm text-right"
                          />
                        ) : (
                          <span className="font-mono">
                            {preco.precoUsd ? formatCurrency(preco.precoUsd, 'USD') : '-'}
                          </span>
                        )}
                      </td>
                      
                      <td className="p-3 text-right">
                        {editingItem === `${produtoIndex}` ? (
                          <input
                            type="number"
                            step="0.01"
                            value={getEditedValue(produtoIndex, precoIndex, 'precoBrl', preco.precoBrl) || ''}
                            onChange={(e) => handleEdit(produtoIndex, precoIndex, 'precoBrl', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border rounded text-sm text-right"
                          />
                        ) : (
                          <span className="font-mono font-medium">
                            {formatCurrency(preco.precoBrl)}
                          </span>
                        )}
                      </td>
                      
                      {editingItem === `${produtoIndex}` && precoIndex === 0 && (
                        <td className="p-3 text-center" rowSpan={produto.precos.length}>
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={applyEdits}
                              className="h-7 px-2"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingItem(null);
                                setEditedData({});
                              }}
                              className="h-7 px-2"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Botão de edição por produto */}
            {editingItem !== `${produtoIndex}` && (
              <div className="flex justify-end mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingItem(`${produtoIndex}`)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-3 w-3" />
                  Editar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Ações Finais */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>{results.produtos?.length || 0}</strong> produtos • 
                <strong className="ml-1">
                  {results.produtos?.reduce((total, produto) => total + (produto.precos?.length || 0), 0) || 0}
                </strong> preços extraídos
              </p>
              <p className="mt-1">
                Revise os dados acima e confirme para salvar no banco de dados.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onReject}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Descartar
              </Button>
              
              <Button
                onClick={() => onConfirm(results)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Confirmar e Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsTable;

