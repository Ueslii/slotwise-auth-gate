import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Home } from 'lucide-react';

const BookingSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="text-center">
          <CardHeader className="pb-6">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Agendamento Confirmado!
            </CardTitle>
            <CardDescription className="text-lg">
              Seu agendamento foi criado com sucesso
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Você receberá uma confirmação e poderá gerenciar seus agendamentos
                na área do cliente.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => navigate('/meus-agendamentos')}
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Ver Meus Agendamentos</span>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Voltar ao Início</span>
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>
                Caso precise cancelar ou reagendar, acesse "Meus Agendamentos"
                em sua área do cliente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingSuccess;