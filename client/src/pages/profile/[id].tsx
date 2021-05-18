import { ApolloCache, gql } from '@apollo/client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { FetchMoreSpinner } from '../../components/FetchMoreSpinner';
import { HeadComponent } from '../../components/Head';
import { Layout } from '../../components/Layout';
import { Modal } from '../../components/Modal_';
import { PostComponent } from '../../components/PostComponent';
import { Spinner } from '../../components/Spinner';
import {
  HandleFollowMutation,
  MeDocument,
  MeQuery,
  useDeleteAccountMutation,
  useHandleFollowMutation,
  usePostsQuery,
  useProfileQuery,
} from '../../generated/graphql';
import { limit } from '../../utils/constants';
import { getIdAsNumber } from '../../utils/getIdAsNumber';
import { withApollo } from '../../utils/withApollo';

const updateFollowStatus = (
  cache: ApolloCache<HandleFollowMutation>,
  leaderId: number
) => {
  const meData = cache.readQuery<MeQuery>({
    query: MeDocument,
  });

  const meProfileData = cache.readFragment<{
    id: number;
    _count: {
      posts: number;
      follower_followers_followerIdTousers: number;
      follower_followers_leaderIdTousers: number;
    };
  }>({
    id: 'ProfileUser:' + meData?.me?.id,
    fragment: gql`
      fragment _ on ProfileUser {
        id
        _count
      }
    `,
  });
  const data = cache.readFragment<{
    id: number;
    _count: {
      posts: number;
      follower_followers_followerIdTousers: number;
      follower_followers_leaderIdTousers: number;
    };
    follower_followers_leaderIdTousers: [{ id: number }] | [];
  }>({
    id: 'ProfileUser:' + leaderId,
    fragment: gql`
      fragment __ on ProfileUser {
        id
        _count
        follower_followers_leaderIdTousers {
          id
        }
      }
    `,
  });

  if (data?.follower_followers_leaderIdTousers.length === 0) {
    cache.writeFragment({
      id: 'ProfileUser:' + leaderId,
      fragment: gql`
        fragment ___ on ProfileUser {
          _count
          follower_followers_leaderIdTousers
        }
      `,
      data: {
        _count: {
          ...data._count,
          follower_followers_leaderIdTousers:
            data._count.follower_followers_leaderIdTousers + 1,
        },
        follower_followers_leaderIdTousers: [{ id: meData?.me?.id }],
      },
    });
    if (!meProfileData?.id) {
      return;
    }

    cache.writeFragment({
      id: 'ProfileUser:' + meData?.me?.id,
      fragment: gql`
        fragment ____ on ProfileUser {
          _count
        }
      `,
      data: {
        _count: {
          ...meProfileData?._count,
          follower_followers_followerIdTousers:
            meProfileData?._count.follower_followers_followerIdTousers! + 1,
        },
      },
    });
  } else if (data?.follower_followers_leaderIdTousers.length === 1) {
    cache.writeFragment({
      id: 'ProfileUser:' + leaderId,
      fragment: gql`
        fragment _____ on ProfileUser {
          _count
          follower_followers_leaderIdTousers
        }
      `,
      data: {
        _count: {
          ...data._count,
          follower_followers_leaderIdTousers:
            data._count.follower_followers_leaderIdTousers - 1,
        },
        follower_followers_leaderIdTousers: [],
      },
    });
    if (!meProfileData?.id) {
      return;
    }
    cache.writeFragment({
      id: 'ProfileUser:' + meData?.me?.id,
      fragment: gql`
        fragment ________ on ProfileUser {
          _count
        }
      `,
      data: {
        _count: {
          ...meProfileData?._count,
          follower_followers_followerIdTousers:
            meProfileData?._count.follower_followers_followerIdTousers! - 1,
        },
      },
    });
  }
};

const Profile = () => {
  const router = useRouter();
  const id = getIdAsNumber(router.query.id!);
  const [open, setOpen] = useState(false);
  const { data, loading: userLoading } = useProfileQuery({
    variables: {
      id,
    },
  });
  const [handleFollow] = useHandleFollowMutation();

  const [deleteAccount, { loading, client }] = useDeleteAccountMutation();

  const onDelete = async () => {
    await deleteAccount();
    await client.cache.reset();
    setOpen(false);
    router.push('/register');
  };

  const {
    data: postsData,
    loading: postLoading,
    variables,
    fetchMore,
  } = usePostsQuery({
    variables: {
      userId: id,
      limit,
      cursor: null,
    },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    window.addEventListener('scroll', handleOnScroll);
    return () => window.removeEventListener('scroll', handleOnScroll);
  });

  const handleOnScroll = () => {
    // http://stackoverflow.com/questions/9439725/javascript-how-to-detect-if-browser-window-is-scrolled-to-bottom
    var scrollTop =
      (document.documentElement && document.documentElement.scrollTop) ||
      document.body.scrollTop;
    var scrollHeight =
      (document.documentElement && document.documentElement.scrollHeight) ||
      document.body.scrollHeight;
    var clientHeight =
      document.documentElement.clientHeight || window.innerHeight;
    var scrolledToBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
    if (scrolledToBottom) {
      if (!postLoading && postsData?.posts.posts.length) {
        fetchMore({
          variables: {
            limit: variables?.limit,
            cursor:
              postsData?.posts.posts[postsData.posts.posts.length - 1]
                .createdAt,
          },
        });
      }
    }
  };

  if (!data?.profile.user && !userLoading) {
    return (
      <Layout>
        <div>Oooops Something Went Wrong</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <HeadComponent>Pingram: {data?.profile.user?.username}</HeadComponent>
      <div className='relative flex w-full min-h-full-min-nav'>
        <div className='fixed w-1/3 py-10 px-8 flex flex-col space-y-6  min-h-full'>
          {!data?.profile?.user && userLoading ? (
            <Spinner />
          ) : (
            <>
              <div className='flex flex-col'>
                <div
                  className='mx-auto bg-gradient-to-r from-blue-400 to-blue-700
            w-40 h-40 rounded-full p-1 mb-2
          '
                >
                  <div className='w-full p-2 bg-white h-full rounded-full '>
                    <Image
                      src={data?.profile.user?.avatar!}
                      width={155}
                      height={155}
                      className='object-cover rounded-full object-center'
                    />
                  </div>
                </div>
                <span className='text-gray-900 font-bold text-xl text-center'>
                  {data?.profile.user?.username}
                </span>
              </div>
              <div className='flex  items-center justify-around'>
                <div className='flex flex-col items-center justify-center'>
                  <p className='text-gray-700 font-bold text-lg'>
                    {data?.profile.user?._count.posts}
                  </p>
                  <p className='text-gray-500 font-semibold  text-lg'>Posts</p>
                </div>
                <div className='flex flex-col items-center justify-center'>
                  <p className='text-gray-700 font-bold text-lg'>
                    {
                      data?.profile.user?._count
                        .follower_followers_leaderIdTousers
                    }
                  </p>
                  <p className='text-gray-500 font-semibold text-lg'>
                    Followers
                  </p>
                </div>
                <div className='flex flex-col items-center justify-center'>
                  <p className='text-gray-700 font-bold text-lg'>
                    {
                      data?.profile.user?._count
                        .follower_followers_followerIdTousers
                    }
                  </p>
                  <p className='text-gray-500 font-semibold text-lg'>
                    Following
                  </p>
                </div>
              </div>

              {!data?.profile.isCurrentUserProfile &&
                (data?.profile.user?.follower_followers_leaderIdTousers
                  ?.length === 0 ? (
                  <button
                    onClick={async () => {
                      handleFollow({
                        variables: {
                          leaderId: data.profile.user?.id!,
                        },
                        update: (cache) =>
                          updateFollowStatus(cache, data.profile.user?.id!),
                      });
                    }}
                    type='button'
                    className='px-3 py-2 w-full text-white 
                    border-2 border-blue-600 bg-blue-600 text-center rounded-md focus:outline-none'
                  >
                    Follow
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      handleFollow({
                        variables: {
                          leaderId: data?.profile.user?.id!,
                        },
                        update: (cache) =>
                          updateFollowStatus(cache, data?.profile.user?.id!),
                      });
                    }}
                    type='button'
                    className='px-3 py-2 w-full text-blue-600 
                  border-2 border-blue-600
                  font-semibold
                  text-center rounded-md focus:outline-none'
                  >
                    Following
                  </button>
                ))}

              <div>
                <h3 className='text-center text-blue-600 font-semibold text-lg'>
                  Bio
                </h3>
                <p className='text-gray-600 text-center'>
                  {data?.profile.user?.bio}
                </p>
              </div>
              {data?.profile.isCurrentUserProfile && (
                <div className='w-full mt-8'>
                  <Button
                    isSubmitting={false}
                    onClick={() => setOpen(true)}
                    type='button'
                    className='w-full bg-red-600 hover:bg-red-800'
                  >
                    Delete Account
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        <div className='absolute top-0 left-2/5 w-2/3 min-h-full bg-gray-50  px-10 flex flex-col'>
          <motion.div
            layout
            className='grid lg:grid-cols-2 md:grid-cols-1 justify-items-center gap-2'
          >
            {!postsData?.posts.posts && postLoading ? (
              <Spinner />
            ) : (
              <>
                {postsData?.posts.posts.map((post) => (
                  <PostComponent width='w-80' key={post.id} post={post} />
                ))}
              </>
            )}
          </motion.div>
          {postsData?.posts.hasMore && <FetchMoreSpinner />}
        </div>
      </div>
      <Modal
        disabled={loading}
        open={open}
        setOpen={setOpen}
        title='Account'
        onConfirm={onDelete}
        showIcon
      />
    </Layout>
  );
};

export default withApollo({ ssr: false })(Profile);
