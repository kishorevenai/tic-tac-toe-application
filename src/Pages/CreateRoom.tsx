import { useEffect, useRef, useState, useContext } from "react";
import client, { createSession } from "../nakamaClient";
import { useParams, useNavigate, type Session } from "react-router-dom";
import { calculateWinner, isBoardFull } from "../utils/gameUtils"; // Adjust path as needed
import { MyContext } from "../store/nakamaContext";

function PrivateRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user }: any = useContext(MyContext);

  const [session, setSession] = useState<any>(user);

  console.log(session, user);
  const [status, setStatus] = useState<any>(null);
  const [mySymbol, setMySymbol] = useState<string>("");
  const [whosNext, setWhosNext] = useState<string>("");
  const [board, setBoard] = useState(Array(9).fill(null));
  const [winner, setWinner] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const socketRef = useRef<any>(null);
  const matchRef = useRef<any>(null);

  const handleRouteToHome = () => {
    navigate("/dashboard");
  };

  async function init() {
    try {
      console.log("CHECKING RESULT ======>", whosNext);
      // const userSession: any = await createSession(
      //   "player_" + Math.floor(Math.random() * 10000)
      // );
      // setSession(userSession);
      setStatus("Authenticated...");

      const socket = client.createSocket(false, false);
      await socket.connect(session, true);
      socketRef.current = socket;

      socket.onmatchdata = (matchData: any) => {
        const decoder = new TextDecoder();
        const dataString = decoder.decode(matchData.data);
        const { board: opponentBoard } = JSON.parse(dataString);
        setBoard(opponentBoard);

        const gameWinner = calculateWinner(opponentBoard);
        if (gameWinner) {
          setWinner(gameWinner);
          setGameOver(true);
          setStatus(gameWinner === "X" ? "You Won! 🎉" : "Opponent Won!");
          return;
        }

        if (isBoardFull(opponentBoard)) {
          setGameOver(true);
          setStatus("It's a Draw!");
          return;
        }

        setWhosNext("X");
        setStatus("Your Turn!");
      };

      socket.onmatchpresence = (presence: any) => {
        console.log("PRESENCE EVENT", presence);
        if (presence.joins && presence.joins.length > 0) {
          console.log("JOIN EVENT COMING", presence);
          let comingUsername = presence.joins[0].username;
          let currentUsername = session.username;

          if (comingUsername !== currentUsername) {
            setTimeout(() => {
              setWhosNext("X");
              setStatus("Opponent joined! Your turn (X)");
            }, 500);
          }
        }

        if (presence.leaves && presence.leaves.length > 0) {
          setStatus("Opponent left the game 😢");
          setGameOver(true);
        }
      };

      // Create match WITHOUT passing any name parameter
      console.log(session);
      const match = await socket.createMatch();

      matchRef.current = match.match_id;
      setMySymbol("X");
      // setWhosNext("X");
      setStatus(`Match Created! Waiting for opponent to join...`);
    } catch (error) {
      console.error("Error creating match:", error);
      setStatus("Failed to create match");
    }
  }

  async function updateWinStatus(won: boolean) {
    if (!session) return;

    try {
      const userSession = user;
      const username =
        userSession.username || userSession.user_id || "unknown_player";

      const result = await client.readStorageObjects(session, {
        object_ids: [
          {
            collection: "player_stats",
            key: "match_stats",
            user_id: session.user_id,
          },
        ],
      });

      let stats = { wins: 0, totalMatches: 0 };

      if (
        result.objects &&
        result.objects.length > 0 &&
        result.objects[0].value &&
        typeof result.objects[0].value === "object" &&
        "wins" in result.objects[0].value &&
        "totalMatches" in result.objects[0].value
      ) {
        stats = result.objects[0].value as {
          wins: number;
          user_id: string;
          totalMatches: number;
        };
      }

      // Update stats
      stats.totalMatches += 1;
      if (won) stats.wins += 1;

      // Save updated stats
      await client.writeStorageObjects(session, [
        {
          collection: "player_stats",
          key: "match_stats",
          value: { ...stats, username },
          permission_read: 2,
          permission_write: 1,
        },
      ]);

      console.log("Updated player stats:", stats);
    } catch (error) {
      console.error("Failed to update win stats:", error);
    }
  }

  useEffect(() => {
    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleClick = (index: number) => {
    if (!matchRef.current || !socketRef.current || board[index] || gameOver)
      return;

    if (whosNext !== mySymbol) return;

    const newBoard = [...board];
    newBoard[index] = mySymbol;
    setBoard(newBoard);

    // Check for winner after your move
    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameOver(true);
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
      updateWinStatus(false);
    } else {
      setStatus("Opponent's Turn");
      setWhosNext("O");
      updateWinStatus(false);
    }

    // Send the move to opponent
    const data = JSON.stringify({
      board: newBoard,
    });

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
      setStatus("Failed to send your move");
    }
  };

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center gap-10 w-[90%] m-auto">
        <p className="text-gray-50 font-bold span">{status}</p>
        <p className="span border p-2 ">ROOM ID: {matchRef.current}</p>
        {gameOver && (
          <button className="p-button" onClick={handleRouteToHome}>
            Back to home page
          </button>
        )}
      </div>

      {mySymbol && (
        <p className="span w-[90%] mx-auto">
          You are: <strong>{mySymbol}</strong>
        </p>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,200px)",
          gap: "5px",
          justifyContent: "center",
        }}
      >
        {board.map((cell, i) => (
          <button
            className="rounded"
            key={i}
            onClick={() => handleClick(i)}
            style={{
              width: "200px",
              height: "200px",
              fontSize: "2rem",
              cursor: "pointer",
              backgroundColor: cell ? "#e0e0e0" : "white",
              color: cell === "X" ? "red" : cell === "O" ? "blue" : "black",
            }}
            disabled={whosNext !== mySymbol || gameOver || !whosNext}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PrivateRoom;
