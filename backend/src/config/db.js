import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

// Make connection problems visible in the server log instead of failing silently.
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected. Retrying…'));
mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));
mongoose.connection.on('error', (error) => console.error('MongoDB error:', error.message));

export async function connectDatabase(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  console.log(`MongoDB connected (${mongoose.connection.name})`);
}

export function disconnectDatabase() {
  return mongoose.disconnect();
}
