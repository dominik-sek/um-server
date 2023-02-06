import request from 'supertest';
import app from '../../app';

const validLogin = {
  username: "baltazaradministrator3",
  password: "123321321"
};
const invalidLogin = {
  username: 'invalid',
  password: 'invalid'
}
describe('API Routes', () => {

  describe('GET /api/v1/', () => {
    it('responds with 200 OK', async () => {
      const response = await request(app).get('/api/v1/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');
    });
  });

  describe('GET /api/v1/cloud-signature', () => {
    it('responds with signature and timestamp', async () => {
      const login = await request(app)
      .post('/api/v1/login')
      .send(validLogin);
      const response = await request(app).get('/api/v1/cloud-signature')
      .set('Cookie', login.header['set-cookie']);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('signature');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/v1/login', () => {
    it('responds with 401 Unauthorized when login fails', async () => {
      const response = await request(app)
        .post('/api/v1/login')
        .send(invalidLogin);
      expect(response.status).toBe(401);
      expect(response.text).toBe('No user found');
    });

    it('responds with user when login succeeds', async () => {
      const response = await request(app)
        .post('/api/v1/login')
        .send(validLogin);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('role');
    });
  });

  describe('GET /api/v1/check-auth', () => {
    it('responds with 401 Unauthorized when not logged in', async () => {
      const response = await request(app).get('/api/v1/check-auth');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ role: null, auth: false });
    });

    it('responds with user role and auth status when logged in', async () => {
      const loginResponse = await request(app)
        .post('/api/v1/login')
        .send(validLogin);
      const authResponse = await request(app)
        .get('/api/v1/check-auth')
        .set('Cookie', loginResponse.header['set-cookie']);
      expect(authResponse.status).toBe(200);
      expect(authResponse.body).toHaveProperty('role');
      expect(authResponse.body).toHaveProperty('auth');
    });
  });

  it('responds with 200 OK', async () => {
    const loginResponse = await request(app)
      .post('/api/v1/login')
      .send(validLogin);
    const logoutResponse = await request(app)
      .delete('/api/v1/logout')
      .set('Cookie', loginResponse.header['set-cookie']);
    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body).toEqual({ message: 'Logged out' });
  });
});
