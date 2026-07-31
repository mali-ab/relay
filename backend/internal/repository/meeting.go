package repository

import (
	"context"
	"database/sql"
	"errors"

	"teachflow/internal/domain"
)

type MeetingRepository struct{ db *sql.DB }

func NewMeetingRepository(db *sql.DB) *MeetingRepository { return &MeetingRepository{db: db} }

func (r *MeetingRepository) CreateMeeting(ctx context.Context, meeting *domain.Meeting) error {
	const query = `
		INSERT INTO meetings(title, room_name, creator_id, max_participants, meeting_duration_minutes)
		VALUES($1, $2, $3, $4, $5) RETURNING id, created_at`
	err := r.db.QueryRowContext(ctx, query, meeting.Title, meeting.RoomName, meeting.CreatorID, meeting.MaxParticipants, meeting.MeetingDurationMinutes).Scan(&meeting.ID, &meeting.CreatedAt)
	if err != nil {
		return err
	}

	const meetingQuery = `INSERT INTO meeting_participants VALUES($1, $2)`
	res, err := r.db.ExecContext(ctx, meetingQuery, meeting.ID, meeting.CreatorID)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return domain.ErrNotFound
	}

	return nil
}

func (r *MeetingRepository) GetByRoomName(ctx context.Context, roomName string) (*domain.Meeting, error) {
	const query = `SELECT id, title, room_name, creator_id, max_participants, meeting_duration_minutes, created_at, ended_at FROM meetings WHERE room_name = $1`
	meeting := new(domain.Meeting)
	err := r.db.QueryRowContext(ctx, query, roomName).Scan(&meeting.ID, &meeting.Title, &meeting.RoomName, &meeting.CreatorID, &meeting.MaxParticipants, &meeting.MeetingDurationMinutes, &meeting.CreatedAt, &meeting.EndedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return meeting, nil
}

func (r *MeetingRepository) EndMeeting(ctx context.Context, meetingID int64) error {

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx, `
		UPDATE meetings
		SET ended_at = NOW()
		WHERE id = $1
	`, meetingID)
	if err != nil {
		return err
	}

	_, err = tx.ExecContext(ctx, `
		DELETE
		FROM meeting_participants
		WHERE meeting_id = $1
	`, meetingID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *MeetingRepository) ListByCreator(ctx context.Context, creatorID int64) ([]domain.Meeting, error) {
	const query = `SELECT id, title, room_name, creator_id, max_participants, meeting_duration_minutes, created_at, ended_at FROM meetings WHERE creator_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query, creatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	meetings := make([]domain.Meeting, 0)
	for rows.Next() {
		var meeting domain.Meeting
		if err := rows.Scan(&meeting.ID, &meeting.Title, &meeting.RoomName, &meeting.CreatorID, &meeting.MaxParticipants, &meeting.MeetingDurationMinutes, &meeting.CreatedAt, &meeting.EndedAt); err != nil {
			return nil, err
		}
		meetings = append(meetings, meeting)
	}
	return meetings, rows.Err()
}
 