package jitsi

// import (
// 	"context"
// 	"fmt"
// 	"net/url"
// 	"strconv"
// 	"strings"
// 	"time"

// 	"github.com/golang-jwt/jwt/v5"
// )

// // Provider creates short-lived Jitsi Meet JWT links. The secret remains on the backend.
// type Provider struct {
// 	baseURL string
// 	appID   string
// 	secret  []byte
// }

// func NewProvider(baseURL, appID, secret string) *Provider {
// 	return &Provider{
// 		baseURL: strings.TrimRight(baseURL, "/"),
// 		appID:   appID,
// 		secret:  []byte(secret),
// 	}
// }

// func (p *Provider) JoinURL(_ context.Context, roomName string, userID int64) (string, error) {
// 	claims := jwt.MapClaims{
// 		"aud":  "jitsi",
// 		"iss":  p.appID,
// 		"sub":  "*",
// 		"room": roomName,
// 		"exp":  time.Now().Add(5 * time.Minute).Unix(),
// 		"context": map[string]any{
// 			"user": map[string]any{"id": strconv.FormatInt(userID, 10)},
// 		},
// 	}
// 	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(p.secret)
// 	if err != nil {
// 		return "", fmt.Errorf("sign jitsi token: %w", err)
// 	}
// 	return p.baseURL + "/" + url.PathEscape(roomName) + "?jwt=" + url.QueryEscape(token), nil
// }

// // var _ usecase.ConferenceProvider = (*Provider)(nil)
