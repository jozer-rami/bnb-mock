import request from 'supertest';
import app from '../app';

describe('Main Application Endpoints', () => {
  describe('GET /', () => {
    it('should return welcome message with API documentation', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Welcome to BNB Mock Server');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body).toHaveProperty('timestamp');
      
      // Check BNB endpoints are documented
      expect(response.body.endpoints).toHaveProperty('bnb');
      expect(response.body.endpoints.bnb).toHaveProperty('auth');
      expect(response.body.endpoints.bnb).toHaveProperty('transaction');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1', () => {
    it('should return API version information', async () => {
      const response = await request(app)
        .get('/api/v1')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Welcome to BNB Mock API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('status', 'running');
    });
  });

  describe('404 Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('status', 404);
    });

    it('should return 404 for unknown API routes', async () => {
      const response = await request(app)
        .get('/api/v2')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('status', 404);
    });
  });

  describe('CORS Configuration', () => {
    it('should include CORS headers for development', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // CORS headers should be present (check for credentials header instead)
      expect(response.headers).toHaveProperty('access-control-allow-credentials', 'true');
    });
  });
}); 