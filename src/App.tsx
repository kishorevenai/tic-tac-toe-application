import "./App.css";
import { useEffect, useRef, useState } from "react";
import client, { createSession } from "./nakamaClient";

function App() {
  const [session, setSession] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [mySymbol, setMySymbol] = useState<string>("");
  const [whosNext, setWhosNext] = useState<string>("");
  const [board, setBoard] = useState(Array(9).fill(null));

  const socketRef = useRef<any>(null);
  const matchRef = useRef<any>(null);

  async function init() {
    try {
      const userSession: any = await createSession(
        "player_" + Math.floor(Math.random() * 10000)
      );

      setSession(userSession);
      setStatus("Aunthenticated...");

      const socket = client.createSocket(false, false);
      await socket.connect(userSession, true);
      socketRef.current = socket;

      const MATCH_NAME = "tictactoe_room_1";

      // socket.onmatchdata = (matchData: any) => {
      //   console.log(matchData);
      // };

      socket.onmatchpresence = (presence: any) => {
        console.log("MATCH FOUND", presence);
      };

      try {
        const match = await socket.createMatch(MATCH_NAME);
        console.log("MATCH", match);
        matchRef.current = match.match_id;
        setMySymbol("X");
        setWhosNext("X");
        setStatus("Match Created! You are X, Waiting for the opponent...");
      } catch (error) {}
    } catch (error) {
      console.error("Error parsing match data:", error);
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
    console.log(board[index]);
    if (!matchRef.current || board[index]) return;

    const newBoard = [...board];
    newBoard[index] = mySymbol;
    setBoard(newBoard);
    setStatus("Opponent's Turn");

    const data = JSON.stringify({
      board: newBoard,
    });

    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    console.log("ENCODED DATA", encodedData);

    try {
      socketRef.current.send({
        match_data_send: {
          match_id: matchRef.current,
          op_code: 1,
          data: encodedData,
        },
      });
      setWhosNext("O");
    } catch (error) {
      setStatus("Failed to send your move datas");
    }
  };

  return (
    <div style={{ textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>Tic Tac Toe</h1>
      <p>{status}</p>
      {mySymbol && (
        <p>
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
            }}
            // disabled={!!cell || !isXNext}
          >
            {cell}
          </button>
        ))}
      </div>
      {/* <p>Next Player: {isXNext ? mySymbol : mySymbol === "X" ? "O" : "X"}</p> */}
    </div>
  );
}

export default App;
