import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Search, 
  Filter, 
  Settings, 
  Users, 
  MoreVertical,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RefreshCw,
  Download,
  Upload,
  Star,
  Archive,
  Trash2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import BoardSettings from './BoardSettings';
import CardModal from './CardModal';
import { useWhatsAppInstance } from '../../contexts/WhatsAppInstanceContext';

const KanbanBoard = ({ boardId, onBack }) => {
  const { fetchWithInstance } = useWhatsAppInstance();
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    assignee: '',
    priority: '',
    labels: [],
    dueDate: '',
    status: ''
  });
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const boardRef = useRef(null);

  // Dados de teste para desenvolvimento
  const getMockBoard = () => ({
    id: boardId || 'board-1',
    name: 'Gestão de Conversas WhatsApp',
    description: 'Board para gerenciar conversas e atendimentos',
    type: 'conversations',
    status: 'active',
    settings: {
      autoAssignCards: true,
      enableTimeTracking: true,
      maxCardsPerColumn: 20,
      cardStyle: 'detailed'
    },
    appearance: {
      backgroundColor: '#f8fafc',
      cardStyle: 'detailed',
      showAssignees: true,
      showDueDates: true,
      showPriority: true
    },
    totalCards: 15,
    completedCards: 8,
    overdueCards: 2
  });

  const getMockColumns = () => [
    {
      id: 'col-1',
      name: 'Novas Conversas',
      type: 'todo',
      position: 0,
      color: '#3B82F6',
      cardCount: 5,
      settings: { maxCards: 10, wipLimit: 8 }
    },
    {
      id: 'col-2', 
      name: 'Em Atendimento',
      type: 'in_progress',
      position: 1,
      color: '#F59E0B',
      cardCount: 4,
      settings: { maxCards: 8, wipLimit: 6 }
    },
    {
      id: 'col-3',
      name: 'Aguardando Cliente',
      type: 'review',
      position: 2,
      color: '#8B5CF6',
      cardCount: 3,
      settings: { maxCards: 15, wipLimit: 10 }
    },
    {
      id: 'col-4',
      name: 'Resolvidas',
      type: 'done',
      position: 3,
      color: '#10B981',
      cardCount: 3,
      settings: { maxCards: 50 }
    }
  ];

  const getMockCards = () => [
    // Novas Conversas
    {
      id: 'card-1',
      columnId: 'col-1',
      title: 'João Silva - Cotação Soja',
      description: 'Cliente solicitando cotação para 1000 sacas de soja',
      type: 'conversation',
      priority: 'high',
      position: 0,
      conversationId: 'conv-1',
      contactName: 'João Silva',
      contactPhone: '+5511999999999',
      assigneeId: null,
      labels: ['cotação', 'soja'],
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      urgent: true
    },
    {
      id: 'card-2',
      columnId: 'col-1',
      title: 'Maria Santos - Logística',
      description: 'Dúvidas sobre transporte de milho para SP',
      type: 'conversation',
      priority: 'normal',
      position: 1,
      conversationId: 'conv-2',
      contactName: 'Maria Santos',
      contactPhone: '+5511888888888',
      assigneeId: null,
      labels: ['logística', 'milho'],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    // Em Atendimento
    {
      id: 'card-3',
      columnId: 'col-2',
      title: 'Pedro Costa - Negociação',
      description: 'Negociando preços para entrega em março',
      type: 'conversation',
      priority: 'high',
      position: 0,
      conversationId: 'conv-3',
      contactName: 'Pedro Costa',
      contactPhone: '+5511777777777',
      assigneeId: 'user-1',
      assigneeName: 'Carlos Oliveira',
      labels: ['negociação', 'preços'],
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      timeInColumn: 2.5
    },
    // Aguardando Cliente
    {
      id: 'card-4',
      columnId: 'col-3',
      title: 'Ana Ferreira - Documentação',
      description: 'Aguardando envio de documentos para finalizar',
      type: 'conversation',
      priority: 'normal',
      position: 0,
      conversationId: 'conv-4',
      contactName: 'Ana Ferreira',
      contactPhone: '+5511666666666',
      assigneeId: 'user-2',
      assigneeName: 'Lucia Santos',
      labels: ['documentação'],
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      timeInColumn: 6.0
    },
    // Resolvidas
    {
      id: 'card-5',
      columnId: 'col-4',
      title: 'Roberto Lima - Entrega Concluída',
      description: 'Entrega realizada com sucesso',
      type: 'conversation',
      priority: 'normal',
      position: 0,
      conversationId: 'conv-5',
      contactName: 'Roberto Lima',
      contactPhone: '+5511555555555',
      assigneeId: 'user-1',
      assigneeName: 'Carlos Oliveira',
      labels: ['entrega', 'concluído'],
      status: 'completed',
      completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      customerRating: 5,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
    }
  ];

  // Carregar dados do board
  const loadBoard = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implementar chamada real para API
      // const response = await fetchWithInstance(`/kanban/boards/${boardId}`);
      
      // Por enquanto usar dados mock
      setBoard(getMockBoard());
      setColumns(getMockColumns());
      setCards(getMockCards());

    } catch (err) {
      console.error('Erro ao carregar board:', err);
      setError('Erro ao carregar board');
      
      // Fallback para dados mock
      setBoard(getMockBoard());
      setColumns(getMockColumns());
      setCards(getMockCards());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoard();
  }, [boardId]);

  // Filtrar cards baseado na busca e filtros
  const getFilteredCards = () => {
    return cards.filter(card => {
      // Filtro de busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          card.title.toLowerCase().includes(searchLower) ||
          card.description?.toLowerCase().includes(searchLower) ||
          card.contactName?.toLowerCase().includes(searchLower) ||
          card.labels?.some(label => label.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Filtros específicos
      if (selectedFilters.assignee && card.assigneeId !== selectedFilters.assignee) {
        return false;
      }

      if (selectedFilters.priority && card.priority !== selectedFilters.priority) {
        return false;
      }

      if (selectedFilters.status && card.status !== selectedFilters.status) {
        return false;
      }

      if (selectedFilters.labels.length > 0) {
        const hasMatchingLabel = selectedFilters.labels.some(filterLabel =>
          card.labels?.includes(filterLabel)
        );
        if (!hasMatchingLabel) return false;
      }

      return true;
    });
  };

  // Drag and Drop
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      // Atualizar estado local imediatamente
      const newCards = Array.from(cards);
      const draggedCard = newCards.find(card => card.id === draggableId);
      
      if (!draggedCard) return;

      // Remover card da posição original
      const sourceCards = newCards.filter(card => 
        card.columnId === source.droppableId && card.id !== draggableId
      );
      
      // Reordenar cards na coluna de origem
      sourceCards.forEach((card, index) => {
        if (index >= source.index) {
          card.position = index;
        }
      });

      // Atualizar card movido
      draggedCard.columnId = destination.droppableId;
      draggedCard.position = destination.index;
      draggedCard.movedToColumnAt = new Date();

      // Reordenar cards na coluna de destino
      const destCards = newCards.filter(card => 
        card.columnId === destination.droppableId && card.id !== draggableId
      );
      
      destCards.forEach((card, index) => {
        if (index >= destination.index) {
          card.position = index + 1;
        }
      });

      setCards(newCards);

      // TODO: Enviar para API
      // await fetchWithInstance(`/kanban/cards/${draggableId}/move`, {
      //   method: 'PUT',
      //   body: JSON.stringify({
      //     columnId: destination.droppableId,
      //     position: destination.index
      //   })
      // });

      console.log('Card movido:', {
        cardId: draggableId,
        from: source.droppableId,
        to: destination.droppableId,
        position: destination.index
      });

    } catch (err) {
      console.error('Erro ao mover card:', err);
      // Reverter mudanças em caso de erro
      loadBoard();
    }
  };

  // Criar novo card
  const handleCreateCard = async (columnId, cardData) => {
    try {
      const newCard = {
        id: `card-${Date.now()}`,
        columnId,
        position: cards.filter(c => c.columnId === columnId).length,
        createdAt: new Date(),
        ...cardData
      };

      setCards(prev => [...prev, newCard]);

      // TODO: Enviar para API
      // const response = await fetchWithInstance('/kanban/cards', {
      //   method: 'POST',
      //   body: JSON.stringify(newCard)
      // });

      console.log('Card criado:', newCard);

    } catch (err) {
      console.error('Erro ao criar card:', err);
    }
  };

  // Abrir modal do card
  const handleCardClick = (card) => {
    setSelectedCard(card);
    setShowCardModal(true);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      boardRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Toggle visibilidade da coluna
  const toggleColumnVisibility = (columnId) => {
    setHiddenColumns(prev => 
      prev.includes(columnId) 
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Carregando board...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const filteredCards = getFilteredCards();
  const visibleColumns = columns.filter(col => !hiddenColumns.includes(col.id));

  return (
    <div ref={boardRef} className="h-full flex flex-col bg-gray-50">
      {/* Header do Board */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{board?.name}</h1>
              {board?.description && (
                <p className="text-sm text-gray-600">{board.description}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {board?.totalCards} cards
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {board?.completedCards} concluídos
              </Badge>
              {board?.overdueCards > 0 && (
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  {board.overdueCards} atrasados
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Botões de ação */}
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Membros
            </Button>

            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <ScrollArea className="h-full">
            <div className="flex space-x-4 p-4 min-w-max">
              {visibleColumns.map(column => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  cards={filteredCards.filter(card => card.columnId === column.id)}
                  onCardClick={handleCardClick}
                  onCreateCard={handleCreateCard}
                  onToggleVisibility={() => toggleColumnVisibility(column.id)}
                />
              ))}
              
              {/* Botão para adicionar coluna */}
              <div className="w-80 flex-shrink-0">
                <Button 
                  variant="outline" 
                  className="w-full h-12 border-dashed border-2 border-gray-300 hover:border-gray-400"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Coluna
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DragDropContext>
      </div>

      {/* Modals */}
      {showSettings && (
        <BoardSettings
          board={board}
          onClose={() => setShowSettings(false)}
          onSave={(updatedBoard) => {
            setBoard(updatedBoard);
            setShowSettings(false);
          }}
        />
      )}

      {showCardModal && selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => {
            setShowCardModal(false);
            setSelectedCard(null);
          }}
          onSave={(updatedCard) => {
            setCards(prev => prev.map(card => 
              card.id === updatedCard.id ? updatedCard : card
            ));
            setShowCardModal(false);
            setSelectedCard(null);
          }}
        />
      )}
    </div>
  );
};

export default KanbanBoard;

