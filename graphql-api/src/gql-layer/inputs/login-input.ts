import { Field, InputType, Int } from "@nestjs/graphql";

@InputType({})
export class LoginInput{

    @Field(() => Int, { nullable: false})
    accountId: number;

    @Field( ()=> String, { nullable: false} )
    password: string;
}