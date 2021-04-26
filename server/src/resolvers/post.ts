import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { isAuth } from '../middlewares/isAuth';
import { Post } from '../models';
import { MyContext } from '../types';

@InputType()
class PostInput {
  @Field()
  url: string;
  @Field({ nullable: true })
  caption?: string;
}

@ObjectType()
export class PostCount {
  @Field(() => Int)
  likes: number;

  @Field(() => Int)
  comments: number;
}

@ObjectType()
export class PostResponse extends Post {
  @Field()
  _count: PostCount;
}

@ObjectType()
export class PaginatedPosts {
  @Field(() => [PostResponse])
  posts: PostResponse[];

  @Field(() => Boolean)
  hasMore: boolean;
}

@Resolver()
export class PostResolver {
  @Mutation(() => PostResponse)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('inputs') inputs: PostInput,
    @Ctx() { req, prisma }: MyContext
  ): Promise<PostResponse> {
    const post = await prisma.post.create({
      data: {
        ...inputs,
        userId: req.session.userId as number,
      },
      include: {
        likes: {
          where: {
            userId: req.session.userId,
          },
          select: {
            createdAt: true,
            postId: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
    return post as PostResponse;
  }

  @Query(() => PostResponse, { nullable: true })
  @UseMiddleware(isAuth)
  post(@Arg('id', () => Int) id: number, @Ctx() { prisma }: MyContext) {
    return prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
  }

  @Query(() => PaginatedPosts)
  @UseMiddleware(isAuth)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('userId', () => Int, { nullable: true }) userId: number | null,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req, prisma }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(limit, 48);
    const limitPlusOne = realLimit + 1;
    if (!cursor) {
      if (userId) {
        const posts = (await prisma.post.findMany({
          take: limitPlusOne,
          where: {
            userId,
          },
          include: {
            likes: {
              where: {
                userId: req.session.userId,
              },
              select: {
                createdAt: true,
                postId: true,
              },
            },
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })) as PostResponse[];
        return {
          posts: posts.slice(0, realLimit),
          hasMore: posts.length === limitPlusOne,
        };
      } else {
        const posts = (await prisma.post.findMany({
          take: limitPlusOne,
          include: {
            likes: {
              where: {
                userId: req.session.userId,
              },
              select: {
                createdAt: true,
                postId: true,
              },
            },
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })) as PostResponse[];
        return {
          posts: posts.slice(0, realLimit),
          hasMore: posts.length === limitPlusOne,
        };
      }
    } else {
      if (userId) {
        const posts = (await prisma.post.findMany({
          take: limitPlusOne,
          skip: 1,
          where: {
            userId,
          },
          cursor: {
            createdAt: cursor,
          },
          include: {
            likes: {
              where: {
                userId: req.session.userId,
              },
              select: {
                createdAt: true,
                postId: true,
              },
            },
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })) as PostResponse[];

        return {
          posts: posts.slice(0, realLimit),
          hasMore: posts.length === limitPlusOne,
        };
      } else {
        const posts = (await prisma.post.findMany({
          take: limitPlusOne,
          skip: 1,
          cursor: {
            createdAt: cursor,
          },
          include: {
            likes: {
              where: {
                userId: req.session.userId,
              },
              select: {
                createdAt: true,
                postId: true,
              },
            },
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })) as PostResponse[];

        return {
          posts: posts.slice(0, realLimit),
          hasMore: posts.length === limitPlusOne,
        };
      }
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async handleLike(
    @Arg('postId', () => Int, { nullable: true }) postId: number,
    @Arg('commentId', () => Int, { nullable: true }) commentId: number,
    @Ctx() { req, prisma }: MyContext
  ): Promise<boolean> {
    const alreadyLiked = await prisma.like.findFirst({
      where: {
        postId,
        userId: req.session.userId!,
        commentId,
      },
    });
    if (alreadyLiked) {
      await prisma.like.delete({
        where: {
          id: alreadyLiked.id,
        },
      });
      return true;
    }
    await prisma.like.create({
      data: {
        userId: req.session.userId!,
        commentId,
        postId,
      },
    });
    return true;
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('url') url: string,
    @Arg('caption', { nullable: true }) caption: string,
    @Ctx() { req, prisma }: MyContext
  ) {
    const post = await prisma.post.findUnique({
      where: {
        id,
      },
    });
    if (post?.userId !== req.session.userId) {
      throw new Error('Not Authorized');
    }
    return prisma.post.update({
      where: { id },
      data: {
        url,
        caption,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  @Mutation(() => Boolean, { nullable: true })
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req, prisma }: MyContext
  ) {
    const post = await prisma.post.findUnique({
      where: {
        id,
      },
    });
    if (post?.userId !== req.session.userId) {
      throw new Error('Not Authorized');
    }
    const deletePostData = prisma.post.update({
      where: {
        id,
      },
      data: {
        comments: {
          deleteMany: {},
        },
        likes: {
          deleteMany: {},
        },
      },
    });
    const deletePost = prisma.post.delete({
      where: {
        id,
      },
    });
    await prisma.$transaction([deletePostData, deletePost]);
    return true;
  }
}
