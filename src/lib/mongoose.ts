// import mongoose from 'mongoose'

// let isConnected = false;

// export const connectToDB = async () => {
//     mongoose.set('strictQuery', true)

//     if (!process.env.MONGODB_URL) {
//         return console.log('MONGODB_URL not found')
//     }

//     if (isConnected) {
//         return console.log('Connected to MongoDB')
//     }

//     try {
//         await mongoose.connect(process.env.MONGODB_URL)

//         isConnected = true

//         console.log('Connected to MongoDB')
        
//     } catch (error) {
//         console.log(error)
//     }
// }


import mongoose from 'mongoose'

let isConnected = false;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export const connectToDB = async () => {
    mongoose.set('strictQuery', true)

    if (!process.env.MONGODB_URL) {
        return console.log('MONGODB_URL not found')
    }

    // Cek dari cache global dulu
    if (cached.conn) {
        isConnected = true;
        return console.log('Connected to MongoDB (cached)')
    }

    // Kalau belum ada promise, buat koneksi baru dengan pooling
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose.connect(process.env.MONGODB_URL, opts);
    }

    try {
        cached.conn = await cached.promise;
        isConnected = true;
        console.log('Connected to MongoDB')
    } catch (error) {
        cached.promise = null;
        isConnected = false;
        console.log(error)
    }
}