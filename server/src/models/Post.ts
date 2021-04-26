import * as TypeGraphQL from 'type-graphql';
import { Comment } from '../models/Comment';
import { Like } from '../models/Like';
import { User } from '../models/User';

@TypeGraphQL.ObjectType({
  isAbstract: true,
})
export class Post {
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
  url!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  caption?: string | null;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: false,
  })
  userId!: number;

  @TypeGraphQL.Field((_type) => User, {
    nullable: false,
  })
  user: User;

  comments?: Comment[];

  @TypeGraphQL.Field((_type) => [Like], {
    nullable: true,
  })
  likes: Like[];
}
