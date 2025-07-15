'use client';

import { useState, useEffect } from 'react';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Close as CloseIcon } from '@mui/icons-material';
import AlertDialog from '@/components/AlertDialog';
import { CircularProgress } from '@mui/material';
import Cookies from 'js-cookie';
import Loading from '../loading';
import { useNotification } from '@/contexts/NotificationContext';
import { useLoading } from '@/contexts/LoadingContext';

export default function TourThemes() {
  const { showSuccess, showError, showInfo } = useNotification();
  const { setLoading, isLoading } = useLoading();
  
  const [themes, setThemes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', image: null });
  const [previewUrl, setPreviewUrl] = useState('');
  const [currentTarget, setCurrentTarget] = useState("");
  const [change, setChange] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Tour Themes - Admin Panel';
    fetchData();
  }, [change]);

  const fetchData = async () => {
    try {
      setLoading('fetchThemes', true, 'Loading themes...');
      const res = await fetch('https://data.tripknock.in/theme/all');
      const data = await res.json();
      
      if (data.status === false) {
        showError('Failed to fetch themes');
      } else {
        setThemes(data);
      }
    } catch (error) {
      console.log('Error fetching themes:', error);
      showError('Error fetching themes');
    } finally {
      setLoading('fetchThemes', false);
    }
  };


  const handleAdd = () => {
    setEditItem(null);
    setFormData({ name: '', image: null });
    setPreviewUrl('');
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({ name: item.name, image: null });
    setPreviewUrl(item.image);
    setShowModal(true);
  };

  const handleDelete = (item) => {
    setDeleteItem(item);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData2 = new FormData();
    formData2.append('name', formData.name);
    formData2.append('image', formData.image ?? null);
    if (editItem !== null) {
      formData2.append('id', editItem.id);
    }

    try {
      if (editItem !== null) {
        const res = await fetch('https://data.tripknock.in/theme/update', {
          method: 'POST',
          headers: {
            'admin': JSON.parse(Cookies.get('tk_auth_details')).email
          },
          body: formData2
        });
        const data = await res.json();
        
        if (data.status === true) {
          setChange(change + 1);
          showSuccess('Theme updated successfully');
          setShowModal(false);
        } else {
          showError(`Failed to update theme: ${data.message || 'Unknown error'}`);
        }
      } else {
        const res = await fetch('https://data.tripknock.in/theme/create', {
          method: 'POST',
          headers: {
            'admin': JSON.parse(Cookies.get('tk_auth_details')).email
          },
          body: formData2
        });
        const data = await res.json();
        
        if (data.status === true) {
          showSuccess('Theme added successfully');
          setChange(change + 1);
          setShowModal(false);
        } else {
          showError(`Failed to add theme: ${data.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.log('Error submitting theme:', error);
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('https://data.tripknock.in/theme/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin': JSON.parse(Cookies.get('tk_auth_details')).email
        },
        body: JSON.stringify({ id: deleteItem.id })
      });
      const data = await res.json();
      
      if (data.status === true) {
        setChange(change + 1);
        showSuccess('Theme deleted successfully');
      } else {
        showError(`Failed to delete theme: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log('Error deleting theme:', error);
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
      setDeleteItem(null);
    }
  };



  return (
    <>
      {isLoading('fetchThemes') ? <Loading /> :
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-secondary-900">Tour Themes</h1>
            <button
              onClick={handleAdd}
              className="btn-primary"
              disabled={isSubmitting}
            >
              <AddIcon className="w-5 h-5 mr-2" />
              Add New Theme
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {themes.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary-200"
              >
                <div className="aspect-w-16 aspect-h-9 bg-secondary-100">
                  <img
                    src={"https://data.tripknock.in/uploads/" + item?.image}
                    alt={item?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-secondary-900">{item.name}</h3>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setCurrentTarget(item.slug);
                        handleEdit(item);
                      }}
                      className="p-1.5 text-secondary-600 hover:text-primary-600 rounded-full hover:bg-primary-50 transition-colors"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 text-secondary-600 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <DeleteIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex justify-between items-center p-4 border-b border-secondary-200">
                  <h2 className="text-lg font-semibold text-secondary-900">
                    {editItem ? 'Edit Theme' : 'Add New Theme'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-secondary-500 hover:text-secondary-700"
                    disabled={isSubmitting}
                  >
                    <CloseIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      placeholder="Enter theme name"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Image
                    </label>
                    <div className="mt-2">
                      <div className="flex items-center space-x-4">
                        <div className="w-32 h-32 rounded-lg border-2 border-dashed border-secondary-300 overflow-hidden">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-secondary-400">
                              No image
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                            disabled={isSubmitting}
                          />
                          <label
                            htmlFor="image-upload"
                            className={`btn-secondary cursor-pointer ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            Choose Image
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn-secondary"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary relative"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <CircularProgress size={20} className="mr-2" />
                          Processing...
                        </>
                      ) : (
                        editItem ? 'Save Changes' : 'Add Theme'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={!!deleteItem}
            title="Delete Theme"
            message={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
            confirmLabel={isSubmitting ? "Deleting..." : "Delete"}
            confirmVariant="error"
            onConfirm={confirmDelete}
            onCancel={() => {
              setDeleteItem(null);
            }}
            disabled={isSubmitting}
          />


        </div>
      }
    </>
  );
}
