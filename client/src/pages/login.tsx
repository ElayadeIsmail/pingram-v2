import { Form, Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { HeadComponent } from '../components/Head';
import { InputField } from '../components/InputField';
import { MeDocument, MeQuery, useLoginMutation } from '../generated/graphql';
import { toErrorsMap } from '../utils/toErrorsMap';
import { withApollo } from '../utils/withApollo';

const Login = () => {
  const router = useRouter();
  const [login] = useLoginMutation();
  return (
    <AuthLayout>
      <HeadComponent>Login: To Pingram</HeadComponent>
      <div className='flex w-full flex-col px-5 py-3 bg-white space-y-2 mb-3 shadow-xl rounded-2xl'>
        <Formik
          initialValues={{ email: '', password: '' }}
          onSubmit={async (values, { setErrors }) => {
            const res = await login({
              variables: values,
              update: (cache, { data }) => {
                cache.writeQuery<MeQuery>({
                  query: MeDocument,
                  data: {
                    __typename: 'Query',
                    me: data?.login.user,
                  },
                });
              },
            });
            if (res.data?.login.errors) {
              setErrors(toErrorsMap(res.data.login.errors));
            } else if (res.data?.login.user) {
              router.push('/');
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className='w-full space-y-2'>
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
                Login
              </Button>
              <Link href='/forgot-password'>
                <a className='block text-center text-blue-600 font-semibold hover:underline'>
                  Forget Password?
                </a>
              </Link>
            </Form>
          )}
        </Formik>
      </div>
      <div className='bg-white shadow-xl rounded-xl w-full px-9 py-4 text-center'>
        Don't have an account{' '}
        <Link href='/register'>
          <a className='text-blue-600 font-semibold hover:underline'>
            Register
          </a>
        </Link>
      </div>
    </AuthLayout>
  );
};

export default withApollo({ ssr: false })(Login);
