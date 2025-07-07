import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { PersonServiceSequelize } from './sequelize-layer/services/person.service';
import { PersonService } from './gql-layer/person-service.interface';
import { PersonResolver } from './gql-layer/resolvers/person.resolver';
import { MarriageResolver } from './gql-layer/resolvers/marriage.resolver';
import { SequelizeModule } from '@nestjs/sequelize';
import { MarriageRecordModel } from './sequelize-layer/models/MarriageRecord';
import { PersonModel } from './sequelize-layer/models/Person';
import { MarriedToResolver } from './gql-layer/resolvers/marriedTo.resolver';
import { DateScalar } from './gql-layer/scalars/date.scalar';
import { Gender} from './gql-layer/scalars/gender.scalar';
import { DbProvider } from './sequelize-layer/db-provider';
import { GeneratorService } from './sequelize-layer/services/generator.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';


@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'dist/schema.gql'),
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      resolvers: {
        Gender: Gender
      }
    })
  ],
  providers: [
    {
      provide: 'PersonService',
      useClass: PersonServiceSequelize
    },
    GeneratorService,
    DbProvider,
    PersonResolver, 
    MarriageResolver,
    MarriedToResolver,
    DateScalar,
    AppService
  ],

  controllers: [
    AppController
  ],
})
export class AppModule {}
