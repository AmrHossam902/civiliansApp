import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NewAccessToken {
    
    @Field()
    accessToken: string;

}