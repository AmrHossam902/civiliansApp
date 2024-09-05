import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./schema";
import { GeneratorService } from "./person/generator.service";

import { Person } from "./person/models/Person";

import { Db } from "./database/db-client";
import { PersonService } from "./person/person.service";
import { resolvers } from "./resolvers";





const server = new ApolloServer({
    typeDefs: schema,
    resolvers: resolvers
});


startStandaloneServer(server, {
    listen: { port: 4000 },
})
.then ( ({ url}) =>{
    console.log(`🚀  Server ready at: ${url}`);
    new Db();
    /* setTimeout(()=>{    
        let genService = new GeneratorService();
        
        genService.populateDB();

    }, 5000); */

})
