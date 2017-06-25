import * as passport from 'koa-passport';

import {IUserModel, User} from '../../models/user.model';

export class PassportSerialize {
  constructor() {
    passport.serializeUser(this.serialize);
    passport.deserializeUser(this.deserialize);
  }

  public serialize(user: IUserModel, done) {
    done(null, user.id);
  }

  public deserialize(id: string, done) {
    User.findById(id, done);
  }
}
