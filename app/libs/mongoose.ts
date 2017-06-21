import * as mongoose from 'mongoose';
import config from '../config/default';
import * as uniqValidator from 'mongoose-beautiful-unique-validation';

class MongooseLib {
  constructor() {
    if (process.env.MONGOOSE_DEBUG) {
      mongoose.set('debug', true);
    }
    mongoose.connect(config.mongoose.uri, config.mongoose.options);
    mongoose.plugin(uniqValidator);
  }
}

export default new MongooseLib();
