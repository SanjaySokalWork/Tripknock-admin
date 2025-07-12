'use client';

import { useAppContext } from '@/context/AppContext';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Login() {
  const router = useRouter();

  const { isLoggedIn, login } = useAppContext();
  const [error, setError] = useState('');

  const [user, setUser] = useState({
    email: '',
    password: ''
  })

  useEffect(() => {
    document.title = 'Login | TripKnock Admin';
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn])

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.email.trim() === "" || user.password === "") {
      setError('Please fill all the fields');
      return;
    } else {
      const response = await fetch('http://localhost:5000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email.toLowerCase().trim(),
          password: user.password
        })
      })
      const res = await response.json();

      if (res.status === false) {
        setError(res.message);
      } else {
        Cookies.set('tk_auth_details', JSON.stringify(res));
        login({
          id: res.id,
          email: res.email,
          name: res.name,
          role: res.role,
          phone: res.phone
        });
        router.push('/');
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your admin account
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={user.email}
                required
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />

              <label className="block text-sm font-medium text-gray-700 mt-4">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={user.password}
                required
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />

              <div className="flex items-center justify-between">
                <div className="mt-4">
                  <button
                    type="submit"
                    className="w-full bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-primary-200"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            </form>
            {error && <div className="text-red-500 px-4 py-3 bg-red-100 rounded-md">{error}</div>}
          </div>
        </div>
      </div>

      {/* Right side - Image/Banner */}
      <div className="hidden md:block md:w-1/2 bg-primary-600">
        <div className="h-full flex items-center justify-center p-8">
          <div className="max-w-md text-center text-white">
            <h1 className="text-4xl font-bold mb-6">Tripknock Admin Panel</h1>
            <p className="text-lg text-primary-100">
              Manage your travel business efficiently with our comprehensive admin tools
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
