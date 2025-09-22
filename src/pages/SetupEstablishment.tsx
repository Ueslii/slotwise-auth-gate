import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building, Loader2 } from 'lucide-react';

const SetupEstablishment = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    contact_info: ''
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Usuário não autenticado'
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('establishments')
        .insert({
          name: formData.name,
          description: formData.description,
          address: formData.address,
          contact_info: formData.contact_info,
          owner_id: user.id
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso!',
        description: 'Estabelecimento criado com sucesso'
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar estabelecimento',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Building className="h-8 w-8" />
            <span>Configurar Estabelecimento</span>
          </h1>
          <p className="text-muted-foreground">
            Configure seu estabelecimento para começar a receber agendamentos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Estabelecimento</CardTitle>
            <CardDescription>
              Preencha as informações básicas do seu negócio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Estabelecimento *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Salão Beleza & Estilo"
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
                  placeholder="Descreva seu estabelecimento e serviços oferecidos"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_info">Informações de Contato</Label>
                <Input
                  id="contact_info"
                  name="contact_info"
                  value={formData.contact_info}
                  onChange={handleInputChange}
                  placeholder="Telefone, WhatsApp, email"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !formData.name.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Estabelecimento'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetupEstablishment;