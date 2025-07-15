'use client';

import { useEffect, useState } from 'react';
import { Edit, Delete, Add as AddIcon, Save, Close } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AlertDialog from '@/components/AlertDialog';
import Cookies from 'js-cookie';
import Loading from '../loading';
import { useNotification } from '@/contexts/NotificationContext';
import { useLoading } from '@/contexts/LoadingContext';

export default function Users() {
  const { showSuccess, showError, showInfo, showWarning, testNotification } = useNotification();
  const { setLoading, isLoading } = useLoading();

  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [update, setUpdate] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'blogger',
    phone: '',
    password: ''
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    document.title = 'Users - Admin Panel';
    setLoading('fetchUsers', true, 'Loading users...');

    async function fetchData() {
      try {
        let userEmail = JSON.parse(Cookies.get('tk_auth_details')).email;
        setCurrentUser(userEmail);

        let res = await fetch('https://data.tripknock.in/user/all', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'admin': userEmail
          }
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`);
        }

        let data = await res.json()
        if (data && Array.isArray(data)) {
          setUsers(data);
        } else {
          throw new Error('Invalid data format received from server');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        showError(`Failed to load users: ${error.message}`);
        setUsers([]);
      } finally {
        setLoading('fetchUsers', false);
      }
    }

    fetchData();
  }, [update])

  const roles = [
    {
      role: 'superadmin'
    },
    {
      role: 'admin'
    },
    {
      role: 'subadmin'
    },
    {
      role: 'blogger'
    },
    {
      role: 'user'
    }
  ];

  const handleOpenDialog = (user = null) => {
    if (user !== null) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        password: ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'blogger',
        phone: '',
        password: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    setLoading('deleteUser', true, `Deleting user: ${deleteItem.name}...`);
    try {
      let res = await fetch(`https://data.tripknock.in/user/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin': currentUser
        },
        body: JSON.stringify({ id: deleteItem.id })
      })

      if (!res.ok) {
        throw new Error(`Failed to delete user: ${res.status} ${res.statusText}`);
      }

      let data = await res.json()
      if (data.status === true) {
        showSuccess(`User "${deleteItem.name}" has been successfully deleted`);
        setUpdate(update + 1);
      } else {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showError(`Failed to delete user "${deleteItem.name}": ${error.message}`);
    } finally {
      setLoading('deleteUser', false);
      setDeleteItem(null);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email' && editingUser) {
      showWarning('Email cannot be changed for existing users');
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      showError('Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      showError('Phone number is required');
      return false;
    }
    if (!editingUser && !formData.password.trim()) {
      showError('Password is required for new users');
      return false;
    }
    if (formData.password && formData.password.length < 6) {
      showError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const actionType = editingUser ? 'Updating' : 'Creating';
    const userName = editingUser ? editingUser.name : formData.name;

    setLoading('saveUser', true, `${actionType} user: ${userName}...`);

    try {
      if (editingUser !== null) {
        let res = await fetch('https://data.tripknock.in/user/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'admin': currentUser
          },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            role: formData.role,
            id: editingUser.id,
            password: formData.password.trim()
          })
        })

        if (!res.ok) {
          throw new Error(`Failed to update user: ${res.status} ${res.statusText}`);
        }

        let data = await res.json()
        if (data.status === true) {
          showSuccess(`User "${formData.name}" has been successfully updated`);
          setUpdate(update + 1);
        } else {
          throw new Error(data.message || 'Failed to update user');
        }
      } else {
        let res = await fetch('https://data.tripknock.in/user/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'admin': currentUser
          },
          body: JSON.stringify(formData)
        })

        if (!res.ok) {
          throw new Error(`Failed to create user: ${res.status} ${res.statusText}`);
        }

        let data = await res.json()
        if (data.status === true) {
          showSuccess(`User "${formData.name}" has been successfully created with role "${formData.role}"`);
          setUpdate(update + 1);
        } else {
          throw new Error(data.message || 'Failed to create user');
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      const action = editingUser ? 'updating' : 'creating';
      showError(`Failed to ${action} user "${formData.name}": ${error.message}`);
    } finally {
      setLoading('saveUser', false);
      setFormData({
        name: '',
        email: '',
        role: 'blogger',
        phone: '',
        password: ''
      });
      handleCloseDialog();
    }
  };

  const handleDeleteUser = (user) => {
    setDeleteItem(user);
    showWarning(`Preparing to delete user: ${user.name}`);
  };

  if (isLoading('fetchUsers')) {
    return <Loading />;
  }

  return (
    <>
      {isLoading('saveUser') || isLoading('deleteUser') ? <Loading /> :
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-secondary-900">Users</h1>
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenDialog()}
                className="btn-primary flex items-center gap-2"
              >
                <AddIcon /> Add User
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-secondary-600">Name</th>
                  <th className="text-left p-4 text-secondary-600">Email</th>
                  <th className="text-left p-4 text-secondary-600">Role</th>
                  <th className="text-left p-4 text-secondary-600">Phone</th>
                  <th className="text-right p-4 text-secondary-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  user.email !== currentUser && (
                    <tr key={user.id}>
                      <td className="p-4 text-secondary-900">{user.name}</td>
                      <td className="p-4 text-secondary-600">{user.email}</td>
                      <td className="p-4 text-secondary-600">{user.role}</td>
                      <td className="p-4 text-secondary-600">{user.phone}</td>
                      <td className="p-4">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleOpenDialog(user)}
                            className="p-1 text-secondary-600 hover:text-primary-600"
                          >
                            <Edit />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1 text-secondary-600 hover:text-red-600"
                          >
                            <Delete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>

          {/* Add/Edit User Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
              <DialogTitle className="flex justify-between items-center">
                {editingUser ? 'Edit User' : 'Add New User'}
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="text-secondary-500 hover:text-secondary-700"
                >
                  <Close />
                </button>
              </DialogTitle>
              <DialogContent className="space-y-4">
                <div className="mt-4">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    {...(editingUser ? { disabled: true } : {})}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    required
                  >
                    {roles.map((role, id) => (
                      <option key={id} value={role.role}>{role.role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    {...(editingUser ? {} : { required: true })}
                  />
                </div>
              </DialogContent>
              <DialogActions className="p-4">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingUser ? 'Save Changes' : 'Add User'}
                </button>
              </DialogActions>
            </form>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={!!deleteItem}
            title="Delete User"
            message={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
            confirmLabel={isLoading('deleteUser') ? "Deleting..." : "Delete"}
            confirmVariant="error"
            onConfirm={confirmDelete}
            onCancel={() => {
              setDeleteItem(null);
            }}
            disabled={isLoading('deleteUser')}
          />
        </div>
      }
    </>
  );
}
