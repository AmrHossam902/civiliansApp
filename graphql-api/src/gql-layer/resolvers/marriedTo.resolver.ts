import { PersonService } from '../person-service.interface';
import { MarriageRecord } from '../models/marriage-record.model';
import { Inject } from '@nestjs/common';
import { MarriedTo } from '../models/marriedTo.model';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Person } from '../models/person.model';

@Resolver(() => MarriedTo)
export class MarriedToResolver {
    constructor(@Inject('PersonService') private readonly personService: PersonService) {}

    @ResolveField()
    children(@Parent() marriedTo: MarriedTo): Promise<Person[]> {
        let parent1:Person = marriedTo.parent;
        let parent2:Person = marriedTo.spouse;
        return this.personService.getChildren(parent1, parent2);
    }



}

