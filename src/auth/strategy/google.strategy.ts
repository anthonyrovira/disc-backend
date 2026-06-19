import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3001/auth/google/callback',
      scope: ['email', 'profile'],
      state: false,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, displayName } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      return done(new Error('No email returned from Google'), false);
    }

    const nameParts = displayName?.split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || undefined;

    const user = {
      email,
      googleId: id,
      firstName,
      lastName,
    };

    return done(null, user);
  }
}
