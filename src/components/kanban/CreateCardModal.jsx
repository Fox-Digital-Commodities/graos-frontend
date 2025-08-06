import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Tag
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CreateCardModal = ({ columnId, columnName, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'conversation',
    priority: 'normal',
    assigneeId: '',
    conversationId: '',
    contactName: '',
    contactPhone: '',
    labels: [],
    dueDate: null,
    estimatedHours: '',
    notes: ''
  });

  const [newLabel, setNewLabel] = useState('');
  const [errors, setErrors] = useState({});

  // Opções disponíveis
  const cardTypes = [
    { value: 'conversation', label: 'Conversa WhatsApp', icon: MessageCircle },
    { value: 'task', label: 'Tarefa', icon: User },
    { value: 'lead', label: 'Lead', icon: User },
    { value: 'support', label: 'Suporte', icon: Phone }
  ];

  const priorities = [
    { value: 'low', label: 'Baixa', color: 'bg-gray-400' },
    { value: 'normal', label: 'Normal', color: 'bg-blue-500' },
    { value: 'high', label: 'Alta', color: 'bg-orange-500' },
    { value: 'urgent', label: 'Urgente', color: 'bg-red-500' }
  ];

  // Mock de usuários disponíveis
  const availableUsers = [
    { id: 'user-1', name: 'Carlos Oliveira', avatar: null },
    { id: 'user-2', name: 'Lucia Santos', avatar: null },
    { id: 'user-3', name: 'Roberto Silva', avatar: null }
  ];

  // Labels predefinidas
  const predefinedLabels = [
    'cotação', 'soja', 'milho', 'logística', 'negociação', 
    'preços', 'documentação', 'entrega', 'urgente', 'cliente-vip'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, newLabel.trim()]
      }));
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }));
  };

  const handlePredefinedLabel = (label) => {
    if (!formData.labels.includes(label)) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, label]
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (formData.type === 'conversation' && !formData.contactName.trim()) {
      newErrors.contactName = 'Nome do contato é obrigatório para conversas';
    }

    if (formData.contactPhone && !/^\+?[\d\s\-\(\)]+$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Formato de telefone inválido';
    }

    if (formData.estimatedHours && (isNaN(formData.estimatedHours) || formData.estimatedHours <= 0)) {
      newErrors.estimatedHours = 'Estimativa deve ser um número positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const cardData = {
      ...formData,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
      urgent: formData.priority === 'urgent',
      status: 'active'
    };

    onSave(cardData);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Criar Card em "{columnName}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6" onKeyPress={handleKeyPress}>
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: João Silva - Cotação Soja"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva os detalhes do card..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Tipo e Prioridade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cardTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${priority.color}`} />
                        <span>{priority.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Informações do Contato (se for conversa) */}
          {formData.type === 'conversation' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Informações do Contato</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Nome do Contato *</Label>
                  <Input
                    id="contactName"
                    placeholder="Ex: João Silva"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    className={errors.contactName ? 'border-red-500' : ''}
                  />
                  {errors.contactName && (
                    <p className="text-sm text-red-600">{errors.contactName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Telefone</Label>
                  <Input
                    id="contactPhone"
                    placeholder="Ex: +55 11 99999-9999"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    className={errors.contactPhone ? 'border-red-500' : ''}
                  />
                  {errors.contactPhone && (
                    <p className="text-sm text-red-600">{errors.contactPhone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conversationId">ID da Conversa</Label>
                <Input
                  id="conversationId"
                  placeholder="Ex: 5511999999999@c.us"
                  value={formData.conversationId}
                  onChange={(e) => handleInputChange('conversationId', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Atribuição e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select 
                value={formData.assigneeId} 
                onValueChange={(value) => handleInputChange('assigneeId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Não atribuído</SelectItem>
                  {availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? (
                      format(formData.dueDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecionar data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => handleInputChange('dueDate', date)}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Estimativa de Horas */}
          <div className="space-y-2">
            <Label htmlFor="estimatedHours">Estimativa (horas)</Label>
            <Input
              id="estimatedHours"
              type="number"
              step="0.5"
              min="0"
              placeholder="Ex: 2.5"
              value={formData.estimatedHours}
              onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
              className={errors.estimatedHours ? 'border-red-500' : ''}
            />
            {errors.estimatedHours && (
              <p className="text-sm text-red-600">{errors.estimatedHours}</p>
            )}
          </div>

          {/* Labels */}
          <div className="space-y-3">
            <Label>Labels</Label>
            
            {/* Labels atuais */}
            {formData.labels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.labels.map((label, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{label}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(label)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Adicionar nova label */}
            <div className="flex space-x-2">
              <Input
                placeholder="Nova label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
              />
              <Button type="button" variant="outline" onClick={handleAddLabel}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Labels predefinidas */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Labels sugeridas:</p>
              <div className="flex flex-wrap gap-2">
                {predefinedLabels.map(label => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handlePredefinedLabel(label)}
                    className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                      formData.labels.includes(label)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={formData.labels.includes(label)}
                  >
                    <Tag className="w-3 h-3 mr-1 inline" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Informações adicionais..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Criar Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCardModal;

