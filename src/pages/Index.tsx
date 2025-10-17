import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Header } from '@/components/PublicView/Header';
import { BalanceSection } from '@/components/PublicView/BalanceSection';
import { EventsSection } from '@/components/PublicView/EventsSection';
import { AnnouncementsSection } from '@/components/PublicView/AnnouncementsSection';

const Index = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'treasury', 'current'),
      (doc) => {
        if (doc.exists()) {
          setBalance(doc.data()?.balance || 0);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching balance:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <BalanceSection balance={balance} loading={loading} />
        <EventsSection />
        <AnnouncementsSection />
      </main>
      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Organization Treasury. All rights reserved.</p>
          <p className="mt-2">Committed to transparency and accountability</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
