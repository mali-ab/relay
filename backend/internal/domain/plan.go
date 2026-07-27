package domain

type Plan struct {
	ID                     int64
	Code                   string // 'free', 'pro'
	Name                   string
	MaxParticipants        int
	MeetingDurationMinutes int
	Price                  int
}
