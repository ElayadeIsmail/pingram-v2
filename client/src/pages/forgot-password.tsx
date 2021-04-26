import { Form, Formik } from 'formik';
import React, { useState } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { useForgotPasswordMutation } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

interface ForgetPasswordProps {}

const ForgetPassword: React.FC<ForgetPasswordProps> = ({}) => {
  const [forgotPassword] = useForgotPasswordMutation();
  const [complete, setComplete] = useState(false);
  return (
    <AuthLayout>
      <div className='flex w-full flex-col px-5 py-3 bg-white space-y-2 mb-3 shadow-xl rounded-2xl'>
        <Formik
          initialValues={{ email: '' }}
          onSubmit={async (values) => {
            await forgotPassword({
              variables: values,
            });
            setComplete(true);
          }}
        >
          {({ isSubmitting }) =>
            complete ? (
              <div className='w-full bg-green-500 text-white text-center p-2 rounded-md font-semibold'>
                If An Account With That Email Exist, We Send You An Email
              </div>
            ) : (
              <Form>
                <InputField name='email' placeholder='Email' type='email' />
                <Button
                  type='submit'
                  isSubmitting={isSubmitting}
                  className='w-full text-md py-3 px-4 bg-blue-500 hover:bg-blue-600'
                >
                  Forgot Password
                </Button>
              </Form>
            )
          }
        </Formik>
      </div>
    </AuthLayout>
  );
};

export default withApollo({ ssr: false })(ForgetPassword);
