import { useToastContext } from '@/components/ui/Toast';

/**
 * Toast notification utility wrapper
 */
export function useToast() {
  const { addToast } = useToastContext();
  
  return {
    success: (message: string) => {
      addToast(message, 'success');
    },
    error: (message: string) => {
      addToast(message, 'error');
    },
    info: (message: string) => {
      addToast(message, 'info');
    },
  };
}
