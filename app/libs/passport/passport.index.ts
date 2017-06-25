import * as passport from 'koa-passport';

import {PassportLocalStrategy} from './passport.local';
import {PassportJwtStrategy} from './passport.jwt';
import {PassportSerialize} from './passport.serialize';

class PassportIndex {
  public passport;
  private passportSerialize: PassportSerialize;
  private passportLocalStrategy: PassportLocalStrategy;
  private passportJWT: PassportJwtStrategy;

  constructor() {
    this.passportSerialize = new PassportSerialize();
    this.passportLocalStrategy = new PassportLocalStrategy();
    this.passportJWT = new PassportJwtStrategy();
    this.passport = passport;
  }
}

export default new PassportIndex().passport;
