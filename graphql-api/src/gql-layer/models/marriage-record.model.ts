import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Person } from './person.model';

@ObjectType()
export class MarriageRecord {
  @Field(() => ID)
  id: string;

  @Field()
  mDate: Date;

  @Field(() => Person)
  husband: Person;
  
  @Field(() => Person)
  wife: Person;

  @Field(() => [Person])
  children?: Person[];
}