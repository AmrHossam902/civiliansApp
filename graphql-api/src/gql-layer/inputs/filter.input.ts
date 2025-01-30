import { InputType, Field } from '@nestjs/graphql';
import { Gender, GenderEnum } from '../scalars/gender.scalar';
import { DateFilterInput } from './date-filter.input';

@InputType({})
export class FilterInput {
  @Field(() => Gender, { nullable: true })
  gender?: GenderEnum;

  @Field({ nullable: true })
  isAlive?: boolean;

  @Field(() => DateFilterInput, { nullable: true })
  birthDate?: DateFilterInput;
}