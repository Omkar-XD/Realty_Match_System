import { Request, Response } from 'express';
import { StatsService } from '../services/stats.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { logger } from '../utils/logger.util';

/**
 * Statistics Controller
 * 
 * Handles statistics and analytics HTTP requests
 */

export class StatsController {
  /**
   * GET /api/stats/dashboard
   * Get comprehensive dashboard statistics
   */
  static async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const stats = await StatsService.getDashboardStats(userId, userRole);

      res.status(200).json(
        successResponse('Dashboard statistics retrieved successfully', { stats })
      );
    } catch (error: any) {
      logger.error('Get dashboard stats error:', error);
      res.status(500).json(
        errorResponse('Failed to retrieve dashboard statistics', 500)
      );
    }
  }

  /**
   * GET /api/stats/enquiries
   * Get enquiry statistics with breakdown
   */
  static async getEnquiryStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await StatsService.getEnquiryStats();

      res.status(200).json(
        successResponse('Enquiry statistics retrieved successfully', { stats })
      );
    } catch (error: any) {
      logger.error('Get enquiry stats error:', error);
      res.status(500).json(
        errorResponse('Failed to retrieve enquiry statistics', 500)
      );
    }
  }

  /**
   * GET /api/stats/properties
   * Get property statistics with breakdown
   */
  static async getPropertyStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await StatsService.getPropertyStats();

      res.status(200).json(
        successResponse('Property statistics retrieved successfully', { stats })
      );
    } catch (error: any) {
      logger.error('Get property stats error:', error);
      res.status(500).json(
        errorResponse('Failed to retrieve property statistics', 500)
      );
    }
  }

  /**
   * GET /api/stats/activity
   * Get activity timeline (last 30 days)
   */
  static async getActivityTimeline(req: Request, res: Response): Promise<void> {
    try {
      const timeline = await StatsService.getActivityTimeline();

      res.status(200).json(
        successResponse('Activity timeline retrieved successfully', { 
          timeline, 
          total: timeline.length 
        })
      );
    } catch (error: any) {
      logger.error('Get activity timeline error:', error);
      res.status(500).json(
        errorResponse('Failed to retrieve activity timeline', 500)
      );
    }
  }

  /**
   * GET /api/stats/performance
   * Get user performance statistics (admin only)
   */
  static async getUserPerformance(req: Request, res: Response): Promise<void> {
    try {
      const performance = await StatsService.getUserPerformance();

      res.status(200).json(
        successResponse('User performance retrieved successfully', { 
          performance, 
          total: performance.length 
        })
      );
    } catch (error: any) {
      logger.error('Get user performance error:', error);
      res.status(500).json(
        errorResponse('Failed to retrieve user performance', 500)
      );
    }
  }

  /**
   * GET /api/stats/overview
   * Get quick overview statistics
   */
  static async getOverview(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      // Get basic stats for quick overview
      const [dashboardStats, activityTimeline] = await Promise.all([
        StatsService.getDashboardStats(userId, userRole),
        StatsService.getActivityTimeline()
      ]);

      const overview = {
        totalEnquiries: dashboardStats.enquiries.total,
        totalProperties: dashboardStats.properties.total,
        activeEnquiries: dashboardStats.enquiries.active,
        availableProperties: dashboardStats.properties.available,
        recentActivity: dashboardStats.recentActivity,
        activityTrend: activityTimeline.slice(-7) // Last 7 days
      };

      res.status(200).json(
        successResponse('Overview statistics retrieved successfully', { overview })
      );
    } catch (error: any) {
      logger.error('Get overview error:', error);
      res.status(500).json(
        errorResponse('Failed to retrieve overview statistics', 500)
      );
    }
  }

  /**
   * GET /api/stats/summary
   * Get summary statistics for specific period
   */
  static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const { period } = req.query; // 'today', 'week', 'month', 'year'
      
      // This is a simplified version - you can expand based on requirements
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const stats = await StatsService.getDashboardStats(userId, userRole);

      res.status(200).json(
        successResponse(`${period || 'All-time'} summary retrieved successfully`, { 
          stats,
          period: period || 'all-time'
        })
      );
    } catch (error: any) {
      logger.error('Get summary error:', error);
      res.status(500).json(
        errorResponse('Failed to retrieve summary', 500)
      );
    }
  }
}