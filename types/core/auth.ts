import { Identifiable, Timestamped } from '../shared/base';
import { Gender } from '../shared/enums';

export interface AuthSession {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  created_at: string;
}

export interface EmailLoginCredentials {
  email: string;
  password: string;
}

export interface PhoneLoginCredentials {
  phone_number: string;
  otp_code: string;
}

export interface OTPRequest {
  phone_number?: string;
  email?: string;
}

export interface OTPVerification {
  phone_number?: string;
  email?: string;
  otp_code: string;
}

export interface RegistrationData {
  first_name: string;
  email?: string;
  phone_number?: string;
  password?: string;
  date_of_birth: string;
  gender?: Gender;
  otp_code?: string;
}

export interface LogoutRequest {
  user_id: string;
  session_id?: string;
  logout_all_devices?: boolean;
}

export interface UserSession extends Identifiable, Timestamped {
  user_id: string;
  device_id: string;
  device_name?: string;
  ip_address?: string;
  last_active: string;
  is_current: boolean;
}

export type LoginRequest = EmailLoginCredentials | PhoneLoginCredentials;

export interface LoginResponse {
  session: AuthSession;
  user: any;
  presence: any;
}

export interface LogoutResponse {
  success: boolean;
  logged_out_sessions: number;
}
