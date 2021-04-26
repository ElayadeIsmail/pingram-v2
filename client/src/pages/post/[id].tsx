import { ApolloCache, gql } from '@apollo/client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Comment } from '../../components/Comment';
import { HeadComponent } from '../../components/Head';
import { Layout } from '../../components/Layout';
import { Spinner } from '../../components/Spinner';
import {
  CreateCommentMutation,
  PostCommentsDocument,
  PostCommentsQuery,
  PostCount,
  useCreateCommentMutation,
  useDeletePostMutation,
  useMeQuery,
  usePostCommentsQuery,
  usePostQuery,
} from '../../generated/graphql';
import { getIdAsNumber } from '../../utils/getIdAsNumber';
import { getTimeAgo } from '../../utils/timeAgo';
import { withApollo } from '../../utils/withApollo';

interface PostProps {}

const updateCache = (
  cache: ApolloCache<CreateCommentMutation>,
  data: CreateCommentMutation | null | undefined,
  postId: number,
  count: PostCount
) => {
  const prevData = cache.readQuery<PostCommentsQuery>({
    query: PostCommentsDocument,
    variables: {
      postId,
    },
  });
  cache.writeQuery({
    query: PostCommentsDocument,
    variables: {
      postId,
    },
    data: {
      postComments: [data?.createComment, ...prevData?.postComments!],
    },
  });
  cache.writeFragment({
    id: 'PostResponse:' + postId,
    fragment: gql`
      fragment __ on PostResponse {
        _count
      }
    `,
    data: {
      _count: {
        likes: count.likes,
        comments: count.comments + 1,
      },
    },
  });
};

const Post: React.FC<PostProps> = ({}) => {
  const [contents, setContents] = useState('');
  const router = useRouter();
  const id = getIdAsNumber(router.query.id!);
  const [
    createComment,
    { loading: commentLoading },
  ] = useCreateCommentMutation();
  const { data: meData } = useMeQuery();
  const { data, loading } = usePostQuery({
    variables: {
      id,
    },
  });
  const { data: commentsData, loading: commentsLoading } = usePostCommentsQuery(
    {
      variables: {
        postId: id,
      },
    }
  );
  const [deletePost, { loading: deleteLoading }] = useDeletePostMutation();
  if (!data?.post && !loading) {
    return (
      <Layout>
        <div>Oooops Something Went Wrong</div>
      </Layout>
    );
  }
  return (
    <Layout>
      <HeadComponent>Pingram: Share The Moment</HeadComponent>
      <div className='flex relative items-center justify-center min-h-full-min-nav'>
        <div
          onClick={() => router.back()}
          className='absolute flex cursor-pointer items-center justify-center  left-0 top-0 p-4 rounded-full bg-white hover:bg-gray-200 shadow-md'
        >
          <Image src='/assets/arrow-left.svg' width={30} height={30} />
        </div>
        {(!data?.post && loading) || deleteLoading ? (
          <Spinner />
        ) : (
          <div className='flex w-4/5 shadow-md rounded-2xl'>
            <div className='relative w-1/2 h-99 rounded-l-2xl'>
              <Image
                layout='fill'
                src={data?.post?.url!}
                className='object-cover min-h-full rounded-l-2xl object-center'
              />
            </div>
            <div className='flex-1 flex w-1/2 flex-col h-99 '>
              <div className='flex items-center justify-between bg-gray-100 p-2 rounded-b-none rounded-r-2xl'>
                <Link href={`/profile/${data?.post?.user.id}`}>
                  <div className='flex items-center cursor-pointer'>
                    <Image
                      src={data?.post?.user.avatar!}
                      width={45}
                      height={45}
                      className='rounded-full object-center object-cover'
                    />
                    <span className='text-blue-900 font-semibold ml-2'>
                      {data?.post?.user.username}
                    </span>
                  </div>
                </Link>
                {data?.post?.user.id === meData?.me?.id ? (
                  <button
                    type='submit'
                    className='text-base font-medium rounded-lg px-4 py-2 bg-red-600 hover:bg-red-800 focus:outline-none text-white'
                    disabled={deleteLoading}
                    onClick={async () => {
                      try {
                        await deletePost({
                          variables: {
                            id,
                          },
                          update: (cache) => {
                            cache.evict({ id: 'PostResponse:' + id });
                          },
                        });
                        router.push('/');
                      } catch (error) {
                        console.log(error);
                      }
                    }}
                  >
                    Delete Post
                  </button>
                ) : (
                  <span>{getTimeAgo(data?.post?.createdAt)}</span>
                )}
              </div>
              <div className='h-4/5 flex flex-col-reverse overflow-y-scroll p-2'>
                {!commentsData?.postComments && !commentsLoading ? (
                  <div>Opps Something Went Wrong</div>
                ) : !commentsData?.postComments && commentsLoading ? (
                  <Spinner />
                ) : (
                  commentsData?.postComments.map((comment) => (
                    <Comment key={comment.id} comment={comment} />
                  ))
                )}
              </div>
              <div className='h-20 p-2 flex items-center rounded-t-none rounded-r-2xl space-x-2 bg-gray-200'>
                <Image
                  src={meData?.me?.avatar!}
                  width={45}
                  height={45}
                  className='rounded-full object-center object-cover'
                />
                <textarea
                  onChange={(e) => setContents(e.target.value)}
                  value={contents}
                  className='flex-1 focus:border-2 border-blue-500 rounded-md p-2'
                  placeholder='comment'
                />
                <button
                  onClick={async () => {
                    if (contents.trim() === '') {
                      return;
                    }
                    await createComment({
                      variables: {
                        postId: data?.post?.id!,
                        contents,
                      },
                      update: (cache, { data: commentData }) => {
                        updateCache(
                          cache,
                          commentData,
                          id,
                          data?.post?._count!
                        );
                      },
                    });
                    setContents('');
                  }}
                  disabled={commentLoading}
                  className='bg-blue-600 p-2 text-white font-semibold rounded-md
            focus:outline-none hover:bg-blue-800 disabled:opacity-50'
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default withApollo({ ssr: false })(Post);
