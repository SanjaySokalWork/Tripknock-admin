'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Add, Edit, Delete, Search, Visibility, FilterList } from '@mui/icons-material';
import LoadingSpinner from '@/components/LoadingSpinner';
import Cookies from 'js-cookie';
import AlertDialog from '@/components/AlertDialog';
import { useNotification } from '@/contexts/NotificationContext';
import { useLoading } from '@/contexts/LoadingContext';

export default function DestinationsPage() {
  const { showSuccess, showError, showInfo } = useNotification();
  const { setLoading, isLoading } = useLoading();

  const [destinations, setDestinations] = useState([
    {
      id: 1,
      title: 'Paris',
      country: 'France',
      status: 'published',
      name: 'Paris',
      category: 'City',
      from: 'Paris',
    }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [deleteItem, setDeleteItem] = useState(null);
  const [change, setChange] = useState(0);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [uniqueDestinations, setUniqueDestinations] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer)
  }, [searchQuery]);

  useEffect(() => {
    document.title = 'Theme Pages - Tripknock';
    setLoading('fetchThemePages', true, 'Loading theme pages...');
    async function fetchAll() {
      try {
        const response = await fetch('http://localhost:5000/themes-pages/all');
        const data = await response.json();
        if (data.status === false) {
          showError('Error fetching theme pages: ' + data.message);
          return;
        }

        setDestinations(data);

        // Extract unique destination names for the filter dropdown
        const uniqueNames = [...new Set(data.map(dest => dest.type.category))].sort();
        setUniqueDestinations(uniqueNames);
      } catch (error) {
        console.log('Error fetching destinations:', error);
        showError('Failed to load theme pages');
      } finally {
        setLoading('fetchThemePages', false);
      }
    }
    fetchAll();
  }, [change]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleDestinationFilter = (e) => {
    setDestinationFilter(e.target.value);
  };

  const filteredDestinations = destinations.filter((destination) => {
    const searchTerm = debouncedSearchQuery.toLowerCase();

    // Status filter
    const matchesStatus =
      statusFilter === 'all' ||
      destination.status === statusFilter;

    // Destination name filter
    const matchesDestination =
      destinationFilter === 'all' ||
      destination.type.category === destinationFilter;

    // Search filter (name, title, category, id)
    const matchesSearch =
      destination.title?.toLowerCase().includes(searchTerm) ||
      destination.name?.toLowerCase().includes(searchTerm) ||
      destination.category?.toLowerCase().includes(searchTerm) ||
      String(destination.id).includes(searchTerm.replace(/TRIPDES/gi, '').trim()); // For ID search

    return matchesSearch && matchesStatus && matchesDestination;
  });

  const handleDelete = (item) => {
    setDeleteItem(item);
  };

  const confirmDelete = async (id) => {
    setLoading('deleteThemePage', true, 'Deleting theme page...');
    try {
      let res = await fetch(`http://localhost:5000/themes-pages/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin': JSON.parse(Cookies.get('tk_auth_details')).email
        },
        body: JSON.stringify({ id: deleteItem.id })
      })
      let data = await res.json();
      if (data.status === false) {
        showError('An error occurred while deleting theme page');
        return;
      } else {
        showSuccess('Theme page deleted successfully');
        setDestinations(prev => prev.filter(dest => dest.id !== id));
      }
    } catch (error) {
      console.log('Error deleting destination:', error);
      showError('Failed to delete theme page');
    } finally {
      setLoading('deleteThemePage', false);
      setDeleteItem(null);
      setChange(change + 1);
    }
  };

  return (
    <>
      {isLoading('fetchThemePages') ? <LoadingSpinner /> :
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Theme Pages</h1>
              <p className="text-secondary-600">Manage your theme pages</p>
            </div>
            <Link
              href="/themes/create"
              className="btn-primary flex items-center gap-2"
            >
              <Add className="w-5 h-5" />
              Add Theme Page
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
            <div className="p-4 border-b border-secondary-200">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Search by name, title, category..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="flex-1 bg-transparent border-none focus:outline-none text-secondary-900 placeholder-secondary-400"
                  />
                </div>

                <div className="flex flex-row gap-2 items-center">
                  <select
                    value={statusFilter}
                    onChange={handleStatusFilter}
                    className="rounded-md border border-secondary-300 shadow-sm py-1.5 px-2 bg-white text-secondary-900 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>

                  <select
                    value={destinationFilter}
                    onChange={handleDestinationFilter}
                    className="rounded-md border border-secondary-300 shadow-sm py-1.5 px-2 bg-white text-secondary-900 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Categories</option>
                    {uniqueDestinations.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Theme Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {filteredDestinations.length > 0 ? (
                    filteredDestinations.map((destination) => (
                      <tr key={destination.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-xs text-secondary-900">#TRIPDES{destination.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-secondary-900">{destination.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-secondary-600">
                          {destination.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-secondary-600">
                          {destination.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${destination.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {destination.status}
                          </span>
                          <span className="block mt-1 font-semibold text-xs">{destination.date}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-secondary-600">
                          <div className="flex items-center gap-2">
                            {destination.status === 'published' ?
                              <button
                                className="text-secondary-600 hover:text-secondary-900"
                              >
                                <Visibility className="w-5 h-5" />
                              </button>
                              :
                              <></>
                            }
                            <Link
                              href={`/themes/edit/${destination.slug}`}
                              className="text-secondary-600 hover:text-secondary-900"
                            >
                              <Edit className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(destination)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Delete className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-secondary-600">
                        No destinations found matching your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={!!deleteItem}
            title="Delete Theme Page"
            message={`Are you sure you want to delete "${deleteItem?.title}"? This action cannot be undone.`}
            confirmLabel={isLoading('deleteThemePage') ? "Deleting..." : "Delete"}
            confirmVariant="error"
            onConfirm={() => confirmDelete(deleteItem.id)}
            onCancel={() => {
              setDeleteItem(null);
            }}
            disabled={isLoading('deleteThemePage')}
          />


        </div>
      }
    </>
  );
}