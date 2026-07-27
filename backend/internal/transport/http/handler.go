package myHttp

import (
	"errors"
	"log"
	"net/http"
	"strings"

	"teachflow/internal/domain"

	"teachflow/internal/usecase"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	user         UserUsecaseStore
	meetings     MeetingUsecaseStore
	subscription SubscriptionUsecaseStore
	jitsiURL     string
}

func NewHandler(auth UserUsecaseStore, meetings MeetingUsecaseStore, subs SubscriptionUsecaseStore, jitsiURL string) *Handler {
	return &Handler{user: auth, meetings: meetings, subscription: subs, jitsiURL: strings.TrimRight(jitsiURL, "/")}
}

func (h *Handler) Profile(c *gin.Context) {
	userID := currentUserID(c)

	userDTO, userPlan, err := h.user.Profile(c.Request.Context(), userID)
	if err != nil {
		h.writeError(c, err)
		return
	}

	userResp := UserResponse{
		ID:    userDTO.ID,
		Name:  userDTO.Name,
		Email: userDTO.Email,
	}

	planResp := UserPlanResponse{
		UserID:                 userPlan.UserID,
		PlanCode:               userPlan.PlanCode,
		PlanName:               userPlan.PlanName,
		MaxParticipants:        userPlan.MaxParticipants,
		MeetingDurationMinutes: userPlan.MeetingDurationMinutes,
		StartedAt:              userPlan.StartedAt,
		ExpiresAt:              userPlan.ExpiresAt,
	}

	c.JSON(http.StatusOK, gin.H{"user": userResp, "subs": planResp})
}

func (h *Handler) CreateSubscription(c *gin.Context) {
	err := h.subscription.CreateSubscription(c.Request.Context(), currentUserID(c), c.Param("plan"))
	if err != nil {
		h.writeError(c, err)
		return
	}

	c.Status(http.StatusOK)
}

func (h *Handler) Plans(c *gin.Context) {
	plansDTO, err := h.subscription.GetPlans(c.Request.Context())
	if err != nil {
		h.writeError(c, err)
		return
	}

	var response []PlanResponse
	for _, p := range plansDTO {
		response = append(response, PlanResponse{
			ID:                     p.ID,
			Code:                   p.Code,
			Name:                   p.Name,
			MaxParticipants:        p.MaxParticipants,
			MeetingDurationMinutes: p.MeetingDurationMinutes,
			Price:                  p.Price,
		})
	}

	c.JSON(http.StatusOK, gin.H{"plans": response})
}

func (h *Handler) Register(c *gin.Context) {
	var request struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	dto := usecase.RegisterDTO{
		Name:     request.Name,
		Email:    request.Email,
		Password: request.Password,
	}

	result, err := h.user.Register(c.Request.Context(), dto)
	if err != nil {
		h.writeError(c, err)
		return
	}

	userResponse := UserResponse{
		ID:    result.User.ID,
		Name:  result.User.Name,
		Email: result.User.Email,
	}

	c.JSON(http.StatusCreated, gin.H{"token": result.Token, "user": userResponse})
}

func (h *Handler) Login(c *gin.Context) {
	var request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	dto := usecase.LoginDTO{
		Email:    request.Email,
		Password: request.Password,
	}
	result, err := h.user.Login(c.Request.Context(), dto)
	if err != nil {
		h.writeError(c, err)
		return
	}

	userResponse := UserResponse{
		ID:    result.User.ID,
		Name:  result.User.Name,
		Email: result.User.Email,
	}

	c.JSON(http.StatusOK, gin.H{"token": result.Token, "user": userResponse})
}

func (h *Handler) CreateMeeting(c *gin.Context) {
	var request struct {
		Title string `json:"title"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})

		return
	}

	meetingDTO, err := h.meetings.Create(c.Request.Context(), currentUserID(c), request.Title)
	if err != nil {
		log.Printf("request failed: %v", err)
		h.writeError(c, err)

		return
	}

	meeting := &MeetingResponse{
		ID:                     meetingDTO.ID,
		Title:                  meetingDTO.Title,
		RoomName:               meetingDTO.RoomName,
		CreatorID:              meetingDTO.CreatorID,
		MaxParticipants:        meetingDTO.MaxParticipants,
		MeetingDurationMinutes: meetingDTO.MeetingDurationMinutes,
		CreatedAt:              meetingDTO.CreatedAt,
		RemainingMinutes:       meetingDTO.RemainingMinutes,
	}

	c.JSON(http.StatusCreated, h.meetingResponse(meeting))
}

func (h *Handler) EndMeeting(c *gin.Context) {
	err := h.meetings.End(c.Request.Context(), c.Param("roomName"), currentUserID(c))
	if err != nil {
		h.writeError(c, err)
		return
	}

	c.Status(http.StatusOK)
}

// MeetingStatus проверяет, может ли пользователь присоединиться к встрече.
// Если встреча завершена или истекла — возвращает 410 Gone с ошибкой.
// Если встреча активна — возвращает 200 OK с короткой информацией.
func (h *Handler) MeetingStatus(c *gin.Context) {
	status, err := h.meetings.MeetingStatus(c.Request.Context(), c.Param("roomName"))
	if err != nil {
		h.writeError(c, err)
		return
	}

	if !status.IsActive {
		c.JSON(http.StatusGone, gin.H{"error": "meeting ended"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":                status.ID,
		"room_name":         status.RoomName,
		"participant_count": status.ParticipantCount,
		"max_participants":  status.MaxParticipants,
	})
}

func (h *Handler) ListMeetings(c *gin.Context) {
	meetingsDTO, err := h.meetings.ListMine(c.Request.Context(), currentUserID(c))
	if err != nil {
		h.writeError(c, err)
		return
	}

	if len(meetingsDTO) < 1 {
		c.JSON(http.StatusOK, gin.H{"meetings": []MeetingResponse{}})

		return
	}

	var meetingsResponse []MeetingResponse
	for _, m := range meetingsDTO {
		meetRes := MeetingResponse{
			ID:                     m.ID,
			Title:                  m.Title,
			RoomName:               m.RoomName,
			CreatorID:              m.CreatorID,
			MaxParticipants:        m.MaxParticipants,
			MeetingDurationMinutes: m.MeetingDurationMinutes,
			CreatedAt:              m.CreatedAt,
			EndedAt:                m.EndetAt,
			RemainingMinutes:       m.RemainingMinutes,
		}

		meetingsResponse = append(meetingsResponse, meetRes)
	}

	c.JSON(http.StatusOK, gin.H{"meetings": meetingsResponse})
}

func (h *Handler) JoinMeeting(c *gin.Context) {
	meetingDTO, err := h.meetings.Join(c.Request.Context(), c.Param("roomName"), currentUserID(c))
	if err != nil {
		h.writeError(c, err)
		return
	}

	meeting := &MeetingResponse{
		ID:                     meetingDTO.ID,
		Title:                  meetingDTO.Title,
		RoomName:               meetingDTO.RoomName,
		CreatorID:              meetingDTO.CreatorID,
		MaxParticipants:        meetingDTO.MaxParticipants,
		MeetingDurationMinutes: meetingDTO.MeetingDurationMinutes,
		CreatedAt:              meetingDTO.CreatedAt,
		EndedAt:                meetingDTO.EndetAt,
		RemainingMinutes:       meetingDTO.RemainingMinutes,
	}
	c.JSON(http.StatusOK, h.meetingResponse(meeting))
}

func (h *Handler) meetingResponse(meeting *MeetingResponse) gin.H {
	return gin.H{"meeting": meeting, "join_url": h.jitsiURL + "/" + meeting.RoomName}
}

func (h *Handler) writeError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, domain.ErrValidation):
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
	case errors.Is(err, domain.ErrEmailExists):
		c.JSON(http.StatusConflict, gin.H{"error": "email already exists"})
	case errors.Is(err, domain.ErrInvalidCredentials):
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
	case errors.Is(err, domain.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
	case errors.Is(err, domain.ErrAlreadyOnMeeting):
		c.JSON(http.StatusForbidden, gin.H{"error": "you are already on meeting"})
	case errors.Is(err, domain.ErrForbidden):
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
	case errors.Is(err, domain.ErrMeetingFull):
		c.JSON(http.StatusConflict, gin.H{"error": "room is full"})
	case errors.Is(err, domain.ErrMeetingEnded):
		c.JSON(http.StatusGone, gin.H{"error": "meeting ended"})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
	}
}

func currentUserID(c *gin.Context) int64 { return c.MustGet("user_id").(int64) }
