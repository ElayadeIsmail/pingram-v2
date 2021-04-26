import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import React, { Dispatch, useEffect } from 'react';
import { useDeleteAccountMutation } from '../generated/graphql';

interface ModalProps {
  setIsOpen: Dispatch<React.SetStateAction<boolean>>;
}

export const Modal: React.FC<ModalProps> = ({ setIsOpen }) => {
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, []);
  const router = useRouter();
  const [deleteAccount, { loading, client }] = useDeleteAccountMutation();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='absolute overflow-hidden z-40 -top-22 left-0 w-screen h-screen bg-black bg-opacity-40 flex items-center justify-center'
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className='relative bg-white rounded-lg w-96 py-6 px-4 z-50'
      >
        <p className='font-semibold text-gray-800 text-center my-3 mb-6'>
          Are You Sure that you want to delete your Account, After this you
          can't get it back again!
        </p>
        <div className='flex items-center justify-between'>
          <button
            onClick={() => setIsOpen(false)}
            disabled={loading}
            type='button'
            className='text-base focus:outline-none font-medium rounded-lg bg-gray-300 px-4 py-2'
          >
            Go Back
          </button>
          <button
            disabled={loading}
            type='button'
            className='text-base flex items-center font-medium rounded-lg px-4 py-2 bg-red-600 w-auto
            disabled:opacity-50 hover:bg-red-800 focus:outline-none text-white'
            onClick={async () => {
              await deleteAccount();
              await client.cache.reset();
              setIsOpen(false);
              router.push('/register');
            }}
          >
            {loading && (
              <svg
                className='loader-btn h-6 w-6 mr-3 rounded-full border-2 border-t-2 border-gray-500'
                viewBox='0 0 24 24'
              ></svg>
            )}
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
