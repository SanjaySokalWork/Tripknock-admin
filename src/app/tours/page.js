'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import MetaData from '@/components/MetaData';
import {
  Add,
  Edit,
  Delete,
  Search,
  Public,
  SaveAs,
  Visibility
} from '@mui/icons-material';
import AlertDialog from '@/components/AlertDialog';
import Loading from '../loading';
import Cookies from 'js-cookie';
import { useNotification } from '@/contexts/NotificationContext';
import { useLoading } from '@/contexts/LoadingContext';

export default function ToursPage() {
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useNotification();
  const { setLoading, isLoading } = useLoading();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteTour, setDeleteTour] = useState(null);
  const [theme, setTheme] = useState([]);

  // Sample data - replace with actual API call
  const [tours, setTours] = useState([]);

  useEffect(() => {
    document.title = "Tours | Tripknock";
    setLoading('fetchTours', true, 'Loading tours...');

    async function loadDataOne() {
      try {
        let res = await fetch("http://localhost:5000/package/load")
        let result = await res.json();

        if (result.theme) {
          let newtheme = []
          result.theme.map(ele => newtheme.push({ value: ele.slug, label: ele.name }))
          setTheme(newtheme);
        }
      } catch (error) {
        console.log('Error loading package data:', error);
        showError('Failed to load package data');
      }
    }

    async function fetchData() {
      try {
        const res = await fetch("http://localhost:5000/package/all");
        const data = await res.json();
        let newData = [];
        // console.log(data);

        for (let i = 0; i < data.length; i++) {
          let set = new Set();
          for (let j = 0; j < data[i].destinations.length; j++) {
            if (data[i].destinations[j]) {
              set.add(JSON.parse(data[i].destinations[j].type).name);
            }
          }
          data[i].destinations = Array.from(set);
        }

        setTours(data);
      } catch (error) {
        console.log('Error fetching tours:', error);
        showError('Failed to load tours');
      } finally {
        setLoading('fetchTours', false);
      }
    }

    loadDataOne();
    fetchData();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDelete = (tour) => {
    setDeleteTour(tour);
  };

  const confirmDelete = async () => {
    setLoading('deleteTour', true, 'Deleting tour...');
    try {
      let check = await fetch("http://localhost:5000/package/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'admin': JSON.parse(Cookies.get('tk_auth_details')).email
        },
        body: JSON.stringify({ id: deleteTour.id }),
      });
      check = await check.json();
      if (check.status === true) {
        setTours(tours.filter(tour => tour.id !== deleteTour.id));
        showSuccess('Tour deleted successfully');
      } else {
        showError('Failed to delete tour');
      }
    } catch (error) {
      console.log('Error deleting tour:', error);
      showError('An error occurred while deleting tour');
    } finally {
      setLoading('deleteTour', false);
      setDeleteTour(null);
    }
  };

  const filteredTours = tours.filter((tour) => {
    const matchesSearch =
      tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tour.destinations && Array.isArray(tour.destinations) &&
        tour.destinations.some(destination =>
          (typeof destination === 'string' && destination.toLowerCase().includes(searchQuery.toLowerCase()))
        )) ||
      String(tour.id).includes(searchQuery.replace(/TKTOUR/gi, '').trim());

    const matchesType =
      filterType === "all" ||
      (tour.themes && tour.themes.includes(filterType));

    const matchesStatus = filterStatus === "all" || tour.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <>
      {isLoading('fetchTours') ? <Loading /> :
        <div className="p-6">
          <MetaData
            title="Tours Management"
            description="Manage your tours, create new tour packages, edit existing tours, and control all tour-related operations from one place."
          />
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-secondary-900">Tours</h1>
            <button
              onClick={() => router.push('/tours/create')}
              className="btn-primary flex items-center gap-2"
            >
              <Add className="w-5 h-5" />
              Create Tour
            </button>
          </div>

          <Suspense fallback={<LoadingSpinner />}>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-secondary-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearch}
                      className="block w-full pl-10 pr-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Search tours by title, destination, or type..."
                    />
                  </div>
                </div>

                {/* Filter by Type */}
                <div className="w-full md:w-48">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-lg"
                  >
                    <option value="all">All Themes</option>
                    {theme.map((ele, ind) => (
                      <option key={ind} value={ele.value}>{ele.label}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by Status */}
                <div className="w-full md:w-48">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-lg"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
          </Suspense>

          <div className="bg-white rounded-lg shadow-sm mt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {filteredTours.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="text-secondary-500">
                          {tours.length === 0 ? 'No tours found. Create your first tour!' : 'No tours match your search criteria.'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTours.map((tour) => (
                      <tr key={tour.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-secondary-900">#TKTOUR{tour.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-secondary-900">{tour.title}</div>
                          <div className="text-sm text-secondary-500">
                            {tour.themes && tour.themes.length > 0 ?
                              tour.themes.map(theme => theme + (theme === tour.themes[tour.themes.length - 1] ? '' : ', ')) :
                              <></>
                            }
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-secondary-500">
                          {
                            tour.destinations && (tour.destinations.length > 0) &&
                            <React.Fragment>
                              {tour.destinations?.map((destination, ind) => (
                                <div key={ind}>
                                  {typeof destination === 'string' ? destination : `Destination ${destination}`}
                                  {ind < tour.destinations.length - 1 && ', '}
                                </div>
                              ))}
                            </React.Fragment>
                          }
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary-500">
                          {tour.time ?
                            `${tour.time.nights || 'N/A'} Nights ${tour.time.days || 'N/A'} Days` :
                            'Duration not set'
                          }
                        </td>
                        <td className="px-6 py-4">
                          {tour.price && tour.price.length > 0 ? (
                            <>
                              <div className="text-sm font-medium text-secondary-900">₹{tour.price[0].regular || 'N/A'} /-</div>
                              {tour.price[0].discount && tour.price[0].discount > 0 && (
                                <div className="text-xs text-secondary-500">
                                  <span className="line-through">₹{tour.price[0].regular}</span>
                                  <span className="text-green-600 ml-1">- {tour.price[0].discount}%</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-sm text-secondary-500">Price not set</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tour.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {tour.status === 'published' ? (
                              <>
                                <Public className="w-4 h-4 mr-1" />
                                Published
                              </>
                            ) : (
                              <>
                                <SaveAs className="w-4 h-4 mr-1" />
                                Draft
                              </>
                            )}
                          </span>
                          <span className="text-sm block text-secondary-700 text-semibold block mt-1">
                            {tour.date}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex justify-end items-center gap-2">
                            {tour.status === 'published' ?
                              <button
                                onClick={() => router.push(`/tours/edit/${tour.slug}`)}
                                className="text-secondary-600 hover:text-secondary-900"
                              >
                                <Visibility className="w-5 h-5" />
                              </button>
                              : <></>}
                            <button
                              onClick={() => router.push(`/tours/edit/${tour.slug}`)}
                              className="text-secondary-600 hover:text-secondary-900"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(tour)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Delete className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={!!deleteTour}
            title="Delete Tour"
            message={`Are you sure you want to delete tour "${deleteTour?.title}"? This action cannot be undone.`}
            confirmLabel="Delete"
            confirmVariant="error"
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTour(null)}
          />
        </div >
      }
    </>
  );
}
