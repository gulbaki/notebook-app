export class RegisterResponseDTO {
  accessToken: string;
  tokenType?: string = 'bearer';
  expiresIn: number | string;
  refreshToken?: string;
  type?: string;
}
