package domain

import "time"

type UserPlan struct {
	UserID int64

	PlanCode string
	PlanName string

	MaxParticipants        int
	MeetingDurationMinutes int

	StartedAt *time.Time
	ExpiresAt *time.Time
}
