import { Generated, Selectable, Insertable, Updateable } from "kysely";

export interface UserTable {
  guid: string;
  password: string;
  email?: string | null;
  phone: string;
  userName?: string | null;
  firstName: string | null;
  lastName: string | null;
  gender: string;
  roles: string[];
  isVerified: boolean;
  isActive: boolean;
  refreshToken: string | null;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export type UserModel = Selectable<UserTable>;
export type UserCreateModel = Insertable<UserTable>;
export type UserUpdateModel = Updateable<UserTable>;
