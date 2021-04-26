import React from 'react';

export const Pulse: React.FC = ({}) => {
  return (
    <div className='border border-light-blue-300 shadow rounded-md p-4 max-w-sm w-full mx-auto'>
      <div className='animate-pulse flex items-center justify-center space-x-4'>
        <div className='rounded-full bg-gray-300 h-12 w-12'></div>
        <div className='flex-1 space-y-4 py-1'>
          <div className='h-4 bg-gray-300 rounded w-3/4'></div>
        </div>
      </div>
    </div>
  );
};
