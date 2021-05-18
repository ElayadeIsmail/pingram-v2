import React, { useEffect } from 'react';
import { FetchMoreSpinner } from '../components/FetchMoreSpinner';
import { HeadComponent } from '../components/Head';
import { Layout } from '../components/Layout';
import { PostComponent } from '../components/PostComponent';
import { Spinner } from '../components/Spinner';
import { usePostsQuery } from '../generated/graphql';
import { limit } from '../utils/constants';
import { useIsAuth } from '../utils/useIsAuth';
import { withApollo } from '../utils/withApollo';

const Home = () => {
  useIsAuth();
  const { data, loading, error, variables, fetchMore } = usePostsQuery({
    variables: {
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
    if (scrolledToBottom && data?.posts.posts.length && !loading) {
      fetchMore({
        variables: {
          limit: variables?.limit,
          cursor: data?.posts.posts[data.posts.posts.length - 1].createdAt,
        },
      });
    }
  };
  if ((!data && !loading) || error) {
    return (
      <Layout>
        <HeadComponent>Pingram: Share The Moment</HeadComponent>
        <div>Your Query filed</div>
      </Layout>
    );
  }
  return (
    <Layout>
      <HeadComponent>Pingram: Share The Moment</HeadComponent>
      {!data && loading ? (
        <Spinner />
      ) : (
        <div className='flex flex-col'>
          <div className='w-full grid min-h-full-min-nav justify-items-center lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-2'>
            {data?.posts?.posts.map((post) => (
              <PostComponent key={post.id} post={post} />
            ))}
          </div>
          {data?.posts.hasMore && <FetchMoreSpinner />}
        </div>
      )}
    </Layout>
  );
};

export default withApollo({ ssr: false })(Home);
