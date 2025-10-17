import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatTransactionAmount } from '@/utils/currencyFormatter';
import { formatDate } from '@/utils/dateFormatter';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  receivedFrom?: string;
  expenseCategory?: string;
  relatedEvent?: string;
  date: any;
}

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
}

export const TransactionModal = ({ open, onClose }: TransactionModalProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      
      setTransactions(transactionData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Complete Transaction History</DialogTitle>
        </DialogHeader>

        {loading ? (
          <LoadingSpinner text="Loading transactions..." />
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={transaction.type === 'income' ? 'default' : 'destructive'}
                        className={
                          transaction.type === 'income' 
                            ? 'bg-income hover:bg-income/90' 
                            : 'bg-expense hover:bg-expense/90'
                        }
                      >
                        {transaction.type === 'income' ? (
                          <ArrowUpCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <ArrowDownCircle className="mr-1 h-3 w-3" />
                        )}
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {transaction.type === 'income' ? (
                        <div className="text-sm">
                          <span className="text-muted-foreground">From: </span>
                          <span className="font-medium">{transaction.receivedFrom}</span>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <Badge variant="outline" className="font-normal">
                            {transaction.expenseCategory}
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm truncate">{transaction.description}</p>
                    </TableCell>
                    <TableCell>
                      {transaction.relatedEvent && (
                        <span className="text-sm text-muted-foreground">{transaction.relatedEvent}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold whitespace-nowrap">
                      <span className={transaction.type === 'income' ? 'text-income' : 'text-expense'}>
                        {formatTransactionAmount(transaction.amount, transaction.type)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
