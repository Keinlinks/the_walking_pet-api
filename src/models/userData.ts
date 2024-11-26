export interface PartialUserData {
    id?: string;
    city:string;
    latitude: number;
    longitude: number;
    receiver?: string;
}

export interface UserData extends PartialUserData {
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