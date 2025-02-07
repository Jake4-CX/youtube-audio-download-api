import 'dotenv/config';
import App from '@/app';
import logger from '@/utils/logger';

(async () => {
  const app = new App();

  // Express REST API

  app.start();
  app.app.listen(process.env.REST_PORT || 8080, () => {
    logger.info(`Server listening on port ${process.env.REST_PORT || 8080}`);
  });

  process.on('unhandledRejection', (error) => {
    logger.error('Unhandled promise rejection:', error);
  });
  
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
  });

})();
