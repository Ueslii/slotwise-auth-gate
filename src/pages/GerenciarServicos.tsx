import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings, Plus, Edit, Trash2, Loader2, Clock, DollarSign } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  establishment_id: number;
}

const GerenciarServicos = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [establishmentId, setEstablishmentId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: '',
    price: ''
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchEstablishmentAndServices();
  }, [user]);

  const fetchEstablishmentAndServices = async () => {
    if (!user?.id) return;

    try {
      // First get the establishment
      const { data: establishment, error: estError } = await supabase
        .from('establishments')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (estError || !establishment) {
        throw new Error('Estabelecimento não encontrado');
      }

      setEstablishmentId(establishment.id);

      // Then get the services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('establishment_id', establishment.id)
        .order('created_at', { ascending: false });

      if (servicesError) {
        throw servicesError;
      }

      setServices(servicesData || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar serviços',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration_minutes: '',
      price: ''
    });
    setEditingService(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description || '',
      duration_minutes: service.duration_minutes.toString(),
      price: service.price.toString()
    });
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!establishmentId) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Estabelecimento não identificado'
      });
      return;
    }

    setSubmitting(true);

    try {
      const serviceData = {
        name: formData.name,
        description: formData.description || null,
        duration_minutes: parseInt(formData.duration_minutes),
        price: parseFloat(formData.price),
        establishment_id: establishmentId
      };

      let error;

      if (editingService) {
        const { error: updateError } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('services')
          .insert(serviceData);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso!',
        description: `Serviço ${editingService ? 'atualizado' : 'criado'} com sucesso`
      });

      setIsDialogOpen(false);
      resetForm();
      fetchEstablishmentAndServices();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: `Erro ao ${editingService ? 'atualizar' : 'criar'} serviço`,
        description: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (serviceId: number, serviceName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o serviço "${serviceName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso!',
        description: 'Serviço excluído com sucesso'
      });

      fetchEstablishmentAndServices();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir serviço',
        description: error.message
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando serviços...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <Settings className="h-8 w-8" />
              <span>Gerenciar Serviços</span>
            </h1>
            <p className="text-muted-foreground">
              Configure os serviços oferecidos pelo seu estabelecimento
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                </DialogTitle>
                <DialogDescription>
                  {editingService 
                    ? 'Atualize as informações do serviço' 
                    : 'Adicione um novo serviço ao seu estabelecimento'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Serviço *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Corte de Cabelo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descreva o serviço oferecido"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration_minutes">Duração (minutos) *</Label>
                    <Input
                      id="duration_minutes"
                      name="duration_minutes"
                      type="number"
                      value={formData.duration_minutes}
                      onChange={handleInputChange}
                      placeholder="60"
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="50.00"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitting || !formData.name.trim()}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingService ? 'Atualizando...' : 'Criando...'}
                    </>
                  ) : (
                    editingService ? 'Atualizar Serviço' : 'Criar Serviço'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {services.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum serviço cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando os serviços oferecidos pelo seu estabelecimento
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Serviço
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{service.name}</span>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(service.id, service.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  {service.description && (
                    <CardDescription>{service.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{service.duration_minutes} minutos</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>R$ {service.price.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GerenciarServicos;