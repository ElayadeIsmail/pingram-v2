import * as TypeGraphQL from 'type-graphql';
import { User } from '../models/User';

@TypeGraphQL.ObjectType({
  isAbstract: true,
})
export class Follower {
  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: false,
  })
  id!: number;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date | null;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: false,
  })
  leaderId!: number;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: false,
  })
  followerId!: number;

  users_followers_follower_idTousers?: User;

  users_followers_leaderIdTousers?: User;
}
