import React from 'react';
import { FetchMoreSpinner } from '../components/FetchMoreSpinner';
import { withApollo } from '../utils/withApollo';

const Test = ({}) => {
  return (
    <div>
      <FetchMoreSpinner />
    </div>
  );
};

export default withApollo({ ssr: false })(Test);
