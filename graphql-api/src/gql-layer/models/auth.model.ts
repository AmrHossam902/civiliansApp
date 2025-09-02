import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class LogInResponse {

    @Field( () => String, { nullable: true})
    accessToken?: String;

    @Field( () => String, { nullable: true})
    refreshToken?: String;
}