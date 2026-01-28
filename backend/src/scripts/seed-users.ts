import getSupabaseClient from '../config/database';
import { hashPassword } from '../utils/password.util';
import { logger } from '../utils/logger.util';
import { USER_ROLES } from '../config/constants';

/**
 * Initial users to seed
 * 1 Admin + 4 Staff Members
 */
const initialUsers = [
  {
    full_name: 'Admin User',
    email: 'admin@realtymatch.com',
    phone_number: '+919876543210',
    password: 'Admin@2026',
    role: USER_ROLES.ADMIN,
  },
  {
    full_name: 'Rahul Sharma',
    email: 'rahul@realtymatch.com',
    phone_number: '+919876543211',
    password: 'Staff@2026',
    role: USER_ROLES.STAFF,
  },
  {
    full_name: 'Priya Patel',
    email: 'priya@realtymatch.com',
    phone_number: '+919876543212',
    password: 'Staff@2026',
    role: USER_ROLES.STAFF,
  },
  {
    full_name: 'Amit Kumar',
    email: 'amit@realtymatch.com',
    phone_number: '+919876543213',
    password: 'Staff@2026',
    role: USER_ROLES.STAFF,
  },
  {
    full_name: 'Sneha Desai',
    email: 'sneha@realtymatch.com',
    phone_number: '+919876543214',
    password: 'Staff@2026',
    role: USER_ROLES.STAFF,
  },
];

/**
 * Seed users into database
 */
export const seedUsers = async (): Promise<void> => {
  try {
    logger.info('Starting user seeding...');
    
    const supabase = getSupabaseClient();

    // Check if users already exist
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('email')
      .in('email', initialUsers.map(u => u.email));

    if (checkError) {
      throw new Error(`Failed to check existing users: ${checkError.message}`);
    }

    if (existingUsers && existingUsers.length > 0) {
      logger.warn('Users already exist in database. Skipping seed.');
      logger.info(`Existing users: ${existingUsers.map(u => u.email).join(', ')}`);
      return;
    }

    // Hash passwords and prepare users
    const usersToInsert = await Promise.all(
      initialUsers.map(async (user) => {
        const password_hash = await hashPassword(user.password);
        return {
          full_name: user.full_name,
          email: user.email,
          phone_number: user.phone_number,
          password_hash,
          role: user.role,
        };
      })
    );

    // Insert users
    const { data, error } = await supabase
      .from('users')
      .insert(usersToInsert)
      .select();

    if (error) {
      throw new Error(`Failed to insert users: ${error.message}`);
    }

    logger.info(`✅ Successfully seeded ${data?.length || 0} users`);
    logger.info('');
    logger.info('=== USER CREDENTIALS (PERMANENT) ===');
    logger.info('');
    
    initialUsers.forEach((user, index) => {
      logger.info(`${index + 1}. ${user.full_name} (${user.role})`);
      logger.info(`   Email: ${user.email}`);
      logger.info(`   Phone: ${user.phone_number}`);
      logger.info(`   Password: ${user.password}`);
      logger.info('');
    });

    logger.info('⚠️  IMPORTANT: These are PERMANENT credentials stored in database');
    logger.info('Users can change them through the Edit Profile section');
    logger.info('');

  } catch (error) {
    logger.error('User seeding failed:', error);
    throw error;
  }
};

// Run seed if called directly
if (require.main === module) {
  seedUsers()
    .then(() => {
      logger.info('✅ User seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ User seeding failed:', error);
      process.exit(1);
    });
}