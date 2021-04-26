import { Field, InputType } from 'type-graphql';

@InputType()
export class RegisterInputs {
  @Field({ nullable: false })
  username: string;
  @Field({ nullable: false })
  email: string;
  @Field({ nullable: false })
  password: string;
}
