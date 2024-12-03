/*
  Title: Database Build
*/

DROP TABLE IF EXISTS Events;
DROP TABLE IF EXISTS Subscriptions;
DROP TABLE IF EXISTS Administrators;

CREATE TABLE Events (
  id bigint GENERATED ALWAYS AS IDENTITY,
  description varchar(500) NOT NULL,
  timestamp timestamp without time zone NOT NULL,
  broadcast boolean NOT NULL
);

CREATE TABLE Subscriptions (
  id bigint GENERATED ALWAYS AS IDENTITY,
  type varchar(16) NOT NULL,
  target varchar(500) NOT NULL UNIQUE,
  secretToken varchar(500) UNIQUE
);

CREATE TABLE Administrators (
  id bigint GENERATED ALWAYS AS IDENTITY,
  name varchar(32) NOT NULL UNIQUE,
  password varchar(100) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO calendarapp;
