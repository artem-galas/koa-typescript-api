import * as mongoose from 'mongoose';
import * as config from 'config';
import * as uniqValidator from 'mongoose-beautiful-unique-validation';

class MongooseLib {
  constructor() {
    if (process.env.MONGOOSE_DEBUG) {
      mongoose.set('debug', true);
    }
    mongoose.connect(config.get<string>('mongoose.uri'), config.get<string>('mongoose.options'));
    mongoose.plugin(uniqValidator);
  }
}

export default new MongooseLib();
