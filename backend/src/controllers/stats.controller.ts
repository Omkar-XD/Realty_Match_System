import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { StatsService } from '../services/stats.service';
import { sendSuccess, sendError } from '../utils/response.util';

export class StatsController {
  private statsService = new StatsService();

  getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const stats = await this.statsService.getDashboardStats();
      sendSuccess(res, stats);
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 500);
    }
  };
}