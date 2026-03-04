-- 점메추 ERD 기반 DDL (PostgreSQL)
-- 필요 시 MySQL/SQLite 문법으로 조정

-- 유저
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  login_id   VARCHAR(255) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  nickname   VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 식당
CREATE TABLE restaurants (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  image_url      TEXT,
  naver_link     TEXT,
  recommend_menu VARCHAR(500),
  location_text  TEXT,
  price_range    VARCHAR(100),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 태그 카테고리
CREATE TABLE tag_categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  code       VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 태그
CREATE TABLE tags (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  group_name       VARCHAR(255),
  tag_category_id  INTEGER      NOT NULL REFERENCES tag_categories(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tags_tag_category_id ON tags(tag_category_id);

-- 후기 (User, Restaurant 참조)
CREATE TABLE reviews (
  id            SERIAL PRIMARY KEY,
  restaurant_id INTEGER      NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id       INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uuid          VARCHAR(36)  NOT NULL UNIQUE,
  rating        INTEGER      NOT NULL,
  content       TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- 식당-태그 (다대다)
CREATE TABLE restaurant_tags (
  id            SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  tag_id        INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(restaurant_id, tag_id)
);

CREATE INDEX idx_restaurant_tags_restaurant_id ON restaurant_tags(restaurant_id);
CREATE INDEX idx_restaurant_tags_tag_id ON restaurant_tags(tag_id);
