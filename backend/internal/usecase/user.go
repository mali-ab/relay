package usecase

import (
	"context"
	"errors"
	"strings"
	"teachflow/internal/domain"
)

type PasswordManager interface {
	Hash(string) (string, error)
	Compare(string, string) error
}

type TokenIssuer interface{ Issue(int64) (string, error) }

type UserUseCase struct {
	users        UserRepoStore
	subscription SubscriptionRepositoryStore
	passwords    PasswordManager
	tokens       TokenIssuer
}

func NewUserUseCase(users UserRepoStore, subs SubscriptionRepositoryStore, passwords PasswordManager, tokens TokenIssuer) *UserUseCase {
	return &UserUseCase{users: users, subscription: subs, passwords: passwords, tokens: tokens}
}

func (u *UserUseCase) Profile(ctx context.Context, userID int64) (*UserDTO, *UserPlanDTO, error) {
	user, err := u.users.GetUser(ctx, userID)
	if err != nil {
		return nil, nil, err
	}

	userDTO := &UserDTO{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}

	userPlan, err := u.subscription.GetUserPlan(ctx, userID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			return userDTO, &UserPlanDTO{}, nil
		}
		return nil, nil, err
	}

	userPlanDTO := &UserPlanDTO{
		UserID:                 userID,
		PlanCode:               userPlan.PlanCode,
		PlanName:               userPlan.PlanName,
		MaxParticipants:        userPlan.MaxParticipants,
		MeetingDurationMinutes: userPlan.MeetingDurationMinutes,
		StartedAt:              userPlan.StartedAt,
		ExpiresAt:              userPlan.ExpiresAt,
	}

	return userDTO, userPlanDTO, nil
}

func (u *UserUseCase) Register(ctx context.Context, newUser RegisterDTO) (*AuthResult, error) {
	newUser.Name, newUser.Email = strings.TrimSpace(newUser.Name), strings.TrimSpace(strings.ToLower(newUser.Email))
	if newUser.Name == "" || newUser.Email == "" || len(newUser.Password) < 8 {
		return nil, domain.ErrValidation
	}
	hash, err := u.passwords.Hash(newUser.Password)
	if err != nil {
		return nil, err
	}
	user := &domain.User{Name: newUser.Name, Email: newUser.Email, PasswordHash: hash}
	if err := u.users.Create(ctx, user); err != nil {
		return nil, err
	}

	userDTO := &UserDTO{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}

	return u.resultFor(userDTO)
}

func (u *UserUseCase) Login(ctx context.Context, userLogin LoginDTO) (*AuthResult, error) {
	user, err := u.users.GetByEmail(ctx, strings.TrimSpace(strings.ToLower(userLogin.Email)))
	if err != nil || u.passwords.Compare(userLogin.Password, user.PasswordHash) != nil {
		return nil, domain.ErrInvalidCredentials
	}

	userDTO := &UserDTO{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}

	return u.resultFor(userDTO)
}

func (u *UserUseCase) resultFor(user *UserDTO) (*AuthResult, error) {
	token, err := u.tokens.Issue(user.ID)
	if err != nil {
		return nil, err
	}
	return &AuthResult{Token: token, User: *user}, nil
}
