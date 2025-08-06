import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon, 
  X, 
  Plus,
  User,
  MessageCircle,
  Phone,
  Tag,
  Clock,
  Star,
  Paperclip,
  Send,
  Edit3,
  Save,
  MoreVertical,
  CheckCircle2,
  Circle,
  Trash2,
  Archive,
  AlertTriangle,
  Timer,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CardModal = ({ card, onClose, onSave }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(card);
  const [newComment, setNewComment] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  // Mock de atividades
  const [activities] = useState([
    {
      id: 'act-1',
      type: 'created',
      userId: 'user-1',
      userName: 'Carlos Oliveira',
      description: 'criou este card',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      icon: '➕',
      color: '#10B981'
    },
    {
      id: 'act-2',
      type: 'assigned',
      userId: 'user-1',
      userName: 'Carlos Oliveira',
      description: 'atribuiu para si mesmo',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      icon: '👤',
      color: '#8B5CF6'
    },
    {
      id: 'act-3',
      type: 'message_received',
      userId: 'system',
      userName: 'Sistema',
      description: `recebeu mensagem de ${card.contactName}`,
      data: { messageText: 'Olá, gostaria de uma cotação para soja.' },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: '📨',
      color: '#10B981'
    },
    {
      id: 'act-4',
      type: 'commented',
      userId: 'user-1',
      userName: 'Carlos Oliveira',
      description: 'adicionou um comentário',
      data: { comment: 'Cliente interessado em 1000 sacas. Verificar disponibilidade no estoque.' },
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      icon: '💬',
      color: '#3B82F6'
    }
  ]);

  const [comments] = useState([
    {
      id: 'comment-1',
      userId: 'user-1',
      userName: 'Carlos Oliveira',
      text: 'Cliente interessado em 1000 sacas. Verificar disponibilidade no estoque.',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      id: 'comment-2',
      userId: 'user-2',
      userName: 'Lucia Santos',
      text: 'Estoque disponível. Preço atual: R$ 85,00/saca',
      createdAt: new Date(Date.now() - 30 * 60 * 1000)
    }
  ]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    setEditMode(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    // TODO: Implementar adição de comentário
    console.log('Novo comentário:', newComment);
    setNewComment('');
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    
    const newItem = {
      id: `item-${Date.now()}`,
      text: newChecklistItem,
      completed: false
    };
    
    const updatedChecklist = [...(formData.checklist || []), newItem];
    handleInputChange('checklist', updatedChecklist);
    setNewChecklistItem('');
  };

  const handleToggleChecklistItem = (itemId) => {
    const updatedChecklist = formData.checklist?.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    handleInputChange('checklist', updatedChecklist);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    return 'Agora';
  };

  const getProgressPercentage = () => {
    if (!formData.checklist || formData.checklist.length === 0) return 0;
    const completed = formData.checklist.filter(item => item.completed).length;
    return Math.round((completed / formData.checklist.length) * 100);
  };

  const tabs = [
    { id: 'details', label: 'Detalhes', icon: Edit3 },
    { id: 'activity', label: 'Atividade', icon: Clock },
    { id: 'comments', label: 'Comentários', icon: MessageCircle }
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {editMode ? (
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="text-xl font-semibold"
                />
              ) : (
                formData.title
              )}
            </DialogTitle>
            
            <div className="flex items-center space-x-2">
              {editMode ? (
                <>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </div>
          
          {/* Informações básicas */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>#{formData.id}</span>
            <span>•</span>
            <span>Criado {formatTimeAgo(formData.createdAt)}</span>
            {formData.timeInColumn && (
              <>
                <span>•</span>
                <span>{formData.timeInColumn.toFixed(1)}h nesta coluna</span>
              </>
            )}
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {activeTab === 'details' && (
                <div className="grid grid-cols-3 gap-6">
                  {/* Coluna principal */}
                  <div className="col-span-2 space-y-6">
                    {/* Descrição */}
                    <div>
                      <Label>Descrição</Label>
                      {editMode ? (
                        <Textarea
                          value={formData.description || ''}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          rows={4}
                          className="mt-2"
                        />
                      ) : (
                        <p className="mt-2 text-gray-700">
                          {formData.description || 'Nenhuma descrição'}
                        </p>
                      )}
                    </div>

                    {/* Informações do contato */}
                    {formData.contactName && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-3">Informações do Contato</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Nome</Label>
                            <p className="text-sm text-gray-700">{formData.contactName}</p>
                          </div>
                          {formData.contactPhone && (
                            <div>
                              <Label>Telefone</Label>
                              <p className="text-sm text-gray-700">{formData.contactPhone}</p>
                            </div>
                          )}
                        </div>
                        {formData.conversationId && (
                          <div className="mt-3">
                            <Button size="sm" variant="outline">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Abrir Conversa
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Checklist */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label>Checklist</Label>
                        {formData.checklist && formData.checklist.length > 0 && (
                          <span className="text-sm text-gray-600">
                            {getProgressPercentage()}% concluído
                          </span>
                        )}
                      </div>
                      
                      {formData.checklist && formData.checklist.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {formData.checklist.map(item => (
                            <div key={item.id} className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleChecklistItem(item.id)}
                                className="flex-shrink-0"
                              >
                                {item.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                              <span className={`text-sm ${
                                item.completed ? 'line-through text-gray-500' : 'text-gray-700'
                              }`}>
                                {item.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Adicionar item..."
                          value={newChecklistItem}
                          onChange={(e) => setNewChecklistItem(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                        />
                        <Button size="sm" onClick={handleAddChecklistItem}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Avaliação do cliente */}
                    {formData.customerRating && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-medium text-yellow-900 mb-2">Avaliação do Cliente</h4>
                        <div className="flex items-center space-x-2 mb-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star}
                              className={`w-4 h-4 ${
                                star <= formData.customerRating 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600">
                            ({formData.customerRating}/5)
                          </span>
                        </div>
                        {formData.customerFeedback && (
                          <p className="text-sm text-gray-700">{formData.customerFeedback}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4">
                    {/* Status */}
                    <div>
                      <Label>Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => handleInputChange('status', value)}
                        disabled={!editMode}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="on_hold">Em espera</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Prioridade */}
                    <div>
                      <Label>Prioridade</Label>
                      <Select 
                        value={formData.priority} 
                        onValueChange={(value) => handleInputChange('priority', value)}
                        disabled={!editMode}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Responsável */}
                    <div>
                      <Label>Responsável</Label>
                      <div className="mt-2 flex items-center space-x-2">
                        {formData.assigneeId ? (
                          <>
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {formData.assigneeName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{formData.assigneeName}</span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Não atribuído</span>
                        )}
                      </div>
                    </div>

                    {/* Data de vencimento */}
                    <div>
                      <Label>Vencimento</Label>
                      <div className="mt-2">
                        {formData.dueDate ? (
                          <div className={`text-sm ${
                            new Date(formData.dueDate) < new Date() ? 'text-red-600' : 'text-gray-700'
                          }`}>
                            {format(new Date(formData.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Sem prazo</span>
                        )}
                      </div>
                    </div>

                    {/* Labels */}
                    <div>
                      <Label>Labels</Label>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {formData.labels?.map((label, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Estimativa */}
                    {formData.estimatedHours && (
                      <div>
                        <Label>Estimativa</Label>
                        <p className="mt-2 text-sm text-gray-700">
                          {formData.estimatedHours}h estimadas
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {activities.map(activity => (
                    <div key={activity.id} className="flex space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                        style={{ backgroundColor: activity.color }}
                      >
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{activity.userName}</span>
                          <span className="text-sm text-gray-600">{activity.description}</span>
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(activity.createdAt)}
                          </span>
                        </div>
                        {activity.data?.messageText && (
                          <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                            "{activity.data.messageText}"
                          </div>
                        )}
                        {activity.data?.comment && (
                          <div className="mt-1 p-2 bg-blue-50 rounded text-sm">
                            {activity.data.comment}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {/* Comentários existentes */}
                  <div className="space-y-4">
                    {comments.map(comment => (
                      <div key={comment.id} className="flex space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {comment.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{comment.userName}</span>
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Novo comentário */}
                  <div className="border-t pt-4">
                    <div className="flex space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder="Adicionar comentário..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                        />
                        <Button size="sm" onClick={handleAddComment}>
                          <Send className="w-4 h-4 mr-2" />
                          Comentar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardModal;

