import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, User, LogOut, CheckCircle, Clock } from 'lucide-react';

interface PendingUser {
  id: string;
  full_name: string | null;
  role: string;
  status: string;
}

const SuperAdmin = () => {
  const { signOut, profile } = useAuth();
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, status')
        .eq('role', 'administrador')
        .eq('status', 'pendente');

      if (error) {
        console.error('Error fetching pending users:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar usuários pendentes"
        });
        return;
      }

      setPendingUsers(data || []);
    } catch (error) {
      console.error('Error in fetchPendingUsers:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados"
      });
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    setApproving(userId);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status: 'ativo' 
        })
        .eq('id', userId);

      if (error) {
        console.error('Error approving user:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao aprovar usuário"
        });
        return;
      }

      toast({
        title: "Usuário aprovado",
        description: "O usuário foi aprovado com sucesso"
      });

      // Refresh the list
      await fetchPendingUsers();
    } catch (error) {
      console.error('Error in approveUser:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao aprovar usuário"
      });
    } finally {
      setApproving(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span>Painel Super Admin</span>
            </h1>
            <p className="text-muted-foreground">Gerencie aprovações de prestadores</p>
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
              <span>Informações do Administrador</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Nome:</strong> {profile?.full_name || 'Não informado'}</p>
              <p><strong>Tipo:</strong> Super Admin</p>
              <Badge variant="default" className="bg-primary">Acesso Total</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Prestadores Pendentes de Aprovação</span>
            </CardTitle>
            <CardDescription>
              Lista de prestadores aguardando aprovação para acessar a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando usuários pendentes...</p>
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum prestador pendente de aprovação</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name || 'Nome não informado'}
                      </TableCell>
                      <TableCell>Prestador</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Pendente</Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          onClick={() => approveUser(user.id)}
                          disabled={approving === user.id}
                          className="flex items-center space-x-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>
                            {approving === user.id ? 'Aprovando...' : 'Aprovar'}
                          </span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdmin;