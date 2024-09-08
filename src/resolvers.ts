import { Person } from "./person/models/Person";
import { PersonService } from "./person/person.service";

export const resolvers = {
    Query: {
        people : (_, args) => {
            const personService: PersonService = PersonService.getInstance();
            console.log(args);
            return personService.getAllPeople(args.after, args.before, args.sort, args.limit, args.filter, args.search);
        },

        someone : (_, args) =>{
            const personService: PersonService = PersonService.getInstance();
            return personService.getPersonBySSN(args.ssn)
        }
    },

    Person: {
        birthDate: (parent: Person)=>{
            return parent.birthDate.toUTCString();
        },

        siblings: (parent:Person, args)=>{
            const personService: PersonService = PersonService.getInstance();
            return personService.getPersonSiblings(parent);
        },

        parents: (parent: Person) =>{
            const personService: PersonService = PersonService.getInstance();
            return personService.getPersonParents(parent);
        }
    },

/*     Mutation: {
        addNewPerson: (_, args)=>{
            const personService: PersonService = PersonService.getInstance();
            return personService.createNewPerson({ ...args.person } as Person);
        }
    }, */


};