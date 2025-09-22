import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, User, LogOut } from 'lucide-react';

const MeusAgendamentos = () => {
  const { signOut, profile } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Meus Agendamentos</h1>
            <p className="text-muted-foreground">Gerencie seus agendamentos e histórico</p>
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
              <p><strong>Tipo:</strong> Cliente</p>
            </div>
          </CardContent>
        </Card>

        {/* Agendamentos */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Próximos Agendamentos</span>
              </CardTitle>
              <CardDescription>
                Seus agendamentos futuros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum agendamento encontrado. 
                <br />
                Em breve: sistema completo de agendamentos estará disponível.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
              <CardDescription>
                Agendamentos anteriores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum histórico encontrado.
                <br />
                Seus agendamentos passados aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MeusAgendamentos;