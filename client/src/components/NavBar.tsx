import { ApolloCache, gql } from '@apollo/client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { ChangeEvent, Dispatch, useState } from 'react';
import {
  CreatePostMutation,
  PostsDocument,
  PostsQuery,
  useCreatePostMutation,
  useLogoutMutation,
  useMeQuery,
} from '../generated/graphql';
import { limit } from '../utils/constants';
import { uploadFile } from '../utils/uploadFile';
import { Search } from './Search';

// enter='transition ease-out duration-100'
// enterFrom='transform opacity-0 scale-95'
// enterTo='transform opacity-100 scale-100'
// leave='transition ease-in duration-75'
// leaveFrom='transform opacity-100 scale-100'
// leaveTo='transform opacity-0 scale-95'

const variants = {
  open: { opacity: 1, scale: 1, display: 'block' },
  close: { opacity: 0, scale: 0.95, display: 'none' },
};

interface NavBarProps {
  setShowProgress: Dispatch<React.SetStateAction<boolean>>;
  setProgress: Dispatch<React.SetStateAction<number>>;
  showProgress: boolean;
}

const updatePostsCache = (
  cache: ApolloCache<CreatePostMutation>,
  data: CreatePostMutation | null | undefined,
  id: number
) => {
  const userPostsData = cache.readQuery<PostsQuery>({
    query: PostsDocument,
    variables: {
      limit,
      userId: id,
      cursor: null,
    },
  });
  const userProfileData = cache.readFragment<{
    id: number;
    _count: {
      posts: number;
      follower_followers_followerIdTousers: number;
      follower_followers_leaderIdTousers: number;
    };
  }>({
    id: 'ProfileUser:' + id,
    fragment: gql`
      fragment _ on ProfileUser {
        id
        _count
      }
    `,
  });

  const postsData = cache.readQuery<PostsQuery>({
    query: PostsDocument,
    variables: {
      limit,
      cursor: null,
    },
  });
  if (userPostsData?.posts) {
    const cursor =
      userPostsData.posts.posts.length > limit
        ? userPostsData.posts.posts[userPostsData.posts.posts.length - 1]
        : null;
    cache.writeQuery({
      query: PostsDocument,
      data: {
        posts: {
          hasMore: userPostsData.posts.hasMore,
          posts: [data?.createPost, ...userPostsData.posts.posts],
        },
      },
      variables: {
        limit,
        userId: id,
        cursor,
      },
    });
    cache.writeFragment({
      id: 'ProfileUser:' + id,
      fragment: gql`
        fragment _ on ProfileUser {
          _count
        }
      `,
      data: {
        _count: {
          ...userProfileData?._count,
          posts: userProfileData?._count.posts! + 1,
        },
      },
    });
  }

  if (postsData?.posts) {
    const cursor =
      postsData.posts.posts.length > limit
        ? postsData.posts.posts[postsData.posts.posts.length - 1]
        : null;
    cache.writeQuery({
      query: PostsDocument,
      data: {
        posts: {
          hasMore: postsData.posts.hasMore,
          posts: [data?.createPost, ...postsData.posts.posts],
        },
      },
      variables: {
        limit,
        cursor,
      },
    });
  }
};

export const NavBar: React.FC<NavBarProps> = ({
  setProgress,
  setShowProgress,
  showProgress,
}) => {
  const router = useRouter();
  const [logout, { loading: logoutLoading, client }] = useLogoutMutation();
  const [isOpen, setIsOpen] = useState(false);
  const { data, loading } = useMeQuery();
  const [createPost] = useCreatePostMutation();
  let body = null;
  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return null;
    }
    setShowProgress(true);
    const url = await uploadFile(e.target.files[0], (progress) =>
      setProgress(progress)
    );
    await createPost({
      variables: { inputs: { url } },
      update: (cache, { data: postData }) => {
        try {
          updatePostsCache(cache, postData, data?.me?.id!);
        } catch (error) {
          error;
        }
      },
    });
    setShowProgress(false);
    setProgress(0);
  };

  if (loading) {
  } else if (!data?.me) {
    body = (
      <>
        <Link href='/login'>
          <a className='mr-3 font-semibold no-underline bg-blue-600 text-white rounded-md py-2 px-3 cursor-pointer focus:bg-blue-700'>
            Login
          </a>
        </Link>
        <Link href='/register'>
          <a className='font-semibold cursor-pointer no-underline text-blue-600 bg-white rounded-md  py-2 px-3 focus:text-blue-800'>
            Register
          </a>
        </Link>
      </>
    );
  } else {
    body = (
      <>
        <button
          type='button'
          disabled={showProgress}
          className='bg-blue-600 relative flex items-center text-white px-3 py-2 font-semibold cursor-pointer rounded-md  mr-5 disabled:opacity-50'
        >
          <input
            type='file'
            name='post'
            id='post'
            onChange={handleChange}
            className='opacity-0 absolute cursor-pointer top-0 left-0 overflow-hidden w-full h-full z-10'
          />
          {showProgress && (
            <svg
              className='loader-btn h-6 w-6 mr-3 rounded-full border-2 border-t-2 border-gray-500'
              viewBox='0 0 24 24'
            ></svg>
          )}
          New Post
        </button>
        <div className='relative inline-block'>
          <div
            className='w-14 h-14 flex items-center'
            aria-expanded='true'
            aria-haspopup='true'
            onClick={() => setIsOpen(!isOpen)}
          >
            <img
              src={data?.me?.avatar!}
              className='w-full h-full rounded-full object-cover object-center
      cursor-pointer shadow-md'
              alt='profile'
            />
          </div>
          <motion.div
            animate={isOpen ? 'open' : 'close'}
            variants={variants}
            transition={{ duration: 0.2 }}
            initial='close'
            className={`origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none ${
              isOpen ? 'z-10' : '-z-10'
            } `}
            role='menu'
            aria-orientation='vertical'
            aria-labelledby='options-menu'
          >
            <div className='py-1' role='none'>
              <Link href={`/profile/${data?.me?.id}`}>
                <motion.a
                  whileHover={{ scale: 0.97, cursor: 'pointer' }}
                  className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  role='menuitem'
                >
                  My Account
                </motion.a>
              </Link>
              <Link href='/'>
                <motion.a
                  whileHover={{ scale: 0.97, cursor: 'pointer' }}
                  className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  role='menuitem'
                >
                  Home
                </motion.a>
              </Link>
              <Link href='/edit'>
                <motion.a
                  whileHover={{ scale: 0.97, cursor: 'pointer' }}
                  className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  role='menuitem'
                >
                  Edit Account
                </motion.a>
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  await client.cache.reset();
                  router.push('/login');
                }}
                disabled={logoutLoading}
                className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none disabled:opacity-50'
                role='menuitem'
              >
                Sign out
              </button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }
  return (
    <div className='fixed z-10 top-0 left-0 w-screen h-20 bg-white border-b-4 border-gray-200'>
      <div className='w-11/12 mx-auto h-full flex items-center justify-between'>
        <Link href='/'>
          <div className='h-full cursor-pointer flex items-center'>
            <h1 className='mx-auto font-serif font-bold text-3xl text-blue-600'>
              Pingram
            </h1>
          </div>
        </Link>
        <Search />
        <div className='flex items-center'>{body}</div>
      </div>
    </div>
  );
};
