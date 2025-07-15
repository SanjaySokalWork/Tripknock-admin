'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import {
  LocationOn,
  Luggage,
  Article,
  People,
  Reviews,
} from '@mui/icons-material';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNotification } from '@/contexts/NotificationContext';
import { useLoading } from '@/contexts/LoadingContext';

export default function Home() {
  const { user } = useAppContext();
  const { showError, showInfo } = useNotification();
  const { setLoading, isLoading } = useLoading();
  
  const [stats, setStats] = useState({
    destinations: { total: 0, published: 0, draft: 0 },
    tours: { total: 0, published: 0, draft: 0 },
    blogs: { total: 0, published: 0, draft: 0 },
    users: { total: 0 },
    reviews: { total: 0 }
  });

  useEffect(() => {
    document.title = "Dashboard | Tripknock";
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading('fetchStats', true, 'Loading dashboard stats...');
      const response = await fetch('https://data.tripknock.in/stats/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      showError('Failed to load stats, showing placeholder data');
      // Fallback to placeholder data if API fails
      setStats({
        destinations: { total: 24, published: 18, draft: 6 },
        tours: { total: 45, published: 32, draft: 13 },
        blogs: { total: 18, published: 15, draft: 3 },
        users: { total: 1205 },
        reviews: { total: 342 }
      });
    } finally {
      setLoading('fetchStats', false);
    }
  };

  const shortcuts = [
    {
      title: 'Destinations',
      description: 'Manage travel destinations',
      icon: <LocationOn className="h-6 w-6 text-blue-500" />,
      link: '/destinations',
      stats: stats.destinations
    },
    {
      title: 'Tours',
      description: 'Manage tour packages',
      icon: <Luggage className="h-6 w-6 text-purple-500" />,
      link: '/tours',
      stats: stats.tours
    },
    {
      title: 'Blogs',
      description: 'Manage blog articles',
      icon: <Article className="h-6 w-6 text-green-500" />,
      link: '/blogs',
      stats: stats.blogs
    },
    {
      title: 'Users',
      description: 'Manage user accounts',
      icon: <People className="h-6 w-6 text-orange-500" />,
      link: '/users',
      stats: stats.users
    },
    {
      title: 'Reviews',
      description: 'View customer reviews',
      icon: <Reviews className="h-6 w-6 text-yellow-500" />,
      link: '/reviews',
      stats: stats.reviews
    }
  ];

  if (isLoading('fetchStats')) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome back, {user?.name}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-secondary-800 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {shortcuts.map((shortcut, index) => (
            <Link
              href={shortcut.link}
              key={index}
              className="card p-4 hover:shadow-md transition-shadow duration-200 hover:border-primary-300"
            >
              <div className="flex items-start w-full">
                <div className="p-2 bg-gray-50 rounded-lg mr-3">
                  {shortcut.icon}
                </div>
                <div className="w-full">
                  <h3 className="font-medium text-secondary-900">{shortcut.title}</h3>
                  <p className="text-sm text-secondary-600 mt-1">{shortcut.description}</p>

                  {shortcut.stats && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-secondary-500">Total:</span>
                        <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                          {shortcut.stats.total}
                        </span>
                      </div>

                      {shortcut.stats.published !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-secondary-500">Published:</span>
                          <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            {shortcut.stats.published}
                          </span>
                        </div>
                      )}

                      {shortcut.stats.draft !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-secondary-500">Draft:</span>
                          <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                            {shortcut.stats.draft}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
