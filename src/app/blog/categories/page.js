'use client';

import { useEffect, useState } from 'react';
import { Add, Edit, Delete, Search, Close } from '@mui/icons-material';
import LoadingSpinner from '@/components/LoadingSpinner';
import AlertDialog from '@/components/AlertDialog';
import Cookies from 'js-cookie';

// Modal component for category add/edit
const CategoryModal = ({ isOpen, onClose, category, onSave, title }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: ''
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || ''
      });
    } else {
      setFormData({
        name: '',
        slug: ''
      });
    }
  }, [category, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug when name changes
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Close className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                className="input-field w-full"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="slug"
                className="input-field w-full"
                value={formData.slug}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {category ? 'Update Category' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function CategoriesPage() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Categories - Tripknock';
    fetchCategories();
    
    // Check if admin token exists
    try {
      const authCookie = Cookies.get('tk_auth_details');
      if (!authCookie) {
        setError('Authentication required. Please log in as an admin.');
      }
    } catch (error) {
      console.log('Error checking authentication:', error);
      setError('Authentication error. Please log in again.');
    }
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://data.tripknock.in/blog/categories/all');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      
      setCategories(data);
      setError(null);
    } catch (error) {
      console.log('Error fetching categories:', error);
      setError('Failed to load categories. Please try again.');
    }
    setLoading(false);
  };

  const handleAddCategory = async (categoryData) => {
    setLoading(true);
    
    try {
      const authCookie = Cookies.get('tk_auth_details');
      if (!authCookie) {
        throw new Error('Authentication required. Please log in as an admin.');
      }
      
      const adminEmail = JSON.parse(authCookie).email;
      
      const response = await fetch('https://data.tripknock.in/blog/categories/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin': adminEmail
        },
        body: JSON.stringify(categoryData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add category');
      }
      
      // Reset form and refresh categories
      setIsAddModalOpen(false);
      await fetchCategories();
      setError(null);
    } catch (error) {
      console.log('Error adding category:', error);
      setError(error.message || 'Failed to add category. Please try again.');
    }
    
    setLoading(false);
  };

  const handleUpdateCategory = async (categoryData) => {
    if (!editingCategory) return;
    setLoading(true);
    
    try {
      const authCookie = Cookies.get('tk_auth_details');
      if (!authCookie) {
        throw new Error('Authentication required. Please log in as an admin.');
      }
      
      const adminEmail = JSON.parse(authCookie).email;
      
      const response = await fetch(`https://data.tripknock.in/blog/categories/update/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'admin': adminEmail
        },
        body: JSON.stringify(categoryData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update category');
      }
      
      // Reset form and refresh categories
      setEditingCategory(null);
      await fetchCategories();
      setError(null);
    } catch (error) {
      console.log('Error updating category:', error);
      setError(error.message || 'Failed to update category. Please try again.');
    }
    
    setLoading(false);
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategory) return;
    
    setLoading(true);
    try {
      const authCookie = Cookies.get('tk_auth_details');
      if (!authCookie) {
        throw new Error('Authentication required. Please log in as an admin.');
      }
      
      const adminEmail = JSON.parse(authCookie).email;
      
      const response = await fetch(`https://data.tripknock.in/blog/categories/delete/${deleteCategory.id}`, {
        method: 'DELETE',
        headers: {
          'admin': adminEmail
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }
      
      // Reset and refresh categories
      setDeleteCategory(null);
      await fetchCategories();
      setError(null);
    } catch (error) {
      console.log('Error deleting category:', error);
      setError(error.message || 'Failed to delete category. Please try again.');
    }
    
    setLoading(false);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {loading && <LoadingSpinner />}
      
      {/* Delete Confirmation Dialog */}
      {deleteCategory && (
        <AlertDialog
          open={!!deleteCategory}
          title="Delete Category"
          message={`Are you sure you want to delete the category "${deleteCategory.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleDeleteCategory}
          onCancel={() => setDeleteCategory(null)}
        />
      )}
      
      {/* Add Category Modal */}
      <CategoryModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        category={null}
        onSave={handleAddCategory}
        title="Add New Category"
      />
      
      {/* Edit Category Modal */}
      <CategoryModal 
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        category={editingCategory}
        onSave={handleUpdateCategory}
        title="Edit Category"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Categories</h1>
            <p className="text-secondary-600">Manage blog categories</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Add className="w-5 h-5" />
            Add Category
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-secondary-400" />
            </div>
            <input
              type="text"
              className="input-field pl-10 w-full"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    URL Slug
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Blogs
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-secondary-500">
                      {searchQuery ? 'No categories found matching your search.' : 'No categories found. Add your first category!'}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-secondary-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-500">{category.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-500">{category.blogCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setEditingCategory(category)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteCategory(category)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Delete className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
