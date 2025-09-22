import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Plus, Trash2, Loader2, Clock } from 'lucide-react';

interface Availability {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  establishment_id: number;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];

const TIME_OPTIONS = Array.from({ length: 24 * 2 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? '00' : '30';
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes}`;
  return { value: timeString, label: timeString };
});

const Disponibilidade = () => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [establishmentId, setEstablishmentId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    day_of_week: '',
    start_time: '',
    end_time: ''
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchEstablishmentAndAvailabilities();
  }, [user]);

  const fetchEstablishmentAndAvailabilities = async () => {
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

      // Then get the availabilities
      const { data: availabilitiesData, error: availabilitiesError } = await supabase
        .from('availabilities')
        .select('*')
        .eq('establishment_id', establishment.id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (availabilitiesError) {
        throw availabilitiesError;
      }

      setAvailabilities(availabilitiesData || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar horários',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      day_of_week: '',
      start_time: '',
      end_time: ''
    });
  };

  const openCreateDialog = () => {
    resetForm();
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

    if (formData.start_time >= formData.end_time) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O horário de início deve ser anterior ao horário de fim'
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('availabilities')
        .insert({
          day_of_week: parseInt(formData.day_of_week),
          start_time: formData.start_time,
          end_time: formData.end_time,
          establishment_id: establishmentId
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso!',
        description: 'Horário de disponibilidade criado com sucesso'
      });

      setIsDialogOpen(false);
      resetForm();
      fetchEstablishmentAndAvailabilities();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar horário',
        description: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (availabilityId: number, dayName: string, startTime: string, endTime: string) => {
    if (!confirm(`Tem certeza que deseja excluir o horário "${dayName} das ${startTime} às ${endTime}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('availabilities')
        .delete()
        .eq('id', availabilityId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso!',
        description: 'Horário excluído com sucesso'
      });

      fetchEstablishmentAndAvailabilities();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir horário',
        description: error.message
      });
    }
  };

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(day => day.value === dayOfWeek)?.label || 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando horários...</p>
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
              <Calendar className="h-8 w-8" />
              <span>Definir Disponibilidade</span>
            </h1>
            <p className="text-muted-foreground">
              Configure os horários de funcionamento do seu estabelecimento
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Horário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Horário de Disponibilidade</DialogTitle>
                <DialogDescription>
                  Adicione um novo horário de funcionamento
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Dia da Semana *</Label>
                  <Select 
                    value={formData.day_of_week} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, day_of_week: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o dia da semana" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Horário de Início *</Label>
                    <Select 
                      value={formData.start_time} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, start_time: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Início" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Horário de Fim *</Label>
                    <Select 
                      value={formData.end_time} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, end_time: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Fim" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitting || !formData.day_of_week || !formData.start_time || !formData.end_time}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Horário'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {availabilities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum horário configurado</h3>
              <p className="text-muted-foreground mb-4">
                Configure os horários de funcionamento para começar a receber agendamentos
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Horário
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day) => {
              const dayAvailabilities = availabilities.filter(av => av.day_of_week === day.value);
              
              return (
                <Card key={day.value}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{day.label}</span>
                      {dayAvailabilities.length === 0 && (
                        <span className="text-sm text-muted-foreground font-normal">
                          (Fechado)
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dayAvailabilities.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        Nenhum horário configurado para este dia
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {dayAvailabilities.map((availability) => (
                          <div key={availability.id} className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {availability.start_time} às {availability.end_time}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(
                                availability.id, 
                                day.label, 
                                availability.start_time, 
                                availability.end_time
                              )}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Disponibilidade;