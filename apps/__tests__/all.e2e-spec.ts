import * as date from 'date-fns';
import { createDealData, waitForMs } from '@app/const/test-util';
import { dealConnectionName, DealDocument } from '@app/deal-data';
import { INestApplication, INestMicroservice } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { WsAdapter } from '@nestjs/platform-ws';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import WebSocket from 'ws';
import { DealModule } from '../bid-it/src/deal/deal.module';
import { UserModule } from '../bid-it/src/user/user.module';
import { EngineModule } from '../engine/src/engine/engine.module';
import { SocketModule } from '../socket/src/socket/socket.module';

let db: MongoMemoryServer;
let restApp: INestApplication;
let engineApp: INestMicroservice;
let socketApp: INestApplication;
let socketClients: WebSocket[] = [];

beforeEach(async () => {
  db = new MongoMemoryServer();
  [restApp, engineApp, socketApp] = await Promise.all([
    getRestApp(db),
    getEngineApp(db),
    getSocketApp(),
  ]);
});

afterEach(async () => {
  if (socketClients && socketClients.length > 0) {
    socketClients.forEach((client) => client.close());
    socketClients = [];
  }

  await Promise.all([restApp.close(), engineApp.close(), socketApp.close()]);
  await db.stop();
});

test(`e2e integrations`, async () => {
  const agent = request.agent(restApp.getHttpServer());
  const { port } = socketApp.getHttpServer().listen().address();

  const handleSocketMsg = (ev: WebSocket.MessageEvent) =>
    JSON.parse(ev.data as string).type;
  const onCloseMsg = jest.fn(handleSocketMsg);
  const onSocketMsg = jest.fn(handleSocketMsg);

  const pendingCloseDeal: DealDocument = await agent
    .post('/deal')
    .send(
      createDealData({
        endedAt: date.format(
          date.add(new Date(), { seconds: 1 }),
          "yyyy-MM-dd'T'HH:mm:ss"
        ),
      })
    )
    .set('Content-Type', 'application/json')
    .expect(201)
    .then((res) => res.body);

  const pendingCloseDealSocketClient = await createSocketForDeal(
    port,
    pendingCloseDeal._id
  );
  pendingCloseDealSocketClient.onmessage = onCloseMsg;

  const deal: DealDocument = await agent
    .post('/deal')
    .send(createDealData())
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect(201)
    .then((res) => res.body);

  const socketClient = await createSocketForDeal(port, deal._id);
  socketClient.onmessage = onSocketMsg;

  await createSocketForDeal(port, []);
  await createSocketForDeal(port, [pendingCloseDeal._id, deal._id]);

  await agent
    .put('/deal')
    .send({
      dealId: deal._id,
      dealerId: 'dealerId',
      price: deal.startingPrice + 1000,
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect(200);

  await agent
    .put('/deal')
    .send({
      dealId: deal._id,
      dealerId: 'dealerId',
      price: deal.startingPrice + 1000,
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect(200);

  await waitForMs(1000);

  expect(onSocketMsg).toHaveBeenCalledTimes(2);
  expect(onSocketMsg).toHaveNthReturnedWith(1, 'bid_accepted');
  expect(onSocketMsg).toHaveNthReturnedWith(2, 'bid_rejected');

  expect(onCloseMsg).toHaveBeenCalledTimes(1);
});

async function getRestApp(mongoDb: MongoMemoryServer) {
  const fixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        ignoreEnvVars: true,
      }),
      ScheduleModule.forRoot(),
      MongooseModule.forRootAsync({
        useFactory: () =>
          mongoDb.getConnectionString().then((uri) => ({
            uri,
          })),
        connectionName: dealConnectionName,
      }),
      MongooseModule.forRootAsync({
        useFactory: () =>
          mongoDb.getConnectionString().then((uri) => ({
            uri,
          })),
        connectionName: 'users',
      }),
      DealModule,
      UserModule,
    ],
  }).compile();

  const app = fixture.createNestApplication();

  app.connectMicroservice({
    transport: Transport.REDIS,
  });

  await app.startAllMicroservicesAsync();

  await app.init();

  return app;
}

async function getEngineApp(mongoDb: MongoMemoryServer) {
  const fixture = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        ignoreEnvVars: true,
      }),
      MongooseModule.forRootAsync({
        useFactory: () =>
          mongoDb.getConnectionString().then((uri) => ({
            uri,
          })),
        connectionName: dealConnectionName,
      }),
      EngineModule,
    ],
  }).compile();

  const app = fixture.createNestMicroservice({
    transport: Transport.REDIS,
  });

  await app.listenAsync();

  return app;
}

async function getSocketApp() {
  const fixture = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        ignoreEnvVars: true,
      }),
      SocketModule,
    ],
  }).compile();

  const app = fixture.createNestApplication();

  app.connectMicroservice({
    transport: Transport.REDIS,
  });

  await app.startAllMicroservicesAsync();

  app.useWebSocketAdapter(new WsAdapter(app));

  await app.init();

  return app;
}

function createSocketForDeal(port: number, dealId: string | string[]) {
  return new Promise<WebSocket>((fulfill, reject) => {
    const client = new WebSocket(
      Array.isArray(dealId)
        ? dealId.length > 0
          ? `ws://localhost:${port}?${dealId
              .map((id) => `dealId=${id}`)
              .join('&')}`
          : `ws://localhost:${port}`
        : `ws://localhost:${port}?dealId=${dealId}`
    );
    client.onopen = () => {
      socketClients.push(client);
      return fulfill(client);
    };
    client.onerror = reject;
  });
}
