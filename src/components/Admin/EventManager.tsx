import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatDate } from '@/utils/dateFormatter';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, Clock, Calendar as CalendarIcon } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: any;
  status: 'ongoing' | 'upcoming';
}

export const EventManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; eventId: string | null }>({
    open: false,
    eventId: null,
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'upcoming' as 'ongoing' | 'upcoming',
  });

  // Fetch events
  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];
      setEvents(eventData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'upcoming',
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date),
        status: formData.status,
        createdAt: serverTimestamp(),
      };

      if (editingEvent) {
        await updateDoc(doc(db, 'events', editingEvent.id), eventData);
        toast.success('Event updated successfully!');
      } else {
        await addDoc(collection(db, 'events'), eventData);
        toast.success('Event added successfully!');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      status: event.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
      toast.success('Event deleted successfully!');
      setDeleteDialog({ open: false, eventId: null });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleStatusToggle = async (event: Event) => {
    try {
      const newStatus = event.status === 'ongoing' ? 'upcoming' : 'ongoing';
      await updateDoc(doc(db, 'events', event.id), { status: newStatus });
      toast.success(`Event status changed to ${newStatus}`);
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error('Failed to update event status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</CardTitle>
              <CardDescription>
                {editingEvent ? 'Update event details' : 'Create a new event'}
              </CardDescription>
            </div>
            <Button onClick={() => (showForm ? resetForm() : setShowForm(true))} variant={showForm ? 'outline' : 'default'}>
              {showForm ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> Add Event</>}
            </Button>
          </div>
        </CardHeader>
        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value: 'ongoing' | 'upcoming') => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter event description"
                    rows={4}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingEvent ? 'Update Event' : 'Add Event'}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>Manage your organization's events</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner text="Loading events..." />
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No events found. Add your first event above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <Badge
                        className={event.status === 'ongoing' ? 'bg-primary' : 'bg-secondary'}
                      >
                        {event.status === 'ongoing' ? <Clock className="mr-1 h-3 w-3" /> : <CalendarIcon className="mr-1 h-3 w-3" />}
                        {event.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center">
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      {formatDate(event.date)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleStatusToggle(event)} className="flex-1">
                        Toggle Status
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteDialog({ open: true, eventId: event.id })}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, eventId: null })}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        onConfirm={() => deleteDialog.eventId && handleDelete(deleteDialog.eventId)}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};
