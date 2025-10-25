import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [joinRoomId, setJoinRoomId] = useState<string>("");

  const handleJoinRoom = () => {
    if (joinRoomId.trim()) {
      navigate(`/join-room/${joinRoomId.trim()}`);
    }
  };

  const handleCreateRoom = () => {
    // Generate a random room identifier for the URL
    const roomIdentifier = `room_${Date.now()}`;
    navigate(`/private-room/${roomIdentifier}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Tic Tac Toe Multiplayer</h2>

      <div style={{ marginBottom: "30px" }}>
        <h3>Create a New Game</h3>
        <button onClick={handleCreateRoom}>Create Room</button>
        <p>Click to create a room and get a match ID to share</p>
      </div>

      <div>
        <h3>Join Existing Game</h3>
        <label htmlFor="joinRoomId">Match ID: </label>
        <input
          value={joinRoomId}
          id="joinRoomId"
          placeholder="Paste Match ID here"
          onChange={(e) => setJoinRoomId(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button onClick={handleJoinRoom}>Join Room</button>
      </div>
    </div>
  );
};

export default Dashboard;
