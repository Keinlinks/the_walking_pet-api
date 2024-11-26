import {
  ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
import { subscribe } from 'diagnostics_channel';
  import { Server, Socket } from 'socket.io';
import { PartialUserData, UserData } from 'src/models/userData';
  
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
  export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;      

    handleDisconnect(client: Socket) {
      let roomTodisconect = client.data.room as string;

      this.server.to(roomTodisconect).emit('remove_user', { id: client.id });
      client.leave(roomTodisconect);
    }


    handleConnection(client: Socket) {
      console.log('connected: ' + client.id);
    }

    @SubscribeMessage('selfId')
    selfId(@ConnectedSocket() client: Socket){
      this.server.to(client.id).emit('selfId', { token: client.id});
    }

    @SubscribeMessage('identify')
    newIdentify(@ConnectedSocket() client: Socket, @MessageBody() userData: string, @MessageBody() locationData: PartialUserData) {
      let rawData:any = JSON.parse(userData[0]);
      locationData = JSON.parse(locationData[1] as any);
      let data: UserData = {
        id: rawData.id,
        city: rawData.city,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        pet_1: JSON.parse(rawData.pet_1),
        pet_2: JSON.parse(rawData.pet_2),
      }
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
    }

    @SubscribeMessage('update_user')
    updateUser(@MessageBody() userData: UserData) {

      this.server.to(userData.city).except(userData.id).emit('receive_userData',  userData);
    }

    @SubscribeMessage('update_userdata_to_user')
    updateToUser(@MessageBody() userData: any, @MessageBody() partialData: PartialUserData) {
      userData = JSON.parse(userData[0] as any);
      partialData = JSON.parse(partialData[1] as any);
      let data: UserData = {
        id: userData.id,
        city: userData.city,
        latitude: partialData.latitude,
        longitude: partialData.longitude,
        pet_1: JSON.parse(userData.pet_1),
        pet_2: JSON.parse(userData.pet_2),
        receiver: partialData.receiver
      }
      this.server.to(data.city).except(data.id).emit('receive_userData',  data);
    }

    @SubscribeMessage('update_user_location')
    updateUserLocation(@MessageBody() userData: PartialUserData) {
      userData = JSON.parse(userData as any);
      this.server.to(userData.city).except(userData.id).emit('receive_user_location',  userData);
    }

    @SubscribeMessage('update_to_user')
    updateToUserLocation(@MessageBody() userData: PartialUserData) {
      userData = JSON.parse(userData as any);
      this.server.to(userData.receiver).emit('receive_user_location',  userData);
    }

    @SubscribeMessage('update_to_all')
    updateToAll(@MessageBody() data: PartialUserData, @ConnectedSocket() client: Socket) {
      this.server.to(data.city).except(client.id).emit('message', data);
    }

    private sendInfoToAll(data: PartialUserData,exceptId?:string) {
      this.server.to(data.city).except(exceptId).emit('receive_userData', data );
    }
  }