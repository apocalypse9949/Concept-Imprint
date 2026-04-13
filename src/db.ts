import Dexie, { type Table } from 'dexie';

export type IdeaStatus = 'Raw' | 'Developing' | 'Project';
export type IdeaPriority = 'Low' | 'Medium' | 'High';

export interface Idea {
  id?: string; // Using string UUIDs for cloud-sync compatibility
  title: string;
  description: string;
  tags: string[];
  status: IdeaStatus;
  priority: IdeaPriority;
  created_at: number;
  updated_at: number;
}

export class IdeaTrackerDB extends Dexie {
  ideas!: Table<Idea, string>;

  constructor() {
    super('IdeaTrackerDB');
    this.version(1).stores({
      ideas: 'id, title, status, priority, created_at, *tags'
      // *tags means we can index/query by any tag in the array
    });
  }
}

export const db = new IdeaTrackerDB();

import { supabase } from './supabase';

// Real sync implementation leveraging Supabase
export const syncWithCloud = async () => {
  if (!supabase) {
    console.warn('Supabase client not initialized. Cannot sync.');
    return false;
  }

  // Check if we have internet connection
  if (!navigator.onLine) {
    console.log('Currently offline. Sync skipped.');
    return false;
  }

  try {
    const LAST_SYNC_KEY = 'idea_tracker_last_sync';
    const lastSyncStr = localStorage.getItem(LAST_SYNC_KEY);
    const lastSyncTime = lastSyncStr ? parseInt(lastSyncStr, 10) : 0;
    
    // 1. Pull changes from Supabase made since last sync
    const { data: remoteData, error: pullError } = await supabase
      .from('ideas')
      .select('*')
      .gt('updated_at', lastSyncTime);

    if (pullError) throw pullError;

    if (remoteData && remoteData.length > 0) {
      await db.transaction('rw', db.ideas, async () => {
        for (const remoteIdea of remoteData) {
          // Check local
          const localIdea = await db.ideas.get(remoteIdea.id);
          // If local idea doesn't exist, or remote is newer, overwrite local
          if (!localIdea || remoteIdea.updated_at > localIdea.updated_at) {
            await db.ideas.put(remoteIdea as Idea);
          }
        }
      });
    }

    // 2. Push local changes made since last sync
    const localUpdatedIdeas = await db.ideas
      .filter(idea => idea.updated_at > lastSyncTime)
      .toArray();

    if (localUpdatedIdeas.length > 0) {
      const { error: pushError } = await supabase
        .from('ideas')
        .upsert(localUpdatedIdeas);
        
      if (pushError) throw pushError;
    }

    // 3. Update last sync time
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    console.log('Supabase sync complete!');
    return true;

  } catch (error) {
    console.error('Error syncing with Supabase:', error);
    return false;
  }
};
