/*
    Title: Database Build
*/

CREATE TABLE Events (
    id          integer                  PRIMARY KEY,
    description varchar(500)             NOT NULL,
    timestamp   timestamp with time zone NOT NULL,
    broadcasted boolean                  NOT NULL
);

CREATE TABLE Subscriptions (
    id   integer      PRIMARY KEY,
    type varchar(16)  NOT NULL,
    url  varchar(500) NOT NULL
);

CREATE TABLE Administrators (
    id       integer      PRIMARY KEY,
    name     varchar(32)  NOT NULL,
    password varchar(100) NOT NULL
);
