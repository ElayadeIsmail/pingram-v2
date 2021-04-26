import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { isAuth } from '../middlewares/isAuth';
import { Comment } from '../models';
import { MyContext } from '../types';

@Resolver()
export class CommentResolver {
  @Query(() => [Comment])
  @UseMiddleware(isAuth)
  async postComments(
    @Arg('postId', () => Int) postId: number,
    @Ctx() { prisma }: MyContext
  ): Promise<Comment[]> {
    const comments = (await prisma.comment.findMany({
      where: {
        postId,
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })) as Comment[];
    return comments;
  }

  @Mutation(() => Comment, { nullable: true })
  @UseMiddleware(isAuth)
  async createComment(
    @Arg('contents') contents: string,
    @Arg('postId', () => Int) postId: number,
    @Ctx() { prisma, req }: MyContext
  ): Promise<Comment> {
    const comment = (await prisma.comment.create({
      data: {
        contents,
        postId,
        userId: req.session.userId!,
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    })) as Comment;
    return comment;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteComment(
    @Arg('commentId', () => Int) commentId: number,
    @Ctx() { prisma, req }: MyContext
  ): Promise<Boolean> {
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });
    if (comment?.userId !== req.session.userId) {
      throw new Error('Not Authorized');
    }

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });
    return true;
  }
}
