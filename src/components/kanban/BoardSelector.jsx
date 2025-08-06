import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Kanban, 
  Truck, 
  DollarSign, 
  Headphones, 
  Settings,
  RefreshCw,
  Download,
  Users,
  BarChart3,
  Calendar,
  Clock
} from 'lucide-react';
import { useWhatsAppInstance } from '../../contexts/WhatsAppInstanceContext';
import { kanbanService, syncService } from '../../services/api';

const BoardSelector = ({ selectedBoardId, onBoardSelect, onCreateBoard }) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { selectedInstance } = useWhatsAppInstance();

  useEffect(() => {
    if (selectedInstance?.id) {
      loadBoards();
    }
  }, [selectedInstance]);

  const loadBoards = async () => {
    try {
      setLoading(true);
      const boardsData = await kanbanService.getBoards(selectedInstance?.id);
      setBoards(boardsData);
      
      // Selecionar primeiro board se nenhum estiver selecionado
      if (!selectedBoardId && boardsData.length > 0) {
        onBoardSelect(boardsData[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncContacts = async () => {
    if (!selectedInstance?.id) return;

    try {
      setSyncing(true);
      await syncService.syncContacts(selectedInstance.id, { forceSync: true });
      
      // Recarregar boards após sincronização
      await loadBoards();
      
      alert('Contatos sincronizados com sucesso!');
    } catch (error) {
      console.error('Erro na sincronização:', error);
      alert('Erro ao sincronizar contatos: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateBoard = async (type) => {
    if (!selectedInstance?.id) return;

    try {
      setSyncing(true);
      let result;

      if (type === 'logistics') {
        result = await syncService.createLogisticsBoard(selectedInstance.id);
      } else if (type === 'commercial') {
        result = await syncService.createCommercialBoard(selectedInstance.id);
      }

      if (result.success) {
        await loadBoards();
        onBoardSelect(result.board.id);
        setShowCreateDialog(false);
        alert(`Board ${type === 'logistics' ? 'Logística' : 'Comercial'} criado com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao criar board:', error);
      alert('Erro ao criar board: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const getBoardIcon = (type) => {
    const icons = {
      logistics: Truck,
      commercial: DollarSign,
      support: Headphones,
      conversations: Kanban,
    };
    return icons[type] || Kanban;
  };

  const getBoardColor = (type) => {
    const colors = {
      logistics: 'bg-blue-100 text-blue-800',
      commercial: 'bg-green-100 text-green-800',
      support: 'bg-yellow-100 text-yellow-800',
      conversations: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.conversations;
  };

  const formatBoardStats = (board) => {
    const totalCards = board.columns?.reduce((sum, col) => sum + (col.cards?.length || 0), 0) || 0;
    const completedCards = board.columns?.reduce((sum, col) => {
      return sum + (col.cards?.filter(card => card.status === 'completed').length || 0);
    }, 0) || 0;

    return { totalCards, completedCards };
  };

  if (!selectedInstance) {
    return (
      <div className="text-center py-8">
        <Kanban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Selecione uma Instância WhatsApp
        </h3>
        <p className="text-gray-600">
          Escolha uma instância para visualizar os boards Kanban
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Boards Kanban</h2>
          <p className="text-gray-600">
            Instância: {selectedInstance.name}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleSyncContacts}
            disabled={syncing}
          >
            {syncing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Sincronizar
          </Button>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar Board
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Board</DialogTitle>
                <DialogDescription>
                  Escolha o tipo de board para criar automaticamente com base nas conversas
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleCreateBoard('logistics')}
                >
                  <CardHeader className="text-center">
                    <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <CardTitle className="text-lg">Logística</CardTitle>
                    <CardDescription>
                      Gestão de entregas e transporte
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleCreateBoard('commercial')}
                >
                  <CardHeader className="text-center">
                    <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <CardTitle className="text-lg">Comercial</CardTitle>
                    <CardDescription>
                      Vendas e negociações
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Seletor de board atual */}
      {boards.length > 0 && (
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Board Ativo:</label>
          <Select value={selectedBoardId} onValueChange={onBoardSelect}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecionar board" />
            </SelectTrigger>
            <SelectContent>
              {boards.map(board => {
                const Icon = getBoardIcon(board.type);
                return (
                  <SelectItem key={board.id} value={board.id}>
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{board.name}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Lista de boards */}
      {loading ? (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Carregando boards...</p>
        </div>
      ) : boards.length === 0 ? (
        <div className="text-center py-12">
          <Kanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum Board Encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            Crie seu primeiro board para começar a organizar as conversas
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Board
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map(board => {
            const Icon = getBoardIcon(board.type);
            const stats = formatBoardStats(board);
            const completionRate = stats.totalCards > 0 
              ? Math.round((stats.completedCards / stats.totalCards) * 100) 
              : 0;

            return (
              <Card 
                key={board.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedBoardId === board.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => onBoardSelect(board.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <Icon className="w-6 h-6 text-gray-700" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{board.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {board.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getBoardColor(board.type)}>
                      {board.type === 'logistics' ? 'Logística' : 
                       board.type === 'commercial' ? 'Comercial' : 
                       board.type === 'support' ? 'Suporte' : 'Geral'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Estatísticas */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {stats.totalCards}
                        </div>
                        <div className="text-sm text-gray-600">Total Cards</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {completionRate}%
                        </div>
                        <div className="text-sm text-gray-600">Concluídos</div>
                      </div>
                    </div>

                    {/* Colunas */}
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Colunas ({board.columns?.length || 0})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {board.columns?.slice(0, 3).map(column => (
                          <Badge key={column.id} variant="secondary" className="text-xs">
                            {column.name}
                          </Badge>
                        ))}
                        {board.columns?.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{board.columns.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Informações adicionais */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(board.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(board.updatedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BoardSelector;

