import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Settings, 
  Plus, 
  Maximize2, 
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  ArrowLeft
} from 'lucide-react';
import { useWhatsAppInstance } from '../../contexts/WhatsAppInstanceContext';
import { kanbanService, syncService } from '../../services/api';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import CreateCardModal from './CreateCardModal';
import BoardSelector from './BoardSelector';
import CardModal from './CardModal';
import BoardSettings from './BoardSettings';

const KanbanBoard = () => {
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [boardData, setBoardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { selectedInstance } = useWhatsAppInstance();

  // Carregar dados do board quando selecionado
  useEffect(() => {
    if (selectedBoardId) {
      loadBoardData();
    }
  }, [selectedBoardId]);

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    if (selectedBoardId && import.meta.env.VITE_KANBAN_AUTO_REFRESH === 'true') {
      const interval = setInterval(() => {
        loadBoardData(true); // Silent refresh
      }, parseInt(import.meta.env.VITE_KANBAN_REFRESH_INTERVAL) || 30000);

      return () => clearInterval(interval);
    }
  }, [selectedBoardId]);

  const loadBoardData = async (silent = false) => {
    if (!selectedBoardId) return;

    try {
      if (!silent) setLoading(true);
      setError(null);

      const board = await kanbanService.getBoardById(selectedBoardId);
      setBoardData(board);
    } catch (err) {
      console.error('Erro ao carregar board:', err);
      setError('Erro ao carregar dados do board: ' + err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination || !boardData) return;

    const { source, destination, draggableId } = result;

    // Se moveu para a mesma posição, não faz nada
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    try {
      // Atualizar localmente primeiro para UX responsiva
      const newBoardData = { ...boardData };
      const sourceColumn = newBoardData.columns.find(col => col.id === source.droppableId);
      const destColumn = newBoardData.columns.find(col => col.id === destination.droppableId);
      
      const [movedCard] = sourceColumn.cards.splice(source.index, 1);
      destColumn.cards.splice(destination.index, 0, movedCard);

      setBoardData(newBoardData);

      // Fazer a chamada para a API
      await kanbanService.moveCard(draggableId, destination.droppableId, destination.index);
      
      // Recarregar dados para garantir sincronização
      await loadBoardData(true);
    } catch (err) {
      console.error('Erro ao mover card:', err);
      // Reverter mudança local em caso de erro
      await loadBoardData(true);
      alert('Erro ao mover card: ' + err.message);
    }
  };

  const handleCreateCard = async (cardData) => {
    try {
      await kanbanService.createCard({
        ...cardData,
        columnId: boardData.columns[0]?.id, // Primeira coluna por padrão
      });
      
      await loadBoardData(true);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Erro ao criar card:', err);
      alert('Erro ao criar card: ' + err.message);
    }
  };

  const handleCardClick = async (cardId) => {
    try {
      const card = await kanbanService.getCardById(cardId);
      setSelectedCard(card);
      setShowCardModal(true);
    } catch (err) {
      console.error('Erro ao carregar card:', err);
      alert('Erro ao carregar detalhes do card: ' + err.message);
    }
  };

  const handleUpdateCard = async (cardId, cardData) => {
    try {
      await kanbanService.updateCard(cardId, cardData);
      await loadBoardData(true);
      setShowCardModal(false);
    } catch (err) {
      console.error('Erro ao atualizar card:', err);
      alert('Erro ao atualizar card: ' + err.message);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!confirm('Tem certeza que deseja excluir este card?')) return;

    try {
      await kanbanService.deleteCard(cardId);
      await loadBoardData(true);
      setShowCardModal(false);
    } catch (err) {
      console.error('Erro ao excluir card:', err);
      alert('Erro ao excluir card: ' + err.message);
    }
  };

  const handleRefresh = async () => {
    await loadBoardData();
  };

  const handleSyncWithMaytapi = async () => {
    if (!selectedInstance?.id) {
      alert('Selecione uma instância WhatsApp primeiro');
      return;
    }

    try {
      setLoading(true);
      await syncService.syncContacts(selectedInstance.id, { forceSync: true });
      await loadBoardData();
      alert('Sincronização concluída com sucesso!');
    } catch (err) {
      console.error('Erro na sincronização:', err);
      alert('Erro na sincronização: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar cards baseado na busca e filtros
  const getFilteredCards = (cards) => {
    if (!cards) return [];

    return cards.filter(card => {
      const matchesSearch = !searchTerm || 
        card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPriority = filterPriority === 'all' || card.priority === filterPriority;

      return matchesSearch && matchesPriority;
    });
  };

  // Calcular estatísticas do board
  const getBoardStats = () => {
    if (!boardData?.columns) return { total: 0, completed: 0, overdue: 0 };

    const allCards = boardData.columns.flatMap(col => col.cards || []);
    const total = allCards.length;
    const completed = allCards.filter(card => card.status === 'completed').length;
    const overdue = allCards.filter(card => {
      return card.dueDate && new Date(card.dueDate) < new Date() && card.status !== 'completed';
    }).length;

    return { total, completed, overdue };
  };

  const stats = getBoardStats();

  // Se não há board selecionado, mostrar BoardSelector
  if (!selectedBoardId) {
    return (
      <div className="h-full">
        <BoardSelector
          selectedBoardId={selectedBoardId}
          onBoardSelect={setSelectedBoardId}
          onCreateBoard={() => {}}
        />
      </div>
    );
  }

  if (loading && !boardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Carregando board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!boardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Board não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Header do Board */}
      <div className="flex-shrink-0 border-b bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedBoardId(null)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{boardData.name}</h1>
              <p className="text-gray-600">{boardData.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncWithMaytapi}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Sincronizar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsModal(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="flex items-center space-x-6 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              Total: <span className="font-medium">{stats.total}</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">
              Concluídos: <span className="font-medium">{stats.completed}</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-red-500" />
            <span className="text-sm text-gray-600">
              Atrasados: <span className="font-medium">{stats.overdue}</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Instância: <span className="font-medium">{selectedInstance?.name}</span>
            </span>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todas as prioridades</option>
              <option value="urgent">Urgente</option>
              <option value="high">Alta</option>
              <option value="normal">Normal</option>
              <option value="low">Baixa</option>
            </select>
          </div>

          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Card
          </Button>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="h-full overflow-x-auto">
            <div className="flex space-x-6 p-6 h-full min-w-max">
              {boardData.columns?.map((column) => (
                <div key={column.id} className="flex-shrink-0 w-80">
                  <KanbanColumn
                    column={column}
                    cards={getFilteredCards(column.cards || [])}
                    onCardClick={handleCardClick}
                    onCreateCard={() => setShowCreateModal(true)}
                  />
                </div>
              ))}
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* Modais */}
      {showCreateModal && (
        <CreateCardModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCard}
          columns={boardData.columns || []}
        />
      )}

      {showCardModal && selectedCard && (
        <CardModal
          isOpen={showCardModal}
          onClose={() => setShowCardModal(false)}
          card={selectedCard}
          onUpdate={handleUpdateCard}
          onDelete={handleDeleteCard}
          columns={boardData.columns || []}
        />
      )}

      {showSettingsModal && (
        <BoardSettings
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          board={boardData}
          onUpdate={(boardData) => {
            setBoardData({ ...boardData, ...boardData });
            setShowSettingsModal(false);
          }}
        />
      )}
    </div>
  );
};

export default KanbanBoard;

