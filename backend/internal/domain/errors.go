package domain

import "errors"

var (
	ErrEmailExists        = errors.New("email already exists")
	ErrNotFound           = errors.New("resource not found")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrValidation         = errors.New("validation error")

	ErrMeetingFull      = errors.New("Room is Full")
	ErrMeetingEnded     = errors.New("Meeting Ended")
	ErrAlreadyOnMeeting = errors.New("You are already on meeting")
	ErrForbidden        = errors.New("Failed to end meeting. user-id != creator-id")
)
