import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Organization Treasury</h1>
            <p className="text-xs text-muted-foreground">Transparent Fund Management</p>
          </div>
        </div>
        <Link to="/login">
          <Button variant="outline" size="sm">
            <Shield className="mr-2 h-4 w-4" />
            Admin
          </Button>
        </Link>
      </div>
    </header>
  );
};
