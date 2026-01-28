import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './environment';
import { logger } from '../utils/logger.util';

// Create Supabase client
let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize and return Supabase client
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    logger.info('Supabase client initialized');
  }

  return supabaseClient;
};

/**
 * Test database connection
 */
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('users').select('count', { count: 'exact', head: true });

    if (error) {
      logger.error('Database connection test failed:', error);
      return false;
    }

    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection error:', error);
    return false;
  }
};

// Export the client getter as default
export default getSupabaseClient;