import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { PERMISSIONS_KEY } from "./permission.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector
  ) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const req = context.switchToHttp().getRequest();
      const requiredPermissions = this.reflector.getAllAndOverride<[string]>(
        PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()]
      );
      if (!requiredPermissions) return true;

      return requiredPermissions.some((perm) =>
        req.user?.permissions?.includes(perm)
      );
    } catch (e) {
      console.log(e);
      throw new HttpException("Access denied", HttpStatus.FORBIDDEN);
    }
  }
}
