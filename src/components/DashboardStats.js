import { 
  TrendingUp, 
  People, 
  DirectionsCar, 
  CurrencyRupee 
} from '@mui/icons-material';

export default function DashboardStats() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '₹54,239',
      change: '+12.5%',
      icon: <CurrencyRupee className="text-green-500" />,
    },
    {
      title: 'Active Tours',
      value: '45',
      change: '+5.0%',
      icon: <DirectionsCar className="text-blue-500" />,
    },
    {
      title: 'New Bookings',
      value: '124',
      change: '+18.2%',
      icon: <TrendingUp className="text-purple-500" />,
    },
    {
      title: 'Total Users',
      value: '1,205',
      change: '+3.1%',
      icon: <People className="text-orange-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              {stat.icon}
            </div>
            <span className="text-sm text-green-500 font-medium">
              {stat.change}
            </span>
          </div>
          <h3 className="text-gray-500 text-sm">{stat.title}</h3>
          <p className="text-2xl font-semibold mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
