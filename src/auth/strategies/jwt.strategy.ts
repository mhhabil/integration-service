import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../auth.service';
import { IJWTPayload } from '../jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: JwtStrategy.source,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: IJWTPayload): Promise<any> {
    return {
      id: payload.user_id,
      exp: payload.exp,
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
