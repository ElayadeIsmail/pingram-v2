import * as TypeGraphQL from 'type-graphql';
import { Comment } from '../models/Comment';
import { Follower } from '../models/Follower';
import { Like } from '../models/Like';
import { Post } from '../models/Post';

@TypeGraphQL.ObjectType({
  isAbstract: true,
})
export class User {
  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: false,
  })
  id!: number;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  username!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  bio?: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  avatar?: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  phone?: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  email?: string | null;

  password: string | null;

  comments?: Comment[];

  follower_followers_followerIdTousers?: Follower[];

  @TypeGraphQL.Field((_type) => [Follower], {
    nullable: true,
  })
  follower_followers_leaderIdTousers?: Follower[];

  likes?: Like[];

  posts?: Post[];
}
