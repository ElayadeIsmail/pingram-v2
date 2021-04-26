import React from 'react';

export const Spinner = () => {
  return (
    <div className='w-full min-h-full-min-nav flex items-center justify-center'>
      <div className='loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-16 w-16'></div>
    </div>
  );
};
