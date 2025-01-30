import { InputType, Field } from '@nestjs/graphql';
import { Gender, GenderEnum } from '../scalars/gender.scalar';

@InputType()
export class CreatePersonInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  middleName: string;

  @Field()
  birthDate: string;

  @Field(()=> Gender)
  gender: GenderEnum;

  @Field()
  address: string;

  @Field()
  fatherSSN: string;

  @Field()
  motherSSN: string;
}