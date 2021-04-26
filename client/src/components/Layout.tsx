import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useMeQuery } from '../generated/graphql';
import { NavBar } from './NavBar';
import { Progress } from './Progress';
import { Spinner } from './Spinner';

interface LayoutProps {}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  const router = useRouter();
  const { data, loading } = useMeQuery();

  useEffect(() => {
    if (!data?.me && !loading) {
      router.push('/login');
    }
  }, [data, loading]);

  if (loading && !data?.me) {
    return <Spinner />;
  }
  return (
    <>
      <NavBar
        setProgress={setProgress}
        showProgress={showProgress}
        setShowProgress={setShowProgress}
      />
      <div className='mt-22'>
        {showProgress && (
          <Progress progress={progress} showProgress={showProgress} />
        )}
        <div className='w-11/12 mx-auto py-2'>{children}</div>
      </div>
    </>
  );
};
