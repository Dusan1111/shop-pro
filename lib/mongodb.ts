// lib/mongodb.ts

import { MongoClient, ServerApiVersion } from "mongodb";

const isDev = process.env.NODE_ENV === "development";

const uri = isDev ? process.env.MONGODB_URI_DEV : process.env.MONGODB_URI_PROD;

const settingsDbName = isDev
  ? process.env.MONGODB_SETTINGS_DB_DEV
  : process.env.MONGODB_SETTINGS_DB_PROD;

if (!uri || !settingsDbName) {
  throw new Error("MongoDB URI or DB name is not defined");
}

// Common options for MongoClient
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 5000,
  tls: true, // Explicitly enable TLS
  tlsAllowInvalidCertificates: isDev, // Allow invalid certs in dev only
};

let client;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

if (isDev) {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Helper function to get database connection for a specific user
export async function getUserDb(userDbName: string) {
  const client = await clientPromise;
  return client.db(userDbName);
}

export { clientPromise, settingsDbName };
