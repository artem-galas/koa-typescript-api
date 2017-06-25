import * as passport from 'koa-passport';
import {Strategy} from 'passport-local';
import {IUserModel, User} from '../../models/user.model';

export class PassportLocalStrategy {

  private localStrategy: Strategy;

  constructor() {
    this.localStrategy = new Strategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true,
      },
      (req, username, password, done) => {
        User.findOne({username: username}, (err, user: IUserModel) => {
          if (err) {
            return done(err);
          }

          if (!user || !user.checkPassword(password)) {
            return done(null, false, {message: 'Not Found User, or Password incorrect'});
          }
          return done(null, user);
        });
      },
    );
    passport.use(this.localStrategy);
  }
}
