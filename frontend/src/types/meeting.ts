export interface CreateMeetingPayload {
  creator_id: number;
  title: string;
  duration_minutes?: number;
  scheduled_at?: string;
}

export interface MeetingInfo {
  id: number;
  title: string;
  room_name: string;
  creator_id: number;
  max_participants: number;
  meeting_duration_minutes: number | null;
  created_at: string;
  ended_at?: string | null;
}

export interface MeetingResponse {
  meeting: MeetingInfo;
  room: {
    server_url: string;
    room_name: string;
    join_url: string;
  };
}

export interface JoinMeetingResponse {
  meeting: MeetingInfo;
  room: {
    server_url: string;
    room_name: string;
    join_url: string;
  };
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
}
