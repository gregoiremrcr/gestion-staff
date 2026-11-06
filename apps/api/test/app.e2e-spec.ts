import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import bcrypt from 'bcrypt';
import { AppModule, SupabaseService } from './../src/app.module.js';

process.env.JWT_SECRET = 'test-jwt-secret';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SECRET_KEY = 'test-secret-key';

describe('Gestion Staff API (e2e)', () => {
  let app: INestApplication<App>;
  let passwordHash: string;
  const user = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Alice Admin',
    email: 'admin@restaurant.fr',
    role: 'ADMIN',
    active: true,
  };

  beforeEach(async () => {
    passwordHash = await bcrypt.hash('Admin123!', 4);
    const dbMock = {
      one: async () => ({ ...user, password_hash: passwordHash }),
      list: async () => [],
      query: async () => [],
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(SupabaseService)
      .useValue(dbMock)
      .compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => { await app.close(); });

  it('GET /api/health returns the API status', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200)
      .expect({ status: 'ok', service: 'gestion-staff-api', database: 'supabase' });
  });

  it('POST /api/auth/login returns a JWT and public user data', async () => {
    const response = await request(app.getHttpServer()).post('/api/auth/login')
      .send({ email: user.email, password: 'Admin123!' }).expect(201);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.user).toEqual({ id: user.id, name: user.name, email: user.email, role: user.role });
    expect(response.body.user.password_hash).toBeUndefined();
  });

  it('GET /api/products requires a bearer token', async () => {
    await request(app.getHttpServer()).get('/api/products').expect(401);
  });

  it('GET /api/auth/me accepts the login token without exposing the password', async () => {
    const login = await request(app.getHttpServer()).post('/api/auth/login')
      .send({ email: user.email, password: 'Admin123!' }).expect(201);
    const response = await request(app.getHttpServer()).get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`).expect(200);
    expect(response.body).toMatchObject(user);
    expect(response.body.password_hash).toBeUndefined();
  });
});
