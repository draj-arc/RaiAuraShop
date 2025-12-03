import { db as firestoreDb } from "./firebase";
import * as schema from "@shared/schema";

// For now, we'll use Firestore directly. In a full migration, you'd need to adapt the schema to Firestore collections.
// This is a placeholder to get the app running with Firebase.

export const db = firestoreDb;
