export {};

export type UserData = {
  sub?: string;
  phone?: string;
  roles?: string[];
  refreshToken?: string;
};

declare global {
  namespace Express {
    export interface Request {
      user?: UserData;
    }
  }
}
