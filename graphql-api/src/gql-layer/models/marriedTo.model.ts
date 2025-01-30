import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Person } from './person.model';

@ObjectType()
export class MarriedTo {

  @Field(() => Person) //parent node (i.e. 2nd of the 2 spouses)
  parent: Person; 

  @Field(() => Person)
  spouse: Person;

  @Field()
  marriageDate: Date;

  @Field(() => [Person], { nullable: true })
  children?: Person[];
}