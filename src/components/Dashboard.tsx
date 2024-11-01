import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, Loader2 } from 'lucide-react';
import { BookingData, processBookingData, groupByCountry, groupByDate } from '../utils/dataProcessor';

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
      setIsLoading(true);
      setError(null);
      try {
        const data = await processBookingData();
        console.log(data);
        if (data && data.length > 0) {
          setBookingData(data);
          setFilteredData(data);
          
          const dates = data.map(booking => new Date(booking.date!));
          setDateRange({
            from: new Date(Math.min(...dates.map(d => d.getTime()))),
            to: new Date(Math.max(...dates.map(d => d.getTime())))
          });
        } else {
          setError('No booking data available');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load booking data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const filtered = bookingData.filter(booking => {
      const bookingDate = new Date(booking.date!);
      return bookingDate >= dateRange.from && bookingDate <= dateRange.to;
    });
    setFilteredData(filtered);
  }, [dateRange, bookingData]);

  const totalAdults = filteredData.reduce((sum, booking) => sum + booking.adults, 0);
  const totalChildren = filteredData.reduce((sum, booking) => sum + booking.children, 0);
  const countryData = groupByCountry(filteredData);
  const timeSeriesData = groupByDate(filteredData);
  const sparklineData = timeSeriesData.map(item => ({
    date: item.date,
    adults: filteredData.filter(booking => booking.date === item.date)
      .reduce((sum, booking) => sum + booking.adults, 0),
    children: filteredData.filter(booking => booking.date === item.date)
      .reduce((sum, booking) => sum + booking.children, 0)
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-400 text-xl mr-3">❌</span>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!bookingData.length) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-blue-400 text-xl mr-3">ℹ️</span>
            <p className="text-sm text-blue-800">No booking data available. Please check back later.</p>
          </div>
        </div>
      </div>
    );
  }

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

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Total Child Visitors</h3>
              <span className="text-2xl font-semibold text-indigo-600">{totalChildren}</span>
            </div>
            <div style={{ width: '100%', height: 60 }}>
              <ResponsiveContainer>
                <LineChart data={sparklineData}>
                  <Line 
                    type="monotone" 
                    dataKey="children" 
                    stroke="#4F46E5" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Visitors Over Time</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="total_visitors" 
                    stroke="#4F46E5" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Visitors by Country</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={countryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_visitors" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;