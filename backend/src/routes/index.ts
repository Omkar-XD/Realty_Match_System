import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import enquiryRoutes from './enquiry.routes';
import propertyRoutes from './property.routes';
import statsRoutes from './stats.routes';

/**
 * Main API Router
 * 
 * Combines all route modules under /api prefix
 */

const router = Router();

// API version info
router.get('/', (req, res) => {
  res.json({
    message: 'RealtyMatch API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      enquiries: '/api/enquiries',
      properties: '/api/properties',
      stats: '/api/stats'
    }
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/properties', propertyRoutes);
router.use('/stats', statsRoutes);

export default router;