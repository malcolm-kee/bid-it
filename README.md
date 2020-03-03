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
