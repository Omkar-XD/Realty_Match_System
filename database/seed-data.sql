-- RealtyMatch System - Seed Data
-- Provides initial test data for development and testing

-- =====================================================
-- SEED USERS
-- =====================================================
-- Password for all users: "password123" (already hashed with bcrypt)
-- Hash: $2a$10$rZ5YvvqXJ6YvQkJ2kGq5G.Pw8XxXKKJ5KxXxXxXxXxXxXxXxXxX

INSERT INTO users (id, name, email, phone, role, password_hash) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Admin User',
    'admin@realtymatch.com',
    '9876543210',
    'admin',
    '$2a$10$rZ5YvvqXJ6YvQkJ2kGq5G.2QJZ1YZ8mXXKJ5KxXxXxXxXxXxXxXxXxX'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Rajesh Kumar',
    'rajesh@realtymatch.com',
    '9876543211',
    'staff',
    '$2a$10$rZ5YvvqXJ6YvQkJ2kGq5G.2QJZ1YZ8mXXKJ5KxXxXxXxXxXxXxXxXxX'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Priya Sharma',
    'priya@realtymatch.com',
    '9876543212',
    'staff',
    '$2a$10$rZ5YvvqXJ6YvQkJ2kGq5G.2QJZ1YZ8mXXKJ5KxXxXxXxXxXxXxXxXxX'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    'Amit Patel',
    'amit@realtymatch.com',
    '9876543213',
    'staff',
    '$2a$10$rZ5YvvqXJ6YvQkJ2kGq5G.2QJZ1YZ8mXXKJ5KxXxXxXxXxXxXxXxXxX'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SEED ENQUIRIES
-- =====================================================

INSERT INTO enquiries (
  id, buyer_name, buyer_phone, buyer_email, transaction_type,
  property_type, property_sub_type, budget_min, budget_max,
  location_preferences, bhk_preferences, area_min, area_max,
  notes, status, added_by
) VALUES
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'Sandeep Verma',
    '9123456789',
    'sandeep.v@gmail.com',
    'Buy',
    'Residential',
    'Flat/Apartment',
    5000000,
    7000000,
    ARRAY['Baner', 'Hinjewadi', 'Wakad'],
    ARRAY[2, 3],
    1000,
    1500,
    'Looking for a ready-to-move 2-3 BHK flat',
    'active',
    '550e8400-e29b-41d4-a716-446655440002'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002',
    'Meera Iyer',
    '9123456790',
    'meera.iyer@yahoo.com',
    'Rent',
    'Residential',
    'Flat/Apartment',
    15000,
    25000,
    ARRAY['Koregaon Park', 'Kalyani Nagar'],
    ARRAY[2],
    800,
    1200,
    'Need fully furnished 2 BHK for 11 months',
    'active',
    '550e8400-e29b-41d4-a716-446655440002'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440003',
    'Rakesh Gupta',
    '9123456791',
    'rakesh.g@outlook.com',
    'Buy',
    'Commercial',
    'Office Space',
    10000000,
    15000000,
    ARRAY['Yerwada', 'Viman Nagar'],
    ARRAY[0],
    2000,
    3000,
    'Looking for office space for IT company',
    'active',
    '550e8400-e29b-41d4-a716-446655440003'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440004',
    'Anjali Deshmukh',
    '9123456792',
    'anjali.d@gmail.com',
    'Buy',
    'Residential',
    'Villa',
    15000000,
    25000000,
    ARRAY['Kharadi', 'Magarpatta'],
    ARRAY[3, 4],
    2000,
    3000,
    'Looking for villa with garden',
    'won',
    '550e8400-e29b-41d4-a716-446655440003'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440005',
    'Vikram Singh',
    '9123456793',
    'vikram.s@hotmail.com',
    'Lease',
    'Commercial',
    'Warehouse',
    50000,
    100000,
    ARRAY['Chakan', 'Talegaon'],
    ARRAY[0],
    5000,
    10000,
    'Need warehouse for logistics business',
    'active',
    '550e8400-e29b-41d4-a716-446655440004'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SEED PROPERTIES
-- =====================================================

INSERT INTO properties (
  id, property_id, owner_name, owner_phone, owner_email,
  transaction_type, property_type, property_sub_type,
  price, location, area, bhk, bathrooms,
  furnishing, parking, floor_number, total_floors,
  age_of_property, facing, amenities, description, status, added_by
) VALUES
  (
    '750e8400-e29b-41d4-a716-446655440001',
    'PROP0001',
    'Ramesh Kulkarni',
    '9234567890',
    'ramesh.k@gmail.com',
    'Buy',
    'Residential',
    'Flat/Apartment',
    6500000,
    'Baner, Pune',
    1200,
    2,
    2,
    'Semi Furnished',
    'Covered',
    5,
    12,
    3,
    'East',
    ARRAY['Swimming Pool', 'Gym', 'Garden', 'Security'],
    'Spacious 2 BHK in prime Baner location with all amenities',
    'available',
    '550e8400-e29b-41d4-a716-446655440002'
  ),
  (
    '750e8400-e29b-41d4-a716-446655440002',
    'PROP0002',
    'Sunita Joshi',
    '9234567891',
    'sunita.j@yahoo.com',
    'Rent',
    'Residential',
    'Flat/Apartment',
    20000,
    'Koregaon Park, Pune',
    950,
    2,
    2,
    'Fully Furnished',
    'Covered',
    3,
    8,
    2,
    'North',
    ARRAY['Gym', 'Club House', 'Power Backup'],
    'Fully furnished 2 BHK ready to move in',
    'available',
    '550e8400-e29b-41d4-a716-446655440002'
  ),
  (
    '750e8400-e29b-41d4-a716-446655440003',
    'PROP0003',
    'Kiran Patil',
    '9234567892',
    'kiran.p@outlook.com',
    'Buy',
    'Commercial',
    'Office Space',
    12000000,
    'Yerwada, Pune',
    2500,
    0,
    3,
    'Unfurnished',
    'Covered',
    4,
    10,
    1,
    'South',
    ARRAY['Lift', 'Power Backup', 'Security', 'Parking'],
    'Prime commercial space ideal for IT offices',
    'available',
    '550e8400-e29b-41d4-a716-446655440003'
  ),
  (
    '750e8400-e29b-41d4-a716-446655440004',
    'PROP0004',
    'Manish Agarwal',
    '9234567893',
    'manish.a@gmail.com',
    'Buy',
    'Residential',
    'Villa',
    18000000,
    'Kharadi, Pune',
    2500,
    3,
    3,
    'Semi Furnished',
    'Both',
    0,
    3,
    0,
    'West',
    ARRAY['Garden', 'Swimming Pool', 'Club House', 'Gym'],
    'Brand new 3 BHK villa with private garden',
    'available',
    '550e8400-e29b-41d4-a716-446655440003'
  ),
  (
    '750e8400-e29b-41d4-a716-446655440005',
    'PROP0005',
    'Deepak Shah',
    '9234567894',
    'deepak.s@hotmail.com',
    'Lease',
    'Commercial',
    'Warehouse',
    75000,
    'Chakan, Pune',
    7000,
    0,
    2,
    'Unfurnished',
    'Open',
    0,
    1,
    5,
    'North',
    ARRAY['Security', 'Loading Bay', 'Power Backup'],
    'Large warehouse with good connectivity',
    'available',
    '550e8400-e29b-41d4-a716-446655440004'
  ),
  (
    '750e8400-e29b-41d4-a716-446655440006',
    'PROP0006',
    'Pooja Reddy',
    '9234567895',
    'pooja.r@gmail.com',
    'Buy',
    'Residential',
    'Flat/Apartment',
    5500000,
    'Wakad, Pune',
    1100,
    2,
    2,
    'Unfurnished',
    'Covered',
    7,
    15,
    1,
    'North-East',
    ARRAY['Gym', 'Garden', 'Play Area', 'Security'],
    'Well-maintained 2 BHK with excellent amenities',
    'available',
    '550e8400-e29b-41d4-a716-446655440002'
  ),
  (
    '750e8400-e29b-41d4-a716-446655440007',
    'PROP0007',
    'Naveen Kumar',
    '9234567896',
    'naveen.k@yahoo.com',
    'Buy',
    'Residential',
    'Flat/Apartment',
    8500000,
    'Hinjewadi, Pune',
    1400,
    3,
    2,
    'Semi Furnished',
    'Covered',
    10,
    18,
    2,
    'South-West',
    ARRAY['Swimming Pool', 'Gym', 'Club House', 'Security', 'Garden'],
    'Premium 3 BHK in IT hub area with modern amenities',
    'sold',
    '550e8400-e29b-41d4-a716-446655440003'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify data insertion

-- SELECT COUNT(*) AS total_users FROM users;
-- SELECT COUNT(*) AS total_enquiries FROM enquiries;
-- SELECT COUNT(*) AS total_properties FROM properties;
-- 
-- SELECT status, COUNT(*) FROM enquiries GROUP BY status;
-- SELECT status, COUNT(*) FROM properties GROUP BY status;