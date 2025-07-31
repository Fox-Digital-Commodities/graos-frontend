import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Phone, 
  Briefcase, 
  Truck, 
  Tractor,
  Save,
  X,
  Tag,
  Star,
  StarOff,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useWhatsAppInstance } from '../contexts/WhatsAppInstanceContext';

const ContactEditor = ({ contact, onSave, onCancel, className = '' }) => {
  const { fetchWithInstance } = useWhatsAppInstance();
  const [formData, setFormData] = useState({
    whatsappId: '',
    phoneNumber: '',
    displayName: '',
    pushName: '',
    profilePictureUrl: '',
    customerType: null,
    businessContext: {
      segment: '',
      company: '',
      location: ''
    },
    labels: [],
    isFavorite: false,
    isBlocked: false,
    notes: ''
  });
  
  const [newLabel, setNewLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Inicializar formulário com dados do contato
  useEffect(() => {
    if (contact) {
      setFormData({
        whatsappId: contact.whatsappId || contact.id || '',
        phoneNumber: contact.phoneNumber || contact.phone || '',
        displayName: contact.displayName || contact.name || contact.pushName || '',
        pushName: contact.pushName || contact.name || '',
        profilePictureUrl: contact.profilePictureUrl || contact.profilePicUrl || contact.avatar || '',
        customerType: contact.customerType || null,
        businessContext: {
          segment: contact.businessContext?.segment || '',
          company: contact.businessContext?.company || '',
          location: contact.businessContext?.location || ''
        },
        labels: contact.labels || [],
        isFavorite: contact.isFavorite || false,
        isBlocked: contact.isBlocked || false,
        notes: contact.notes || ''
      });
    }
  }, [contact]);

  const customerTypes = [
    {
      value: null,
      label: 'Não classificado',
      icon: <User className="w-4 h-4" />,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      description: 'Tipo de cliente não definido'
    },
    {
      value: 'produtor_rural',
      label: 'Produtor Rural',
      icon: <Tractor className="w-4 h-4" />,
      color: 'bg-green-100 text-green-800 border-green-200',
      description: 'Cliente produtor rural - cultivo de grãos, agricultura'
    },
    {
      value: 'motorista',
      label: 'Motorista',
      icon: <Truck className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Motorista de transporte - logística e entrega'
    }
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
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

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validações básicas
      if (!formData.displayName.trim()) {
        throw new Error('Nome é obrigatório');
      }

      if (!formData.phoneNumber.trim()) {
        throw new Error('Número de telefone é obrigatório');
      }

      // Preparar dados para envio
      const contactData = {
        ...formData,
        displayName: formData.displayName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        pushName: formData.pushName.trim() || formData.displayName.trim(),
        businessContext: {
          ...formData.businessContext,
          segment: formData.businessContext.segment.trim(),
          company: formData.businessContext.company.trim(),
          location: formData.businessContext.location.trim()
        },
        notes: formData.notes.trim()
      };

      let response;
      
      // Verificar se é criação ou atualização
      if (contact?.id) {
        // Atualizar contato existente
        response = await fetchWithInstance(`/contacts/${contact.id}`, {
          method: 'PUT',
          body: JSON.stringify(contactData)
        });
      } else {
        // Criar novo contato
        response = await fetchWithInstance('/contacts', {
          method: 'POST',
          body: JSON.stringify(contactData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar contato');
      }

      const savedContact = await response.json();
      
      // Chamar callback de sucesso
      if (onSave) {
        onSave(savedContact);
      }

    } catch (err) {
      console.error('Erro ao salvar contato:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomerType = customerTypes.find(type => type.value === formData.customerType);

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {contact?.id ? 'Editar Contato' : 'Novo Contato'}
            </CardTitle>
            <CardDescription>
              Gerencie as informações e classificação do contato
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              Salvar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Erro */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Avatar e informações básicas */}
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage 
              src={formData.profilePictureUrl} 
              alt={formData.displayName} 
            />
            <AvatarFallback className="bg-gray-100 text-lg">
              {formData.displayName?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="displayName">Nome *</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="Nome do contato"
                  disabled={loading}
                />
              </div>
              
              <div>
                <Label htmlFor="phoneNumber">Telefone *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="+55 11 99999-9999"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="pushName">Nome no WhatsApp</Label>
              <Input
                id="pushName"
                value={formData.pushName}
                onChange={(e) => handleInputChange('pushName', e.target.value)}
                placeholder="Nome exibido no WhatsApp"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Tipo de Cliente */}
        <div>
          <Label className="text-base font-medium">Tipo de Cliente</Label>
          <p className="text-sm text-gray-600 mb-3">
            Classifique o contato para melhor organização
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {customerTypes.map((type) => (
              <button
                key={type.value || 'none'}
                type="button"
                onClick={() => handleInputChange('customerType', type.value)}
                disabled={loading}
                className={`
                  p-3 border-2 rounded-lg text-left transition-all
                  ${formData.customerType === type.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {type.icon}
                  <span className="font-medium">{type.label}</span>
                </div>
                <p className="text-xs text-gray-600">{type.description}</p>
              </button>
            ))}
          </div>
          
          {selectedCustomerType && (
            <div className="mt-3">
              <Badge 
                variant="outline" 
                className={`${selectedCustomerType.color} flex items-center space-x-1 w-fit`}
              >
                {selectedCustomerType.icon}
                <span>Selecionado: {selectedCustomerType.label}</span>
              </Badge>
            </div>
          )}
        </div>

        <Separator />

        {/* Contexto de Negócio */}
        <div>
          <Label className="text-base font-medium">Informações de Negócio</Label>
          <p className="text-sm text-gray-600 mb-3">
            Dados adicionais sobre o cliente
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="segment">Segmento</Label>
              <Input
                id="segment"
                value={formData.businessContext.segment}
                onChange={(e) => handleInputChange('businessContext.segment', e.target.value)}
                placeholder="Ex: Soja, Milho, Transporte"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={formData.businessContext.company}
                onChange={(e) => handleInputChange('businessContext.company', e.target.value)}
                placeholder="Nome da empresa"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={formData.businessContext.location}
                onChange={(e) => handleInputChange('businessContext.location', e.target.value)}
                placeholder="Cidade, Estado"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Etiquetas */}
        <div>
          <Label className="text-base font-medium">Etiquetas</Label>
          <p className="text-sm text-gray-600 mb-3">
            Adicione tags para organizar melhor os contatos
          </p>
          
          {/* Etiquetas existentes */}
          {formData.labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.labels.map((label, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="flex items-center space-x-1"
                >
                  <span>{label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLabel(label)}
                    disabled={loading}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          {/* Adicionar nova etiqueta */}
          <div className="flex space-x-2">
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Nova etiqueta"
              disabled={loading}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLabel();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddLabel}
              disabled={loading || !newLabel.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Notas */}
        <div>
          <Label htmlFor="notes">Notas</Label>
          <p className="text-sm text-gray-600 mb-2">
            Informações adicionais sobre o contato
          </p>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Adicione observações, histórico ou informações relevantes..."
            rows={4}
            disabled={loading}
          />
        </div>

        {/* Opções adicionais */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFavorite}
              onChange={(e) => handleInputChange('isFavorite', e.target.checked)}
              disabled={loading}
              className="rounded"
            />
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm">Marcar como favorito</span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactEditor;

