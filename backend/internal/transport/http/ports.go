package myHttp

import (
	"context"
	"teachflow/internal/usecase"
)

type UserUsecaseStore interface {
	Profile(context.Context, int64) (*usecase.UserDTO, *usecase.UserPlanDTO, error)
	// CheckSubscription(ctx context.Context, userID int64) (*usecase.UserPlanDTO, error)
	Register(context.Context, usecase.RegisterDTO) (*usecase.AuthResult, error)
	Login(context.Context, usecase.LoginDTO) (*usecase.AuthResult, error)
}

type MeetingUsecaseStore interface {
	Create(ctx context.Context, creatorID int64, title string) (*usecase.CreateMeetingDTO, error)
	Join(ctx context.Context, roomName string, userID int64) (*usecase.MeetingDTO, error)
	End(ctx context.Context, roomName string, userID int64) error
	ListMine(ctx context.Context, userID int64) ([]usecase.MeetingDTO, error)
	MeetingStatus(ctx context.Context, roomName string) (*usecase.MeetingStatusDTO, error)
}

type SubscriptionUsecaseStore interface {
	CreateSubscription(context.Context, int64, string) error
	GetPlans(ctx context.Context) ([]usecase.PlanDTO, error)
}
