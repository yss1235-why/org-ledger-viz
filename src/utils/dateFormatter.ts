import { format } from 'date-fns';

/**
 * Formats a Firestore timestamp or Date object to a readable date string
 */
export const formatDate = (date: Date | { toDate: () => Date } | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = date instanceof Date ? date : date.toDate();
    return format(dateObj, 'dd MMM yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Formats a date with time
 */
export const formatDateTime = (date: Date | { toDate: () => Date } | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = date instanceof Date ? date : date.toDate();
    return format(dateObj, 'dd MMM yyyy, hh:mm a');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};
