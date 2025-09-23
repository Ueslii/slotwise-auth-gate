import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, User, LogOut, Clock, Building, DollarSign } from 'lucide-react';

interface AppointmentWithDetails {
  id: number;
  start_time: string;
  end_time: string;
  status: string;
  services: {
    name: string;
    price: number;
    duration_minutes: number;
  };
  establishments: {
    name: string;
  };
}

const MeusAgendamentos = () => {
  const { signOut, profile, user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentWithDetails[]>([]);
  const [pastAppointments, setPastAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            id,
            start_time,
            end_time,
            status,
            services (
              name,
              price,
              duration_minutes
            ),
            establishments (
              name
            )
          `)
          .eq('client_id', user.id)
          .order('start_time', { ascending: true });

        if (error) {
          throw error;
        }

        const now = new Date();
        const upcoming = data?.filter(apt => new Date(apt.start_time) >= now) || [];
        const past = data?.filter(apt => new Date(apt.start_time) < now) || [];

        setUpcomingAppointments(upcoming);
        setPastAppointments(past);
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmado':
        return 'default';
      case 'cancelado':
        return 'destructive';
      case 'concluido':
        return 'secondary';
      default:
        return 'outline';
    }
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
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando agendamentos...</p>
          </div>
        ) : (
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
                {upcomingAppointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum agendamento futuro encontrado.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <Card key={appointment.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{appointment.establishments.name}</span>
                              </div>
                              <h3 className="font-semibold">{appointment.services.name}</h3>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(appointment.start_time), 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(appointment.start_time), 'HH:mm')} - {format(new Date(appointment.end_time), 'HH:mm')}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <Badge variant="secondary" className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDuration(appointment.services.duration_minutes)}</span>
                                </Badge>
                                <Badge variant="outline" className="flex items-center space-x-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span>{formatPrice(appointment.services.price)}</span>
                                </Badge>
                              </div>
                            </div>
                            <Badge variant={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
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
                {pastAppointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum histórico encontrado.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pastAppointments.map((appointment) => (
                      <Card key={appointment.id} className="border-l-4 border-l-muted">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{appointment.establishments.name}</span>
                              </div>
                              <h3 className="font-semibold">{appointment.services.name}</h3>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(appointment.start_time), 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(appointment.start_time), 'HH:mm')} - {format(new Date(appointment.end_time), 'HH:mm')}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <Badge variant="secondary" className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDuration(appointment.services.duration_minutes)}</span>
                                </Badge>
                                <Badge variant="outline" className="flex items-center space-x-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span>{formatPrice(appointment.services.price)}</span>
                                </Badge>
                              </div>
                            </div>
                            <Badge variant={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeusAgendamentos;