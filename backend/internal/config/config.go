package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerHost string
	ServerPort string

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	JWTSecret string

	JitsiURL    string
	JitsiAppID  string
	JitsiSecret string
}

func Load() *Config {

	err := godotenv.Load()

	if err != nil {
		log.Println(".env not found")
	}

	return &Config{
		ServerHost: os.Getenv("SERVER_HOST"),
		ServerPort: os.Getenv("SERVER_PORT"),

		DBHost:     os.Getenv("DB_HOST"),
		DBPort:     os.Getenv("DB_PORT"),
		DBUser:     os.Getenv("DB_USER"),
		DBPassword: os.Getenv("DB_PASSWORD"),
		DBName:     os.Getenv("DB_NAME"),

		JWTSecret: os.Getenv("JWT_SECRET"),

		JitsiURL:    os.Getenv("JITSI_URL"),
		JitsiAppID:  os.Getenv("JITSI_APP_ID"),
		JitsiSecret: os.Getenv("JITSI_APP_SECRET"),
	}
}
