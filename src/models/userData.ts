export interface UserData {
    id?: string;
    city:string;
    latitude: number;
    longitude: number;
}

export interface UserDataExtended extends UserData {
  pet_1: {
    raceId: number;
    name: string;
    age: number;
    month: number;
    days: number;
    dangerousness: number;
    gender: string;
  }
  pet_2: {
    raceId: number;
    name: string;
    age: number;
    month: number;
    days: number;
    dangerousness: number;
    gender: string;
  }
}