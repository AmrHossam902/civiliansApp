import { GraphQLScalarType, parseValue } from "graphql";
import { Person } from "./person/models/Person";
import { PersonService } from "./person/person.service";
import { MarriageRecord } from "./person/models/MarriageRecord";
import { MarriedTo } from "./person/interfaces/marriedTo.interface";
import { MarriageReadErrorType, MarriageReadError } from "./person/exceptions/marriageRead.error";
import genderPipe from "./person/pipes/gender.pipe";
import { faker } from "@faker-js/faker";

export const resolvers = {
    Query: {

        people : (_, args) => {
            const personService: PersonService = PersonService.getInstance();
            console.log(args);
            
            return personService.getAllPeople(
                args.after, 
                args.before, 
                args.sort, 
                args.limit, 
                genderPipe(args.filter), 
                args.search
            );
        },

        someone : (_, args) =>{
            const personService: PersonService = PersonService.getInstance();
            return personService.getPersonBySSN(args.ssn)
        },

        marriage : async (_, args) =>{
            const personService: PersonService = PersonService.getInstance();
            const husband = await personService.getPersonBySSN(args.maleNatId);
            if(!husband)
                throw new MarriageReadError(
                    MarriageReadErrorType.HUSBAND_NOT_FOUND,
                    `can not find a person with this National Id ${args.maleNatId}`
                );

            const wife = await personService.getPersonBySSN(args.femaleNatId);
            if(!wife)
                throw new MarriageReadError(
                    MarriageReadErrorType.WIFE_NOT_FOUND,
                    `can not find a person with this National Id ${args.femaleNatId}`
                );

            return personService.getMarriageRecord(husband.id, wife.id)
            .then((marriageCase: MarriageRecord)=>{
                
                if(!marriageCase)
                    throw new MarriageReadError(
                        MarriageReadErrorType.MARRIAGE_CASE_NOT_FOUND,
                        `no marriage case found for these 
                        people with national ids ${args.maleNatId} 
                        & ${args.femaleNatId}`
                    );

                marriageCase.husband = husband;
                marriageCase.wife = wife;

                return marriageCase;
            })
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
        
        id: (parent: MarriageRecord) => {
            return parent.publicId;
        },

        husband: (parent: MarriageRecord) =>{
            const personService: PersonService = PersonService.getInstance();
            return personService.getPersonById(parent.husbandId);
        },

        wife: (parent: MarriageRecord) =>{
            const personService: PersonService = PersonService.getInstance();
            return personService.getPersonById(parent.wifeId);
        },

        children: (parent: MarriageRecord) =>{
            const personService: PersonService = PersonService.getInstance();
            return personService.getChildren(parent.husband, parent.wife);
        }
    },

    Mutation: {
        addNewPerson: async (_, { person }: any)=>{
            const personService: PersonService = PersonService.getInstance();
            const father = await personService.getPersonBySSN(person.fatherSSN);
            const mother = await personService.getPersonBySSN(person.motherSSN);

            const p: Partial<Person> = {
                firstName: person.firstName,
                lastName: person.lastName,
                middleName: person.middleName,
                ssn: faker.string.alphanumeric(10), 
                gender: genderPipe(person.gender).gender,
                birthDate: person.birthDate,
                address: person.address,
                father_id: father.id,
                mother_id: mother.id
            };
            console.log(p);

            return personService.createNewPerson(p);
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

    }),




};