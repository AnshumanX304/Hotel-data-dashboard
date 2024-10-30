import React, {useEffect,useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { BookingData, processBookingData, groupByDate } from '../utils/dataProcessor';
import { Calendar} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [bookingData, setBookingData] = useState<BookingData[]>([]);
  const [filteredData, setFilteredData] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date()
  });


  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await processBookingData();
        console.log(data);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);


  const totalAdults = filteredData.reduce((sum, booking) => sum + booking.adults, 0);
  const timeSeriesData = groupByDate(filteredData);
  const sparklineData = timeSeriesData.map(item => ({
    date: item.date,
    adults: filteredData.filter(booking => booking.date === item.date)
      .reduce((sum, booking) => sum + booking.adults, 0),
    children: filteredData.filter(booking => booking.date === item.date)
      .reduce((sum, booking) => sum + booking.children, 0)
  }));

  

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Hotel Bookings Dashboard</h1>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div className="flex space-x-4">
              <input
                type="date"
                value={dateRange.from.toISOString().split('T')[0]}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onChange={(e) => setDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.to.toISOString().split('T')[0]}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onChange={(e) => setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Total Adult Visitors</h3>
              <span className="text-2xl font-semibold text-indigo-600">{totalAdults}</span>
            </div>
            <div style={{ width: '100%', height: 60 }}>
              <ResponsiveContainer>
                <LineChart data={sparklineData}>
                  <Line 
                    type="monotone" 
                    dataKey="adults" 
                    stroke="#4F46E5" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        
      </main>

      
    </div>
  );
};

export default Dashboard;