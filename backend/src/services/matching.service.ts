import { MatchingService } from '../../../src/services/matching.service';
import { Property, Enquiry } from '../../../src/types';

describe('MatchingService', () => {
  let matchingService: MatchingService;

  beforeEach(() => {
    matchingService = new MatchingService();
  });

  describe('calculatePropertyEnquiryMatchScore', () => {
    const createMockProperty = (overrides?: Partial<Property>): Property => ({
      id: '1',
      property_id: 'PROP0001',
      owner_name: 'Test Owner',
      owner_phone: '1234567890',
      owner_email: 'owner@test.com',
      transaction_type: 'Buy',
      property_type: 'Residential',
      property_sub_type: 'Flat/Apartment',
      price: 6000000,
      location: 'Baner',
      area: 1200,
      bhk: 2,
      bathrooms: 2,
      furnishing: 'Semi Furnished',
      parking: 'Covered',
      floor_number: 5,
      total_floors: 12,
      age_of_property: 3,
      facing: 'East',
      amenities: [],
      images: [],
      description: '',
      status: 'available',
      added_by: 'user1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    });

    const createMockEnquiry = (overrides?: Partial<Enquiry>): Enquiry => ({
      id: '1',
      buyer_name: 'Test Buyer',
      buyer_phone: '9876543210',
      buyer_email: 'buyer@test.com',
      transaction_type: 'Buy',
      property_type: 'Residential',
      property_sub_type: 'Flat/Apartment',
      budget_min: 5000000,
      budget_max: 7000000,
      location_preferences: ['Baner', 'Hinjewadi'],
      bhk_preferences: [2, 3],
      area_min: 1000,
      area_max: 1500,
      requirements: [],
      notes: '',
      status: 'active',
      added_by: 'staff1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    });

    it('should return 0 if transaction types do not match', () => {
      const property = createMockProperty({ transaction_type: 'Buy' });
      const enquiry = createMockEnquiry({ transaction_type: 'Rent' });

      const score = (matchingService as any).calculatePropertyEnquiryMatchScore(
        property,
        enquiry
      );

      expect(score).toBe(0);
    });

    it('should give maximum score for perfect match', () => {
      const property = createMockProperty({
        transaction_type: 'Buy',
        property_type: 'Residential',
        property_sub_type: 'Flat/Apartment',
        price: 6000000,
        location: 'Baner',
        bhk: 2,
        area: 1200,
      });

      const enquiry = createMockEnquiry({
        transaction_type: 'Buy',
        property_type: 'Residential',
        property_sub_type: 'Flat/Apartment',
        budget_min: 5000000,
        budget_max: 7000000,
        location_preferences: ['Baner'],
        bhk_preferences: [2],
        area_min: 1000,
        area_max: 1500,
      });

      const score = (matchingService as any).calculatePropertyEnquiryMatchScore(
        property,
        enquiry
      );

      // Transaction(20) + PropertyType(15) + SubType(10) + Budget(20+5) + Location(15) + BHK(15) + Area(10+5)
      expect(score).toBeGreaterThanOrEqual(100);
    });

    it('should calculate partial match correctly', () => {
      const property = createMockProperty({
        transaction_type: 'Buy',
        property_type: 'Residential',
        price: 6000000,
        bhk: 2,
      });

      const enquiry = createMockEnquiry({
        transaction_type: 'Buy',
        property_type: 'Residential',
        budget_min: 5000000,
        budget_max: 7000000,
        location_preferences: ['Different Location'],
        bhk_preferences: [3], // Different BHK
      });

      const score = (matchingService as any).calculatePropertyEnquiryMatchScore(
        property,
        enquiry
      );

      // Should have transaction type + property type + budget matches
      expect(score).toBeGreaterThan(40);
      expect(score).toBeLessThan(100);
    });

    it('should give bonus for price in sweet spot', () => {
      const property = createMockProperty({
        price: 6000000, // Exactly middle of range
      });

      const enquiry = createMockEnquiry({
        budget_min: 5000000,
        budget_max: 7000000,
      });

      const score = (matchingService as any).calculatePropertyEnquiryMatchScore(
        property,
        enquiry
      );

      // Should include sweet spot bonus
      expect(score).toBeGreaterThan(0);
    });

    it('should match location case-insensitively', () => {
      const property = createMockProperty({
        location: 'BANER, Pune',
      });

      const enquiry = createMockEnquiry({
        location_preferences: ['baner', 'hinjewadi'],
      });

      const score = (matchingService as any).calculatePropertyEnquiryMatchScore(
        property,
        enquiry
      );

      // Should include location match points
      expect(score).toBeGreaterThan(20);
    });
  });

  describe('getMatchedCriteria', () => {
    it('should return all matched criteria', () => {
      const property: Partial<Property> = {
        transaction_type: 'Buy',
        property_type: 'Residential',
        property_sub_type: 'Flat/Apartment',
        price: 6000000,
        location: 'Baner',
        bhk: 2,
        area: 1200,
      };

      const enquiry: Partial<Enquiry> = {
        transaction_type: 'Buy',
        property_type: 'Residential',
        property_sub_type: 'Flat/Apartment',
        budget_min: 5000000,
        budget_max: 7000000,
        location_preferences: ['Baner'],
        bhk_preferences: [2],
        area_min: 1000,
        area_max: 1500,
      };

      const criteria = (matchingService as any).getPropertyEnquiryMatchedCriteria(
        property as Property,
        enquiry as Enquiry
      );

      expect(criteria).toContain('Transaction Type');
      expect(criteria).toContain('Property Type');
      expect(criteria).toContain('Sub Type');
      expect(criteria).toContain('Budget Range');
      expect(criteria).toContain('Location');
      expect(criteria).toContain('BHK');
      expect(criteria).toContain('Area');
    });

    it('should return only matching criteria', () => {
      const property: Partial<Property> = {
        transaction_type: 'Buy',
        property_type: 'Residential',
        price: 8000000, // Out of budget
        bhk: 4, // Not in preferences
      };

      const enquiry: Partial<Enquiry> = {
        transaction_type: 'Buy',
        property_type: 'Residential',
        budget_min: 5000000,
        budget_max: 7000000,
        bhk_preferences: [2, 3],
      };

      const criteria = (matchingService as any).getPropertyEnquiryMatchedCriteria(
        property as Property,
        enquiry as Enquiry
      );

      expect(criteria).toContain('Transaction Type');
      expect(criteria).toContain('Property Type');
      expect(criteria).not.toContain('Budget Range');
      expect(criteria).not.toContain('BHK');
    });
  });
});