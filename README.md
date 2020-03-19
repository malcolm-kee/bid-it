# bid-it

Scaleable Bidding System With Microservices Architecture

## Architecture

![Architecture](assets/bid-it-architecture.png)

1. REST API is a NestJS application. [Source code](apps/bid-it/src/main.ts)
1. Bid Engine is a NodeJS script. [Source code](scripts/src/engine.ts)
1. Websocket server is a NodeJS script. [Source code](scripts/src/socket.ts)

## Installation

There are two ways to run this application:

1. Docker (recommended)
2. Manual

### 1. Docker

```bash
docker-compose --compatibility up -d
```

This will starts 3 Rest API services with 3 WebSocket servers with Nginx as load-balancer in front them.

You can access the REST API Swagger UI at http://localhost:3000/api

> You can shutdown the services with the command `docker-compose down`

### 2. Manual

#### Prerequisite

1. MongoDB
1. Redis

#### Running The Services

1. Install dependencies.

   ```bash
   yarn install
   ```

1. Adding an `.env` file at the root of the project with the following content:

   ```bash
   DEALS_DB_URL=mongodb://localhost:27017/deal
   USERS_DB_URL=mongodb://localhost:27017/user
   REPORTING_DB_URL=mongodb://localhost:27017/report
   REDIS_URL=redis://localhost:6379
   ```

1. Start all the services.

   ```bash
   yarn start
   ```

1. You can access the REST API Swagger UI at http://localhost:3000/api

## Reports

We use a reporting server ([source](scripts/scr/reporting.ts)) listening to Redis event and persists the events to MongoDB.

The reports then can be generated with [`generate-report.ts`](scripts/scr/generate-report.ts)

## Simulations

### With Docker in Unix environment

1. Start all the services:

   ```bash
   docker-compose --compatibility up -d
   ```

1. Generate test data and simulate 200 concurrent clients performing bidding, and generates reporting in console.

   ```bash
   ./run-simulation.sh
   ```

### Others

1. Start all the services:

   ```bash
   yarn start
   ```

1. (First time only) Generate all the deals:

   ```bash
   yarn setup
   ```

1. Simulate many clients performing bidding:

   ```bash
   yarn simulate
   ```

1. Generate reports:

   ```bash
   yarn report
   ```

## Additional Considerations/Improvements

### Scaleability

1. Both REST API and Websocket servers can be scaled horizontally easily.
1. At the moment, a single queue is used to process all bids. This singleton design is intentional to avoid race conditions between bids. 
1. The singleton design of queue may have performance impact if the load is very high. One possible solution to explore is to distribute the load to process bids across multiple queues by ensuring bids associated with a particular deal always go to the same queue.

## Built With

- [NestJS](https://nestjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [webpack](https://webpack.js.org/)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)