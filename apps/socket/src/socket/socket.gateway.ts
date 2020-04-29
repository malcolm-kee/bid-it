import { DealEventMap } from '@app/deal-data';
import { Injectable } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { IncomingMessage } from 'http';
import url from 'url';
import WebSocket, { Server } from 'ws';

@WebSocketGateway()
@Injectable()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  server: Server;

  private dealSubscribers = new Map<string, WebSocket[]>();

  private registerClient(dealId: string, client: WebSocket) {
    const currentSubscribers = this.dealSubscribers.get(dealId);

    if (currentSubscribers) {
      currentSubscribers.push(client);
    } else {
      this.dealSubscribers.set(dealId, [client]);
    }
  }

  private cleanupClient(client: WebSocket) {
    this.dealSubscribers.forEach((value, key) => {
      const clientIndex = value.indexOf(client);
      if (clientIndex > -1) {
        value.splice(clientIndex, 1);
      }
      if (value.length === 0) {
        this.dealSubscribers.delete(key);
      }
    });
  }

  handleConnection(client: WebSocket, msg: IncomingMessage) {
    if (msg.url) {
      const { query } = url.parse(msg.url, true);
      const dealToSubscribe = query && query.dealId;

      if (dealToSubscribe) {
        if (Array.isArray(dealToSubscribe)) {
          dealToSubscribe.forEach((restaurant) =>
            this.registerClient(restaurant, client)
          );
        } else {
          this.registerClient(dealToSubscribe, client);
        }
      }
    }
  }

  handleDisconnect(client: WebSocket) {
    this.cleanupClient(client);
  }

  notifyEvent<Type extends keyof DealEventMap>(
    type: Type,
    payload: DealEventMap[Type]
  ): Promise<unknown> {
    const subs = this.dealSubscribers.get(payload.dealId);

    if (subs) {
      const dataToClient = JSON.stringify({
        type,
        payload,
      });

      return Promise.all(
        subs.map(
          (sub) =>
            new Promise((fulfill, reject) => {
              sub.send(dataToClient, (err) => (err ? reject(err) : fulfill()));
            })
        )
      );
    }

    return Promise.resolve();
  }
}
