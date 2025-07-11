export interface User {
  _id?: string;
  userId: string;
  email?: string;
  name: string;
}

export interface SearchUser {
  _id: string;
  username: string;
  email: string;
}

export interface Message {
  sender?: string;
  recipient?: string;
  message: string;
  file?: string;
  _id?: string;
  createdAt?: Date;
}

export interface MessageData {
  online?: User[];
  id?: string;

  sender?: string;
  recipient?: string;
  message?: string;
  createdAt?: Date;
}
