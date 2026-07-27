package domain

import "time"

// Meeting is a video meeting created by a user.
type Meeting struct {
	ID                     int64
	Title                  string
	RoomName               string
	CreatorID              int64
	MaxParticipants        int
	MeetingDurationMinutes int
	CreatedAt              time.Time
	EndedAt                  *time.Time
}
