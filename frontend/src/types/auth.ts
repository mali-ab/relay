export interface SubscriptionInfo {
  user_id: number;
  plan_code: string;
  plan_name: string;
  max_participants: number;
  meeting_duration_minutes: number | null;
  started_at: string;
  expires_at: string;
}

export interface UserInfo {
  id: number;
  name: string;
  email: string;
}

export interface MeResponse {
  subs: SubscriptionInfo;
  user: UserInfo;
}

export interface LoginResponse {
  plan?: SubscriptionInfo;
  token: string;
  user: UserInfo;
}

export interface RegisterResponse {
  reg_token: string;
}

export interface VerifyResponse {
  user: UserInfo;
  token: string;
}

export interface SendCodeRequest {
  email?: string;
}

export interface VerifyRequest {
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  new_password: string;
}

