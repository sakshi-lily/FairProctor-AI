import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { IUser, UserModel, UserRole, UserStatus } from '../models/User.js';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isMongoConnected = false;
let databaseMode: 'mongodb' | 'local_json' = 'local_json';
let connectionErrorMsg: string | null = null;

// File-based fallback storage helpers
function readLocalUsers(): IUser[] {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    if (!data.trim()) return [];
    return JSON.parse(data, (key, value) => {
      if (key === 'createdAt' || key === 'updatedAt' || key === 'lastLoginAt' || key === 'passwordResetExpires') {
        return value ? new Date(value) : null;
      }
      return value;
    });
  } catch (err) {
    console.error('Error reading local users JSON store:', err);
    return [];
  }
}

function writeLocalUsers(users: IUser[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local users JSON store:', err);
  }
}

export async function initDatabase(): Promise<void> {
  console.log(`\n-------------------------------------------------------------`);
  console.log(`[FairProctor AI Database Initializer]`);
  console.log(`Target MongoDB URI: ${config.MONGODB_URI.replace(/:[^:]*@/, ':****@')}`);

  try {
    // Attempt Mongoose connection with 3-second timeout
    await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    databaseMode = 'mongodb';
    console.log(`✓ Connected successfully to MongoDB.`);
  } catch (err: any) {
    isMongoConnected = false;
    databaseMode = 'local_json';
    connectionErrorMsg = err?.message || 'Connection refused';
    console.warn(`! MongoDB is not currently reachable (${connectionErrorMsg}).`);
    console.info(`✓ Seamlessly initialized persistent local store at: ${USERS_FILE}`);
    console.info(`ℹ To connect to MongoDB, ensure mongod is running or set MONGODB_URI in .env (e.g. MongoDB Atlas).\n`);
  }
  console.log(`-------------------------------------------------------------\n`);
}

export const db = {
  getMode(): 'mongodb' | 'local_json' {
    return databaseMode;
  },

  getStatus() {
    return {
      mode: databaseMode,
      connected: isMongoConnected,
      uri: config.MONGODB_URI.replace(/:[^:]*@/, ':****@'),
      error: connectionErrorMsg,
      storageFile: databaseMode === 'local_json' ? USERS_FILE : undefined,
    };
  },

  async findUserByEmail(email: string): Promise<IUser | null> {
    const normalized = email.trim().toLowerCase();
    if (databaseMode === 'mongodb') {
      const doc = await UserModel.findOne({ email: normalized }).exec();
      return doc ? (doc.toObject() as unknown as IUser) : null;
    }
    const users = readLocalUsers();
    return users.find((u) => u.email.toLowerCase() === normalized) || null;
  },

  async findUserById(id: string): Promise<IUser | null> {
    if (databaseMode === 'mongodb') {
      try {
        const doc = await UserModel.findById(id).exec();
        return doc ? (doc.toObject() as unknown as IUser) : null;
      } catch {
        return null;
      }
    }
    const users = readLocalUsers();
    return users.find((u) => u._id.toString() === id.toString()) || null;
  },

  async findUserByResetToken(tokenHash: string): Promise<IUser | null> {
    const now = new Date();
    if (databaseMode === 'mongodb') {
      const doc = await UserModel.findOne({
        passwordResetToken: tokenHash,
        passwordResetExpires: { $gt: now },
      }).exec();
      return doc ? (doc.toObject() as unknown as IUser) : null;
    }
    const users = readLocalUsers();
    return (
      users.find((u) => {
        if (!u.passwordResetToken || !u.passwordResetExpires) return false;
        return u.passwordResetToken === tokenHash && new Date(u.passwordResetExpires) > now;
      }) || null
    );
  },

  async createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
    status?: UserStatus;
    rememberMe?: boolean;
  }): Promise<IUser> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const now = new Date();

    if (databaseMode === 'mongodb') {
      const doc = await UserModel.create({
        name: data.name.trim(),
        email: normalizedEmail,
        passwordHash: data.passwordHash,
        role: data.role || 'candidate',
        status: data.status || 'active',
        rememberMe: data.rememberMe ?? false,
      });
      return doc.toObject() as unknown as IUser;
    }

    const users = readLocalUsers();
    const newUser: IUser = {
      _id: crypto.randomBytes(12).toString('hex'),
      name: data.name.trim(),
      email: normalizedEmail,
      passwordHash: data.passwordHash,
      role: data.role || 'candidate',
      status: data.status || 'active',
      rememberMe: data.rememberMe ?? false,
      passwordResetToken: null,
      passwordResetExpires: null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    };
    users.push(newUser);
    writeLocalUsers(users);
    return newUser;
  },

  async updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    const now = new Date();

    if (databaseMode === 'mongodb') {
      const doc = await UserModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: now },
        { returnDocument: 'after' }
      ).exec();
      return doc ? (doc.toObject() as unknown as IUser) : null;
    }

    const users = readLocalUsers();
    const index = users.findIndex((u) => u._id.toString() === id.toString());
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: now,
    };
    writeLocalUsers(users);
    return users[index];
  },

  async listAllUsers(): Promise<IUser[]> {
    if (databaseMode === 'mongodb') {
      const docs = await UserModel.find({}).sort({ createdAt: -1 }).exec();
      return docs.map((d) => d.toObject() as unknown as IUser);
    }
    const users = readLocalUsers();
    return [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async countUsers(): Promise<number> {
    if (databaseMode === 'mongodb') {
      return UserModel.countDocuments().exec();
    }
    return readLocalUsers().length;
  },
};
