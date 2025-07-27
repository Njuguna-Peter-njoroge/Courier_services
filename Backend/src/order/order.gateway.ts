// parcel.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ParcelGateway {
  @WebSocketServer()
  server: Server;

  // Emit parcel location/status updates to subscribed clients
  sendParcelUpdate(parcelId: string, data: any) {
    this.server.to(parcelId).emit('parcelUpdate', data);
  }

  // Client joins a room to track a specific parcel
  @SubscribeMessage('trackParcel')
  handleTrackParcel(
    @MessageBody() parcelId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(parcelId);
    client.emit('joinedParcelRoom', parcelId);
  }
}
