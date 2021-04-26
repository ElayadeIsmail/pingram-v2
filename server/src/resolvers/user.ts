import * as argon2 from 'argon2';
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
import { v4 } from 'uuid';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { isAuth } from '../middlewares/isAuth';
import { User } from '../models';
import { MyContext } from '../types';
import { sendEmail } from '../utils/sendEmail';
import { RegisterInputs } from '../utils/user-types';
import { validateRegister } from '../utils/validate-register';

@ObjectType()
export class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@InputType()
class ProfileInput {
  @Field({ nullable: true })
  bio?: string;
  @Field({ nullable: true })
  avatar?: string;
}

//

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}
@ObjectType()
export class UserCount {
  @Field(() => Int)
  posts: number;

  @Field(() => Int)
  follower_followers_followerIdTousers?: number;
  @Field(() => Int)
  follower_followers_leaderIdTousers?: number;
}

@ObjectType()
export class ProfileUser extends User {
  @Field()
  _count: UserCount;
}

@ObjectType()
export class ProfileResponse {
  @Field(() => ProfileUser, { nullable: true })
  user: ProfileUser;

  @Field(() => Boolean)
  isCurrentUserProfile: boolean;
}

@ObjectType()
export class FollowResponse {
  @Field({ nullable: true })
  status: 'follow' | 'unfollow';

  @Field(() => Boolean)
  follow: boolean;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { req, prisma }: MyContext
  ): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return { errors: [{ field: 'email', message: 'Invalid Credentials' }] };
    }
    const isPasswordMatch = await argon2.verify(user.password!, password);
    if (!isPasswordMatch) {
      return { errors: [{ field: 'email', message: 'Invalid Credentials' }] };
    }
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: RegisterInputs,
    @Ctx() { req, prisma }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      user = await prisma.user.create({
        data: {
          username: options.username,
          email: options.email,
          password: hashedPassword,
        },
      });
    } catch (err) {
      if (err.code === 'P2002') {
        return {
          errors: [
            {
              field: err.meta.target[0],
              message: `${err.meta.target[0]} already taken`,
            },
          ],
        };
      }
      console.log('message:', err);
    }
    req.session.userId = user?.id;
    return { user };
  }

  @Mutation(() => User)
  @UseMiddleware(isAuth)
  updateProfile(
    @Arg('options') options: ProfileInput,
    @Ctx() { req, prisma }: MyContext
  ) {
    return prisma.user.update({
      where: {
        id: req.session.userId,
      },
      data: {
        ...options,
      },
    });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async handleFollow(
    @Arg('leaderId', () => Int) leaderId: number,
    @Ctx() { req, prisma }: MyContext
  ): Promise<boolean> {
    if (leaderId === req.session.userId) {
      return false;
    }
    const alreadyFollow = await prisma.follower.findUnique({
      where: {
        follower_leaderId_followerId_key: {
          followerId: req.session.userId!,
          leaderId,
        },
      },
    });
    if (alreadyFollow) {
      await prisma.follower.delete({
        where: {
          follower_leaderId_followerId_key: {
            followerId: req.session.userId!,
            leaderId,
          },
        },
      });

      return true;
    }
    await prisma.follower.create({
      data: {
        followerId: req.session.userId!,
        leaderId,
      },
    });

    return true;
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req, prisma }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    return prisma.user.findUnique({
      where: {
        id: req.session.userId,
      },
    });
  }

  @Query(() => [User], { nullable: true })
  searchUsers(
    @Arg('searchTerm') searchTerm: string,
    @Arg('limit', () => Int, { nullable: true }) limit: number | null,
    @Ctx() { prisma }: MyContext
  ) {
    let take = limit || 5;
    return prisma.user.findMany({
      where: {
        username: {
          contains: searchTerm,
        },
      },
      take,
      select: {
        id: true,
        username: true,
        avatar: true,
      },
    });
  }

  @Query(() => ProfileResponse)
  @UseMiddleware(isAuth)
  async profile(
    @Arg('id', () => Int) id: number,
    @Ctx() { req, prisma }: MyContext
  ): Promise<ProfileResponse> {
    const user = (await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        createdAt: true,
        follower_followers_leaderIdTousers: {
          where: {
            followerId: req.session.userId,
            leaderId: id,
          },
        },
        _count: {
          select: {
            posts: true,
            follower_followers_followerIdTousers: true,
            follower_followers_leaderIdTousers: true,
          },
        },
      },
    })) as ProfileUser;
    return { user, isCurrentUserProfile: id === req.session.userId };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis, prisma }: MyContext
  ) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return true;
    }
    const token = v4();
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 60 * 24 * 3
    );
    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`
    );
    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('newPassword') newPassword: string,
    @Arg('token') token: string,
    @Ctx() { prisma, redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length < 6) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'length must be greater than 5',
          },
        ],
      };
    }
    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'Token has expired',
          },
        ],
      };
    }
    const userIdNum = parseInt(userId);
    const user = await prisma.user.findUnique({
      where: {
        id: userIdNum,
      },
    });
    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'User has no longer Exist',
          },
        ],
      };
    }
    await prisma.user.update({
      where: {
        id: userIdNum,
      },
      data: {
        password: await argon2.hash(newPassword),
      },
    });
    await redis.del(key);
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteAccount(@Ctx() { req, prisma }: MyContext) {
    const userId = req.session.userId;
    const userPosts = await prisma.post.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });
    const deletePostsComments = prisma.comment.deleteMany({
      where: {
        postId: {
          in: userPosts.map((post) => post.id),
        },
      },
    });
    const deleteUserData = prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        comments: {
          deleteMany: {
            OR: [
              {
                userId,
              },
              {
                postId: {
                  in: userPosts.map((post) => post.id),
                },
              },
            ],
          },
        },
        follower_followers_followerIdTousers: { deleteMany: {} },
        follower_followers_leaderIdTousers: { deleteMany: {} },
        likes: { deleteMany: {} },
        posts: { deleteMany: {} },
      },
    });

    const deleteUser = prisma.user.delete({
      where: {
        id: userId,
      },
    });

    await prisma.$transaction([
      deletePostsComments,
      deleteUserData,
      deleteUser,
    ]);
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
    return new Promise((resolve) => {
      req.session.destroy((err: Error) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log('logout Err:', err);
          resolve(false);
          return;
        }
        resolve(true);
      });
    });
  }
}
