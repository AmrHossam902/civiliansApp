import { Injectable } from "@nestjs/common";
import { AuthService } from "src/gql-layer/auth-service.interface";
import { UserModel } from "../models/User";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { UserRoleModel } from "../models/User_role";
import { RoleModel } from "../models/Role";

@Injectable()
export class AuthServiceSequelize implements AuthService {

    constructor(
        private jwtService: JwtService
    ){}

    createNewUser(){}

    async login(accountId: number, password: string){
            
            const user = await UserModel.findOne({
                where: {
                    accountId 
                },
                include: [
                    {
                        model: UserRoleModel,
                        include: [
                            {
                                model: RoleModel
                            }
                        ]
                    }
                ]
            });

            if(!user)
                throw new Error("INVALID_CREDENTIALS");

            const roles = user.userRoles.map((userRole)=>{
                return {
                    name: userRole.role.name,
                    permissions: userRole.role.permissions
                }
            })

            return bcrypt.compare(password, user.passwordHash)
            .then(()=>{

                const accessToken = this.jwtService.sign({
                    accountId, 
                    name: user.name,
                    roles
                });

                const refreshToken = this.jwtService.sign({
                    accountId,
                }, {
                    expiresIn: '2h'
                });

                return {
                    accessToken,
                    refreshToken
                }
            });


    }

    async generateNewAccessToken(refreshToken: string){
        try {
            const payload = this.jwtService.verify(refreshToken);
            const newAccessToken = this.jwtService.sign({
                accountId: payload.accountId, 
                name: payload.name  
            });
        
            return { accessToken: newAccessToken };
        } catch (err) {
            throw new Error('INVALID_REFRESH_TOKEN');
        }
    }

    


}