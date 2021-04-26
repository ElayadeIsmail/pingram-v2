import Head from 'next/head';
import React from 'react';

export const HeadComponent: React.FC = ({ children }) => {
  return (
    <Head>
      <title>{children}</title>
    </Head>
  );
};
