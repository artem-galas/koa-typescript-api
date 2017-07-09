import * as faker from 'faker';
import {IUser} from '../../models/user.model';

const user: IUser = {
  name: faker.name.findName(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  password: faker.internet.password(8),
};

const users: Array<IUser> =  [];
for (let i = 0; i <= 5; i++) {
  users.push({
    name: faker.name.findName(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(8),
  });
}

export const userFixtures = {
  user,
};

export const usersFixtures = {
  users,
};
