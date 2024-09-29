import { GraphQLScalarType, parseValue } from "graphql";
import { Person } from "./person/models/Person";
import { PersonService } from "./person/person.service";
import { MarriageRecord } from "./person/models/MarriageRecord";
import { MarriedTo } from "./person/interfaces/marriedTo.interface";

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

        id: (parent: Person) => {
            return parent.publicId;
        },
        siblings: (parent:Person, args)=>{
            const personService: PersonService = PersonService.getInstance();
            return personService.getPersonSiblings(parent);
        },

        parents: (parent: Person) =>{
            const personService: PersonService = PersonService.getInstance();
            return personService.getPersonParents(parent);
        },

        marriedTo: async (person: Person,_,context) =>{
            const personService: PersonService = PersonService.getInstance();
            const marriageCases: MarriedTo[] = await personService.marriedTo(person);
            marriageCases.forEach( m => m.parent = person); 
            return marriageCases;
        },

        gender : (parent: Person) =>{
            if(parent.gender == 1)
                return "MALE";
            else
                return "FEMALE";
        }

    },

    MarriedTo: {
        children: (marriedTo: MarriedTo)=>{
            let parent1:Person = marriedTo.parent;
            let parent2:Person = marriedTo.spouse;
            const personService: PersonService = PersonService.getInstance();
            return personService.getChildren(parent1, parent2);
        }
    },

    MarriageRecord: {
        
        husband: (parent: MarriageRecord) =>{
            const personService: PersonService = PersonService.getInstance();
            return personService.getPersonById(parent.husbandId);
        },

        wife: (parent: MarriageRecord) =>{
            const personService: PersonService = PersonService.getInstance();
            return personService.getPersonById(parent.wifeId);
        }
    },

    Date: new GraphQLScalarType({
        name: "Date",
        description: "JS date type for GQL",
        serialize: (date: unknown) => {
            if(date instanceof Date)
                return `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`; 
            throw Error("this value can't be serialized into a date")
        },
        parseValue: (input: unknown) => {
            if(typeof input == "string" && /^dd-dd-dddd$/.test(input)){
                const [day, month, year] = input.split("-");
                return new Date(Number(year), Number(month), Number(day));
            }
                
            throw Error("invalid date format, input can't be converted")
        }

    })

/*     Mutation: {
        addNewPerson: (_, args)=>{
            const personService: PersonService = PersonService.getInstance();
            return personService.createNewPerson({ ...args.person } as Person);
        }
    }, */


};