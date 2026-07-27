package app

import (
	"fmt"
	"log"

	"teachflow/internal/config"
	"teachflow/internal/database"
	"teachflow/internal/repository"
	"teachflow/internal/security"
	myHttp "teachflow/internal/transport/http"
	"teachflow/internal/usecase"
)

// Run composes infrastructure adapters and starts the HTTP delivery layer.
func Run() error {
	cfg := config.Load()
	db, err := database.NewPostgres(cfg)
	if err != nil {
		return fmt.Errorf("database connection failed: %w", err)
	}
	defer db.Close()

	usersRepo := repository.NewUserRepository(db)
	meetingsRepo := repository.NewMeetingRepository(db)
	participantsRepo := repository.NewMeetingParticipantsRepository(db)
	subscriptionRepo := repository.NewSubscriptionRepository(db)

	tokens := security.NewJWTService(cfg.JWTSecret)

	userUsecase := usecase.NewUserUseCase(usersRepo, subscriptionRepo, security.PasswordService{}, tokens)
	meetingUsecase := usecase.NewMeetingUsecase(meetingsRepo, participantsRepo, subscriptionRepo)
	subsUsecase := usecase.NewSubscriptionUsecase(subscriptionRepo)

	handler := myHttp.NewHandler(userUsecase, meetingUsecase, subsUsecase, cfg.JitsiURL)

	addr := fmt.Sprintf("%s:%s", cfg.ServerHost, cfg.ServerPort)
	log.Printf("server started on %s", addr)
	return myHttp.NewRouter(handler, tokens).Run(addr)
}
