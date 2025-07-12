'use client';

import { useEffect, useState } from 'react';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import AlertDialog from '@/components/AlertDialog';
import { CircularProgress } from '@mui/material';
import Cookies from 'js-cookie';
import Loading from '../loading';
import { useNotification } from '@/contexts/NotificationContext';
import { useLoading } from '@/contexts/LoadingContext';

export default function TourIncludes() {
  const { showSuccess, showError } = useNotification();
  const { setLoading, isLoading } = useLoading();
  
  const [includes, setIncludes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: null });
  const [deleteItem, setDeleteItem] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [update, setUpdate] = useState(0);

  useEffect(() => {
    document.title = 'Tour Includes - Admin';
    fetchIncludes();
  }, [update]);

  const fetchIncludes = async () => {
    try {
      setLoading('fetchIncludes', true, 'Loading includes...');
      const response = await fetch('http://localhost:5000/include/all', {
        method: 'GET',
        headers: {
          'admin': JSON.parse(Cookies.get('tk_auth_details')).email
        },
      });
      const data = await response.json();
      
      if (data.status === false) {
        showError('Failed to fetch includes');
      } else {
        setIncludes(data);
      }
    } catch (error) {
      console.log('Error fetching includes:', error);
      showError('Error fetching includes');
    } finally {
      setLoading('fetchIncludes', false);
    }
  };

  const handleAdd = () => {
    setEditItem(null);
    setFormData({ name: '', icon: null });
    setPreviewUrl('');
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({ name: item.name, icon: null });
    setPreviewUrl(item.icon);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, icon: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formDatas = new FormData();
    formDatas.append('image', formData.icon ?? null);
    formDatas.append('name', formData.name);
    if (editItem !== null) {
      formDatas.append('id', editItem.id);
    }

    try {
      const endpoint = editItem ? 'update' : 'create';
      const response = await fetch(`http://localhost:5000/include/${endpoint}`, {
        method: 'POST',
        headers: {
          'admin': JSON.parse(Cookies.get('tk_auth_details')).email
        },
        body: formDatas
      });
      const data = await response.json();
      
      if (data.status === true) {
        showSuccess(data.message || `Include ${editItem ? 'updated' : 'created'} successfully`);
        setShowModal(false);
        setFormData({ name: '', icon: null });
        setPreviewUrl('');
        setEditItem(null);
        setUpdate(update + 1);
      } else {
        showError(data.message || `Failed to ${editItem ? 'update' : 'create'} include`);
      }
    } catch (error) {
      console.log('Error submitting include:', error);
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (item) => {
    setDeleteItem(item);
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/include/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin': JSON.parse(Cookies.get('tk_auth_details')).email
        },
        body: JSON.stringify({ id: deleteItem.id })
      });
      const data = await response.json();
      
      if (data.status === true) {
        showSuccess(data.message || 'Tour include deleted successfully');
        setUpdate(update + 1);
      } else {
        showError(data.message || 'Failed to delete include');
      }
    } catch (error) {
      console.log('Error deleting include:', error);
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
      setDeleteItem(null);
    }
  };



  return (
    <>
      {isLoading('fetchIncludes') ? <Loading /> :
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-secondary-900">Tour Includes</h1>
            <button
              onClick={handleAdd}
              className="btn-primary"
              disabled={isSubmitting}
            >
              <AddIcon className="w-5 h-5 mr-2" />
              Add New Include
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {includes.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 flex flex-col items-center transition-all duration-200 hover:shadow-md hover:border-primary-200 hover:-translate-y-1 group"
              >
                <div className="w-16 h-16 mb-3 rounded-full bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <img src={"http://localhost:5000/uploads/" + item.image} alt={item.name} className="w-8 h-8" />
                </div>
                <h3 className="text-center font-medium text-secondary-900 group-hover:text-primary-600 transition-colors">{item.name}</h3>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => {
                      handleEdit(item)
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
            ))}
          </div>

          {/* Add/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex justify-between items-center p-4 border-b border-secondary-200">
                  <h2 className="text-lg font-semibold text-secondary-900">
                    {editItem ? 'Edit Include' : 'Add New Include'}
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
                      placeholder="Enter include name"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Icon
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-lg border-2 border-dashed border-secondary-300 flex items-center justify-center">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-16 h-16 object-contain"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-secondary-400" />
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="icon-upload"
                          disabled={isSubmitting}
                        />
                        <label
                          htmlFor="icon-upload"
                          className={`btn-secondary cursor-pointer ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''} `}
                        >
                          Choose Icon
                        </label>
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
                        editItem ? 'Save Changes' : 'Add Include'
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
            title="Delete Tour Include"
            message={`Are you sure you want to delete "${deleteItem?.name}" ? This action cannot be undone.`}
            confirmLabel={isSubmitting ? "Deleting..." : "Delete"}
            confirmVariant="error"
            onConfirm={confirmDelete}
            onCancel={() => setDeleteItem(null)}
            disabled={isSubmitting}
          />


        </div>
      }
    </>
  );
}
