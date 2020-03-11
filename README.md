# bid-it

- Bid REST API
- Bid Engine
- WebSocket

## Installation

### Prerequisite

1. MongoDB
1. Redis

### Running The Services

1. Install dependencies.

   ```bash
   yarn install
   ```

1. Adding an `.env` file at the root of the project with the following content:

   ```bash
   DEALS_DB_URL=mongodb://localhost:27017/deal
   USERS_DB_URL=mongodb://localhost:27017/user
   REDIS_URL=redis://localhost:6379
   ```

1. Start all the services.

   ```bash
   yarn start
   ```

## Architecture

![Architecture](assets/bid-it-architecture.png)

Frontend -> Bid Service -> Websocket Service -> Frontend

Frontend <-> Websocket Server <-> Queue -> Bid Service

### Frontend -> Bid Service

- Broker?
- Queue?
- Fire & Forget vs Wait for Status

### Bid Service -> Websocket Service

- Message Queue: Redis?

### Websocket Service -> Frontend

- Socket.io?
- Use Redis to allow scaling Websocket Server?
- Only

## Events

- Bid Accepted

  payload: dealId, dealerId, bidId, bidPrice

- Bid Rejected

  payload: dealId, dealerId, bidId

- Deal Closed

  payload: dealId, dealerId, finalPrice

## REST Endpoints

- Get Active Deals

  response: dealId, currentPrice, dealDetails

- Post New Bid

  request: dealId, dealerId, bidPrice

  reponse: bidId

## Reports

### Business Reporting

- Each deal

  - closing price
  - number of accepted bid

- Summary: number of dealers that place at least one successful bid

### Performance Reporting

- how many bids are processed per second
- reliability measurements:

  - number of concurrent connections
  - latency

## Additional Considerations/Improvements

### Scaleability

1. At the moment we use single queue for all bids, which is not very scaleable because we can't add additional queues when load is increasing. RabbitMQ supports [exchange with topic](https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html) which would allows us to create separate queues based on arbitrary categorization.

1. Using RabbitMQ's "exchange with topic", we can starts with single queue when load is low. When load is high, we can split the loads between multiple queues, based on the type of bid. For instance, one queue handles all car bids, while another queue will handle all other types of bids.

1. However, at the moment NestJS does not supports exchange with topic as it is special features offered by RabbitMQ. The [`@golevelup/nestjs-rabbitmq`](https://www.npmjs.com/package/@golevelup/nestjs-rabbitmq) package seems like support the feature, but it is not very popular and I have not really look into it.
