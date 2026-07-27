package usecase

import (
	"context"
	"time"
)

type SubscriptionUsecase struct {
	subscription SubscriptionRepositoryStore
	now          func() time.Time
}

func NewSubscriptionUsecase(subs SubscriptionRepositoryStore) *SubscriptionUsecase {
	return &SubscriptionUsecase{subscription: subs, now: time.Now}
}

func (u *SubscriptionUsecase) CreateSubscription(ctx context.Context, userID int64, planCode string) error {
	err := u.subscription.CreateSubscription(ctx, userID, planCode)
	if err != nil {
		return err
	}

	return nil
}

func (u *SubscriptionUsecase) GetPlans(ctx context.Context) ([]PlanDTO, error) {
	plans, err := u.subscription.GetPlans(ctx)
	if err != nil {
		return nil, err
	}

	var plansDTO []PlanDTO
	for _, p := range plans {
		plansDTO = append(plansDTO, PlanDTO{
			ID:                     p.ID,
			Code:                   p.Code,
			Name:                   p.Name,
			MaxParticipants:        p.MaxParticipants,
			MeetingDurationMinutes: p.MeetingDurationMinutes,
			Price:                  p.Price,
		})
	}

	return plansDTO, nil
}

// func (u *UserUseCase) CheckSubscription(ctx context.Context, userID int64) (*UserPlanDTO, error) {
// 	userPlan, err := u.subscription.GetSubscription(ctx, userID)
// 	if err != nil {
// 		if errors.Is(err, domain.ErrNotFound) {
// 			return nil, nil
// 		}
// 		return nil, err
// 	}

// 	dto := &UserPlanDTO{
// 		UserID:                 userID,
// 		PlanCode:               userPlan.PlanCode,
// 		PlanName:               userPlan.PlanName,
// 		MaxParticipants:        userPlan.MaxParticipants,
// 		MeetingDurationMinutes: userPlan.MeetingDurationMinutes,
// 		StartedAt:              userPlan.StartedAt,
// 		ExpiresAt:              userPlan.ExpiresAt,
// 	}

// 	return dto, nil
// }
