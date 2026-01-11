import { createRxDatabase, RxDatabase } from 'rxdb';
import { getRxStorageIndexeddb } from 'rxdb/plugins/storage-indexeddb';
import { addRxPlugin } from 'rxdb/plugins/core';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';

// Enable dev mode for better debugging
addRxPlugin(RxDBDevModePlugin);

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
}

let dbInstance: FlexGridDB | null = null;

export async function getDatabase(): Promise<FlexGridDB> {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    const db = await createRxDatabase<FlexGridDB>({
      name: 'flexgrid',
      storage: getRxStorageIndexeddb(),
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
