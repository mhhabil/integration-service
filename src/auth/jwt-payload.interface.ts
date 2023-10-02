export interface IJWTPayload {
  user_id: string;
  exp: number;
  iat: number;
}

export interface IJWTUser {
  id: string;
  exp: number;
  service: any;
}
