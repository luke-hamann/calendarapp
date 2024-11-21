/*
    Title: Database Build
*/

CREATE TABLE Events (
    id bigint GENERATED ALWAYS AS IDENTITY,
    description varchar(500) NOT NULL,
    timestamp timestamp without time zone NOT NULL,
    broadcasted boolean NOT NULL
);

CREATE TABLE Subscriptions (
    id bigint GENERATED ALWAYS AS IDENTITY,
    type varchar(16) NOT NULL,
    url varchar(500) NOT NULL
);

CREATE TABLE Administrators (
    id bigint GENERATED ALWAYS AS IDENTITY,
    name varchar(32) NOT NULL,
    password varchar(100) NOT NULL
);
