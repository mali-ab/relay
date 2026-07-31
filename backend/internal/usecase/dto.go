package usecase

import "time"

type UserDTO struct {
	ID    int64
	Name  string
	Email string
}

type UserPlanDTO struct {
	UserID int64

	PlanCode string
	PlanName string

	MaxParticipants        int
	MeetingDurationMinutes int

	StartedAt *time.Time
	ExpiresAt *time.Time
}

type CreateMeetingDTO struct {
	ID                     int64
	Title                  string
	RoomName               string
	CreatorID              int64
	MaxParticipants        int
	MeetingDurationMinutes int
	CreatedAt              time.Time
	RemainingMinutes       *int
}

type EndMeetingDTO struct {
	MeetingID int64
	CreatorID int64
	UserID    int64
}

type PlanDTO struct {
	ID                     int64
	Code                   string // 'FREE', 'PRO'
	Name                   string
	MaxParticipants        int
	MeetingDurationMinutes int
	Price                  int
}

type MeetingDTO struct {
	ID                     int64
	Title                  string
	RoomName               string
	CreatorID              int64
	MaxParticipants        int
	MeetingDurationMinutes int
	CreatedAt              time.Time
	EndetAt                *time.Time
	RemainingMinutes       *int
}

type MeetingStatusDTO struct {
	ID               int64      `json:"id"`
	RoomName         string     `json:"room_name"`
	IsActive         bool       `json:"is_active"`
	ParticipantCount int        `json:"participant_count"`
	MaxParticipants  int        `json:"max_participants"`
	EndedAt          *time.Time `json:"ended_at,omitempty"`
}

type AuthResult struct {
	Token string
	User  UserDTO
	Plan  *UserPlanDTO
}

type RegisterDTO struct {
	Name     string
	Email    string
	Password string
}

type LoginDTO struct {
	Email    string
	Password string
}
