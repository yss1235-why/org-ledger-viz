import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, ADMIN_EMAILS } from '@/config/firebase';
import { toast } from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser ? ADMIN_EMAILS.includes(currentUser.email || '') : false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (!ADMIN_EMAILS.includes(result.user.email || '')) {
        await signOut(auth);
        toast.error('Unauthorized: You do not have admin access.');
        return null;
      }
      toast.success('Successfully logged in!');
      return result.user;
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
      return null;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Successfully logged out');
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout');
    }
  };

  return {
    user,
    loading,
    isAdmin,
    loginWithGoogle,
    logout,
  };
};
