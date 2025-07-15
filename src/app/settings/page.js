'use client';

import { useState, useEffect } from 'react';
import { Close, Save } from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';
import Loading from '../loading';

export default function Settings() {
  const { user, isLoggedIn } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [isPasswordErrror, setIsPasswordError] = useState(false);
  const [isPasswordSuccess, setIsPasswordSuccess] = useState(false);
  const [isErrror, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    document.title = 'Settings - Tripknock';
    if (isLoggedIn === true) {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      });
    }
  }, [user])

  const [passwordData, setPasswordData] = useState({
    password: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let res = await fetch('https://data.tripknock.in/user/profile/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: formData.id,
        name: formData.name,
        phone: formData.phone
      })
    })
    let data = await res.json()
    if (data.status === true) {
      setIsSuccess(true);
      setIsError(false);
    } else {
      setIsError(true);
      setIsSuccess(false);
    }
    setLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setIsPasswordError(true);
      setLoading(false);
      setIsError(false);
      setIsPasswordSuccess(false);
    }
    else {
      let res = await fetch('https://data.tripknock.in/user/profile/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: formData.id,
          oldPassword: passwordData.password,
          newPassword: passwordData.newPassword
        })
      })
      let data = await res.json()
      if (data.status === true) {
        setIsPasswordError(false);
        setIsError(false);
        setIsPasswordSuccess(true);
        setPasswordData({
          password: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setIsPasswordError(true);
        setIsError(false);
        setIsPasswordSuccess(false);
      }
      setLoading(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {loading === true ? <Loading /> :
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-secondary-900">Settings</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Profile Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input-field"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="input-field"
                    placeholder="Your email"
                    value={formData.email}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="input-field"
                    placeholder="Your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-span-full flex justify-end mt-6">
                  <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                </div>

                {isErrror && (
                  <div className="px-5 py-4 bg-red-200 rounded-xl flex justify-between">
                    <p className="text-red-700">Error in Updating Profile</p>
                    <button onClick={() => setIsError(false)}>
                      <Close className="w-5 h-5 text-red-700" />
                    </button>
                  </div>
                )}

                {isSuccess && (
                  <div className="px-5 py-4 bg-green-200 rounded-xl flex justify-between">
                    <p className="text-green-700">Profile Updated</p>
                    <button onClick={() => setIsSuccess(false)}>
                      <Close className="w-5 h-5 text-green-700" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Password Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="input-field"
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="input-field"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="col-span-full flex justify-end mt-6">
                  <button onClick={handleChangePassword} className="btn-primary flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                </div>

                {isPasswordErrror && (
                  <div className="px-5 py-4 bg-red-200 rounded-xl flex justify-between">
                    <p className="text-red-700">Passwords do not match</p>
                    <button onClick={() => setIsPasswordError(false)}>
                      <Close className="w-5 h-5 text-red-700" />
                    </button>
                  </div>
                )}

                {isPasswordSuccess && (
                  <div className="px-5 py-4 bg-green-200 rounded-xl flex justify-between">
                    <p className="text-green-700">Password Updated</p>
                    <button onClick={() => setIsPasswordSuccess(false)}>
                      <Close className="w-5 h-5 text-green-700" />
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      }
    </>
  );
}
