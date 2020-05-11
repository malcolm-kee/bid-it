import { createDealData } from '@app/const/test-util';
import { dealConnectionName } from '@app/deal-data';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { DealModule } from './deal/deal.module';
import { UserModule } from './user/user.module';

describe('Rest (e2e)', () => {
  let mongod: MongoMemoryServer;
  let app: INestApplication;

  beforeEach(async () => {
    mongod = new MongoMemoryServer();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        MongooseModule.forRootAsync({
          useFactory: () =>
            mongod.getConnectionString().then((uri) => ({
              uri,
            })),
          connectionName: dealConnectionName,
        }),
        MongooseModule.forRootAsync({
          useFactory: () =>
            mongod.getConnectionString().then((uri) => ({
              uri,
            })),
          connectionName: 'users',
        }),
        DealModule,
        UserModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    await mongod.stop();
  });

  it(`get empty deals`, async () => {
    const agent = request.agent(app.getHttpServer());

    const response = await agent
      .get('/deal')
      .expect(200)
      .then((res) => res.body);

    expect(response).toStrictEqual([]);

    await agent.get('/deal/5eb95f773fd95110153aa767').expect(404);
  });

  it(`get single deal`, async () => {
    const agent = request.agent(app.getHttpServer());

    const createResult = await agent
      .post('/deal')
      .send(createDealData())
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(201)
      .then((res) => res.body);

    const getAllResult = await agent
      .get('/deal')
      .expect(200)
      .then((res) => res.body);

    expect(getAllResult).toStrictEqual([createResult]);

    const getSingleResult = await agent
      .get(`/deal/${createResult._id}`)
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => res.body);

    expect(getSingleResult).toStrictEqual(createResult);
  });

  it(`allows register and login`, async () => {
    const agent = request.agent(app.getHttpServer());

    const user = {
      name: 'Malcolm Kee',
      email: 'malcolm@gmail.com',
    };

    await agent
      .post('/register')
      .send(user)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(201);

    await agent
      .post('/login')
      .send({
        email: user.email,
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200);
  });

  it(`validates login and register`, async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/register')
      .send({
        name: 'Malcolm',
      })
      .expect(400);

    await agent.post('/login').send({}).expect(400);
  });
});
