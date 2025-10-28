import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { calculateWinner, isBoardFull } from "../utils/gameUtils";
import client, { createSession } from "../nakamaClient";

function RandomRoom() {
  const navigate = useNavigate();

  const [status, setStatus] = useState("Connecting...");
  const [mySymbol, setMySymbol] = useState("");
  const [whosNext, setWhosNext] = useState("");
  const [board, setBoard] = useState(Array(9).fill(null));
  const [gameOver, setGameOver] = useState(false);

  const socketRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);
  const matchRef = useRef<any>(null);
  const ticketRef = useRef("");

  const handleRouteToHome = () => {
    navigate("/dashboard");
  };

  async function init() {
    try {
      const randomPlayerName = "player_" + Math.floor(Math.random() * 100000);
      const userSession = await createSession(randomPlayerName);
      sessionRef.current = userSession;
      setStatus("Authenticated... Finding match...");

      console.log("👤 Authenticated as:", randomPlayerName);

      const socket = client.createSocket(false, false);
      await socket.connect(userSession, true);
      socketRef.current = socket;

      // Matchmaker matched handler
      socket.onmatchmakermatched = async (matched) => {
        const matchId = undefined;
        const result = await socket.joinMatch(matchId, matched.token);
        console.log("TESTING MATCH ID", result);

        matchRef.current = result.match_id;
        console.log("✅ Matched! Match ID:", matchRef.current);

        if (ticketRef.current) {
          try {
            await socket.removeMatchmaker(ticketRef.current);
            ticketRef.current = "";
          } catch (e) {
            console.log("Ticket already removed or expired", e);
          }
        }

        const myUserId = sessionRef.current.user_id;
        const users = matched.users || [];
        const sortedUsers = [...users].sort((a, b) =>
          a.presence.session_id.localeCompare(b.presence.session_id)
        );
        const myIndex = sortedUsers.findIndex(
          (u) => u.presence.user_id === myUserId
        );
        if (myIndex === 0) {
          setMySymbol("X");
          setWhosNext("X");
          setStatus("Match started! Your turn (X)");
        } else {
          setMySymbol("O");
          setWhosNext("X");
          setStatus("Match started! Waiting for opponent (X)...");
        }
      };

      // Match data handler
      socket.onmatchdata = (matchData) => {
        const decoder = new TextDecoder();
        const dataString = decoder.decode(matchData.data);
        console.log(dataString);
        const { board: opponentBoard, mySymbol: inCommingSymbol } =
          JSON.parse(dataString);
        setBoard(opponentBoard);

        const gameWinner = calculateWinner(opponentBoard);
        if (gameWinner) {
          setGameOver(true);
          setStatus(gameWinner === mySymbol ? "You Won! 🎉" : "Opponent Won!");
          return;
        }
        if (isBoardFull(opponentBoard)) {
          setGameOver(true);
          setStatus("It's a Draw!");
          return;
        }
        setWhosNext(inCommingSymbol === "X" ? "O" : "X");
        setStatus("Your Turn!");
      };

      // Player presence handler
      socket.onmatchpresence = (presence) => {
        if (presence.leaves && presence.leaves.length > 0) {
          setStatus("Opponent left the game 😢");
          setGameOver(true);
        }
      };

      // Add to matchmaker and get ticket
      setStatus("Searching for opponent...");
      const ticket = await socket.addMatchmaker(
        "*",
        2,
        2,
        { game: "tictactoe" },
        {}
      );

      ticketRef.current = ticket.ticket;
      console.log("🎟️ Added to matchmaker with ticket:", ticket.ticket);
      setStatus("Looking for opponent...");
    } catch (error) {
      console.error("❌ Error in matchmaking:", error);
      setStatus("Failed to connect. Please try again.");
      setTimeout(() => navigate("/dashboard"), 3000);
    }
  }

  async function updateWinStatus(won: boolean) {
    if (!sessionRef.current) return;

    try {
      await client.writeStorageObjects(sessionRef.current, [
        {
          collection: "player_stats",
          key: "match_result",
          value: { won, timestamp: Date.now() },
          permission_read: 2, // public read
          permission_write: 1, // owner write
        },
      ]);
      console.log("Win status updated:", won);
    } catch (error) {
      console.error("Failed to update win status:", error);
    }
  }

  useEffect(() => {
    init();

    return () => {
      if (socketRef.current) {
        if (ticketRef.current) {
          socketRef.current
            .removeMatchmaker(ticketRef.current)
            .catch((e: any) => console.log("Ticket cleanup error:", e));
        }
        try {
          socketRef.current.disconnect();
        } catch (e) {
          console.log("Socket disconnect error:", e);
        }
      }
    };

    // eslint-disable-next-line
  }, []);

  // Click Handler
  const handleClick = (index) => {
    if (!matchRef.current) {
      setStatus("Match not joined yet.");
      return;
    }
    if (!socketRef.current || board[index] || gameOver) return;
    if (whosNext !== mySymbol) return;

    const newBoard = [...board];
    newBoard[index] = mySymbol;
    setBoard(newBoard);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setGameOver(true);
      setStatus("You Won! 🎉");
      if (gameWinner === mySymbol) {
        setStatus("You Won! 🎉");
        updateWinStatus(true);
      } else {
        setStatus("Opponent Won!");
        updateWinStatus(false);
      }
    } else if (isBoardFull(newBoard)) {
      setGameOver(true);
      setStatus("It's a Draw!");
    } else {
      setStatus("Opponent's Turn");
      setWhosNext(mySymbol === "X" ? "O" : "X");
    }

    const data = JSON.stringify({ board: newBoard, mySymbol });
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    try {
      socketRef.current.send({
        match_data_send: {
          match_id: matchRef.current,
          op_code: 1,
          data: encodedData,
        },
      });
    } catch (error) {
      console.error("Send move error:", error);
      setStatus("Failed to send your move");
    }
  };

  return (
    <div className="p-[20px]">
      <h1>Tic Tac Toe - Random Match</h1>
      <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{status}</p>

      {mySymbol && (
        <p>
          You are: <strong style={{ fontSize: "1.5rem" }}>{mySymbol}</strong>
        </p>
      )}

      <p>
        Next to play: <strong>{whosNext || "Waiting..."}</strong>
      </p>

      {gameOver && (
        <button
          onClick={handleRouteToHome}
          style={{
            padding: "10px 20px",
            fontSize: "1rem",
            marginTop: "10px",
            cursor: "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Back to Home
        </button>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 100px)",
          gap: "5px",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            style={{
              width: "100px",
              height: "100px",
              fontSize: "2rem",
              cursor:
                whosNext === mySymbol && !gameOver ? "pointer" : "not-allowed",
              backgroundColor: cell ? "#e0e0e0" : "white",
              color: cell === "X" ? "red" : cell === "O" ? "blue" : "black",
              border: "2px solid #333",
              borderRadius: "5px",
              transition: "all 0.2s",
            }}
            disabled={whosNext !== mySymbol || gameOver}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
}

export default RandomRoom;
