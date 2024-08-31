import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./schema";
import { generatePeople } from "./dataGenerator";
import { PersonService } from "./person/person.service";
import { Person } from "./person/models/Person";



const resolvers = {
    Query: {
        people : () => {
            const personService: PersonService = PersonService.getInstance();
            return personService.getAllPersons()
        },

        someone : (_, args) =>{
            const personService: PersonService = PersonService.getInstance();
            return personService.getPersonBySSN(args.ssn)
        }
    },

    Mutation: {
        addNewPerson: (_, args)=>{
            const personService: PersonService = PersonService.getInstance();
            return personService.createNewPerson({ ...args.person } as Person);
        }
    },

    Person: {
        siblings: (parent:Person, args)=>{
            const personService: PersonService = PersonService.getInstance();
            return personService.getPersonSiblings(parent);
        }
    }
};

const server = new ApolloServer({
    typeDefs: schema,
    resolvers: resolvers
});


startStandaloneServer(server, {
    listen: { port: 4000 },
})
.then ( ({ url}) =>{
    console.log(`🚀  Server ready at: ${url}`);

})
/* .then(()=>{
    const personService: PersonService = PersonService.getInstance();
    personService.getAllPersons()
    .then((res: Person[])=>{
        console.log(res);
    });
}) */
/* .then(async ()=>{
    const personService: PersonService = PersonService.getInstance();
    let ps: Person[] = generatePeople(20);

    for(let i=0; i< 20; i++){
        await personService.createNewPerson(ps[i]);
    }
});
 */  
