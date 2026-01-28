import { EnquiryRepository } from '../repositories/enquiry.repository';
import { PropertyRepository } from '../repositories/property.repository';
import { UserRepository } from '../repositories/user.repository';

interface DashboardStats {
  totalEnquiries: number;
  activeEnquiries: number;
  closedEnquiries: number;
  wonEnquiries: number;
  lostEnquiries: number;
  totalProperties: number;
  availableProperties: number;
  soldProperties: number;
  rentedProperties: number;
  totalUsers: number;
  adminCount: number;
  staffCount: number;
  recentEnquiries: any[];
  recentProperties: any[];
  conversionRate: number;
  averageMatchScore: number;
}

export class StatsService {
  private enquiryRepo = new EnquiryRepository();
  private propertyRepo = new PropertyRepository();
  private userRepo = new UserRepository();

  async getDashboardStats(): Promise<DashboardStats> {
    const [enquiries, properties, users] = await Promise.all([
      this.enquiryRepo.findAll(),
      this.propertyRepo.findAll(),
      this.userRepo.findAll(),
    ]);

    // Enquiry stats
    const activeEnquiries = enquiries.filter(e => e.status === 'active').length;
    const closedEnquiries = enquiries.filter(e => e.status === 'closed').length;
    const wonEnquiries = enquiries.filter(e => e.status === 'won').length;
    const lostEnquiries = enquiries.filter(e => e.status === 'lost').length;

    // Property stats
    const availableProperties = properties.filter(p => p.status === 'available').length;
    const soldProperties = properties.filter(p => p.status === 'sold').length;
    const rentedProperties = properties.filter(p => p.status === 'rented').length;

    // User stats
    const adminCount = users.filter(u => u.role === 'admin').length;
    const staffCount = users.filter(u => u.role === 'staff').length;

    // Recent items (last 5)
    const recentEnquiries = enquiries
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    const recentProperties = properties
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    // Conversion rate
    const totalClosed = wonEnquiries + lostEnquiries;
    const conversionRate = totalClosed > 0 ? (wonEnquiries / totalClosed) * 100 : 0;

    return {
      totalEnquiries: enquiries.length,
      activeEnquiries,
      closedEnquiries,
      wonEnquiries,
      lostEnquiries,
      totalProperties: properties.length,
      availableProperties,
      soldProperties,
      rentedProperties,
      totalUsers: users.length,
      adminCount,
      staffCount,
      recentEnquiries,
      recentProperties,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageMatchScore: 0, // Can be calculated based on matching results
    };
  }
}