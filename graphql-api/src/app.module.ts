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
    }),
    SequelizeModule.forRoot({
      host: "localhost",
      port: 3306,
      username: "root",
      password: "123456",
      database: "civilDb",
      dialect: "mysql",
      logging: false,
      pool: {
          min: 3,
          max: 8,
          acquire: 30000,
          idle: 10000 
      },
      models: [
          MarriageRecordModel,
          PersonModel
      ]
    })
  ],
  providers: [
    {
      provide: 'PersonService',
      useClass: PersonServiceSequelize
    },
    PersonResolver, 
    MarriageResolver,
    MarriedToResolver,
    DateScalar
  ],
})
export class AppModule {}
