import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate } from '@/utils/dateFormatter';
import { Calendar, Clock } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: any;
  status: 'ongoing' | 'upcoming';
}

export const EventsSection = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'events'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      
      setEvents(eventData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching events:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const ongoingEvents = events.filter(e => e.status === 'ongoing');
  const upcomingEvents = events.filter(e => e.status === 'upcoming');

  if (loading) {
    return <LoadingSpinner text="Loading events..." />;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Events</h2>
          <p className="text-muted-foreground">Stay updated with our latest activities</p>
        </div>

        {ongoingEvents.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-6 flex items-center">
              <Clock className="mr-2 h-6 w-6 text-primary" />
              Ongoing Events
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <Badge className="bg-primary">Ongoing</Badge>
                    </div>
                    <CardDescription className="flex items-center text-sm">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDate(event.date)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{event.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {upcomingEvents.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold mb-6 flex items-center">
              <Calendar className="mr-2 h-6 w-6 text-secondary" />
              Upcoming Events
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <Badge variant="secondary" className="bg-secondary">Upcoming</Badge>
                    </div>
                    <CardDescription className="flex items-center text-sm">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDate(event.date)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{event.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No events scheduled at the moment</p>
          </div>
        )}
      </div>
    </section>
  );
};
