import { HTMLMotionProps, motion } from 'framer-motion';
import React, { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isSubmitting: boolean;
  className: string;
} & HTMLMotionProps<'button'>;

// className='bg-blue-600 relative flex items-center text-white px-3 py-2 font-semibold cursor-pointer rounded-md  mr-5 disabled:opacity-50'

// className='w-full p-2 flex items-center justify-center font-semibold focus:outline-none bg-blue-500 text-white rounded-md disabled:opacity-50'

export const Button: React.FC<ButtonProps> = ({
  isSubmitting,
  className,
  children,
  ...props
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.3 }}
      {...props}
      disabled={isSubmitting}
      className={`${className} p-2 flex items-center justify-center font-semibold focus:outline-none  text-white rounded-md disabled:opacity-50`}
    >
      {isSubmitting && (
        <svg
          className='loader-btn h-6 w-6 mr-3 rounded-full border-2 border-t-2 border-gray-500 '
          viewBox='0 0 24 24'
        ></svg>
      )}
      {children}
    </motion.button>
  );
};
