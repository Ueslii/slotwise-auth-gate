import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LayoutDashboard, User, LogOut, Building, Settings, Calendar, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { signOut, profile, user } = useAuth();
  const navigate = useNavigate();
  const [establishmentExists, setEstablishmentExists] = useState<boolean | null>(null);

  useEffect(() => {
    checkEstablishment();
  }, [user]);

  const checkEstablishment = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('establishments')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setEstablishmentExists(!!data);

      // If no establishment exists, redirect to setup
      if (!data) {
        navigate('/setup-establishment');
      }
    } catch (error) {
      console.error('Error checking establishment:', error);
      setEstablishmentExists(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Show loading while checking establishment
  if (establishmentExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando estabelecimento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Bem-vindo ao painel administrativo</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </div>

        {/* User Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informações do Usuário</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Nome:</strong> {profile?.full_name || 'Não informado'}</p>
              <p><strong>Tipo:</strong> Administrador</p>
              <p><strong>Status:</strong> Ativo</p>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LayoutDashboard className="h-5 w-5" />
                <span>Painel</span>
              </CardTitle>
              <CardDescription>
                Gerencie seu estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Visão geral do seu negócio e estatísticas
              </p>
              <Button variant="outline" className="w-full">
                Ver Relatórios
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Gerenciar Serviços</span>
              </CardTitle>
              <CardDescription>
                Configure os serviços oferecidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione, edite e remova serviços do seu estabelecimento
              </p>
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => navigate('/gerenciar-servicos')}
              >
                Gerenciar Serviços
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Configurar Horários</span>
              </CardTitle>
              <CardDescription>
                Defina sua disponibilidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configure os horários de funcionamento do estabelecimento
              </p>
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => navigate('/disponibilidade')}
              >
                Configurar Horários
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Estabelecimento</span>
              </CardTitle>
              <CardDescription>
                Informações do seu negócio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Edite informações do estabelecimento e configurações gerais
              </p>
              <Button variant="outline" className="w-full">
                Editar Estabelecimento
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agendamentos</CardTitle>
              <CardDescription>
                Visualize e gerencie agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Sistema completo de agendamentos e calendário
              </p>
              <Button variant="outline" className="w-full">
                Ver Agendamentos
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
              <CardDescription>
                Acompanhe métricas e resultados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Relatórios detalhados e análises de performance
              </p>
              <Button variant="outline" className="w-full">
                Ver Relatórios
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;