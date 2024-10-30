import React, {useEffect,useState } from 'react';
import {processBookingData} from '../utils/dataProcessor';
import { Calendar, Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {

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

        
      </main>

      
    </div>
  );
};

export default Dashboard;