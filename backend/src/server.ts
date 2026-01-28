import { createApp } from './app';
import { env } from './config/environment';
import { logger } from './utils/logger.util';
import { supabase } from './config/database';

/**
 * Server Entry Point
 * 
 * Starts the Express server and handles graceful shutdown
 */

const startServer = async () => {
  try {
    // Test database connection
    logger.info('Testing database connection...');
    const { error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      logger.error('Database connection failed:', error);
      throw new Error(`Database connection failed: ${error.message}`);
    }
    
    logger.info('Database connection successful');

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(env.PORT, () => {
      logger.info(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🏢 RealtyMatch Backend Server                         ║
║                                                          ║
║   Status: Running                                        ║
║   Port: ${env.PORT}                                      ║
║   Environment: ${env.NODE_ENV}                           ║
║   API URL: http://localhost:${env.PORT}/api              ║
║   Health Check: http://localhost:${env.PORT}/health      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received: Starting graceful shutdown...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        
        // Close database connections if needed
        logger.info('Closing database connections...');
        
        logger.info('Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();