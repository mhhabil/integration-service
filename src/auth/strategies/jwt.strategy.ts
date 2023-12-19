import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../auth.service';
import { IJWTPayload, IJWTUser } from '../jwt-payload.interface';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: JwtStrategy.source,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: IJWTPayload): Promise<IJWTUser> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    return {
      id: payload.user_id,
      exp: payload.exp,
      token,
      service: this.authService,
    };
  }

  static get source() {
    const tokenSource = process.env.JWT_SOURCE;
    // if (tokenSource == 'auth-header') {
    // 	return ExtractJwt.fromAuthHeader;
    // }
    if (tokenSource == 'auth-bearer') {
      return ExtractJwt.fromAuthHeaderAsBearerToken();
    }
    return ExtractJwt.fromHeader(tokenSource);
  }
}
