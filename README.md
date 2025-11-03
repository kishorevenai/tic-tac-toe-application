# Tic Tac Toe Application with Nakama Backend

This repository contains a Tic Tac Toe frontend application and instructions to run it with the Nakama backend server using Docker.

## Prerequisites

Before starting, ensure you have the following installed:

- Ubuntu or Linux-based system
- Git
- Docker and Docker Compose
- Node.js and npm

---



## frontend URL
http://13.203.222.65:5173

## backend URL
Please clone the nakama repository, and run them locally, the backend was unable to be hosted as there are some restrictions from the nakama.

Please make sure the nakama backend is running locally before accessing the frontend URL. (no need to follow if both the frontend and the backend running locally).

## Setup Instructions

### 1. Clone and Run Frontend

Clone the frontend repository:

```bash
git clone https://github.com/kishorevenai/tic-tac-toe-application.git
cd tic-tac-toe-application
npm install
```

Clone the nakama repository:

```bash
git clone https://github.com/heroiclabs/nakama.git
cd nakama
docker compose up
```



## Usage Instructions

Once the frontend and Nakama backend are running, follow these steps:

1. Sign Up / Log In

Open the frontend in a browser.

Sign up with a username and password (or log in if already registered).

Nakama handles authentication and session management.

2. Create a Room

After logging in, click “Create Room” to start a new Tic Tac Toe game.

The created room appears in the list of available rooms.

Share the room ID with a friend if you want them to join directly.

3. Join a Room

You can join a game in three ways:

Join a specific room

Enter the room ID shared by another player.

Join a random room

Click “Join Random” to be matched with any available room waiting for a second player.

Wait for other players

Rooms remain in the list until someone joins.

4. Playing the Game

Once two players are in a room, the game starts automatically.

Players take turns placing X or O in the Tic Tac Toe grid.

The winner is determined by Nakama backend, which synchronizes moves in real time.


