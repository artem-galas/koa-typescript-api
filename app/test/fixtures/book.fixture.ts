import * as faker from 'faker';
import {IBook} from '../../models/book.model';

const book: IBook = {
  name: faker.name.findName(),
  authors: [faker.name.findName(), faker.name.findName()],
  price: faker.finance.amount(10, 100000),
};

export const bookData = book;
