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
  deleted?: boolean;
}

export class IdeaTrackerDB extends Dexie {
  ideas!: Table<Idea, string>;

  constructor() {
    super('IdeaTrackerDB');
    this.version(2).stores({
      ideas: 'id, title, status, priority, created_at, updated_at, *tags'
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
  // Bypassed navigator.onLine check as it fluctuates falsely on Android WebViews

  try {
    const LAST_SYNC_KEY = 'idea_tracker_last_sync';
    const lastSyncStr = localStorage.getItem(LAST_SYNC_KEY);
    const lastSyncTime = lastSyncStr ? parseInt(lastSyncStr, 10) : 0;
    
    // Use a small overlap (5 seconds) to handle clock skew/simultaneous changes
    const fetchTime = Math.max(0, lastSyncTime - 5000);
    
    // 1. PUSH local changes (Push first so the Cloud is aware of our deletions)
    const localUpdatedIdeas = await db.ideas
      .where('updated_at')
      .aboveOrEqual(lastSyncTime)
      .toArray();

    if (localUpdatedIdeas.length > 0) {
      console.log(`Cloud Sync: Pushing ${localUpdatedIdeas.length} local changes to Supabase...`, localUpdatedIdeas);
      const { error: pushError } = await supabase
        .from('ideas')
        .upsert(localUpdatedIdeas);
        
      if (pushError) throw pushError;
    } else {
      console.log('Cloud Sync: No local changes found to push.');
    }

    // 2. PULL changes from Supabase (including those marked as deleted)
    const fetchTime = Math.max(0, lastSyncTime - 5000);
    const { data: remoteData, error: pullError } = await supabase
      .from('ideas')
      .select('*')
      .gt('updated_at', fetchTime);

    if (pullError) throw pullError;

    if (remoteData && remoteData.length > 0) {
      console.log(`Cloud Sync: Pulling ${remoteData.length} records from Supabase...`);
      await db.transaction('rw', db.ideas, async () => {
        for (const remoteIdea of remoteData) {
          const localIdea = await db.ideas.get(remoteIdea.id);
          
          // CRITICAL FIX: If local idea is already deleted, never let a pull "revive" it
          if (localIdea?.deleted && !remoteIdea.deleted) {
            continue; 
          }

          // Only update local if remote is strictly newer
          if (!localIdea || remoteIdea.updated_at > localIdea.updated_at) {
            await db.ideas.put(remoteIdea as Idea);
            if (remoteIdea.deleted) {
              console.log(`Cloud Sync: Marked idea "${remoteIdea.title}" as deleted locally.`);
            }
          }
        }
      });
    }

    // 3. Update last sync time
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    console.log('Cloud Sync: Operation successful.');
    return true;

  } catch (error) {
    console.error('Cloud Sync Error:', error);
    return false;
  }
};
