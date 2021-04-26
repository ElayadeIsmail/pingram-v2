import Image from 'next/image';
import React from 'react';

interface SearchUserProps {}

export const SearchUser: React.FC<SearchUserProps> = () => {
  return (
    <div className='flex items-center p-2 border-b-2 border-gray-200'>
      <Image
        src='/assets/avatar.jpg'
        width={45}
        height={45}
        className='rounded-full object-center object-cover'
      />
      <span className='ml-2 text-base font-semibold text-gray-700'>Sam</span>
    </div>
  );
};
