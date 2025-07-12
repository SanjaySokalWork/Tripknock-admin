'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Add, Edit, Delete, Search, Visibility } from '@mui/icons-material';
import LoadingSpinner from '@/components/LoadingSpinner';
import AlertDialog from '@/components/AlertDialog';
import Cookies from 'js-cookie';
import { useNotification } from '@/contexts/NotificationContext';
import { useLoading } from '@/contexts/LoadingContext';

export default function ArticlesPage() {
  const { showSuccess, showError, showInfo } = useNotification();
  const { setLoading, isLoading } = useLoading();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [deleteArticle, setDeleteArticle] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    document.title = "Blogs - Tripknock";
    setLoading('fetchData', true, 'Loading blogs...');
    fetchArticles();
    fetchCategories();

    // Check if admin token exists
    try {
      const authCookie = Cookies.get('tk_auth_details');
      if (!authCookie) {
        showError('Admin authentication not found. Some features may be limited.');
      }
    } catch (error) {
      console.log('Error checking authentication:', error);
      showError('Error checking authentication');
    }
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('http://localhost:5000/blog/all');
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      } else {
        showError(`Failed to fetch articles: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log('Error fetching articles:', error);
      showError(`Network error: ${error.message}`);
    } finally {
      setLoading('fetchData', false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/blog/categories/all');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        showError('Failed to fetch categories');
      }
    } catch (error) {
      console.log('Error fetching categories:', error);
      showError('Error fetching categories');
    }
  };

  // Function to handle the search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Function to filter articles based on search query, status, and category
  const filteredArticles = articles.filter(article => {
    // Filter by search query
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by status
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;

    // Filter by category
    const matchesCategory = categoryFilter === 'all' ||
      (Array.isArray(article.category) &&
        article.category.some(cat => {
          // If category is an object with id property (from backend)
          if (typeof cat === 'object' && cat.id) {
            return cat.id.toString() === categoryFilter;
          }
          // If category is already a string (category name)
          return cat === categoryFilter;
        }));

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const handleDelete = async (article) => {
    setDeleteArticle(article);
  };

  const confirmDelete = async () => {
    setLoading('deleteArticle', true, 'Deleting blog...');
    try {
      // Check authentication
      const authCookie = Cookies.get('tk_auth_details');
      if (!authCookie) {
        throw new Error('Authentication required. Please log in as an admin.');
      }

      const adminEmail = JSON.parse(authCookie).email;

      const response = await fetch(`http://localhost:5000/blog/delete/${deleteArticle.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin': adminEmail
        }
      });

      if (response.ok) {
        setArticles(prev => prev.filter(item => item.id !== deleteArticle.id));
        showSuccess('Blog deleted successfully');
      } else {
        const errorData = await response.json();
        showError(`Failed to delete blog: ${errorData.message}`);
      }
    } catch (error) {
      console.log('Error deleting article:', error);
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading('deleteArticle', false);
      setDeleteArticle(null);
    }
  };

  return (
    <>
      {isLoading('fetchData') ? <LoadingSpinner /> :
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">All Blogs</h1>
              <p className="text-secondary-600">Manage your blogs</p>
            </div>
            <Link
              href="/blog/blogs/create"
              className="btn-primary flex items-center gap-2"
            >
              <Add className="w-5 h-5" />
              Create Blog
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
            <div className="p-4 border-b border-secondary-200 flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Search className="text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="flex-1 bg-transparent border-none focus:outline-none text-secondary-900 placeholder-secondary-400"
                />
              </div>
              
              <div className="flex flex-wrap gap-4">
                {/* Status filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-secondary-500">Status:</span>
                  <div className="flex rounded-md overflow-hidden border border-secondary-200">
                    <button
                      onClick={() => handleStatusFilterChange('all')}
                      className={`px-3 py-1.5 text-sm ${statusFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-secondary-700 hover:bg-secondary-50'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => handleStatusFilterChange('published')}
                      className={`px-3 py-1.5 text-sm ${statusFilter === 'published' ? 'bg-green-600 text-white' : 'bg-white text-secondary-700 hover:bg-secondary-50'}`}
                    >
                      Published
                    </button>
                    <button
                      onClick={() => handleStatusFilterChange('draft')}
                      className={`px-3 py-1.5 text-sm ${statusFilter === 'draft' ? 'bg-yellow-600 text-white' : 'bg-white text-secondary-700 hover:bg-secondary-50'}`}
                    >
                      Draft
                    </button>
                  </div>
                </div>

                {/* Category filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-secondary-500">Category:</span>
                  <select
                    value={categoryFilter}
                    onChange={handleCategoryFilterChange}
                    className="px-3 py-1.5 text-sm bg-white border border-secondary-200 rounded-md focus:outline-none focus:ring-primary-600 focus:border-primary-600"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {/* <div className="px-6 py-2 bg-secondary-50 border-b border-secondary-200">
                <span className="text-sm text-secondary-600">
                  Showing {filteredArticles.length} of {articles.length} blogs
                </span>
              </div> */}
              <table className="w-full">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-secondary-500">
                        No articles found
                      </td>
                    </tr>
                  ) : (
                    filteredArticles.map((article) => (
                      <tr key={article.id} className="hover:bg-secondary-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-secondary-900">
                                {article.title}
                              </div>
                              <div className="text-sm text-secondary-500">
                                {article.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-900">
                            {Array.isArray(article.category) && article.category.length > 0
                              ? article.category.join(', ')
                              : 'Uncategorized'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-secondary-900">
                              {article.author_name}
                            </div>
                            <div className="text-sm text-secondary-500">
                              {article.author}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {article.status}
                          </span>
                          <span className="text-xs text-secondary-500 block mt-1">{article.last_modified}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                          {article.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {article.status === 'published' && (
                              <Link
                                href={`/blog/blogs/${article.id}/edit`}
                                className="text-primary-600 hover:text-primary-900"
                              >
                                <Visibility className="w-5 h-5" />
                              </Link>
                            )}
                            <Link
                              href={`/blog/blogs/${article.id}/edit`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(article)}
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
        </div>
      }

      {deleteArticle && (
        <AlertDialog
          title="Delete Article"
          message={`Are you sure you want to delete "${deleteArticle.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteArticle(null)}
        />
      )}
    </>
  );
}
