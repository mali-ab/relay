package usecase

import (
	"context"
	"fmt"
	"strings"

	"teachflow/internal/domain"
	"time"
)

type MeetingUsecase struct {
	meetings      MeetingRepositoryStore
	participants  MeetingParticipantRepositoryStore
	subscriptions SubscriptionRepositoryStore
}

func NewMeetingUsecase(meetings MeetingRepositoryStore, participants MeetingParticipantRepositoryStore, subs SubscriptionRepositoryStore) *MeetingUsecase {
	return &MeetingUsecase{meetings: meetings, participants: participants, subscriptions: subs}
}
func (u *MeetingUsecase) Create(ctx context.Context, creatorID int64, title string) (*CreateMeetingDTO, error) {
	title = strings.TrimSpace(title)

	if creatorID < 1 || title == "" || len(title) > 120 {
		return nil, domain.ErrValidation
	}

	activeMeetingID, err := u.participants.GetUserActiveMeetingID(ctx, creatorID)
	if err != nil {
		return nil, err
	}

	if activeMeetingID != 0 {
		return nil, domain.ErrAlreadyOnMeeting
	}

	userPlan, err := u.subscriptions.GetUserPlan(ctx, creatorID)
	if err != nil {
		return nil, err
	}

	meeting := &domain.Meeting{
		Title:                  title,
		RoomName:               roomName(title, time.Now()),
		CreatorID:              creatorID,
		MaxParticipants:        userPlan.MaxParticipants,
		MeetingDurationMinutes: userPlan.MeetingDurationMinutes,
	}

	if err := u.meetings.CreateMeeting(ctx, meeting); err != nil {
		return nil, err
	}

	return &CreateMeetingDTO{
		ID:                     meeting.ID,
		Title:                  meeting.Title,
		RoomName:               meeting.RoomName,
		CreatorID:              meeting.CreatorID,
		MaxParticipants:        meeting.MaxParticipants,
		MeetingDurationMinutes: meeting.MeetingDurationMinutes,
		CreatedAt:              meeting.CreatedAt,
		RemainingMinutes:       meetingToRemaining(meeting),
	}, nil
}

func (u *MeetingUsecase) Join(ctx context.Context, roomName string, userID int64) (*MeetingDTO, error) {
	roomName = strings.TrimSpace(roomName)

	if userID < 1 || roomName == "" {
		return nil, domain.ErrValidation
	}

	meeting, err := u.meetings.GetByRoomName(ctx, roomName)
	if err != nil {
		return nil, err
	}

	if meeting.EndedAt != nil {
		return nil, domain.ErrMeetingEnded
	}

	if meeting.MeetingDurationMinutes != 0 {
		expiredAt := meeting.CreatedAt.Add(
			time.Duration(meeting.MeetingDurationMinutes) * time.Minute,
		)

		if time.Now().After(expiredAt) {
			return nil, domain.ErrMeetingEnded
		}
	}

	activeMeetingID, err := u.participants.GetUserActiveMeetingID(ctx, userID)
	if err != nil {
		return nil, err
	}

	if activeMeetingID != 0 {
		if activeMeetingID == meeting.ID {
			// Пользователь уже в этой комнате (например, обновил страницу).
			// Возвращаем инфо о митинге для переподключения.
			return meetingToDTO(meeting), nil
		}

		return nil, domain.ErrAlreadyOnMeeting
	}

	if err := u.participants.JoinMeeting(ctx, meeting.ID, userID); err != nil {
		return nil, err
	}

	return meetingToDTO(meeting), nil
}

func meetingToDTO(meeting *domain.Meeting) *MeetingDTO {
	dto := &MeetingDTO{
		ID:                     meeting.ID,
		Title:                  meeting.Title,
		RoomName:               meeting.RoomName,
		CreatorID:              meeting.CreatorID,
		MaxParticipants:        meeting.MaxParticipants,
		MeetingDurationMinutes: meeting.MeetingDurationMinutes,
		CreatedAt:              meeting.CreatedAt,
		EndetAt:                meeting.EndedAt,
	}

	if meeting.MeetingDurationMinutes != 0 {
		expiredAt := meeting.CreatedAt.Add(
			time.Duration(meeting.MeetingDurationMinutes) * time.Minute,
		)
		if time.Now().Before(expiredAt) {
			rem := int(time.Until(expiredAt).Minutes())
			if rem < 0 {
				rem = 0
			}
			dto.RemainingMinutes = &rem
		}
	}

	return dto
}

func (u *MeetingUsecase) End(ctx context.Context, roomName string, userID int64) error {
	roomName = strings.TrimSpace(roomName)

	if userID < 1 || roomName == "" {
		return domain.ErrValidation
	}

	meeting, err := u.meetings.GetByRoomName(ctx, roomName)
	if err != nil {
		return err
	}

	if meeting.EndedAt != nil {
		return domain.ErrMeetingEnded
	}

	if meeting.CreatorID == userID {
		return u.meetings.EndMeeting(ctx, meeting.ID)
	}

	return u.participants.LeaveMeeting(ctx, meeting.ID, userID)
}

func (u *MeetingUsecase) MeetingStatus(ctx context.Context, roomName string) (*MeetingStatusDTO, error) {
	roomName = strings.TrimSpace(roomName)

	if roomName == "" {
		return nil, domain.ErrValidation
	}

	meeting, err := u.meetings.GetByRoomName(ctx, roomName)
	if err != nil {
		return nil, err
	}

	count, err := u.participants.GetParticipantCount(ctx, meeting.ID)
	if err != nil {
		return nil, err
	}

	isActive := meeting.EndedAt == nil
	// var remainingMinutes *int

	if isActive && meeting.MeetingDurationMinutes != 0 {
		expiredAt := meeting.CreatedAt.Add(
			time.Duration(meeting.MeetingDurationMinutes) * time.Minute,
		)
		if time.Now().After(expiredAt) {
			isActive = false
		} else {
			// Только для планов с ограничением по времени (FREE) — показываем остаток
			rem := int(time.Until(expiredAt).Minutes())
			if rem < 0 {
				rem = 0
			}
			// remainingMinutes = &rem
		}
	}

	return &MeetingStatusDTO{
		ID:               meeting.ID,
		RoomName:         meeting.RoomName,
		IsActive:         isActive,
		ParticipantCount: count,
		MaxParticipants:  meeting.MaxParticipants,
		EndedAt:          meeting.EndedAt,
		// RemainingMinutes: remainingMinutes,
	}, nil
}

func (u *MeetingUsecase) ListMine(ctx context.Context, userID int64) ([]MeetingDTO, error) {
	if userID < 1 {
		return nil, domain.ErrValidation
	}

	meetings, err := u.meetings.ListByCreator(ctx, userID)
	if err != nil {
		return nil, err
	}

	var meetingsDTO []MeetingDTO

	for _, m := range meetings {
		meeting := MeetingDTO{
			ID:                     m.ID,
			Title:                  m.Title,
			RoomName:               m.RoomName,
			CreatorID:              m.CreatorID,
			MaxParticipants:        m.MaxParticipants,
			MeetingDurationMinutes: m.MeetingDurationMinutes,
			CreatedAt:              m.CreatedAt,
			EndetAt:                m.EndedAt,
		}

		meetingsDTO = append(meetingsDTO, meeting)
	}

	return meetingsDTO, nil
}

func meetingToRemaining(meeting *domain.Meeting) *int {
	if meeting.MeetingDurationMinutes == 0 {
		return nil // PRO — безлимит
	}

	expiredAt := meeting.CreatedAt.Add(
		time.Duration(meeting.MeetingDurationMinutes) * time.Minute,
	)
	if time.Now().After(expiredAt) {
		return nil // уже истекло
	}

	rem := max(int(time.Until(expiredAt).Minutes()), 0)
	return &rem
}

func roomName(title string, now time.Time) string {
	name := strings.Join(strings.Fields(strings.ToLower(strings.TrimSpace(title))), "-")
	return fmt.Sprintf("%s-%d", name, now.UnixNano())
}
