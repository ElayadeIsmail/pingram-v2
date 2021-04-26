import { ApolloCache, gql } from '@apollo/client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import {
  HandleLikeMutation,
  RegularPostFragment,
  useHandleLikeMutation,
} from '../generated/graphql';
import { convertNum } from '../utils/convertNum';
import { HeadComponent } from './Head';

interface PostComponentProps {
  post: RegularPostFragment;
  width?: string;
}

const updateLike = (postId: number, cache: ApolloCache<HandleLikeMutation>) => {
  const data = cache.readFragment<{
    id: number;
    _count: { likes: number; comments: number };
    likes: { createdAt: Date }[] | [];
  }>({
    id: 'PostResponse:' + postId,
    fragment: gql`
      fragment _ on PostResponse {
        id
        _count
        likes
      }
    `,
  });

  if (!data?.likes || !data?.likes?.length) {
    cache.writeFragment({
      id: 'PostResponse:' + postId,
      fragment: gql`
        fragment __ on PostResponse {
          _count
          likes
        }
      `,
      data: {
        _count: {
          likes: data!._count.likes + 1,
          comments: data!._count.comments,
        },
        likes: [{ createdAt: Date.now() }],
      },
    });
  } else if (data?.likes?.length === 1) {
    cache.writeFragment({
      id: 'PostResponse:' + postId,
      fragment: gql`
        fragment __ on PostResponse {
          _count
          likes
        }
      `,
      data: {
        _count: {
          likes: data._count.likes - 1,
          comments: data._count.comments,
        },
        likes: [],
      },
    });
  }
};

export const PostComponent: React.FC<PostComponentProps> = ({
  post,
  width = 'w-88',
}) => {
  const [loading, setLoading] = useState(false);
  const [handleLike] = useHandleLikeMutation();

  return (
    <>
      <HeadComponent>Pingram: Share The Moment</HeadComponent>
      <div className={`flex flex-col ${width} h-96 mb-4`}>
        <Link href={`/post/${post.id}`}>
          <motion.div
            className='relative w-full h-9/10 cursor-pointer'
            whileTap={{ scale: 0.9 }}
          >
            <Image
              src={post.url}
              layout='fill'
              className='object-center object-cover rounded-2xl shadow-md'
            />
          </motion.div>
        </Link>
        <div className='flex flex-1 items-center justify-between py-2'>
          <Link href={`/profile/${post.user.id}`}>
            <div className='flex items-center cursor-pointer'>
              <Image
                src={post.user.avatar!}
                width={45}
                height={45}
                className='rounded-full object-center object-cover'
              />
              <span className='text-blue-900 font-semibold ml-2'>
                {post.user.username}
              </span>
            </div>
          </Link>
          <div className='flex items-center space-x-3'>
            <div className='flex items-center'>
              <button
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  await handleLike({
                    variables: {
                      postId: post.id,
                    },
                    update: (cache) => updateLike(post.id, cache),
                  });
                  setLoading(false);
                }}
                className='cursor-pointer border-0 focus:outline-none'
              >
                {!post.likes?.length ? (
                  <Image src='/assets/heart.svg' width={35} height={35} />
                ) : (
                  <Image src='/assets/heart-solid.svg' width={35} height={35} />
                )}
              </button>
              <span className='ml-1 text-gray-700 text-md font-medium'>
                {convertNum(post._count.likes)}
              </span>
            </div>
            <div className='flex items-center'>
              <button className='cursor-pointer border-0 focus:outline-none'>
                <Image src='/assets/chat.svg' width={35} height={35} />
              </button>
              <span className='ml-1 text-gray-700 text-md font-medium'>
                {convertNum(post._count.comments)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
