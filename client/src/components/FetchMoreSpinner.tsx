import { motion } from 'framer-motion';
import React from 'react';

export const FetchMoreSpinner = () => {
  return (
    <div className='flex items-center justify-center'>
      <motion.div
        animate={{ y: 30 }}
        transition={{ repeat: Infinity, duration: 0.4 }}
        className='w-4 h-4 rounded-full bg-blue-600 mr-3'
      ></motion.div>
      <motion.div
        animate={{ y: 30 }}
        transition={{ repeat: Infinity, duration: 0.4, delay: 0.15 }}
        className='w-4 h-4 rounded-full bg-blue-600 mr-3'
      ></motion.div>
      <motion.div
        animate={{ y: 30 }}
        transition={{ repeat: Infinity, duration: 0.4, delay: 0.3 }}
        className='w-4 h-4 rounded-full bg-blue-600 mr-3'
      ></motion.div>
    </div>
  );
};
