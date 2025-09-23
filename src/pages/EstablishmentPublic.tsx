import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Building, Clock, MapPin, Phone, DollarSign } from 'lucide-react';

interface Establishment {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  contact_info: string | null;
}

interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
}

const EstablishmentPublic = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('ID do estabelecimento não fornecido');
        setLoading(false);
        return;
      }

      try {
        // Fetch establishment details
        const { data: establishmentData, error: establishmentError } = await supabase
          .from('establishments')
          .select('*')
          .eq('id', parseInt(id))
          .single();

        if (establishmentError) {
          throw establishmentError;
        }

        setEstablishment(establishmentData);

        // Fetch services for this establishment
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('establishment_id', parseInt(id));

        if (servicesError) {
          throw servicesError;
        }

        setServices(servicesData || []);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar informações do estabelecimento');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleServiceClick = (serviceId: number) => {
    navigate(`/agendar/${serviceId}`);
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

  if (error || !establishment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Erro</h1>
          <p className="text-muted-foreground">{error || 'Estabelecimento não encontrado'}</p>
          <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            ← Voltar
          </Button>
        </div>

        {/* Establishment Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <Building className="h-6 w-6" />
              <span>{establishment.name}</span>
            </CardTitle>
            {establishment.description && (
              <CardDescription className="text-base">
                {establishment.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {establishment.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{establishment.address}</span>
                </div>
              )}
              {establishment.contact_info && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{establishment.contact_info}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <div>
          <h2 className="text-xl font-bold mb-4">Serviços Disponíveis</h2>
          {services.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhum serviço disponível no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {services.map((service) => (
                <Card key={service.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                        {service.description && (
                          <p className="text-muted-foreground mb-3">{service.description}</p>
                        )}
                        <div className="flex items-center space-x-4">
                          <Badge variant="secondary" className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(service.duration_minutes)}</span>
                          </Badge>
                          <Badge variant="outline" className="flex items-center space-x-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{formatPrice(service.price)}</span>
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleServiceClick(service.id)}
                        className="ml-4"
                      >
                        Agendar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstablishmentPublic;