import * as config from 'config';

import * as passport from 'koa-passport';
import {Strategy, ExtractJwt} from 'passport-jwt';
import {User, IUserModel} from '../../models/user.model';

export class PassportJwtStrategy {

  private jwtStrategy: Strategy;

  constructor() {
    this.jwtStrategy = new Strategy({
        jwtFromRequest: ExtractJwt.fromHeader('authorization'),
        secretOrKey: config.get<string>('jwtSecret'),
      },
      (jwtPayload, done) => {
        User.findById(jwtPayload.id, (err, user: IUserModel) => {
          if (err) {
            return done(err, null);
          }
          if (!user) {
            return done(null, false);
          }
          return done(null, user);
        });
      },
    );
    passport.use(this.jwtStrategy);
  }
}
