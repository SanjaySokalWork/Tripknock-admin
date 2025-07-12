import { useRouter } from 'next/navigation';
import {
  Edit,
  Delete,
  Star,
  LocationOn,
  CalendarToday,
} from '@mui/icons-material';

export default function TourTable({ tours, handleSort, getSortIcon, handleDelete }) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary-50">
              <th
                className="text-left p-4 font-medium text-secondary-600 cursor-pointer hover:bg-secondary-100"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1">
                  Tour Name
                  {getSortIcon('title')}
                </div>
              </th>
              <th
                className="text-left p-4 font-medium text-secondary-600 cursor-pointer hover:bg-secondary-100"
                onClick={() => handleSort('destination')}
              >
                <div className="flex items-center gap-1">
                  Destination
                  {getSortIcon('destination')}
                </div>
              </th>
              <th className="text-left p-4 font-medium text-secondary-600">Duration</th>
              <th
                className="text-left p-4 font-medium text-secondary-600 cursor-pointer hover:bg-secondary-100"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center gap-1">
                  Price
                  {getSortIcon('price')}
                </div>
              </th>
              <th className="text-left p-4 font-medium text-secondary-600">Type</th>
              <th className="text-left p-4 font-medium text-secondary-600">Rating</th>
              <th className="text-right p-4 font-medium text-secondary-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((tour) => (
              <tr
                key={tour.id}
                className="border-t border-secondary-200 hover:bg-secondary-50 transition-colors"
              >
                <td className="p-4">
                  <div className="font-medium text-secondary-900">{tour.title}</div>
                  <div className="text-sm text-secondary-500 flex items-center gap-1">
                    <CalendarToday className="w-4 h-4" />
                    {tour.startDate}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 text-secondary-600">
                    <LocationOn className="w-4 h-4" />
                    {tour.destination}
                  </div>
                </td>
                <td className="p-4 text-secondary-600">{tour.duration}</td>
                <td className="p-4">
                  <div className="text-primary-600 font-medium">₹{tour.basePrice}</div>
                  {tour.discountPercentage > 0 && (
                    <div className="text-sm text-green-600">
                      {tour.discountPercentage}% off
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <span className="badge badge-secondary">{tour.tourType}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-secondary-600">{tour.rating}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => router.push(`/tours/edit/${tour.id}`)}
                      className="p-2 text-secondary-600 hover:text-primary-600 rounded-full hover:bg-primary-50 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tour)}
                      className="p-2 text-secondary-600 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
