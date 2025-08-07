import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          console.log(req.cookies);
          return req.cookies.accessToken;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  async validate(payload: any) {
    // gets called after jwt decodes and verifies the token
    console.log("inside validate");

    // passport will attach the returned object to the request object 
    // with name user (req.user)
    return { accountId: payload.accountId, name: payload.name };
  }
}