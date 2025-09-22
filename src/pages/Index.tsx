import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Users, LogIn, UserPlus } from 'lucide-react';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      // Redirect based on role and status
      if (profile.role === 'super_admin') {
        navigate('/super-admin');
      } else if (profile.role === 'administrador') {
        if (profile.status === 'pendente') {
          navigate('/pending-approval');
        } else if (profile.status === 'ativo') {
          navigate('/dashboard');
        }
      } else if (profile.role === 'cliente') {
        navigate('/meus-agendamentos');
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-bold mb-4">SlotWise</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Plataforma inteligente de agendamentos
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button className="flex items-center space-x-2 min-w-[140px]">
                  <LogIn className="h-4 w-4" />
                  <span>Entrar</span>
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" className="flex items-center space-x-2 min-w-[140px]">
                  <UserPlus className="h-4 w-4" />
                  <span>Cadastrar</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Agendamentos</span>
              </CardTitle>
              <CardDescription>
                Sistema completo de agendamentos online
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gerencie agendamentos de forma eficiente com nossa plataforma intuitiva.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Gestão de Clientes</span>
              </CardTitle>
              <CardDescription>
                Controle completo da base de clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mantenha o histórico e informações dos seus clientes organizados.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Relatórios</span>
              </CardTitle>
              <CardDescription>
                Análises e métricas detalhadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Acompanhe o desempenho do seu negócio com relatórios completos.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
