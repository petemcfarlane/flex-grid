/**
 * Toast notification utility wrapper
 */
export function useToast() {
  return {
    success: (message: string) => {
      // react-hot-toast will be configured globally
      // This is a simple wrapper for now
      console.log('✅', message);
    },
    error: (message: string) => {
      console.error('❌', message);
    },
    info: (message: string) => {
      console.log('ℹ️', message);
    },
  };
}
