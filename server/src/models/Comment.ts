import * as TypeGraphQL from 'type-graphql';
import { Like } from '../models/Like';
import { Post } from '../models/Post';
import { User } from '../models/User';

@TypeGraphQL.ObjectType({
  isAbstract: true,
})
export class Comment {
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
  contents!: string;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: false,
  })
  userId!: number;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: false,
  })
  postId!: number;

  posts?: Post;

  @TypeGraphQL.Field((_type) => User, {
    nullable: false,
  })
  users?: User;

  likes?: Like[];
}
