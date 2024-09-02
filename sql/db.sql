
DROP DATABASE booking_clone;

CREATE DATABASE booking_clone 
COLLATE = 'utf8mb4_general_ci';

USE `booking_clone`;




USE booking_clone;

DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_details;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS room_beds;
DROP TABLE IF EXISTS room_amenities_usage;
DROP TABLE IF EXISTS room_amenities;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS room_types;
DROP TABLE IF EXISTS hotel_amenities_usage;
DROP TABLE IF EXISTS hotel_amenities;
DROP TABLE IF EXISTS images;
DROP TABLE IF EXISTS hotels;
DROP TABLE IF EXISTS beds;
DROP TABLE IF EXISTS pension;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255),
    reset_token VARCHAR(255),
    access_token VARCHAR(255),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

CREATE TABLE pension (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE beds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    capacity INT NOT NULL
);

CREATE TABLE hotel_amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE room_amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    rating FLOAT CHECK (rating BETWEEN 0 AND 10),
    city_center FLOAT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE room_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    pension_type INT,
    capacity INT NOT NULL,
    FOREIGN KEY (pension_type) REFERENCES pension(id) ON DELETE SET NULL
);

CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    room_type INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    is_occupied BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (room_type) REFERENCES room_types(id) ON DELETE SET NULL
);

CREATE TABLE room_amenities_usage (
    room_type_id INT NOT NULL,
    amenity_id INT NOT NULL,
    PRIMARY KEY (room_type_id, amenity_id),
    FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES room_amenities(id) ON DELETE CASCADE
);

CREATE TABLE hotel_amenities_usage (
    hotel_id INT NOT NULL,
    amenity_id INT NOT NULL,
    PRIMARY KEY (hotel_id, amenity_id),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES hotel_amenities(id) ON DELETE CASCADE
);

CREATE TABLE room_beds (
    room_type_id INT NOT NULL,
    bed_id INT NOT NULL,
    PRIMARY KEY (room_type_id, bed_id),
    FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
    FOREIGN KEY (bed_id) REFERENCES beds(id) ON DELETE CASCADE
);

CREATE TABLE images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    hotel_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    overall_rating FLOAT CHECK (overall_rating BETWEEN 0 AND 10),
    date_posted DATE NOT NULL,
    staff_rating FLOAT CHECK (staff_rating BETWEEN 0 AND 10),
    amenities_rating FLOAT CHECK (amenities_rating BETWEEN 0 AND 10),
    hygiene_rating FLOAT CHECK (hygiene_rating BETWEEN 0 AND 10),
    guest_comfort_rating FLOAT CHECK (guest_comfort_rating BETWEEN 0 AND 10),
    value_proposition_rating FLOAT CHECK (value_proposition_rating BETWEEN 0 AND 10),
    location_rating FLOAT CHECK (location_rating BETWEEN 0 AND 10),
    free_wifi_rating FLOAT CHECK (free_wifi_rating BETWEEN 0 AND 10),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    hotel_id INT NOT NULL,
    order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    status ENUM('confirmed', 'cancelled', 'pending') NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    number_of_guests INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

CREATE TABLE order_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    room_type_id INT NOT NULL,
    number_of_rooms INT NOT NULL,
    price_per_room DECIMAL(10, 2) NOT NULL,
    number_of_guests INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE SET NULL
);





