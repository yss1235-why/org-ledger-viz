import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionManager } from '@/components/Admin/TransactionManager';
import { EventManager } from '@/components/Admin/EventManager';
import { AnnouncementManager } from '@/components/Admin/AnnouncementManager';
import { LogOut, LayoutDashboard, Receipt, Calendar, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('transactions');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="transactions" className="space-x-2">
              <Receipt className="h-4 w-4" />
              <span>Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="space-x-2">
              <Megaphone className="h-4 w-4" />
              <span>Announcements</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionManager />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <EventManager />
          </TabsContent>

          <TabsContent value="announcements" className="space-y-6">
            <AnnouncementManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
