import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";

export const Roles: any = (...roleId: number[]) =>
  SetMetadata(ROLES_KEY, roleId);
