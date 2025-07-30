import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { LogInResponse } from "../models/auth.model";
import { LoginInput } from "../inputs/login-input";
import { Inject, UseGuards } from "@nestjs/common";
import { AuthService } from "../auth-service.interface";
import { NewAccessToken } from "../models/new-access-token.model";


@Resolver()
export class AuthResolver {
    
    constructor(@Inject('AuthService') private readonly authService: AuthService){}

    @Query(()=> LogInResponse)
    login(@Args('login') loginData: LoginInput ){
        return this.authService.login(loginData.accountId, loginData.password);
    }

    @Mutation(()=> NewAccessToken)
    generateNewAccessToken(@Args('refreshToken') refreshToken: string){
        return this.authService.generateNewAccessToken(refreshToken);
    }



}