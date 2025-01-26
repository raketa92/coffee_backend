import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_KEY = "permissions";

export const Permissions: any = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
