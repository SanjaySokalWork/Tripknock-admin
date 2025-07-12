'use client';

import { useEffect, useState } from 'react';
import { Add, Edit, Delete, Search, Close } from '@mui/icons-material';
import LoadingSpinner from '@/components/LoadingSpinner';
import AlertDialog from '@/components/AlertDialog';
import Cookies from 'js-cookie';

// Modal component for tag add/edit
const TagModal = ({ isOpen, onClose, tag, onSave, title }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: ''
  });

  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name || '',
        slug: tag.slug || ''
      });
    } else {
      setFormData({
        name: '',
        slug: ''
      });
    }
  }, [tag, isOpen]);

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
                Tag Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                className="input-field w-full"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter tag name"
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
                placeholder="enter-slug"
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
              {tag ? 'Update Tag' : 'Add Tag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function TagsPage() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [deleteTag, setDeleteTag] = useState(null);
  const [tags, setTags] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Tags - Tripknock';
    fetchTags();

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

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/blog/tags/all');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      const data = await response.json();

      setTags(data);
      setError(null);
    } catch (error) {
      console.log('Error fetching tags:', error);
      setError('Failed to load tags. Please try again.');
    }
    setLoading(false);
  };

  // Handle the search input and filter the tags
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter tags based on the search query (search by name)
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTag = async (tagData) => {
    setLoading(true);
    try {
      const authCookie = Cookies.get('tk_auth_details');
      if (!authCookie) {
        throw new Error('Authentication required. Please log in as an admin.');
      }

      const adminEmail = JSON.parse(authCookie).email;

      const response = await fetch('http://localhost:5000/blog/tags/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin': adminEmail
        },
        body: JSON.stringify(tagData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create tag');
      }

      const result = await response.json();

      // Add the new tag to the list with the returned ID
      setTags(prev => [...prev, {
        ...tagData,
        id: result.id,
        blogCount: 0
      }]);

      setIsAddModalOpen(false);
      setError(null);
    } catch (error) {
      console.log('Error creating tag:', error);
      setError(error.message || 'Failed to create tag. Please try again.');
    }
    setLoading(false);
  };

  const handleUpdateTag = async (tagData) => {
    if (!editingTag) return;
    setLoading(true);
    try {
      const authCookie = Cookies.get('tk_auth_details');
      if (!authCookie) {
        throw new Error('Authentication required. Please log in as an admin.');
      }

      const adminEmail = JSON.parse(authCookie).email;

      const response = await fetch(`http://localhost:5000/blog/tags/update/${editingTag.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin': adminEmail
        },
        body: JSON.stringify(tagData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update tag');
      }

      // Update the tag in the list
      setTags(prev => prev.map(tag =>
        tag.id === editingTag.id ? { ...tag, ...tagData } : tag
      ));

      setEditingTag(null);
      setError(null);
    } catch (error) {
      console.log('Error updating tag:', error);
      setError(error.message || 'Failed to update tag. Please try again.');
    }
    setLoading(false);
  };

  const handleDelete = (tag) => {
    setDeleteTag(tag);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const authCookie = Cookies.get('tk_auth_details');
      if (!authCookie) {
        throw new Error('Authentication required. Please log in as an admin.');
      }

      const adminEmail = JSON.parse(authCookie).email;

      const response = await fetch(`http://localhost:5000/blog/tags/delete/${deleteTag.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'admin': adminEmail
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete tag');
      }

      // Remove the tag from the list
      setTags(prev => prev.filter(tag => tag.id !== deleteTag.id));
      setError(null);
    } catch (error) {
      console.log('Error deleting tag:', error);
      setError(error.message || 'Failed to delete tag. Please try again.');
    }
    setLoading(false);
    setDeleteTag(null);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {loading && <LoadingSpinner />}

      {/* Delete Confirmation Dialog */}
      {deleteTag && (
        <AlertDialog
          open={!!deleteTag}
          title="Delete Tag"
          message={`Are you sure you want to delete the tag "${deleteTag.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTag(null)}
        />
      )}

      {/* Add Tag Modal */}
      <TagModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        tag={null}
        onSave={handleAddTag}
        title="Add New Tag"
      />

      {/* Edit Tag Modal */}
      <TagModal
        isOpen={!!editingTag}
        onClose={() => setEditingTag(null)}
        tag={editingTag}
        onSave={handleUpdateTag}
        title="Edit Tag"
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Tags</h1>
          <p className="text-secondary-600">Manage your blog tags</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Add className="w-5 h-5" />
          Add Tag
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
        <div className="p-4 border-b border-secondary-200">
          <div className="flex items-center gap-2">
            <Search className="text-secondary-400" />
            <input
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={handleSearch}
              className="flex-1 bg-transparent border-none focus:outline-none text-secondary-900 placeholder-secondary-400"
            />
          </div>
        </div>

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
              {filteredTags.length > 0 ? (
                filteredTags.map((tag, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-secondary-900">{tag.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-500">{tag.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-500">{tag.blogCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingTag(tag)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Delete className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-secondary-500">
                    {searchQuery ? 'No tags found matching your search.' : 'No tags found. Add your first tag!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
