-- RealtyMatch System - Complete Database Schema
-- Database: PostgreSQL (Supabase)
-- Created: 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff')),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- ENQUIRIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_name VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(20) NOT NULL,
  buyer_email VARCHAR(255) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('Buy', 'Rent', 'Lease')),
  property_type VARCHAR(50) NOT NULL,
  property_sub_type VARCHAR(50) NOT NULL,
  budget_min DECIMAL(15, 2) NOT NULL,
  budget_max DECIMAL(15, 2) NOT NULL,
  location_preferences TEXT[] NOT NULL DEFAULT '{}',
  bhk_preferences INTEGER[] NOT NULL DEFAULT '{}',
  area_min DECIMAL(10, 2) NOT NULL,
  area_max DECIMAL(10, 2) NOT NULL,
  requirements JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'won', 'lost')),
  added_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_enquiries_transaction_type ON enquiries(transaction_type);
CREATE INDEX idx_enquiries_property_type ON enquiries(property_type);
CREATE INDEX idx_enquiries_added_by ON enquiries(added_by);
CREATE INDEX idx_enquiries_created_at ON enquiries(created_at DESC);

-- GIN index for array columns (faster array searches)
CREATE INDEX idx_enquiries_location_preferences ON enquiries USING GIN(location_preferences);
CREATE INDEX idx_enquiries_bhk_preferences ON enquiries USING GIN(bhk_preferences);

-- JSONB index for requirements
CREATE INDEX idx_enquiries_requirements ON enquiries USING GIN(requirements);

-- =====================================================
-- PROPERTIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id VARCHAR(20) UNIQUE NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  owner_phone VARCHAR(20) NOT NULL,
  owner_email VARCHAR(255) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('Buy', 'Rent', 'Lease')),
  property_type VARCHAR(50) NOT NULL,
  property_sub_type VARCHAR(50) NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  location VARCHAR(255) NOT NULL,
  area DECIMAL(10, 2) NOT NULL,
  bhk INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  furnishing VARCHAR(50) NOT NULL,
  parking VARCHAR(50) NOT NULL,
  floor_number INTEGER,
  total_floors INTEGER,
  age_of_property INTEGER DEFAULT 0,
  facing VARCHAR(50),
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'rented', 'unavailable')),
  added_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX idx_properties_property_id ON properties(property_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_transaction_type ON properties(transaction_type);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_bhk ON properties(bhk);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_area ON properties(area);
CREATE INDEX idx_properties_added_by ON properties(added_by);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);

-- GIN index for array columns
CREATE INDEX idx_properties_amenities ON properties USING GIN(amenities);

-- Full-text search index for location and description
CREATE INDEX idx_properties_location_trgm ON properties USING GIN(location gin_trgm_ops);

-- =====================================================
-- TRIGGER FUNCTIONS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enquiries_updated_at
  BEFORE UPDATE ON enquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Optional for Supabase
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- RLS Policies can be added here based on requirements
-- For now, we'll manage access through backend authentication

-- =====================================================
-- INITIAL DATA / SEED
-- =====================================================
-- This will be handled by seed-data.sql

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for active enquiries with user info
CREATE OR REPLACE VIEW active_enquiries_view AS
SELECT 
  e.*,
  u.name AS added_by_name,
  u.email AS added_by_email
FROM enquiries e
JOIN users u ON e.added_by = u.id
WHERE e.status = 'active';

-- View for available properties with user info
CREATE OR REPLACE VIEW available_properties_view AS
SELECT 
  p.*,
  u.name AS added_by_name,
  u.email AS added_by_email
FROM properties p
JOIN users u ON p.added_by = u.id
WHERE p.status = 'available';

-- =====================================================
-- FUNCTIONS FOR STATISTICS
-- =====================================================

-- Function to get property count by status
CREATE OR REPLACE FUNCTION get_property_count_by_status()
RETURNS TABLE(status VARCHAR, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT p.status, COUNT(*)::BIGINT
  FROM properties p
  GROUP BY p.status;
END;
$$ LANGUAGE plpgsql;

-- Function to get enquiry count by status
CREATE OR REPLACE FUNCTION get_enquiry_count_by_status()
RETURNS TABLE(status VARCHAR, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT e.status, COUNT(*)::BIGINT
  FROM enquiries e
  GROUP BY e.status;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE users IS 'Stores system users (admin and staff)';
COMMENT ON TABLE enquiries IS 'Stores buyer enquiries and requirements';
COMMENT ON TABLE properties IS 'Stores property listings from owners';

COMMENT ON COLUMN enquiries.requirements IS 'Additional property requirements as JSONB array';
COMMENT ON COLUMN properties.property_id IS 'Unique human-readable property ID (e.g., PROP0001)';
COMMENT ON COLUMN properties.amenities IS 'Array of amenities like Swimming Pool, Gym, etc.';

-- =====================================================
-- PERFORMANCE OPTIMIZATIONS
-- =====================================================

-- Analyze tables for query optimization
ANALYZE users;
ANALYZE enquiries;
ANALYZE properties;

-- =====================================================
-- BACKUP RECOMMENDATIONS
-- =====================================================
-- 1. Daily automated backups via Supabase
-- 2. Weekly manual exports
-- 3. Point-in-time recovery enabled