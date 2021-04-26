import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
};

export const InputField: React.FC<InputFieldProps> = (props) => {
  const [field, { error }] = useField(props);
  return (
    <div className='my-2 w-full'>
      <input
        {...field}
        {...props}
        id={field.name}
        className={`w-full border ${
          !error ? 'border-gray-300' : 'border-red-500'
        }  p-3 px-4 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
      />
      {error && (
        <span className='block text-sm mt-1 text-red-600'>{error}</span>
      )}
    </div>
  );
};
