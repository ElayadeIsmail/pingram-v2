import gql from 'graphql-tag';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { ChangeEvent, useState } from 'react';
import { Button } from '../components/Button';
import { HeadComponent } from '../components/Head';
import { Layout } from '../components/Layout';
import { Spinner } from '../components/Spinner';
import {
  MeDocument,
  MeQuery,
  useMeQuery,
  useUpdateProfileMutation,
} from '../generated/graphql';
import { uploadFile } from '../utils/uploadFile';
import { withApollo } from '../utils/withApollo';

interface editProps {}

const Edit: React.FC<editProps> = ({}) => {
  const { data, loading } = useMeQuery();
  const [updateProfile] = useUpdateProfileMutation();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [avatar, setAvatar] = useState(data?.me?.avatar);
  const [bio, setBio] = useState(data?.me?.bio);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileTarget = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          reader;
          if (typeof reader.result === 'string') {
            setAvatar(reader.result);
            setFile(fileTarget);
          }
        }
      };
      fileTarget && reader.readAsDataURL(fileTarget);
    }
  };
  const handleSubmit = async () => {
    setIsSubmitting(true);
    let avatar = data?.me?.avatar;
    if (file) {
      avatar = await uploadFile(file, (progress) => progress);
    }
    const res = await updateProfile({
      variables: {
        options: {
          avatar: avatar,
          bio,
        },
      },
      update: (cache, { data: updatedData }) => {
        cache.writeQuery<MeQuery>({
          query: MeDocument,
          data: {
            __typename: 'Query',
            me: updatedData?.updateProfile,
          },
        });
        cache.writeFragment({
          id: 'ProfileUser:' + data?.me?.id,
          fragment: gql`
            fragment _ on ProfileUser {
              avatar
              bio
            }
          `,
          data: {
            avatar,
            bio,
          },
        });
      },
    });
    setIsSubmitting(false);
    if (!res.errors) {
      router.push(`/profile/${res.data?.updateProfile.id}`);
    }
  };

  if (!data?.me && !loading) {
    return <div>Oooops something went wrong</div>;
  }
  return (
    <Layout>
      <HeadComponent>Pingram: </HeadComponent>
      {!data?.me && loading ? (
        <Spinner />
      ) : (
        <div className='flex w-full items-center justify-center overflow-hidden'>
          <div className='flex w-88 flex-col p-5 bg-gray-100 space-y-5 mb-3 shadow-xl rounded-2xl'>
            <div className='mx-auto overflow-hidden w-40 h-40 rounded-full relative'>
              <Image
                src={avatar || data?.me?.avatar || ''}
                layout='fill'
                className='rounded-full object-cover object-center'
              />
              <div className='cursor-pointer absolute w-full h-10 left-0 -bottom-0  overflow-hidden flex items-center justify-items-center bg-gray-500 opacity-40'>
                <img
                  src='/assets/camera.svg'
                  className='z-30 absolute top-1 left-16 w-8 h-8 block mx-auto'
                />
                <input
                  type='file'
                  onChange={handleChange}
                  className='h-full absolute z-40 w-full opacity-0 cursor-pointer'
                />
              </div>
            </div>
            <textarea
              className='p-5 bg-gray-200 rounded-md focus:outline-none border-2 focus:border-blue-500'
              rows={4}
              cols={5}
              placeholder='Bio'
              value={bio!}
              onChange={(e) => setBio(e.target.value)}
            />
            <Button
              onClick={handleSubmit}
              type='submit'
              isSubmitting={isSubmitting}
              className='w-full text-md py-3 px-4 bg-blue-500 hover:bg-blue-600'
            >
              Update
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default withApollo({ ssr: false })(Edit);
