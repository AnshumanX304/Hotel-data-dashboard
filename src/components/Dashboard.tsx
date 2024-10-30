import React, {useEffect } from 'react';
import {processBookingData} from '../utils/dataProcessor';

const Dashboard: React.FC = () => {


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
    <>Dashboard</>
  );
};

export default Dashboard;