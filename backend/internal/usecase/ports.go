package usecase

import (
	"context"
	"teachflow/internal/domain"
)

type UserRepoStore interface {
	GetUser(context.Context, int64) (*domain.User, error)
	Create(context.Context, *domain.User) error
	GetByEmail(context.Context, string) (*domain.User, error)
	UpdateName(context.Context, int64, string) error
	UpdatePassword(context.Context, int64, string) error
}

// type MeetingRepoStore interface {
// 	CreateMeeting(context.Context, *domain.Meeting) error
// 	GetByRoomName(context.Context, string) (*domain.Meeting, error)
// 	GetUserActiveMeetingID(ctx context.Context, userID int64) (int64, error)
// 	JoinMeeting(ctx context.Context, meetingID int64, userID int64) error
// 	ListByCreator(context.Context, int64) ([]domain.Meeting, error)
// 	LeaveMeeting(context.Context, int64, int64) error
// 	EndMeeting(context.Context, int64) error
// 	DeleteByMeetingID(ctx context.Context, meetingID int64)
// }

type MeetingRepositoryStore interface {
	CreateMeeting(ctx context.Context, meeting *domain.Meeting) error
	GetByRoomName(ctx context.Context, roomName string) (*domain.Meeting, error)
	EndMeeting(ctx context.Context, meetingID int64) error
	ListByCreator(ctx context.Context, creatorID int64) ([]domain.Meeting, error)
}

type MeetingParticipantRepositoryStore interface {
	GetUserActiveMeetingID(ctx context.Context, userID int64) (int64, error)
	GetParticipantCount(ctx context.Context, meetingID int64) (int, error)
	JoinMeeting(ctx context.Context, meetingID, userID int64) error
	LeaveMeeting(ctx context.Context, meetingID, userID int64) error
}

type SubscriptionRepositoryStore interface {
	CreateSubscription(context.Context, int64, string) error
	GetUserPlan(context.Context, int64) (*domain.UserPlan, error)
	GetPlans(context.Context) ([]domain.Plan, error)
}
