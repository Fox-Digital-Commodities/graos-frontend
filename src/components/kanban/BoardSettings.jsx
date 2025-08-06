import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Settings, 
  Users, 
  Palette, 
  Zap, 
  Shield,
  Plus,
  X,
  Eye,
  Edit,
  Crown,
  Trash2
} from 'lucide-react';

const BoardSettings = ({ board, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: board?.name || '',
    description: board?.description || '',
    type: board?.type || 'conversations',
    settings: {
      autoAssignCards: board?.settings?.autoAssignCards || false,
      enableTimeTracking: board?.settings?.enableTimeTracking || false,
      enableComments: board?.settings?.enableComments || true,
      enableAttachments: board?.settings?.enableAttachments || true,
      enableDueDates: board?.settings?.enableDueDates || true,
      enableLabels: board?.settings?.enableLabels || true,
      maxCardsPerColumn: board?.settings?.maxCardsPerColumn || 20,
      cardTemplate: board?.settings?.cardTemplate || '',
      defaultPriority: board?.settings?.defaultPriority || 'normal'
    },
    appearance: {
      backgroundColor: board?.appearance?.backgroundColor || '#f8fafc',
      cardStyle: board?.appearance?.cardStyle || 'detailed',
      showAssignees: board?.appearance?.showAssignees || true,
      showDueDates: board?.appearance?.showDueDates || true,
      showPriority: board?.appearance?.showPriority || true,
      showLabels: board?.appearance?.showLabels || true,
      columnWidth: board?.appearance?.columnWidth || 320
    },
    permissions: {
      viewers: board?.permissions?.viewers || [],
      editors: board?.permissions?.editors || [],
      admins: board?.permissions?.admins || [],
      teams: board?.permissions?.teams || [],
      whatsappInstances: board?.permissions?.whatsappInstances || []
    }
  });

  const [newUser, setNewUser] = useState('');
  const [newTeam, setNewTeam] = useState('');
  const [newInstance, setNewInstance] = useState('');

  // Mock de dados
  const availableUsers = [
    { id: 'user-1', name: 'Carlos Oliveira', email: 'carlos@empresa.com' },
    { id: 'user-2', name: 'Lucia Santos', email: 'lucia@empresa.com' },
    { id: 'user-3', name: 'Roberto Silva', email: 'roberto@empresa.com' },
    { id: 'user-4', name: 'Ana Costa', email: 'ana@empresa.com' }
  ];

  const availableTeams = [
    { id: 'team-1', name: 'Vendas' },
    { id: 'team-2', name: 'Suporte' },
    { id: 'team-3', name: 'Logística' }
  ];

  const availableInstances = [
    { id: 'inst-1', name: 'WhatsApp Principal', phone: '+55 11 99999-9999' },
    { id: 'inst-2', name: 'WhatsApp Vendas', phone: '+55 11 88888-8888' },
    { id: 'inst-3', name: 'WhatsApp Suporte', phone: '+55 11 77777-7777' }
  ];

  const boardTypes = [
    { value: 'conversations', label: 'Conversas WhatsApp' },
    { value: 'tasks', label: 'Tarefas' },
    { value: 'leads', label: 'Leads' },
    { value: 'support', label: 'Suporte' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const cardStyles = [
    { value: 'compact', label: 'Compacto' },
    { value: 'detailed', label: 'Detalhado' },
    { value: 'minimal', label: 'Minimalista' }
  ];

  const priorities = [
    { value: 'low', label: 'Baixa' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ];

  const backgroundColors = [
    { value: '#f8fafc', label: 'Cinza Claro', color: '#f8fafc' },
    { value: '#f0f9ff', label: 'Azul Claro', color: '#f0f9ff' },
    { value: '#f0fdf4', label: 'Verde Claro', color: '#f0fdf4' },
    { value: '#fefce8', label: 'Amarelo Claro', color: '#fefce8' },
    { value: '#fdf2f8', label: 'Rosa Claro', color: '#fdf2f8' },
    { value: '#f3f4f6', label: 'Neutro', color: '#f3f4f6' }
  ];

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleBasicChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addUserToRole = (role, userId) => {
    if (!userId || formData.permissions[role].includes(userId)) return;
    
    handleInputChange('permissions', role, [...formData.permissions[role], userId]);
  };

  const removeUserFromRole = (role, userId) => {
    handleInputChange('permissions', role, 
      formData.permissions[role].filter(id => id !== userId)
    );
  };

  const addTeam = (teamId) => {
    if (!teamId || formData.permissions.teams.includes(teamId)) return;
    
    handleInputChange('permissions', 'teams', [...formData.permissions.teams, teamId]);
  };

  const removeTeam = (teamId) => {
    handleInputChange('permissions', 'teams', 
      formData.permissions.teams.filter(id => id !== teamId)
    );
  };

  const addInstance = (instanceId) => {
    if (!instanceId || formData.permissions.whatsappInstances.includes(instanceId)) return;
    
    handleInputChange('permissions', 'whatsappInstances', 
      [...formData.permissions.whatsappInstances, instanceId]
    );
  };

  const removeInstance = (instanceId) => {
    handleInputChange('permissions', 'whatsappInstances', 
      formData.permissions.whatsappInstances.filter(id => id !== instanceId)
    );
  };

  const getUserName = (userId) => {
    const user = availableUsers.find(u => u.id === userId);
    return user ? user.name : userId;
  };

  const getTeamName = (teamId) => {
    const team = availableTeams.find(t => t.id === teamId);
    return team ? team.name : teamId;
  };

  const getInstanceName = (instanceId) => {
    const instance = availableInstances.find(i => i.id === instanceId);
    return instance ? instance.name : instanceId;
  };

  const handleSave = () => {
    const updatedBoard = {
      ...board,
      ...formData
    };
    onSave(updatedBoard);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Configurações do Board</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="permissions">Permissões</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="automation">Automação</TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto max-h-[60vh]">
            <TabsContent value="general" className="space-y-6">
              {/* Informações básicas */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Board</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleBasicChange('name', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleBasicChange('description', e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Tipo do Board</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleBasicChange('type', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {boardTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Configurações gerais */}
              <div className="space-y-4">
                <h4 className="font-medium">Configurações</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-atribuir cards</Label>
                      <p className="text-sm text-gray-600">
                        Atribuir automaticamente novos cards aos membros
                      </p>
                    </div>
                    <Switch
                      checked={formData.settings.autoAssignCards}
                      onCheckedChange={(checked) => 
                        handleInputChange('settings', 'autoAssignCards', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rastreamento de tempo</Label>
                      <p className="text-sm text-gray-600">
                        Permitir registro de tempo nos cards
                      </p>
                    </div>
                    <Switch
                      checked={formData.settings.enableTimeTracking}
                      onCheckedChange={(checked) => 
                        handleInputChange('settings', 'enableTimeTracking', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Comentários</Label>
                      <p className="text-sm text-gray-600">
                        Permitir comentários nos cards
                      </p>
                    </div>
                    <Switch
                      checked={formData.settings.enableComments}
                      onCheckedChange={(checked) => 
                        handleInputChange('settings', 'enableComments', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Anexos</Label>
                      <p className="text-sm text-gray-600">
                        Permitir anexos nos cards
                      </p>
                    </div>
                    <Switch
                      checked={formData.settings.enableAttachments}
                      onCheckedChange={(checked) => 
                        handleInputChange('settings', 'enableAttachments', checked)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Máximo de cards por coluna</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.settings.maxCardsPerColumn}
                      onChange={(e) => 
                        handleInputChange('settings', 'maxCardsPerColumn', parseInt(e.target.value))
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Prioridade padrão</Label>
                    <Select 
                      value={formData.settings.defaultPriority} 
                      onValueChange={(value) => handleInputChange('settings', 'defaultPriority', value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map(priority => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6">
              {/* Administradores */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <span>Administradores</span>
                    </Label>
                    <p className="text-sm text-gray-600">Controle total do board</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.permissions.admins.map(userId => (
                    <Badge key={userId} variant="secondary" className="flex items-center space-x-1">
                      <span>{getUserName(userId)}</span>
                      <button
                        onClick={() => removeUserFromRole('admins', userId)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <Select value={newUser} onValueChange={setNewUser}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecionar usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers
                        .filter(user => !formData.permissions.admins.includes(user.id))
                        .map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => {
                      addUserToRole('admins', newUser);
                      setNewUser('');
                    }}
                    disabled={!newUser}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Editores */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="flex items-center space-x-2">
                      <Edit className="w-4 h-4 text-blue-500" />
                      <span>Editores</span>
                    </Label>
                    <p className="text-sm text-gray-600">Podem editar cards e colunas</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.permissions.editors.map(userId => (
                    <Badge key={userId} variant="secondary" className="flex items-center space-x-1">
                      <span>{getUserName(userId)}</span>
                      <button
                        onClick={() => removeUserFromRole('editors', userId)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <Select value={newUser} onValueChange={setNewUser}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecionar usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers
                        .filter(user => 
                          !formData.permissions.editors.includes(user.id) &&
                          !formData.permissions.admins.includes(user.id)
                        )
                        .map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => {
                      addUserToRole('editors', newUser);
                      setNewUser('');
                    }}
                    disabled={!newUser}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Visualizadores */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-green-500" />
                      <span>Visualizadores</span>
                    </Label>
                    <p className="text-sm text-gray-600">Apenas visualização</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.permissions.viewers.map(userId => (
                    <Badge key={userId} variant="secondary" className="flex items-center space-x-1">
                      <span>{getUserName(userId)}</span>
                      <button
                        onClick={() => removeUserFromRole('viewers', userId)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <Select value={newUser} onValueChange={setNewUser}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecionar usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers
                        .filter(user => 
                          !formData.permissions.viewers.includes(user.id) &&
                          !formData.permissions.editors.includes(user.id) &&
                          !formData.permissions.admins.includes(user.id)
                        )
                        .map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => {
                      addUserToRole('viewers', newUser);
                      setNewUser('');
                    }}
                    disabled={!newUser}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Instâncias WhatsApp */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label>Instâncias WhatsApp</Label>
                    <p className="text-sm text-gray-600">Instâncias vinculadas a este board</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.permissions.whatsappInstances.map(instanceId => (
                    <Badge key={instanceId} variant="secondary" className="flex items-center space-x-1">
                      <span>{getInstanceName(instanceId)}</span>
                      <button
                        onClick={() => removeInstance(instanceId)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <Select value={newInstance} onValueChange={setNewInstance}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecionar instância" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableInstances
                        .filter(instance => !formData.permissions.whatsappInstances.includes(instance.id))
                        .map(instance => (
                          <SelectItem key={instance.id} value={instance.id}>
                            {instance.name} ({instance.phone})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => {
                      addInstance(newInstance);
                      setNewInstance('');
                    }}
                    disabled={!newInstance}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              {/* Cor de fundo */}
              <div>
                <Label>Cor de fundo</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {backgroundColors.map(bg => (
                    <button
                      key={bg.value}
                      onClick={() => handleInputChange('appearance', 'backgroundColor', bg.value)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.appearance.backgroundColor === bg.value
                          ? 'border-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: bg.color }}
                    >
                      <div className="text-sm font-medium text-gray-700">
                        {bg.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estilo dos cards */}
              <div>
                <Label>Estilo dos cards</Label>
                <Select 
                  value={formData.appearance.cardStyle} 
                  onValueChange={(value) => handleInputChange('appearance', 'cardStyle', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cardStyles.map(style => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Largura das colunas */}
              <div>
                <Label>Largura das colunas (px)</Label>
                <Input
                  type="number"
                  min="280"
                  max="500"
                  value={formData.appearance.columnWidth}
                  onChange={(e) => 
                    handleInputChange('appearance', 'columnWidth', parseInt(e.target.value))
                  }
                  className="mt-2"
                />
              </div>

              {/* Elementos visíveis */}
              <div className="space-y-3">
                <Label>Elementos visíveis nos cards</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Mostrar responsáveis</Label>
                    <Switch
                      checked={formData.appearance.showAssignees}
                      onCheckedChange={(checked) => 
                        handleInputChange('appearance', 'showAssignees', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Mostrar datas de vencimento</Label>
                    <Switch
                      checked={formData.appearance.showDueDates}
                      onCheckedChange={(checked) => 
                        handleInputChange('appearance', 'showDueDates', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Mostrar prioridade</Label>
                    <Switch
                      checked={formData.appearance.showPriority}
                      onCheckedChange={(checked) => 
                        handleInputChange('appearance', 'showPriority', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Mostrar labels</Label>
                    <Switch
                      checked={formData.appearance.showLabels}
                      onCheckedChange={(checked) => 
                        handleInputChange('appearance', 'showLabels', checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="automation" className="space-y-6">
              <div className="text-center py-8">
                <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Automação Avançada
                </h3>
                <p className="text-gray-600 mb-4">
                  Configure regras automáticas para otimizar seu fluxo de trabalho
                </p>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Regra
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Configurações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BoardSettings;

