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
  token: string;
  user: UserInfo;
}

export interface RegisterResponse {
  token: string;
  user: UserInfo;
}

