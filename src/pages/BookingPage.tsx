import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, addMinutes, parseISO, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, DollarSign, Building, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  establishment_id: number;
}

interface Establishment {
  id: number;
  name: string;
}

interface Availability {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface Appointment {
  start_time: string;
  end_time: string;
}

const BookingPage = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [service, setService] = useState<Service | null>(null);
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [creatingAppointment, setCreatingAppointment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceData = async () => {
      if (!serviceId) {
        setError('ID do serviço não fornecido');
        setLoading(false);
        return;
      }

      try {
        // Fetch service details
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('*')
          .eq('id', parseInt(serviceId!))
          .single();

        if (serviceError) {
          throw serviceError;
        }

        setService(serviceData);

        // Fetch establishment details
        const { data: establishmentData, error: establishmentError } = await supabase
          .from('establishments')
          .select('id, name')
          .eq('id', serviceData.establishment_id)
          .single();

        if (establishmentError) {
          throw establishmentError;
        }

        setEstablishment(establishmentData);
      } catch (err) {
        console.error('Erro ao carregar dados do serviço:', err);
        setError('Erro ao carregar informações do serviço');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [serviceId]);

  const calculateAvailableSlots = async (date: Date) => {
    if (!service || !establishment) return;

    setLoadingSlots(true);
    setAvailableSlots([]);

    try {
      const dayOfWeek = date.getDay();
      
      // Fetch availability rules for this day
      const { data: availabilities, error: availError } = await supabase
        .from('availabilities')
        .select('*')
        .eq('establishment_id', establishment.id)
        .eq('day_of_week', dayOfWeek);

      if (availError) {
        throw availError;
      }

      if (!availabilities || availabilities.length === 0) {
        setLoadingSlots(false);
        return;
      }

      // Fetch existing appointments for this date
      const startOfSelectedDay = startOfDay(date);
      const endOfSelectedDay = endOfDay(date);

      const { data: appointments, error: appointError } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('establishment_id', establishment.id)
        .gte('start_time', startOfSelectedDay.toISOString())
        .lte('start_time', endOfSelectedDay.toISOString());

      if (appointError) {
        throw appointError;
      }

      // Calculate available slots
      const slots: string[] = [];
      
      availabilities.forEach((availability: Availability) => {
        const [startHour, startMinute] = availability.start_time.split(':').map(Number);
        const [endHour, endMinute] = availability.end_time.split(':').map(Number);
        
        const startTime = new Date(date);
        startTime.setHours(startHour, startMinute, 0, 0);
        
        const endTime = new Date(date);
        endTime.setHours(endHour, endMinute, 0, 0);
        
        let currentSlot = new Date(startTime);
        
        while (currentSlot.getTime() + (service.duration_minutes * 60000) <= endTime.getTime()) {
          const slotEnd = addMinutes(currentSlot, service.duration_minutes);
          
          // Check if this slot conflicts with any existing appointment
          const hasConflict = appointments?.some((appointment: Appointment) => {
            const appointStart = parseISO(appointment.start_time);
            const appointEnd = parseISO(appointment.end_time);
            
            return (
              (currentSlot >= appointStart && currentSlot < appointEnd) ||
              (slotEnd > appointStart && slotEnd <= appointEnd) ||
              (currentSlot <= appointStart && slotEnd >= appointEnd)
            );
          });
          
          if (!hasConflict) {
            slots.push(currentSlot.toISOString());
          }
          
          currentSlot = addMinutes(currentSlot, 30); // 30-minute intervals
        }
      });
      
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Erro ao calcular horários disponíveis:', err);
      toast({
        title: "Erro",
        description: "Erro ao carregar horários disponíveis",
        variant: "destructive",
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      calculateAvailableSlots(selectedDate);
    }
  }, [selectedDate, service, establishment]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setShowConfirmDialog(true);
  };

  const confirmBooking = async () => {
    if (!selectedTime || !service || !user) return;

    setCreatingAppointment(true);

    try {
      const startTime = parseISO(selectedTime);
      const endTime = addMinutes(startTime, service.duration_minutes);

      const { error } = await supabase
        .from('appointments')
        .insert({
          client_id: user.id,
          establishment_id: service.establishment_id,
          service_id: service.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'Confirmado'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Agendamento confirmado!",
        description: "Seu agendamento foi criado com sucesso.",
      });

      navigate('/agendamento-concluido');
    } catch (err) {
      console.error('Erro ao criar agendamento:', err);
      toast({
        title: "Erro",
        description: "Erro ao confirmar agendamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setCreatingAppointment(false);
      setShowConfirmDialog(false);
    }
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

  if (error || !service || !establishment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Erro</h1>
          <p className="text-muted-foreground">{error || 'Serviço não encontrado'}</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Login Necessário</CardTitle>
            <CardDescription>
              Você precisa estar logado para fazer um agendamento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/estabelecimentos/${establishment.id}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Agendar Serviço</h1>
            <p className="text-muted-foreground">Selecione data e horário para seu agendamento</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Service Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>{establishment.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Badge variant="secondary" className="flex items-center justify-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(service.duration_minutes)}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center justify-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>{formatPrice(service.price)}</span>
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Selecione a Data</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  locale={ptBR}
                  className={cn("w-full pointer-events-auto")}
                />
              </CardContent>
            </Card>
          </div>

          {/* Time Slots */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Horários Disponíveis</CardTitle>
                {selectedDate && (
                  <CardDescription>
                    {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {!selectedDate ? (
                  <p className="text-center text-muted-foreground py-8">
                    Selecione uma data para ver os horários disponíveis
                  </p>
                ) : loadingSlots ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Carregando horários...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum horário disponível para esta data
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant="outline"
                        size="sm"
                        onClick={() => handleTimeSelect(slot)}
                        className="text-sm"
                      >
                        {format(parseISO(slot), 'HH:mm')}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Agendamento</DialogTitle>
              <DialogDescription>
                Verifique os detalhes do seu agendamento
              </DialogDescription>
            </DialogHeader>
            
            {selectedTime && selectedDate && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p><strong>Estabelecimento:</strong> {establishment.name}</p>
                  <p><strong>Serviço:</strong> {service.name}</p>
                  <p><strong>Data:</strong> {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: ptBR })}</p>
                  <p><strong>Horário:</strong> {format(parseISO(selectedTime), 'HH:mm')}</p>
                  <p><strong>Duração:</strong> {formatDuration(service.duration_minutes)}</p>
                  <p><strong>Preço:</strong> {formatPrice(service.price)}</p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDialog(false)}
                disabled={creatingAppointment}
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmBooking}
                disabled={creatingAppointment}
              >
                {creatingAppointment ? 'Confirmando...' : 'Confirmar Agendamento'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BookingPage;