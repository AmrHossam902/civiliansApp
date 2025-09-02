import { Resolver, Query, Args, Mutation, Int, ResolveField, Parent } from '@nestjs/graphql';
import { PersonService } from '../person-service.interface';
import { Person } from '../models/person.model';
import { PeoplePage } from '../models/people-page.model';
import { FilterInput } from '../inputs/filter.input';
import { Inject, UseGuards } from '@nestjs/common';
import { MarriedTo } from '../models/marriedTo.model';
import { CreatePersonInput } from '../inputs/create-person.input';
import { JwtAuthGuard } from '../auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => Person)
export class PersonResolver {
  constructor(@Inject('PersonService') private readonly personService: PersonService) {}

  @Query(() => PeoplePage, {nullable: false})
  async people(
    @Args('after', { nullable: true }) after: string,
    @Args('before', { nullable: true }) before: string,
    @Args('sort', { type: () => [[String]], nullable: true }) sort: [string, string][],
    @Args('limit', { type: () => Int, nullable: true  }) limit: number,    
    @Args('filter', { type: () => FilterInput, nullable: true  }) filter: FilterInput,
    @Args('search', { nullable: true }) search: string,
  ) {
    return this.personService.getAllPeople(after, before, sort, limit, filter, search);
  }

  @Query(() => Person)
  async someone(@Args('ssn', { type: () => String }) ssn: string) {
    return this.personService.getPersonBySSN(ssn);
  }

  @ResolveField()
  async siblings (@Parent() person:Person) {
    return this.personService.getPersonSiblings(person);
  }

  @ResolveField()
  async parents (@Parent() person: Person) {
    return this.personService.getPersonParents(person);
  }

  @ResolveField()
  async marriedTo(@Parent() person: Person) {
    const marriageCases: MarriedTo[] = await this.personService.marriedTo(person);
    return marriageCases;
  }
  
  @Mutation(() => Person)
  async addNewPerson(@Args('person') person: CreatePersonInput) {
    return this.personService.createNewPerson(person);
  } 
}