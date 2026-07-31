-- PostGIS Extension for Geospatial Queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Places Table
CREATE TABLE IF NOT EXISTS places (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    category_label VARCHAR(50) NOT NULL,
    rating NUMERIC(3,2) DEFAULT 5.00,
    total_reviews INT DEFAULT 0,
    distance_miles NUMERIC(5,2) DEFAULT 0.5,
    duration_mins INT DEFAULT 5,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    website TEXT,
    open_status BOOLEAN DEFAULT true,
    open_hours VARCHAR(100) DEFAULT '24/7 Operations',
    image TEXT,
    ai_summary TEXT,
    tags TEXT[],
    crowd_density INT DEFAULT 30,
    lat NUMERIC(9,6) NOT NULL,
    lng NUMERIC(9,6) NOT NULL,
    features TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_places_category_rating ON places (category, rating DESC);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    place_id VARCHAR(100) REFERENCES places(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, place_id)
);
