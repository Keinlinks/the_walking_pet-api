import {
  ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
import { UserData } from 'src/models/userData';
  
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
  export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;      

    handleDisconnect(client: any) {
      console.log('disconnected user: ', client.id);
    }


    handleConnection(client: Socket) {
      client.emit('Connected', { token: client.id });
    }

    @SubscribeMessage('identify')
    newIdentify(@ConnectedSocket() client: Socket, @MessageBody() data: UserData) {
      client.join(data.city);
      data.id = client.id;
      this.sendInfotoAll(data);
      client.emit('message', { token: data.id });
    }

    @SubscribeMessage('update_user')
    updateUser(@MessageBody() data: {userId: string, userData: UserData}) {
      this.server.to(data.userId).emit('message',  data.userData);
    }

    @SubscribeMessage('update_to_all')
    updateToAll(@MessageBody() data: UserData) {
      this.server.to(data.city).emit('message',  data );
    }


    sendInfotoAll(data: UserData) {
      this.server.to(data.city).emit('message', data );
    }
  }