import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class DateFilterInput {
  @Field({ nullable: false})
  from: string;

  @Field()
  to: string;
}