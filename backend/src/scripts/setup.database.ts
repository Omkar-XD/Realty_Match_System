import getSupabaseClient from '../config/database';
import { logger } from '../utils/logger.util';

/**
 * SQL schema for all tables
 */
const createTablesSQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enquiries Table
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255),
  lead_source VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'New Enquiry',
  assigned_to_staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buyer Requirements Table
CREATE TABLE IF NOT EXISTS buyer_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_id UUID UNIQUE REFERENCES enquiries(id) ON DELETE CASCADE,
  area VARCHAR(50),
  property_for VARCHAR(10) CHECK (property_for IN ('Rent', 'Buy')),
  property_type VARCHAR(10) CHECK (property_type IN ('Flat', 'Plot')),
  bhk_min INTEGER,
  bhk_max INTEGER,
  budget_min INTEGER,
  budget_max INTEGER,
  carpet_area_min INTEGER,
  carpet_area_max INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_name VARCHAR(255) NOT NULL,
  owner_phone VARCHAR(20) NOT NULL,
  area VARCHAR(50) NOT NULL,
  property_for VARCHAR(10) NOT NULL CHECK (property_for IN ('Rent', 'Buy')),
  property_type VARCHAR(10) NOT NULL CHECK (property_type IN ('Flat', 'Plot')),
  bhk VARCHAR(10),
  price_min INTEGER NOT NULL,
  price_max INTEGER NOT NULL,
  carpet_area INTEGER,
  status VARCHAR(50) NOT NULL DEFAULT 'Available',
  notes TEXT,
  added_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refresh Tokens Table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

/**
 * SQL for creating indexes
 */
const createIndexesSQL = `
-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Indexes for enquiries
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_assigned_to ON enquiries(assigned_to_staff_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_customer_phone ON enquiries(customer_phone);

-- Indexes for buyer_requirements
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_enquiry_id ON buyer_requirements(enquiry_id);

-- Indexes for properties
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_property_for ON properties(property_for);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_added_by ON properties(added_by_user_id);

-- Indexes for refresh_tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
`;

/**
 * SQL for creating triggers
 */
const createTriggersSQL = `
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for enquiries table
DROP TRIGGER IF EXISTS update_enquiries_updated_at ON enquiries;
CREATE TRIGGER update_enquiries_updated_at 
  BEFORE UPDATE ON enquiries
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for properties table
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at 
  BEFORE UPDATE ON properties
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
`;

/**
 * Setup database tables and indexes
 */
export const setupDatabase = async (): Promise<void> => {
  try {
    logger.info('Starting database setup...');
    
    const supabase = getSupabaseClient();

    // Note: Supabase doesn't support direct SQL execution via the JS client
    // You need to run these SQL commands in the Supabase SQL Editor
    
    logger.info('⚠️  IMPORTANT: Run the following SQL commands in Supabase SQL Editor:');
    logger.info('');
    logger.info('=== CREATE TABLES ===');
    logger.info(createTablesSQL);
    logger.info('');
    logger.info('=== CREATE INDEXES ===');
    logger.info(createIndexesSQL);
    logger.info('');
    logger.info('=== CREATE TRIGGERS ===');
    logger.info(createTriggersSQL);
    logger.info('');
    logger.info('After running the SQL, verify by checking the Tables section in Supabase Dashboard');
    
  } catch (error) {
    logger.error('Database setup failed:', error);
    throw error;
  }
};

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      logger.info('Database setup instructions displayed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Setup failed:', error);
      process.exit(1);
    });
}