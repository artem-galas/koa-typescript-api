import * as faker from 'faker';
import {IUser} from '../../models/user.model';

const user: IUser = {
  name: faker.name.findName(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  password: faker.internet.password(8),
};

export default {
  user,
};
