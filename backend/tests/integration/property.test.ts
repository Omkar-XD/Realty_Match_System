import request from 'supertest';
import app from '../../src/app';

describe('Property API Integration Tests', () => {
  let authToken: string;
  let createdPropertyId: string;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@realtymatch.com',
        password: 'password123',
      });

    authToken = loginResponse.body.data.token;
  });

  describe('GET /api/properties', () => {
    it('should get all properties with valid token', async () => {
      const response = await request(app)
        .get('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter properties by status', async () => {
      const response = await request(app)
        .get('/api/properties?status=available')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data.every((p: any) => p.status === 'available')).toBe(true);
      }
    });

    it('should reject request without token', async () => {
      await request(app).get('/api/properties').expect(401);
    });
  });

  describe('POST /api/properties', () => {
    const validPropertyData = {
      owner_name: 'Test Owner',
      owner_phone: '9876543210',
      owner_email: 'owner@test.com',
      transaction_type: 'Buy',
      property_type: 'Residential',
      property_sub_type: 'Flat/Apartment',
      price: 5000000,
      location: 'Test Location',
      area: 1000,
      bhk: 2,
      bathrooms: 2,
      furnishing: 'Semi Furnished',
      parking: 'Covered',
      floor_number: 5,
      total_floors: 10,
      age_of_property: 2,
      facing: 'North',
      amenities: ['Gym', 'Pool'],
      description: 'Test property description',
    };

    it('should create property with valid data', async () => {
      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPropertyData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('property_id');
      expect(response.body.data.owner_name).toBe(validPropertyData.owner_name);

      createdPropertyId = response.body.data.id;
    });

    it('should fail with missing required fields', async () => {
      const invalidData = {
        owner_name: 'Test Owner',
        // Missing other required fields
      };

      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with invalid transaction type', async () => {
      const invalidData = {
        ...validPropertyData,
        transaction_type: 'InvalidType',
      };

      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with negative price', async () => {
      const invalidData = {
        ...validPropertyData,
        price: -1000,
      };

      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/properties/:id', () => {
    it('should get property by id', async () => {
      if (!createdPropertyId) {
        return; // Skip if no property was created
      }

      const response = await request(app)
        .get(`/api/properties/${createdPropertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.id).toBe(createdPropertyId);
    });

    it('should return 404 for non-existent property', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .get(`/api/properties/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/properties/:id', () => {
    it('should update property successfully', async () => {
      if (!createdPropertyId) {
        return;
      }

      const updateData = {
        price: 5500000,
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/properties/${createdPropertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.price).toBe(5500000);
      expect(response.body.data.description).toBe('Updated description');
    });

    it('should return 404 for non-existent property', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .put(`/api/properties/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ price: 6000000 })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/properties/:id/check-matches', () => {
    it('should find matches for property', async () => {
      if (!createdPropertyId) {
        return;
      }

      const response = await request(app)
        .post(`/api/properties/${createdPropertyId}/check-matches`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('DELETE /api/properties/:id', () => {
    it('should delete property successfully', async () => {
      if (!createdPropertyId) {
        return;
      }

      const response = await request(app)
        .delete(`/api/properties/${createdPropertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // Verify property is deleted
      await request(app)
        .get(`/api/properties/${createdPropertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent property', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .delete(`/api/properties/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});