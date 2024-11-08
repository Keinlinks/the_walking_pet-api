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
import { UserData, UserDataExtended } from 'src/models/userData';
  
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
  export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;      

    handleDisconnect(client: Socket) {
      let roomTodisconect = client.data.room as string;
      client.leave(roomTodisconect);
      this.server.to(roomTodisconect).emit('message', { token: client.id, message: 'disconnected' });
    }


    handleConnection(client: Socket) {
      console.log('connected: ' + client.id);
      client.emit('Connected', { token: client.id });
    }

    @SubscribeMessage('identify')
    newIdentify(@ConnectedSocket() client: Socket, @MessageBody() data: UserDataExtended) {
      console.log(data);
      //leave old room
      if (client.data.room){
        client.leave(client.data.room);
        this.server.to(client.data.room).emit('message', { token: client.id, message: 'disconnected' });
      }
      //join new room
      client.join(data.city);
      client.data.room = data.city;

      data.id = client.id;
      this.sendInfoToAll(data,client.id);
      console.log("new user: " + data.id);
      client.emit('selfId', { token: data.id });
    }

    @SubscribeMessage('update_user')
    updateUser(@MessageBody() data: {userId: string, userData: UserDataExtended}) {
      this.server.to(data.userId).emit('receive_userData',  data.userData);
    }
    @SubscribeMessage('update_user_location')
    updateUserLocation(@MessageBody() data: {userId: string, userData: UserData}) {
      this.server.to(data.userId).emit('receive_user_location',  data.userData);
    }

    @SubscribeMessage('update_to_all')
    updateToAll(@MessageBody() data: UserData, @ConnectedSocket() client: Socket) {
      this.server.to(data.city).except(client.id).emit('message', data);
    }

    private sendInfoToAll(data: UserData,exceptId?:string) {
      this.server.to(data.city).except(exceptId).emit('message', data );
    }
  }