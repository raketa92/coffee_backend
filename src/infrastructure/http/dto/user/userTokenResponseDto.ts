export type UserTokenResponseDto = {
  accessToken: string;
  refreshToken: string;
};

type UserDetails = {
  guid: string;
  email: string | null;
  userName: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string;
  gender: string | null;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  lastLogin: Date;
};

export type AuthResponseDto = UserTokenResponseDto & {
  user: UserDetails;
};
