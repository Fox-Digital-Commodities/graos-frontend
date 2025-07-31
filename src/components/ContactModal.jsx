import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit3, Eye, User } from 'lucide-react';
import ContactInfo from './ContactInfo';
import ContactEditor from './ContactEditor';

const ContactModal = ({ 
  isOpen, 
  onClose, 
  contact, 
  onContactUpdate,
  defaultTab = 'view' // 'view' ou 'edit'
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [contactData, setContactData] = useState(contact);

  // Resetar quando o modal abrir/fechar ou contato mudar
  React.useEffect(() => {
    if (isOpen) {
      setContactData(contact);
      setActiveTab(defaultTab);
    }
  }, [isOpen, contact, defaultTab]);

  const handleContactSave = (updatedContact) => {
    setContactData(updatedContact);
    setActiveTab('view'); // Voltar para visualização após salvar
    
    // Notificar componente pai
    if (onContactUpdate) {
      onContactUpdate(updatedContact);
    }
  };

  const handleEditClick = () => {
    setActiveTab('edit');
  };

  const handleCancelEdit = () => {
    setActiveTab('view');
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>
              {contactData?.displayName || contactData?.name || 'Contato'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="view" className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Visualizar</span>
              </TabsTrigger>
              <TabsTrigger value="edit" className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4" />
                <span>Editar</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="view" className="mt-0 h-full">
                <div className="space-y-4">
                  <ContactInfo 
                    contact={contactData}
                    onContactUpdate={onContactUpdate}
                  />
                  
                  {/* Botão para editar */}
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleEditClick}
                      className="flex items-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Editar Informações</span>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="edit" className="mt-0 h-full">
                <ContactEditor
                  contact={contactData}
                  onSave={handleContactSave}
                  onCancel={handleCancelEdit}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;

