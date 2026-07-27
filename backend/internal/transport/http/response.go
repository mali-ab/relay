package myHttp

import "time"

type MeetingResponse struct {
	ID                     int64      `json:"id"`
	Title                  string     `json:"title"`
	RoomName               string     `json:"room_name"`
	CreatorID              int64      `json:"creator_id"`
	MaxParticipants        int        `json:"max_participants"`
	MeetingDurationMinutes int        `json:"meeting_duration_minutes"`
	CreatedAt              time.Time  `json:"created_at"`
	EndedAt                *time.Time `json:"ended_at,omitempty"`
	RemainingMinutes       *int       `json:"remaining_minutes,omitempty"`
}

type UserResponse struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type UserPlanResponse struct {
	UserID int64 `json:"user_id"`

	PlanCode string `json:"plan_code"`
	PlanName string `json:"plan_name"`

	MaxParticipants        int `json:"max_participants"`
	MeetingDurationMinutes int `json:"meeting_duration_minutes"`

	StartedAt *time.Time `json:"started_at"`
	ExpiresAt *time.Time `json:"expires_at"`
}

type PlanResponse struct {
	ID                     int64  `json:"id"`
	Code                   string `json:"code"` // 'free', 'pro'
	Name                   string `json:"name"`
	MaxParticipants        int    `json:"max_participants"`
	MeetingDurationMinutes int    `json:"meeting_duration"`
	Price                  int    `json:"price"`
}
