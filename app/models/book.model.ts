import {Document, Schema, Model, model, NativeError} from 'mongoose';
import * as mongoose from 'mongoose';
import * as crypto from 'crypto';
import * as slug from 'slug';

export interface IBook {
  name: string;
  authors: Array<string>;
  price: string;
  slug?: string;
}

export interface IBookModel extends IBook, mongoose.Document {
  toPlainObject(): IBook;
}

const bookSchema: Schema = new Schema({
  id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: 'Name is required',
  },
  authors: {
    type: Array,
    required: 'Authors is required',
  },
  price: {
    type: String,
    required: 'Price is required',
  },
  slug: {
    type: String,
    unique: true,
  },
});

bookSchema.methods.toPlainObject = function(): IBook {
  return {
    name: this.name,
    authors: this.authors,
    price: this.price,
    slug: this.slug,
  };
};

bookSchema.pre('save', function(next: (err?: NativeError) => void) {
  this.slug = slug(`${this.name}-${crypto.randomBytes(2).toString('base64')}`, {lower: true});
  next();
});

export const Book: Model<IBookModel> = model<IBookModel>('Book', bookSchema);
