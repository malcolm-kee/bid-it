# bid-it

- Bid REST API
- Bid Engine
- WebSocket

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
