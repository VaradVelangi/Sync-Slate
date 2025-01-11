import { useState, useCallback } from 'react';

interface ToastState {
  isVisible: boolean;
  message: string;
  duration: number;
}

export const useToast = (defaultDuration: number = 3000) => {
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    message: '',
    duration: defaultDuration,
  });

  const showToast = useCallback((message: string, duration?: number) => {
    setToast({
      isVisible: true,
      message,
      duration: duration ?? defaultDuration,
    });
  }, [defaultDuration]);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
};