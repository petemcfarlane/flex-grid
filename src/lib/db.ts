import { createRxDatabase, RxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';

// Enable dev mode for better debugging (browser only)
if (typeof window !== 'undefined') {
  addRxPlugin(RxDBDevModePlugin);
}

export interface PreferencesDoc {
  id: string;
  postcode?: string;
  theme?: 'light' | 'dark';
  lastUpdated: string;
}

export interface TariffDoc {
  id: string; // date string: YYYY-MM-DD
  date: string;
  periods: any[];
  timestamp: number;
}

export interface FlexGridDB extends RxDatabase {
  preferences: any;
  tariffs: any;
  [key: string]: any;
}

let dbInstance: FlexGridDB | null = null;

export async function getDatabase(): Promise<FlexGridDB> {
  // Only run in browser
  if (typeof window === 'undefined') {
    throw new Error('RxDB can only be used in browser');
  }

  if (dbInstance) {
    return dbInstance;
  }

  try {
    // Get localStorage storage with AJV validation wrapper
    const storage = wrappedValidateAjvStorage({
      storage: getRxStorageLocalstorage(),
    });

    const db = await createRxDatabase<FlexGridDB>({
      name: 'flexgrid',
      storage,
    });

    // Add preferences collection
    await db.addCollections({
      preferences: {
        schema: {
          version: 0,
          primaryKey: 'id',
          type: 'object',
          properties: {
            id: {
              type: 'string',
              maxLength: 100,
            },
            postcode: {
              type: 'string',
            },
            theme: {
              type: 'string',
              enum: ['light', 'dark'],
            },
            lastUpdated: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['id', 'lastUpdated'],
        },
      },

      // Add tariffs collection for caching
      tariffs: {
        schema: {
          version: 0,
          primaryKey: 'id',
          type: 'object',
          properties: {
            id: {
              type: 'string',
              maxLength: 100,
            },
            date: {
              type: 'string',
            },
            periods: {
              type: 'array',
            },
            timestamp: {
              type: 'number',
            },
          },
          required: ['id', 'date', 'periods', 'timestamp'],
        },
      },
    });

    dbInstance = db;
    console.log('RxDB initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize RxDB:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = null;
  }
}
