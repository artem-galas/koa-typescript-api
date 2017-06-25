import * as path from 'path';
import * as fs from 'fs';

export const middlewares: Array<string> = [
  'logger',
  'errors',
  'bodyparser',
  'passport.initialize',
  'passport.session',
];
