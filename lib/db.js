import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://praticks2003_db_user:s1t1EqtIuqbbxWub@quotes1.2wcuked.mongodb.net/Fathema_Maam_Quotes?retryWrites=true&w=majority";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
