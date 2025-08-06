import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  MessageCircle, 
  Paperclip, 
  AlertTriangle,
  Star,
  CheckCircle2,
  Circle,
  User,
  Calendar,
  Zap,
  Phone,
  Timer,
  Eye,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const KanbanCard = ({ card, onClick, isDragging }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Verificar se o card está atrasado
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && card.status !== 'completed';
  
  // Verificar se está próximo do prazo (24h)
  const isDueSoon = card.dueDate && 
    new Date(card.dueDate) > new Date() && 
    new Date(card.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Cor da prioridade
  const getPriorityColor = () => {
    switch (card.priority) {
      case 'urgent':
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'normal':
        return 'bg-blue-500';
      case 'low':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  // Cor da label
  const getLabelColor = (label) => {
    const colors = {
      'cotação': 'bg-blue-100 text-blue-800',
      'soja': 'bg-green-100 text-green-800',
      'milho': 'bg-yellow-100 text-yellow-800',
      'logística': 'bg-purple-100 text-purple-800',
      'negociação': 'bg-orange-100 text-orange-800',
      'preços': 'bg-red-100 text-red-800',
      'documentação': 'bg-gray-100 text-gray-800',
      'entrega': 'bg-indigo-100 text-indigo-800',
      'concluído': 'bg-green-100 text-green-800'
    };
    return colors[label] || 'bg-gray-100 text-gray-800';
  };

  // Formatação de tempo
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    return 'Agora';
  };

  const formatDueDate = (date) => {
    const dueDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dueDate.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    } else {
      return dueDate.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  // Progresso do checklist (simulado)
  const getChecklistProgress = () => {
    if (!card.checklist) return null;
    const completed = card.checklist.filter(item => item.completed).length;
    const total = card.checklist.length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const checklistProgress = getChecklistProgress();

  return (
    <Card 
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-md
        ${isDragging ? 'shadow-lg rotate-2' : ''}
        ${isOverdue ? 'border-red-300 bg-red-50' : ''}
        ${card.urgent ? 'border-orange-300' : ''}
        ${card.starred ? 'border-yellow-300' : ''}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-3">
        {/* Header do Card */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            {/* Indicador de prioridade */}
            <div className={`w-1 h-4 rounded-full ${getPriorityColor()}`} />
            
            {/* Tipo de conversa */}
            {card.type === 'conversation' && (
              <MessageCircle className="w-4 h-4 text-blue-500" />
            )}
            
            {/* Indicadores especiais */}
            {card.urgent && <Zap className="w-4 h-4 text-orange-500" />}
            {card.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
            {card.status === 'completed' && (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
          </div>

          {/* Menu de ações */}
          {isHovered && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Atribuir
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="w-4 h-4 mr-2" />
                  {card.starred ? 'Remover favorito' : 'Favoritar'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Phone className="w-4 h-4 mr-2" />
                  Abrir conversa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Título */}
        <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
          {card.title}
        </h3>

        {/* Descrição */}
        {card.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {card.description}
          </p>
        )}

        {/* Informações do contato */}
        {card.contactName && (
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600">{card.contactName}</span>
            {card.contactPhone && (
              <span className="text-xs text-gray-400">
                {card.contactPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
              </span>
            )}
          </div>
        )}

        {/* Labels */}
        {card.labels && card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {card.labels.slice(0, 3).map((label, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className={`text-xs px-2 py-0.5 ${getLabelColor(label)}`}
              >
                {label}
              </Badge>
            ))}
            {card.labels.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                +{card.labels.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Progresso do checklist */}
        {checklistProgress && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Checklist</span>
              <span>{checklistProgress.completed}/{checklistProgress.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${checklistProgress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer do Card */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            {/* Data de vencimento */}
            {card.dueDate && (
              <div className={`flex items-center space-x-1 ${
                isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : ''
              }`}>
                <Calendar className="w-3 h-3" />
                <span>{formatDueDate(card.dueDate)}</span>
              </div>
            )}

            {/* Tempo na coluna */}
            {card.timeInColumn && card.timeInColumn > 0 && (
              <div className="flex items-center space-x-1">
                <Timer className="w-3 h-3" />
                <span>{card.timeInColumn.toFixed(1)}h</span>
              </div>
            )}

            {/* Anexos */}
            {card.attachments && card.attachments.length > 0 && (
              <div className="flex items-center space-x-1">
                <Paperclip className="w-3 h-3" />
                <span>{card.attachments.length}</span>
              </div>
            )}

            {/* Comentários */}
            {card.commentCount > 0 && (
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>{card.commentCount}</span>
              </div>
            )}
          </div>

          {/* Assignee */}
          {card.assigneeId && (
            <div className="flex items-center space-x-1">
              <Avatar className="w-5 h-5">
                <AvatarImage src={card.assigneeAvatar} />
                <AvatarFallback className="text-xs">
                  {card.assigneeName ? card.assigneeName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        {/* Indicadores de alerta */}
        {(isOverdue || card.blocked) && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            {isOverdue && (
              <div className="flex items-center space-x-1 text-red-600 text-xs">
                <AlertTriangle className="w-3 h-3" />
                <span>Atrasado</span>
              </div>
            )}
            {card.blocked && (
              <div className="flex items-center space-x-1 text-orange-600 text-xs">
                <AlertTriangle className="w-3 h-3" />
                <span>Bloqueado: {card.blockedReason}</span>
              </div>
            )}
          </div>
        )}

        {/* Rating do cliente */}
        {card.customerRating && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-600">Avaliação:</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star}
                    className={`w-3 h-3 ${
                      star <= card.customerRating 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="mt-2 text-xs text-gray-400">
          {formatTimeAgo(card.createdAt)}
        </div>
      </CardContent>
    </Card>
  );
};

export default KanbanCard;

