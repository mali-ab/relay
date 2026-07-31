package repository

import (
	"context"
	"database/sql"
	"errors"

	"teachflow/internal/domain"
)

type SubscriptionRepository struct {
	db *sql.DB
}

func NewSubscriptionRepository(db *sql.DB) *SubscriptionRepository {
	return &SubscriptionRepository{db: db}
}

func (r *SubscriptionRepository) UserHasActiveSubscription(ctx context.Context, userID int64) (bool, error) {
	var count int
	err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM subscriptions WHERE user_id = $1`, userID).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *SubscriptionRepository) CreateSubscription(ctx context.Context, userID int64, planCode string) error {
	const getPlanID = `SELECT id FROM plans WHERE code = $1`

	var planID int64
	err := r.db.QueryRowContext(ctx, getPlanID, planCode).Scan(&planID)
	if errors.Is(err, sql.ErrNoRows) {
		return domain.ErrNotFound
	}
	if err != nil {
		return err
	}

	const query = `INSERT INTO subscriptions(user_id, plan_id, started_at, expires_at) VALUES($1, $2, NOW(), NOW() + INTERVAL '1 month')`

	result, err := r.db.ExecContext(ctx, query, userID, planID)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *SubscriptionRepository) GetUserPlan(ctx context.Context, userID int64) (*domain.UserPlan, error) {
	const subQuery = `SELECT id, user_id, plan_id, started_at, expires_at FROM subscriptions WHERE user_id = $1`

	var subscription domain.Subscription

	err := r.db.QueryRowContext(ctx, subQuery, userID).Scan(&subscription.ID, &subscription.UserID, &subscription.PlanID, &subscription.StartedAt, &subscription.ExpiresAt)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			const planQuery = `SELECT id, code, name, max_participants, meeting_duration_minutes, price FROM plans WHERE code = 'free'`

			var plan domain.Plan
			err = r.db.QueryRowContext(ctx, planQuery).Scan(&plan.ID, &plan.Code, &plan.Name, &plan.MaxParticipants, &plan.MeetingDurationMinutes, &plan.Price)
			if errors.Is(err, sql.ErrNoRows) {
				return nil, domain.ErrNotFound
			}
			if err != nil {
				return nil, err
			}

			userPlan := &domain.UserPlan{
				UserID:                 userID,
				PlanCode:               plan.Code,
				PlanName:               plan.Name,
				MaxParticipants:        plan.MaxParticipants,
				MeetingDurationMinutes: plan.MeetingDurationMinutes,
				StartedAt:              nil,
				ExpiresAt:              nil,
			}

			return userPlan, nil
		}
		return nil, err
	}

	const planQuery = `SELECT id, code, name, max_participants, meeting_duration_minutes, price FROM plans WHERE id = $1`

	var plan domain.Plan
	err = r.db.QueryRowContext(ctx, planQuery, subscription.PlanID).Scan(&plan.ID, &plan.Code, &plan.Name, &plan.MaxParticipants, &plan.MeetingDurationMinutes, &plan.Price)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	userPlan := &domain.UserPlan{
		UserID:                 subscription.UserID,
		PlanCode:               plan.Code,
		PlanName:               plan.Name,
		MaxParticipants:        plan.MaxParticipants,
		MeetingDurationMinutes: plan.MeetingDurationMinutes,
		StartedAt:              &subscription.StartedAt,
		ExpiresAt:              &subscription.ExpiresAt,
	}

	return userPlan, nil
}

func (r *SubscriptionRepository) GetPlans(ctx context.Context) ([]domain.Plan, error) {
	const query = `SELECT id, code, name, max_participants, meeting_duration_minutes, price FROM plans`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return []domain.Plan{}, err
	}
	defer rows.Close()
	plans := make([]domain.Plan, 0)
	for rows.Next() {
		var plan domain.Plan
		if err := rows.Scan(&plan.ID, &plan.Code, &plan.Name, &plan.MaxParticipants, &plan.MeetingDurationMinutes, &plan.Price); err != nil {
			return nil, err
		}

		plans = append(plans, plan)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return plans, nil
}
