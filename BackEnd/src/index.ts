import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4"
import { startStandaloneServer } from "@apollo/server/standalone";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import express from "express";

import { createServer } from "http";
import cors from "cors";
import { schema } from "./schema";
import { GeneratorService } from "./person/generator.service";

import { Person } from "./person/models/Person";

import { Db } from "./database/db-client";
import { PersonService } from "./person/person.service";
import { resolvers } from "./resolvers";
import { GraphQLScalarType, graphql } from "graphql";


async function setup(){
    const app = express();
    let httpServer = createServer(app);

    //setup apollo server
    const apolloServer = new ApolloServer({
        typeDefs: schema,
        resolvers: resolvers,
        plugins: [ApolloServerPluginDrainHttpServer({httpServer})] //gives access to undelying http server
    });
    await apolloServer.start();


    app.use("/graphql", 
        cors<cors.CorsRequest>({ origin: ['http://localhost:4000', 'http://localhost:3000'] }),
        express.json(), // you need this since you are not running a standalone server
        expressMiddleware(apolloServer)  //convert appolo server to express middleware and hook it
    )

    new Db();

    app.listen(4000, ()=> console.log("server started ..."));

}

setup();



