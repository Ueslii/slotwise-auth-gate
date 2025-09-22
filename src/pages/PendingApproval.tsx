import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Clock, User } from 'lucide-react';

const PendingApproval = () => {
  const { signOut, profile } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-muted w-fit">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Aguardando Aprovação</CardTitle>
          <CardDescription>
            Sua conta de prestador está sendo analisada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{profile?.full_name}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Seu cadastro como prestador de serviços está sendo analisado por nossa equipe. 
              Você receberá um email quando a aprovação for concluída.
            </p>
          </div>
          
          <div className="pt-4 border-t">
            <Button variant="outline" onClick={handleLogout} className="w-full">
              Sair da Conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;