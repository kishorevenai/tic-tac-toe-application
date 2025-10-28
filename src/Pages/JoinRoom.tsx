import { useEffect, useRef, useState } from "react";
import client, { createSession } from "../nakamaClient";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { calculateWinner, isBoardFull } from "../utils/gameUtils"; // Adjust path as needed

function JoinRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState<any>(
    localStorage.getItem("nakamaSession")
  );
  const [status, setStatus] = useState<any>(null);
  const [mySymbol, setMySymbol] = useState<string>("");
  const [whosNext, setWhosNext] = useState<string>("");
  const [board, setBoard] = useState(Array(9).fill(null));
  const [winner, setWinner] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const socketRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);

  console.log(whosNext);
  const matchRef = useRef<any>(null);

  const handleRouteToHome = () => {
    navigate("/dashboard");
  };

  async function init() {
    try {
      const userSession: any = await createSession(
        "player_" + Math.floor(Math.random() * 10000)
      );
      setSession(userSession);
      sessionRef.current = userSession;

      setStatus("Authenticated...");

      const socket = client.createSocket(false, false);

      socket.onmatchdata = (matchData: any) => {
        console.log("COMING DATA", matchData);
        if (matchData.presence.username === sessionRef?.current.username) {
          console.log("Ignoring own message");
          return;
        }

        // Decode and update board when opponent moves
        const decoder = new TextDecoder();
        const dataString = decoder.decode(matchData.data);
        const { board: opponentBoard } = JSON.parse(dataString);
        setBoard(opponentBoard);

        // Check for winner after opponent's move
        const gameWinner = calculateWinner(opponentBoard);
        if (gameWinner) {
          setWinner(gameWinner);
          setGameOver(true);
          setStatus(gameWinner === "O" ? "You Won! 🎉" : "Opponent Won!");
          return;
        }

        // Check for draw
        if (isBoardFull(opponentBoard)) {
          setGameOver(true);
          setStatus("It's a Draw!");
          return;
        }

        setWhosNext("O");
        setStatus("Your Turn!");
      };

      socket.onmatchpresence = (presence: any) => {
        console.log("Match presence updated", presence);
      };

      await socket.connect(JSON.parse(session), true);
      socketRef.current = socket;

      // Use the ID from URL params directly
      console.log("Attempting to join match:", id);
      const match = await socket.joinMatch(id);
      console.log("Joined Match:", match);
      matchRef.current = match.match_id;
      setMySymbol("O");
      setWhosNext("X"); // X goes first
      setStatus("Joined! Waiting for opponent's move...");
    } catch (error) {
      console.error("Error joining match:", error);
      navigate("/");
    }
  }

  async function updateWinStatus(won: boolean) {
    if (!session) return;

    try {
      await client.writeStorageObjects(session, [
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
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleClick = (index: number) => {
    console.log("HAIIIIII");
    console.log(board[index]);
    if (!matchRef.current || !socketRef.current || board[index] || gameOver)
      return;

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
      setWhosNext("X");
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
        <p className="span">Next to play: {whosNext}</p>
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
          gridTemplateColumns: "repeat(3, 100px)",
          gap: "5px",
          justifyContent: "center",
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
              cursor: "pointer",
              backgroundColor: cell ? "#e0e0e0" : "white",
              color: cell === "X" ? "red" : cell === "O" ? "blue" : "black",
            }}
            disabled={whosNext === "X" || gameOver}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
}

export default JoinRoom;
