import { Args, Context, GqlContextType, GqlExecutionContext, Mutation, Query, Resolver } from "@nestjs/graphql";
import { LogInResponse } from "../models/auth.model";
import { LoginInput } from "../inputs/login-input";
import {  ExecutionContext, Inject, UseGuards } from "@nestjs/common";
import { AuthService } from "../auth-service.interface";
import { NewAccessToken } from "../models/new-access-token.model";
import { GqlRes } from "../decorators/gql-res.decorator";
import { Response } from "express";



@Resolver()
export class AuthResolver {
    
    constructor(@Inject('AuthService') private readonly authService: AuthService){}

    @Query(()=> LogInResponse)
    async login(@Args('login') loginData: LoginInput, @GqlRes() res: Response){
        const tokens = await this.authService.login(loginData.accountId, loginData.password);
        res.cookie("accessToken", tokens.accessToken, { httpOnly: true, sameSite: "strict" });
        res.cookie("refreshToken", tokens.refreshToken, { httpOnly: true, sameSite: "strict" });
        return tokens;
    }

    @Mutation(()=> NewAccessToken)
    generateNewAccessToken(@Args('refreshToken') refreshToken: string){
        return this.authService.generateNewAccessToken(refreshToken);
    }



}