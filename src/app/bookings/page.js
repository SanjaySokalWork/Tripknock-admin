'use client';

import { useState, useEffect } from 'react';
import { FilterList, CheckCircle, Cancel, MoreVert } from '@mui/icons-material';
import { useNotification } from '@/contexts/NotificationContext';
import { useLoading } from '@/contexts/LoadingContext';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Bookings() {
  const { showSuccess, showError, showInfo } = useNotification();
  const { setLoading, isLoading } = useLoading();
  
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    document.title = 'Bookings - Admin Panel';
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading('fetchBookings', true, 'Loading bookings...');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockBookings = [
        {
          id: 1,
          customer: 'John Doe',
          email: 'john.doe@example.com',
          tour: 'Paris City Tour',
          date: 'Jan 15, 2024',
          amount: '₹599',
          status: 'confirmed',
          participants: 2,
          notes: 'Vegetarian meal preference',
        },
        {
          id: 2,
          customer: 'Jane Smith',
          email: 'jane.smith@example.com',
          tour: 'Swiss Alps Adventure',
          date: 'Jan 20, 2024',
          amount: '₹899',
          status: 'pending',
          participants: 4,
          notes: 'Early check-in requested',
        },
        {
          id: 3,
          customer: 'Mike Johnson',
          email: 'mike.j@example.com',
          tour: 'Tokyo Explorer',
          date: 'Feb 5, 2024',
          amount: '₹799',
          status: 'confirmed',
          participants: 1,
          notes: '',
        },
        {
          id: 4,
          customer: 'Sarah Wilson',
          email: 'sarah.w@example.com',
          tour: 'Rome Historical Walk',
          date: 'Feb 10, 2024',
          amount: '₹399',
          status: 'cancelled',
          participants: 2,
          notes: 'Cancellation due to emergency',
        },
      ];
      
      setBookings(mockBookings);
      
    } catch (error) {
      console.log('Error fetching bookings:', error);
      showError('Failed to load bookings');
    } finally {
      setLoading('fetchBookings', false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setLoading('updateStatus', true, `${newStatus === 'confirmed' ? 'Confirming' : 'Cancelling'} booking...`);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      
      showSuccess(`Booking ${newStatus === 'confirmed' ? 'confirmed' : 'cancelled'} successfully`);
    } catch (error) {
      console.log('Error updating booking:', error);
      showError('Failed to update booking status');
    } finally {
      setLoading('updateStatus', false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-secondary';
    }
  };

  if (isLoading('fetchBookings')) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary-900">Bookings</h1>
        <div className="flex gap-3">
          <select className="input-field min-w-[150px]">
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="btn-secondary inline-flex items-center gap-2">
            <FilterList className="w-5 h-5" />
            Filter
          </button>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="text-left py-3 px-4 text-secondary-500 font-medium">Customer</th>
                <th className="text-left py-3 px-4 text-secondary-500 font-medium">Tour</th>
                <th className="text-left py-3 px-4 text-secondary-500 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-secondary-500 font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-secondary-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-secondary-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="group hover:bg-secondary-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-secondary-900">{booking.customer}</div>
                      <div className="text-sm text-secondary-500">{booking.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-secondary-900">{booking.tour}</div>
                      <div className="text-sm text-secondary-500">{booking.participants} participants</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-secondary-900">{booking.date}</td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-secondary-900">{booking.amount}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            disabled={isLoading('updateStatus')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                            title="Confirm Booking"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            disabled={isLoading('updateStatus')}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                            title="Cancel Booking"
                          >
                            <Cancel className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        className="p-1 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg"
                        title="More Options"
                      >
                        <MoreVert className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-secondary-200">
          <div className="text-sm text-secondary-500">
            Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
            <span className="font-medium">20</span> bookings
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary px-4 py-2">Previous</button>
            <button className="btn-primary px-4 py-2">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
