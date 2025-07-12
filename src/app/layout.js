'use client';

import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import DashboardLayout from '@/components/DashboardLayout';
import { AppProvider } from '@/context/AppContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { LoadingProvider } from '@/contexts/LoadingContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<LoadingSpinner />}>
          <div className="min-h-screen bg-gray-50">
            <AppProvider>
              <NotificationProvider>
                <LoadingProvider>
              <DashboardLayout>{children}</DashboardLayout>
                </LoadingProvider>
              </NotificationProvider>
            </AppProvider>
          </div>
        </Suspense>
      </body>
    </html>
  );
}
