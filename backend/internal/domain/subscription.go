package domain

import "time"

type Subscription struct {
	ID        int64
	UserID    int64
	PlanID    int64
	StartedAt time.Time
	ExpiresAt time.Time
}
