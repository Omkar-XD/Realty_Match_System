import { UserRepository } from '../repositories/user.repository';
import { EnquiryRepository } from '../repositories/enquiry.repository';
import { PropertyRepository } from '../repositories/property.repository';
import { logger } from '../utils/logger.util';
import { supabase } from '../config/database';

/**
 * Statistics Service
 * 
 * Provides dashboard statistics and analytics
 */

export class StatsService {
  /**
   * Get comprehensive dashboard statistics
   */
  static async getDashboardStats(userId?: string, userRole?: 'admin' | 'staff'): Promise<{
    users: {
      total: number;
      active: number;
      admins: number;
      staff: number;
    };
    enquiries: {
      total: number;
      active: number;
      converted: number;
      myEnquiries?: number;
    };
    properties: {
      total: number;
      available: number;
      sold: number;
      rented: number;
      myProperties?: number;
    };
    requirements: {
      total: number;
      active: number;
    };
    recentActivity: {
      recentEnquiries: number;
      recentProperties: number;
      last7Days: number;
    };
  }> {
    try {
      // User stats (admin only)
      let userStats = {
        total: 0,
        active: 0,
        admins: 0,
        staff: 0
      };

      if (userRole === 'admin') {
        const allUsers = await UserRepository.findAll();
        userStats = {
          total: allUsers.length,
          active: allUsers.filter(u => u.is_active).length,
          admins: allUsers.filter(u => u.role === 'admin').length,
          staff: allUsers.filter(u => u.role === 'staff').length
        };
      }

      // Enquiry stats
      const [totalEnquiries, activeEnquiries, convertedEnquiries] = await Promise.all([
        EnquiryRepository.countByStatus('active').then(active => 
          EnquiryRepository.countByStatus('inactive').then(inactive =>
            EnquiryRepository.countByStatus('converted').then(converted =>
              EnquiryRepository.countByStatus('closed').then(closed =>
                active + inactive + converted + closed
              )
            )
          )
        ),
        EnquiryRepository.countByStatus('active'),
        EnquiryRepository.countByStatus('converted')
      ]);

      const enquiryStats: any = {
        total: totalEnquiries,
        active: activeEnquiries,
        converted: convertedEnquiries
      };

      // If staff, get their specific enquiries
      if (userRole === 'staff' && userId) {
        const { total: myEnquiries } = await EnquiryRepository.findAll({
          assigned_to: userId,
          limit: 1
        });
        enquiryStats.myEnquiries = myEnquiries;
      }

      // Property stats
      const [availableProperties, soldProperties, rentedProperties] = await Promise.all([
        PropertyRepository.countByStatus('available'),
        PropertyRepository.countByStatus('sold'),
        PropertyRepository.countByStatus('rented')
      ]);

      const propertyStats: any = {
        total: availableProperties + soldProperties + rentedProperties,
        available: availableProperties,
        sold: soldProperties,
        rented: rentedProperties
      };

      // If staff, get their specific properties
      if (userRole === 'staff' && userId) {
        const { total: myProperties } = await PropertyRepository.findAll({
          assigned_to: userId,
          limit: 1
        });
        propertyStats.myProperties = myProperties;
      }

      // Buyer requirements stats
      const activeRequirements = await EnquiryRepository.findAllActiveRequirements();
      const requirementStats = {
        total: activeRequirements.length,
        active: activeRequirements.filter(r => r.status === 'active').length
      };

      // Recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentEnquiries } = await supabase
        .from('enquiries')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      const { count: recentProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      const recentActivity = {
        recentEnquiries: recentEnquiries || 0,
        recentProperties: recentProperties || 0,
        last7Days: (recentEnquiries || 0) + (recentProperties || 0)
      };

      logger.info('Dashboard stats generated successfully');

      return {
        users: userStats,
        enquiries: enquiryStats,
        properties: propertyStats,
        requirements: requirementStats,
        recentActivity
      };
    } catch (error) {
      logger.error('Error generating dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get enquiry statistics with breakdown
   */
  static async getEnquiryStats(): Promise<{
    total: number;
    byStatus: {
      active: number;
      inactive: number;
      converted: number;
      closed: number;
    };
    byStaff: Array<{ staff_name: string; count: number }>;
    conversionRate: number;
  }> {
    const [active, inactive, converted, closed] = await Promise.all([
      EnquiryRepository.countByStatus('active'),
      EnquiryRepository.countByStatus('inactive'),
      EnquiryRepository.countByStatus('converted'),
      EnquiryRepository.countByStatus('closed')
    ]);

    const total = active + inactive + converted + closed;

    // Get enquiries grouped by staff
    const { data: staffBreakdown } = await supabase
      .from('enquiries')
      .select('assigned_to, users(name)')
      .not('assigned_to', 'is', null);

    const staffCounts = new Map<string, number>();
    staffBreakdown?.forEach((item: any) => {
      const staffName = item.users?.name || 'Unassigned';
      staffCounts.set(staffName, (staffCounts.get(staffName) || 0) + 1);
    });

    const byStaff = Array.from(staffCounts.entries())
      .map(([staff_name, count]) => ({ staff_name, count }))
      .sort((a, b) => b.count - a.count);

    const conversionRate = total > 0 ? (converted / total) * 100 : 0;

    return {
      total,
      byStatus: { active, inactive, converted, closed },
      byStaff,
      conversionRate: Math.round(conversionRate * 100) / 100
    };
  }

  /**
   * Get property statistics with breakdown
   */
  static async getPropertyStats(): Promise<{
    total: number;
    byStatus: {
      available: number;
      sold: number;
      rented: number;
      under_negotiation: number;
    };
    byType: {
      residential: number;
      commercial: number;
      industrial: number;
      agricultural: number;
      plot: number;
    };
    byTransaction: {
      sale: number;
      rent: number;
    };
    byStaff: Array<{ staff_name: string; count: number }>;
  }> {
    const [available, sold, rented, underNegotiation, forSale, forRent] = await Promise.all([
      PropertyRepository.countByStatus('available'),
      PropertyRepository.countByStatus('sold'),
      PropertyRepository.countByStatus('rented'),
      PropertyRepository.countByStatus('under_negotiation'),
      PropertyRepository.countByTransactionType('sale'),
      PropertyRepository.countByTransactionType('rent')
    ]);

    const total = available + sold + rented + underNegotiation;

    // Get properties by type
    const { data: typeBreakdown } = await supabase
      .from('properties')
      .select('property_type');

    const typeCounts = {
      residential: 0,
      commercial: 0,
      industrial: 0,
      agricultural: 0,
      plot: 0
    };

    typeBreakdown?.forEach((item: any) => {
      if (item.property_type in typeCounts) {
        typeCounts[item.property_type as keyof typeof typeCounts]++;
      }
    });

    // Get properties grouped by staff
    const { data: staffBreakdown } = await supabase
      .from('properties')
      .select('assigned_to, users(name)')
      .not('assigned_to', 'is', null);

    const staffCounts = new Map<string, number>();
    staffBreakdown?.forEach((item: any) => {
      const staffName = item.users?.name || 'Unassigned';
      staffCounts.set(staffName, (staffCounts.get(staffName) || 0) + 1);
    });

    const byStaff = Array.from(staffCounts.entries())
      .map(([staff_name, count]) => ({ staff_name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      byStatus: { available, sold, rented, under_negotiation: underNegotiation },
      byType: typeCounts,
      byTransaction: { sale: forSale, rent: forRent },
      byStaff
    };
  }

  /**
   * Get activity timeline (last 30 days)
   */
  static async getActivityTimeline(): Promise<Array<{
    date: string;
    enquiries: number;
    properties: number;
  }>> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: enquiries } = await supabase
      .from('enquiries')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const { data: properties } = await supabase
      .from('properties')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Group by date
    const timeline = new Map<string, { enquiries: number; properties: number }>();

    enquiries?.forEach((item: any) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      const entry = timeline.get(date) || { enquiries: 0, properties: 0 };
      entry.enquiries++;
      timeline.set(date, entry);
    });

    properties?.forEach((item: any) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      const entry = timeline.get(date) || { enquiries: 0, properties: 0 };
      entry.properties++;
      timeline.set(date, entry);
    });

    // Convert to array and sort by date
    return Array.from(timeline.entries())
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get user performance stats (admin only)
   */
  static async getUserPerformance(): Promise<Array<{
    user_id: string;
    user_name: string;
    user_role: string;
    enquiries_assigned: number;
    properties_assigned: number;
    enquiries_converted: number;
    conversion_rate: number;
  }>> {
    const users = await UserRepository.findAll({ is_active: true });
    
    const performance = await Promise.all(
      users.map(async (user) => {
        const { total: enquiriesAssigned } = await EnquiryRepository.findAll({
          assigned_to: user.id,
          limit: 1
        });

        const { total: propertiesAssigned } = await PropertyRepository.findAll({
          assigned_to: user.id,
          limit: 1
        });

        const { total: enquiriesConverted } = await EnquiryRepository.findAll({
          assigned_to: user.id,
          status: 'converted',
          limit: 1
        });

        const conversionRate = enquiriesAssigned > 0 
          ? (enquiriesConverted / enquiriesAssigned) * 100 
          : 0;

        return {
          user_id: user.id,
          user_name: user.name,
          user_role: user.role,
          enquiries_assigned: enquiriesAssigned,
          properties_assigned: propertiesAssigned,
          enquiries_converted: enquiriesConverted,
          conversion_rate: Math.round(conversionRate * 100) / 100
        };
      })
    );

    return performance.sort((a, b) => b.conversion_rate - a.conversion_rate);
  }
}