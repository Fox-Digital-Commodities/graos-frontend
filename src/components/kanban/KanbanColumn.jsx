import { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  MoreVertical, 
  Eye, 
  EyeOff, 
  Settings,
  AlertTriangle,
  Clock,
  Users,
  TrendingUp,
  Zap
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import KanbanCard from './KanbanCard';
import CreateCardModal from './CreateCardModal';

const KanbanColumn = ({ 
  column, 
  cards, 
  onCardClick, 
  onCreateCard, 
  onToggleVisibility 
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Ordenar cards por posição
  const sortedCards = [...cards].sort((a, b) => a.position - b.position);

  // Calcular estatísticas da coluna
  const getColumnStats = () => {
    const total = cards.length;
    const overdue = cards.filter(card => 
      card.dueDate && new Date(card.dueDate) < new Date() && card.status !== 'completed'
    ).length;
    const urgent = cards.filter(card => card.urgent || card.priority === 'urgent').length;
    const avgTimeInColumn = cards.reduce((sum, card) => sum + (card.timeInColumn || 0), 0) / total || 0;

    return { total, overdue, urgent, avgTimeInColumn };
  };

  const stats = getColumnStats();

  // Verificar se está no limite WIP
  const isAtWipLimit = column.settings?.wipLimit && cards.length >= column.settings.wipLimit;
  const isNearWipLimit = column.settings?.wipLimit && cards.length >= column.settings.wipLimit * 0.8;

  // Cores baseadas no tipo da coluna
  const getColumnColor = () => {
    switch (column.type) {
      case 'todo':
        return 'border-blue-200 bg-blue-50';
      case 'in_progress':
        return 'border-yellow-200 bg-yellow-50';
      case 'review':
        return 'border-purple-200 bg-purple-50';
      case 'done':
        return 'border-green-200 bg-green-50';
      case 'archived':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getHeaderColor = () => {
    return column.color || '#6B7280';
  };

  const handleCreateCard = (cardData) => {
    onCreateCard(column.id, cardData);
    setShowCreateModal(false);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 flex-shrink-0">
        <Card className="h-full">
          <CardContent className="p-2">
            <div className="flex flex-col items-center space-y-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: getHeaderColor() }}
              >
                {cards.length}
              </div>
              <div 
                className="writing-mode-vertical text-sm font-medium cursor-pointer"
                onClick={() => setIsCollapsed(false)}
              >
                {column.name}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-80 flex-shrink-0">
      <Card className={`h-full ${getColumnColor()}`}>
        {/* Header da Coluna */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getHeaderColor() }}
              />
              <CardTitle className="text-sm font-medium text-gray-900">
                {column.name}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {cards.length}
                {column.settings?.maxCards && ` / ${column.settings.maxCards}`}
              </Badge>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsCollapsed(true)}>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Recolher
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleVisibility}>
                  <Eye className="w-4 h-4 mr-2" />
                  Ocultar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Estatísticas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Indicadores de Status */}
          <div className="flex items-center space-x-2 mt-2">
            {isAtWipLimit && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Limite WIP
              </Badge>
            )}
            {isNearWipLimit && !isAtWipLimit && (
              <Badge variant="outline" className="text-xs text-yellow-700 border-yellow-300">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Próximo ao limite
              </Badge>
            )}
            {stats.overdue > 0 && (
              <Badge variant="destructive" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {stats.overdue} atrasados
              </Badge>
            )}
            {stats.urgent > 0 && (
              <Badge variant="outline" className="text-xs text-red-700 border-red-300">
                <Zap className="w-3 h-3 mr-1" />
                {stats.urgent} urgentes
              </Badge>
            )}
          </div>

          {/* Estatísticas Rápidas */}
          {stats.avgTimeInColumn > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              Tempo médio: {stats.avgTimeInColumn.toFixed(1)}h
            </div>
          )}
        </CardHeader>

        {/* Lista de Cards */}
        <CardContent className="pt-0 pb-2 px-3">
          <Droppable droppableId={column.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[200px] space-y-2 ${
                  snapshot.isDraggingOver ? 'bg-blue-100 rounded-lg' : ''
                }`}
              >
                <ScrollArea className="max-h-[calc(100vh-300px)]">
                  <div className="space-y-2 pr-2">
                    {sortedCards.map((card, index) => (
                      <Draggable 
                        key={card.id} 
                        draggableId={card.id} 
                        index={index}
                        isDragDisabled={isAtWipLimit && card.columnId !== column.id}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${
                              snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                            }`}
                          >
                            <KanbanCard 
                              card={card} 
                              onClick={() => onCardClick(card)}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                </ScrollArea>
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Botão Adicionar Card */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 border-dashed border-2 border-gray-300 hover:border-gray-400 h-10"
            onClick={() => setShowCreateModal(true)}
            disabled={isAtWipLimit}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isAtWipLimit ? 'Limite atingido' : 'Adicionar card'}
          </Button>
        </CardContent>
      </Card>

      {/* Modal de Criação */}
      {showCreateModal && (
        <CreateCardModal
          columnId={column.id}
          columnName={column.name}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateCard}
        />
      )}
    </div>
  );
};

export default KanbanColumn;

