import { useState } from 'react';
import { TrendingUp, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/currencyFormatter';
import { TransactionModal } from './TransactionModal';

interface BalanceSectionProps {
  balance: number;
  loading: boolean;
}

export const BalanceSection = ({ balance, loading }: BalanceSectionProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="py-16 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Current Treasury Balance</h2>
            <p className="text-white/80 text-sm">Click the balance to view complete transaction history</p>
          </div>

          <Card 
            className="max-w-2xl mx-auto cursor-pointer transition-all hover:shadow-2xl hover:scale-105 bg-white/95 backdrop-blur border-0"
            onClick={() => setShowModal(true)}
          >
            <CardContent className="p-8 text-center">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-16 bg-muted rounded w-64 mx-auto"></div>
                </div>
              ) : (
                <>
                  <div className="text-5xl md:text-6xl font-bold text-primary mb-4">
                    {formatCurrency(balance)}
                  </div>
                  <Button variant="outline" className="group">
                    <Eye className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    View Transaction History
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <TransactionModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
