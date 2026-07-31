package myHttp

import (
	"net/http"
	"teachflow/internal/middleware"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func NewRouter(handler *Handler, tokenParser middleware.TokenVerifier) *gin.Engine {
	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		ExposeHeaders:    []string{"Content-Length"},
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/health", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok"}) })

	api := router.Group("/api")

	api.POST("/register", handler.Register)
	api.POST("/login", handler.Login)

	api.Use(middleware.AuthRequired(tokenParser))
	api.GET("/me", handler.Profile)
	api.PUT("/me/name", handler.UpdateName)
	api.PUT("/me/password", handler.UpdatePassword)
	api.GET("/plans", handler.Plans)
	api.POST("/subs/:plan", handler.CreateSubscription)

	meetings := api.Group("/meetings")
	meetings.POST("/create", handler.CreateMeeting)
	meetings.POST("/end/:roomName", handler.EndMeeting)
	meetings.GET("/my", handler.ListMeetings)
	meetings.GET("/join/:roomName", handler.JoinMeeting)
	meetings.GET("/:roomName/status", handler.MeetingStatus)

	return router
}
