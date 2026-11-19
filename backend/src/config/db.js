import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

export async function connectDatabase(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  console.log(`MongoDB connected (${mongoose.connection.name})`);
}

export function disconnectDatabase() {
  return mongoose.disconnect();
}
