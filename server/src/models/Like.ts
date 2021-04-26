import * as TypeGraphQL from 'type-graphql';
import { Comment } from '../models/Comment';
import { Post } from '../models/Post';
import { User } from '../models/User';

@TypeGraphQL.ObjectType({
  isAbstract: true,
})
export class Like {
  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: false,
  })
  id!: number;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt!: Date | null;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: false,
  })
  userId!: number;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  postId?: number | null;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  commentId?: number | null;

  comments?: Comment | null;

  posts?: Post | null;

  user?: User;
}
