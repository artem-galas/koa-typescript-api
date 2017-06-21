import {Document, Schema, Model, model} from 'mongoose';
import config from '../config/default';
import * as crypto from 'crypto';

export interface IUserModel extends Document {
  id?: Schema.Types.ObjectId;
  name: string;
  username: string;
  email: string;
  password: string;
  passwordHash?: string;
  salt?: string;
  createdAt?: Date;
  updatedAt?: Date;
  checkPassword(): string;
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
      this.salt = crypto.randomBytes(config.crypto.hash.length).toString('base64');
      this.passwordHash = crypto.pbkdf2Sync(password, this.salt, 1, config.crypto.hash.length, 'sha1');
    } else {
      this.salt = undefined;
      this.passwordHash = undefined;
    }
  })
  .get(() => {
    return this._plainPassword;
  });

userSchema.methods.checkPassword = function(password) {
  if (!password) {
    return false;
  }
  if (!this.passwordHash) {
    return false;
  }
  return crypto.pbkdf2Sync(password, this.salt, 1, config.crypto.hash.length, 'sha1') === this.passwordHash;
};

userSchema.methods.toPlainObject = function() {
  return {
    name: this.name,
    username: this.username,
    email: this.email,
  };

};

export const User: Model<IUserModel> = model<IUserModel>('User', userSchema);
