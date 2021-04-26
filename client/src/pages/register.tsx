import { Form, Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { HeadComponent } from '../components/Head';
import { InputField } from '../components/InputField';
import { MeDocument, MeQuery, useRegisterMutation } from '../generated/graphql';
import { toErrorsMap } from '../utils/toErrorsMap';
import { withApollo } from '../utils/withApollo';

const Register = () => {
  const router = useRouter();
  const [register] = useRegisterMutation();
  return (
    <AuthLayout>
      <HeadComponent>Register: To Pingram</HeadComponent>
      <div className='flex w-full flex-col px-5 py-3 bg-white space-y-2 mb-3 shadow-xl rounded-2xl'>
        <Formik
          initialValues={{ username: '', email: '', password: '' }}
          onSubmit={async (values, { setErrors }) => {
            const res = await register({
              variables: {
                options: values,
              },
              update: (cache, { data }) => {
                cache.writeQuery<MeQuery>({
                  query: MeDocument,
                  data: {
                    __typename: 'Query',
                    me: data?.register.user,
                  },
                });
              },
            });
            if (res.data?.register.errors) {
              setErrors(toErrorsMap(res.data.register.errors));
            } else if (res?.data?.register.user) {
              router.push('/');
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className='w-full space-y-2'>
              <InputField name='username' placeholder='username' type='text' />
              <InputField name='email' placeholder='Email' type='email' />
              <InputField
                name='password'
                type='password'
                placeholder='password'
              />
              <Button
                type='submit'
                isSubmitting={isSubmitting}
                className='w-full text-md py-3 px-4 bg-blue-500 hover:bg-blue-600'
              >
                Register
              </Button>
            </Form>
          )}
        </Formik>
      </div>
      <div className='bg-white w-full px-9 py-4 shadow-xl rounded-xl text-center'>
        Already have an account{' '}
        <Link href='/login'>
          <a className='text-blue-600 font-semibold hover:underline'>Login</a>
        </Link>
      </div>
    </AuthLayout>
  );
};

export default withApollo({ ssr: false })(Register);
