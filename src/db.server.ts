import { PrismaClient } from "@prisma/client";

let db = new PrismaClient();

declare global {
	var __db: PrismaClient | undefined;

}

if (!global.__db) {
	global.__db = db;
}

db = global.__db;

export { db };