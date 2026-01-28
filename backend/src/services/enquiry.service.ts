import { EnquiryRepository } from '../repositories/enquiry.repository';
import { CreateEnquiryDTO, Enquiry, Requirement } from '../types';
import { NotFoundError } from '../utils/error.util';
import { v4 as uuidv4 } from 'uuid';

export class EnquiryService {
  private enquiryRepo = new EnquiryRepository();

  async getAllEnquiries(): Promise<Enquiry[]> {
    return this.enquiryRepo.findAll();
  }

  async getEnquiriesByStatus(status: string): Promise<Enquiry[]> {
    return this.enquiryRepo.findByStatus(status);
  }

  async getEnquiryById(id: string): Promise<Enquiry> {
    const enquiry = await this.enquiryRepo.findById(id);
    if (!enquiry) {
      throw new NotFoundError('Enquiry');
    }
    return enquiry;
  }

  async createEnquiry(data: CreateEnquiryDTO, userId: string): Promise<Enquiry> {
    return this.enquiryRepo.create(data, userId);
  }

  async updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<Enquiry> {
    const enquiry = await this.enquiryRepo.findById(id);
    if (!enquiry) {
      throw new NotFoundError('Enquiry');
    }

    return this.enquiryRepo.update(id, updates);
  }

  async deleteEnquiry(id: string): Promise<void> {
    const enquiry = await this.enquiryRepo.findById(id);
    if (!enquiry) {
      throw new NotFoundError('Enquiry');
    }

    await this.enquiryRepo.delete(id);
  }

  async addRequirement(id: string, requirement: Omit<Requirement, 'id'>): Promise<Enquiry> {
    const enquiry = await this.enquiryRepo.findById(id);
    if (!enquiry) {
      throw new NotFoundError('Enquiry');
    }

    const newRequirement: Requirement = {
      id: uuidv4(),
      ...requirement,
    };

    const updatedRequirements = [...enquiry.requirements, newRequirement];
    
    return this.enquiryRepo.update(id, { requirements: updatedRequirements });
  }

  async removeRequirement(enquiryId: string, requirementId: string): Promise<Enquiry> {
    const enquiry = await this.enquiryRepo.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundError('Enquiry');
    }

    const updatedRequirements = enquiry.requirements.filter(
      req => req.id !== requirementId
    );

    return this.enquiryRepo.update(enquiryId, { requirements: updatedRequirements });
  }
}