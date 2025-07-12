'use client';

import Sidebar from '@/components/Sidebar';

export default function ClientLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}
