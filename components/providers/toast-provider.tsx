'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function ToastProvider() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'hsl(30 15% 8%)',
          border: '1px solid hsl(30 10% 18%)',
          color: 'hsl(40 30% 95%)',
        },
      }}
    />
  );
}
