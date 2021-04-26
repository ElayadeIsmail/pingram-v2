import { motion } from 'framer-motion';
import React from 'react';

interface ProgressProps {
  showProgress: boolean;
  progress: number;
}

const variants = {
  show: { opacity: 1, scale: 1 },
  hide: { opacity: 0, scale: 0.95 },
};

export const Progress: React.FC<ProgressProps> = ({
  showProgress,
  progress,
}) => {
  return (
    <motion.div
      animate={showProgress ? 'show' : 'hide'}
      initial='hide'
      variants={variants}
      layout
      className='w-11/12 rounded-md transform ease-in-out mx-auto bg-gray-300'
    >
      <motion.div
        animate={{ width: `${progress}%` }}
        transition={{ ease: 'easeOut' }}
        className='bg-blue-600 text-xs rounded-md overflow-hidden transition-all ease-in-out py-2 text-center text-black'
        style={{ width: `${progress}%` }}
      ></motion.div>
    </motion.div>
  );
};
