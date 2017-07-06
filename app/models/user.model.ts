import {Document, Schema, Model, model} from 'mongoose';
import * as config from 'config';
import * as crypto from 'crypto';

export interface IUser {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface IUserModel extends IUser, Document {
  id?: Schema.Types.ObjectId;
  passwordHash?: string;
  salt?: string;
  createdAt?: Date;
  updatedAt?: Date;
  checkPassword(password: string): boolean;
  toPlainObject(): object;
}

const userSchema: Schema = new Schema({
  name: {
    type: String,
    required: 'Name is required',
  },
  username: {
    type: String,
    required: 'Username is required',
    unique: 'This username already exist',
  },
  email: {
    type: String,
    unique: 'This email already exist',
    required: 'Email is required',
    validate: [
      {
        validator: function checkEmail(value) {
          return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
        },
        msg: 'Please add valid email',
      },
    ],
  },
  passwordHash: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
});

userSchema.virtual('password')
  .set(function(password: string) {
    if (password !== undefined) {
      if (password.length < 4) {
        this.invalidate('password', 'Password must be more 4 character');
      }
    }

    this._plainPassword = password;

    if (password) {
      this.salt = crypto.randomBytes(config.get<number>('crypto.hash.length')).toString('base64');
      this.passwordHash = crypto.pbkdf2Sync(
        password,
        this.salt,
        1,
        config.get<number>('crypto.hash.length'),
        'sha1').toString();
    } else {
      this.salt = undefined;
      this.passwordHash = undefined;
    }
  })
  .get(() => {
    return this._plainPassword;
  });

userSchema.methods.checkPassword = function(password): boolean {
  if (!password) {
    return false;
  }
  if (!this.passwordHash) {
    return false;
  }
  return crypto.pbkdf2Sync(
    password,
      this.salt,
      1,
      config.get<number>('crypto.hash.length'), 'sha1').toString() === this.passwordHash;
};

userSchema.methods.toPlainObject = function() {
  return {
    name: this.name,
    username: this.username,
    email: this.email,
  };

};

export const User: Model<IUserModel> = model<IUserModel>('User', userSchema);
