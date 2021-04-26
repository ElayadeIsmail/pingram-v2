import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useMeQuery } from '../generated/graphql';
import { Spinner } from './Spinner';

interface AuthLayoutProps {}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { data, loading } = useMeQuery();

  useEffect(() => {
    if (data?.me) {
      router.push('/');
    }
  }, [data, loading]);

  if (loading || data?.me) {
    return <Spinner />;
  }
  return (
    <div className='flex items-center justify-center overflow-hidden h-screen bg-gray-100 w-screen'>
      <div className='flex flex-col w-96'>
        <h1 className='mx-auto mb-3 font-serif font-bold text-5xl text-blue-600'>
          Pingram
        </h1>
        {children}
      </div>
    </div>
  );
};
