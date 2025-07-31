import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  Truck, 
  Tractor,
  Edit3,
  Save,
  X,
  Calendar,
  Tag,
  Star,
  StarOff
} from 'lucide-react';
import { useWhatsAppInstance } from '../contexts/WhatsAppInstanceContext';

const ContactInfo = ({ contact, onContactUpdate, className = '' }) => {
  const { fetchWithInstance } = useWhatsAppInstance();
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar dados do contato do backend
  useEffect(() => {
    if (contact?.phoneNumber || contact?.whatsappId) {
      loadContactData();
    }
  }, [contact]);

  const loadContactData = async () => {
    if (!contact) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Buscar contato por WhatsApp ID ou número de telefone
      const searchParam = contact.whatsappId || contact.phoneNumber;
      const response = await fetchWithInstance(`/contacts?search=${encodeURIComponent(searchParam)}`);
      
      if (response.ok) {
        const data = await response.json();
        const foundContact = data.contacts?.[0];
        
        if (foundContact) {
          setContactData(foundContact);
        } else {
          // Contato não existe no banco, criar estrutura básica
          setContactData({
            whatsappId: contact.whatsappId || contact.id,
            phoneNumber: contact.phoneNumber || contact.phone,
            displayName: contact.displayName || contact.name || contact.pushName,
            pushName: contact.pushName || contact.name,
            profilePictureUrl: contact.profilePicUrl || contact.avatar,
            customerType: null,
            businessContext: {},
            labels: [],
            isFavorite: false,
            isBlocked: false,
            notes: '',
            createdAt: null,
            updatedAt: null
          });
        }
      } else {
        throw new Error('Erro ao carregar dados do contato');
      }
    } catch (err) {
      console.error('Erro ao carregar contato:', err);
      setError(err.message);
      
      // Fallback para dados básicos do WhatsApp
      setContactData({
        whatsappId: contact.whatsappId || contact.id,
        phoneNumber: contact.phoneNumber || contact.phone,
        displayName: contact.displayName || contact.name || contact.pushName,
        pushName: contact.pushName || contact.name,
        profilePictureUrl: contact.profilePicUrl || contact.avatar,
        customerType: null,
        businessContext: {},
        labels: [],
        isFavorite: false,
        isBlocked: false,
        notes: '',
        createdAt: null,
        updatedAt: null
      });
    } finally {
      setLoading(false);
    }
  };

  const getCustomerTypeInfo = (type) => {
    switch (type) {
      case 'produtor_rural':
        return {
          label: 'Produtor Rural',
          icon: <Tractor className="w-4 h-4" />,
          color: 'bg-green-100 text-green-800 border-green-200',
          description: 'Cliente produtor rural'
        };
      case 'motorista':
        return {
          label: 'Motorista',
          icon: <Truck className="w-4 h-4" />,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          description: 'Motorista de transporte'
        };
      default:
        return {
          label: 'Não classificado',
          icon: <User className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          description: 'Tipo de cliente não definido'
        };
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    
    // Remover caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Formato brasileiro: +55 (11) 99999-9999
    if (cleaned.length >= 10) {
      const country = cleaned.slice(0, 2);
      const area = cleaned.slice(2, 4);
      const first = cleaned.slice(4, 9);
      const second = cleaned.slice(9, 13);
      
      return `+${country} (${area}) ${first}-${second}`;
    }
    
    return phone;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            <span>Carregando informações do contato...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="font-medium">Erro ao carregar contato</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadContactData}
              className="mt-3"
            >
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!contactData) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center text-gray-500">
            <User className="w-8 h-8 mx-auto mb-2" />
            <p>Nenhum contato selecionado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const customerTypeInfo = getCustomerTypeInfo(contactData.customerType);

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage 
                src={contactData.profilePictureUrl} 
                alt={contactData.displayName} 
              />
              <AvatarFallback className="bg-gray-100">
                {contactData.displayName?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <CardTitle className="text-lg">
                {contactData.displayName || 'Nome não disponível'}
              </CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <Phone className="w-3 h-3" />
                <span>{formatPhoneNumber(contactData.phoneNumber)}</span>
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {contactData.isFavorite ? (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            ) : (
              <StarOff className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tipo de Cliente */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Tipo de Cliente
            </label>
          </div>
          
          <Badge 
            variant="outline" 
            className={`${customerTypeInfo.color} flex items-center space-x-1 w-fit`}
          >
            {customerTypeInfo.icon}
            <span>{customerTypeInfo.label}</span>
          </Badge>
          
          {customerTypeInfo.description && (
            <p className="text-xs text-gray-500 mt-1">
              {customerTypeInfo.description}
            </p>
          )}
        </div>

        <Separator />

        {/* Informações Básicas */}
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">WhatsApp ID:</span>
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
              {contactData.whatsappId || 'N/A'}
            </span>
          </div>
          
          {contactData.pushName && contactData.pushName !== contactData.displayName && (
            <div className="flex justify-between">
              <span className="text-gray-600">Nome no WhatsApp:</span>
              <span>{contactData.pushName}</span>
            </div>
          )}
          
          {contactData.businessContext?.segment && (
            <div className="flex justify-between">
              <span className="text-gray-600">Segmento:</span>
              <span>{contactData.businessContext.segment}</span>
            </div>
          )}
        </div>

        {/* Labels/Tags */}
        {contactData.labels && contactData.labels.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Tag className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Etiquetas</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {contactData.labels.map((label, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Notas */}
        {contactData.notes && (
          <>
            <Separator />
            <div>
              <span className="text-sm font-medium text-gray-700">Notas</span>
              <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                {contactData.notes}
              </p>
            </div>
          </>
        )}

        {/* Datas */}
        {(contactData.createdAt || contactData.updatedAt) && (
          <>
            <Separator />
            <div className="text-xs text-gray-500 space-y-1">
              {contactData.createdAt && (
                <div className="flex items-center justify-between">
                  <span>Criado em:</span>
                  <span>{formatDate(contactData.createdAt)}</span>
                </div>
              )}
              {contactData.updatedAt && (
                <div className="flex items-center justify-between">
                  <span>Atualizado em:</span>
                  <span>{formatDate(contactData.updatedAt)}</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactInfo;

