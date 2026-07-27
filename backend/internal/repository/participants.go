package repository

import (
	"context"
	"database/sql"
	"errors"
	"teachflow/internal/domain"
)

type MeetingParticipantsRepository struct{ db *sql.DB }

func NewMeetingParticipantsRepository(db *sql.DB) *MeetingParticipantsRepository {
	return &MeetingParticipantsRepository{db: db}
}

func (r *MeetingParticipantsRepository) GetUserActiveMeetingID(ctx context.Context, userID int64) (int64, error) {

	var meetingID int64

	err := r.db.QueryRowContext(ctx, `
		SELECT meeting_id
		FROM meeting_participants
		WHERE user_id = $1
		LIMIT 1
	`, userID).Scan(&meetingID)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, nil
		}

		return 0, err
	}

	return meetingID, nil
}

func (r *MeetingParticipantsRepository) GetParticipantCount(ctx context.Context, meetingID int64) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx, `
		SELECT COUNT(*)
		FROM meeting_participants
		WHERE meeting_id = $1
	`, meetingID).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (r *MeetingParticipantsRepository) JoinMeeting(ctx context.Context, meetingID, userID int64) error {

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var maxParticipants int

	err = tx.QueryRowContext(ctx, `
		SELECT max_participants
		FROM meetings
		WHERE id = $1
		FOR UPDATE
	`, meetingID).Scan(&maxParticipants)
	if err != nil {
		return err
	}

	var count int

	err = tx.QueryRowContext(ctx, `
		SELECT COUNT(*)
		FROM meeting_participants
		WHERE meeting_id = $1
	`, meetingID).Scan(&count)
	if err != nil {
		return err
	}

	if count >= maxParticipants {
		return domain.ErrMeetingFull
	}

	result, err := tx.ExecContext(ctx, `
		INSERT INTO meeting_participants (
			meeting_id,
			user_id
		)
		VALUES ($1, $2)
		ON CONFLICT (meeting_id, user_id)
		DO NOTHING
	`, meetingID, userID)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return domain.ErrAlreadyOnMeeting
	}

	return tx.Commit()
}

func (r *MeetingParticipantsRepository) LeaveMeeting(ctx context.Context, meetingID, userID int64) error {

	result, err := r.db.ExecContext(ctx, `
		DELETE
		FROM meeting_participants
		WHERE meeting_id = $1
		AND user_id = $2
	`, meetingID, userID)
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
