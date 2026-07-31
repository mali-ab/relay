package usecase

import (
	"context"
	"log"
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
		log.Println(err)
		return nil, err
	}

	userDTO := &UserDTO{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}

	return u.resultFor(ctx, userDTO)
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

	return u.resultFor(ctx, userDTO)
}

func (u *UserUseCase) UpdateName(ctx context.Context, userID int64, name string) (*UserDTO, error) {
	name = strings.TrimSpace(name)
	if name == "" || len(name) > 120 {
		return nil, domain.ErrValidation
	}

	if err := u.users.UpdateName(ctx, userID, name); err != nil {
		return nil, err
	}

	return &UserDTO{ID: userID, Name: name}, nil
}

func (u *UserUseCase) UpdatePassword(ctx context.Context, userID int64, oldPassword, newPassword string) error {
	if len(oldPassword) < 8 || len(newPassword) < 8 {
		return domain.ErrValidation
	}

	user, err := u.users.GetUser(ctx, userID)
	if err != nil {
		return err
	}

	if err := u.passwords.Compare(oldPassword, user.PasswordHash); err != nil {
		return domain.ErrInvalidCredentials
	}

	hash, err := u.passwords.Hash(newPassword)
	if err != nil {
		return err
	}

	return u.users.UpdatePassword(ctx, userID, hash)
}

func (u *UserUseCase) resultFor(ctx context.Context, user *UserDTO) (*AuthResult, error) {
	token, err := u.tokens.Issue(user.ID)
	if err != nil {
		return nil, err
	}

	userPlan, err := u.subscription.GetUserPlan(ctx, user.ID)
	if err != nil {
		return nil, err
	}

	planDTO := &UserPlanDTO{
		UserID:                 userPlan.UserID,
		PlanCode:               userPlan.PlanCode,
		PlanName:               userPlan.PlanName,
		MaxParticipants:        userPlan.MaxParticipants,
		MeetingDurationMinutes: userPlan.MeetingDurationMinutes,
		StartedAt:              userPlan.StartedAt,
		ExpiresAt:              userPlan.ExpiresAt,
	}

	return &AuthResult{Token: token, User: *user, Plan: planDTO}, nil
}
