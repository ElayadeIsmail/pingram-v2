import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { AuthLayout } from '../../components/AuthLayout';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import {
  MeDocument,
  MeQuery,
  useChangePasswordMutation,
} from '../../generated/graphql';
import { toErrorsMap } from '../../utils/toErrorsMap';
import { withApollo } from '../../utils/withApollo';

const ChangePassword = ({}) => {
  const router = useRouter();
  const [changePassword] = useChangePasswordMutation();
  const [errorToken, setErrorToken] = useState('');
  return (
    <AuthLayout>
      <div className='flex w-full flex-col px-5 py-3 bg-white space-y-2 mb-3 shadow-xl rounded-2xl'>
        {}
        <Formik
          initialValues={{ newPassword: '' }}
          onSubmit={async (values, { setErrors }) => {
            setErrorToken('');
            const response = await changePassword({
              variables: {
                newPassword: values.newPassword,
                token:
                  typeof router.query.token === 'string'
                    ? router.query.token
                    : '',
              },
              update: (cache, { data }) => {
                cache.writeQuery<MeQuery>({
                  query: MeDocument,
                  data: {
                    __typename: 'Query',
                    me: data?.changePassword.user,
                  },
                });
              },
            });
            if (response.data?.changePassword.errors) {
              const errorToMap = toErrorsMap(
                response.data?.changePassword.errors
              );
              if ('token' in errorToMap) {
                setErrorToken(errorToMap.token);
              }
              setErrors(errorToMap);
            } else if (response.data?.changePassword.user) {
              router.push('/');
            }
          }}
        >
          {({ isSubmitting }) => (
            <>
              {errorToken && (
                <div className='w-full bg-red-500 text-white text-center p-2 rounded-md font-semibold'>
                  {errorToken}
                </div>
              )}
              <Form>
                <InputField
                  name='newPassword'
                  placeholder='New Password'
                  type='password'
                />

                <Button
                  type='submit'
                  isSubmitting={isSubmitting}
                  className='w-full text-md py-3 px-4 bg-blue-500 hover:bg-blue-600'
                >
                  Change Password
                </Button>
              </Form>
            </>
          )}
        </Formik>
      </div>
    </AuthLayout>
  );
};

export default withApollo({ ssr: false })(ChangePassword);
