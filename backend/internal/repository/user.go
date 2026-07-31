package repository

import (
	"context"
	"database/sql"
	"errors"

	"teachflow/internal/domain"

	"github.com/lib/pq"
)

type UserRepository struct{ db *sql.DB }

func NewUserRepository(db *sql.DB) *UserRepository { return &UserRepository{db: db} }

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
	const query = `INSERT INTO users(name, email, password_hash) VALUES($1, $2, $3) RETURNING id`
	err := r.db.QueryRowContext(ctx, query, user.Name, user.Email, user.PasswordHash).Scan(&user.ID)
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			return domain.ErrEmailExists
		}

		return err
	}

	return nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	const query = `SELECT id, name, email, password_hash FROM users WHERE email = $1`
	user := new(domain.User)
	err := r.db.QueryRowContext(ctx, query, email).Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) GetUser(ctx context.Context, id int64) (*domain.User, error) {
	const query = `SELECT id, name, email, password_hash FROM users WHERE id = $1`
	user := new(domain.User)
	err := r.db.QueryRowContext(ctx, query, id).Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) UpdateName(ctx context.Context, id int64, name string) error {
	const query = `UPDATE users SET name = $1 WHERE id = $2`
	result, err := r.db.ExecContext(ctx, query, name, id)
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

func (r *UserRepository) UpdatePassword(ctx context.Context, id int64, passwordHash string) error {
	const query = `UPDATE users SET password_hash = $1 WHERE id = $2`
	result, err := r.db.ExecContext(ctx, query, passwordHash, id)
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
