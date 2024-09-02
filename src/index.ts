import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./schema";
import { GeneratorService } from "./person/generator.service";

import { Person } from "./person/models/Person";

import { Db } from "./database/db-client";


/* const resolvers = {
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
}; */

const server = new ApolloServer({
    typeDefs: schema,
    //resolvers: resolvers
});


startStandaloneServer(server, {
    listen: { port: 4000 },
})
.then ( ({ url}) =>{
    console.log(`🚀  Server ready at: ${url}`);
    new Db();
    setTimeout(()=>{    
        let genService = new GeneratorService();
        
        genService.populateDB();

    }, 5000);

})
