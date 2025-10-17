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
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatTransactionAmount } from '@/utils/currencyFormatter';
import { formatDate } from '@/utils/dateFormatter';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

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

interface Event {
  id: string;
  title: string;
}

export const TransactionManager = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; transactionId: string | null }>({
    open: false,
    transactionId: null,
  });

  // Form state
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    description: '',
    receivedFrom: '',
    expenseCategory: '',
    relatedEvent: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Fetch transactions
  useEffect(() => {
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];
      setTransactions(transactionData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch events for dropdown
  useEffect(() => {
    const q = query(collection(db, 'events'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventData = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
      })) as Event[];
      setEvents(eventData);
    });

    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setFormData({
      type: 'income',
      amount: '',
      description: '',
      receivedFrom: '',
      expenseCategory: '',
      relatedEvent: '',
      date: new Date().toISOString().split('T')[0],
    });
    setEditingTransaction(null);
    setShowForm(false);
  };

  const updateTreasuryBalance = async (amountChange: number) => {
    const treasuryRef = doc(db, 'treasury', 'current');
    const treasuryDoc = await getDoc(treasuryRef);

    if (treasuryDoc.exists()) {
      const currentBalance = treasuryDoc.data().balance || 0;
      await updateDoc(treasuryRef, {
        balance: currentBalance + amountChange,
      });
    } else {
      await setDoc(treasuryRef, {
        balance: amountChange,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!formData.description) {
      toast.error('Please enter a description');
      return;
    }
    if (formData.type === 'income' && !formData.receivedFrom) {
      toast.error('Please specify who the income was received from');
      return;
    }
    if (formData.type === 'expense' && !formData.expenseCategory) {
      toast.error('Please specify the expense category');
      return;
    }

    try {
      const amount = parseFloat(formData.amount);
      const transactionData = {
        type: formData.type,
        amount,
        description: formData.description,
        ...(formData.type === 'income' && { receivedFrom: formData.receivedFrom }),
        ...(formData.type === 'expense' && { expenseCategory: formData.expenseCategory }),
        relatedEvent: formData.relatedEvent || null,
        date: new Date(formData.date),
        createdAt: serverTimestamp(),
      };

      if (editingTransaction) {
        // Calculate balance adjustment for edit
        const oldAmount = editingTransaction.amount;
        const oldType = editingTransaction.type;
        const balanceChange =
          formData.type === 'income'
            ? amount - (oldType === 'income' ? oldAmount : -oldAmount)
            : -amount - (oldType === 'income' ? oldAmount : -oldAmount);

        await updateDoc(doc(db, 'transactions', editingTransaction.id), transactionData);
        await updateTreasuryBalance(balanceChange);
        toast.success('Transaction updated successfully!');
      } else {
        // New transaction
        await addDoc(collection(db, 'transactions'), transactionData);
        const balanceChange = formData.type === 'income' ? amount : -amount;
        await updateTreasuryBalance(balanceChange);
        toast.success('Transaction added successfully!');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      receivedFrom: transaction.receivedFrom || '',
      expenseCategory: transaction.expenseCategory || '',
      relatedEvent: transaction.relatedEvent || '',
      date: transaction.date?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    });
    setShowForm(true);
  };

  const handleDelete = async (transactionId: string) => {
    try {
      const transaction = transactions.find((t) => t.id === transactionId);
      if (transaction) {
        const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
        await deleteDoc(doc(db, 'transactions', transactionId));
        await updateTreasuryBalance(balanceChange);
        toast.success('Transaction deleted successfully!');
      }
      setDeleteDialog({ open: false, transactionId: null });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</CardTitle>
              <CardDescription>
                {editingTransaction ? 'Update transaction details' : 'Record income or expense'}
              </CardDescription>
            </div>
            <Button onClick={() => (showForm ? resetForm() : setShowForm(true))} variant={showForm ? 'outline' : 'default'}>
              {showForm ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> Add Transaction</>}
            </Button>
          </div>
        </CardHeader>
        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type *</Label>
                  <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                {formData.type === 'income' ? (
                  <div className="space-y-2">
                    <Label htmlFor="receivedFrom">Received From *</Label>
                    <Input
                      id="receivedFrom"
                      value={formData.receivedFrom}
                      onChange={(e) => setFormData({ ...formData, receivedFrom: e.target.value })}
                      placeholder="Person or organization name"
                      maxLength={100}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="expenseCategory">Expense Category *</Label>
                    <Input
                      id="expenseCategory"
                      value={formData.expenseCategory}
                      onChange={(e) => setFormData({ ...formData, expenseCategory: e.target.value })}
                      placeholder="e.g., Venue Rent, Food & Catering"
                      maxLength={100}
                      required
                    />
                  </div>
                )}

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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter transaction details"
                    maxLength={200}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="relatedEvent">Related Event (Optional)</Label>
                  <Select value={formData.relatedEvent} onValueChange={(value) => setFormData({ ...formData, relatedEvent: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.title}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>Manage your income and expense records</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner text="Loading transactions..." />
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions found. Add your first transaction above.</p>
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(transaction.date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.type === 'income' ? 'default' : 'destructive'}
                          className={transaction.type === 'income' ? 'bg-income hover:bg-income/90' : 'bg-expense hover:bg-expense/90'}
                        >
                          {transaction.type === 'income' ? <ArrowUpCircle className="mr-1 h-3 w-3" /> : <ArrowDownCircle className="mr-1 h-3 w-3" />}
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.type === 'income' ? (
                          <span className="text-sm font-medium">{transaction.receivedFrom}</span>
                        ) : (
                          <Badge variant="outline">{transaction.expenseCategory}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{transaction.relatedEvent || '-'}</TableCell>
                      <TableCell className={`text-right font-semibold ${transaction.type === 'income' ? 'text-income' : 'text-expense'}`}>
                        {formatTransactionAmount(transaction.amount, transaction.type)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDialog({ open: true, transactionId: transaction.id })}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, transactionId: null })}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This will also update the treasury balance accordingly."
        onConfirm={() => deleteDialog.transactionId && handleDelete(deleteDialog.transactionId)}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};
