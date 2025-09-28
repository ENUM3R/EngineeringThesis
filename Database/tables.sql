CREATE TABLE tasks (
    task_id BIGSERIAL PRIMARY KEY,
    start_date Date,
    finish_date Date,
    priority INT,
    description VARCHAR(255),
    title VARCHAR(255),
    points VARCHAR(100),
)

CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    user_login VARCHAR(255),
    user_password VARCHAR(255),
)
