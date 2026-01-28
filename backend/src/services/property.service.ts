import { PropertyRepository } from '../repositories/property.repository';
import { CreatePropertyDTO, Property } from '../types';
import { NotFoundError } from '../utils/error.util';

export class PropertyService {
  private propertyRepo = new PropertyRepository();

  async getAllProperties(): Promise<Property[]> {
    return this.propertyRepo.findAll();
  }

  async getPropertyById(id: string): Promise<Property> {
    const property = await this.propertyRepo.findById(id);
    if (!property) {
      throw new NotFoundError('Property');
    }
    return property;
  }

  async getPropertyByPropertyId(propertyId: string): Promise<Property> {
    const property = await this.propertyRepo.findByPropertyId(propertyId);
    if (!property) {
      throw new NotFoundError('Property');
    }
    return property;
  }

  async createProperty(data: CreatePropertyDTO, userId: string): Promise<Property> {
    return this.propertyRepo.create(data, userId);
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const property = await this.propertyRepo.findById(id);
    if (!property) {
      throw new NotFoundError('Property');
    }

    return this.propertyRepo.update(id, updates);
  }

  async deleteProperty(id: string): Promise<void> {
    const property = await this.propertyRepo.findById(id);
    if (!property) {
      throw new NotFoundError('Property');
    }

    await this.propertyRepo.delete(id);
  }
}