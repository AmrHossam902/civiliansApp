import { Field, ObjectType } from '@nestjs/graphql';
import { Person } from './person.model';

@ObjectType()
export class PeoplePage {
    @Field(type => [Person])
    people!: Person[];

    @Field({ nullable: true })
    next?: String;

    @Field({ nullable: true })
    prev?: String;
}