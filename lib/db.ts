import Dexie, { Table } from 'dexie';
import { UserResponse } from '@/types';

/**
 * Dexie Database for local persistence
 * Survives page refreshes and browser restarts
 */
class GrantMatcherDB extends Dexie {
  userResponses!: Table<UserResponse>;

  constructor() {
    super('CleanTechGrantMatcherDB');
    this.version(1).stores({
      userResponses: '++id, createdAt, updatedAt',
    });
  }
}

export const db = new GrantMatcherDB();
