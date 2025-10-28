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

  const handleRandomRoom = () => {
    // Generate a random room identifier for the URL
    const roomIdentifier = `room_${Date.now()}`;
    navigate(`/random-room/${roomIdentifier}`);
  };

  const handleListMatches = () => {
    navigate("/list-rooms");
  };

  return (
    <div className="p-10 w-[60%] max-w-[1000px] min-w-[300px] mx-auto">
      <h2 className="text-[20x] sm:text-[20px] md:text-[50px]">
        Tic Tac Toe Multiplayer
      </h2>

      <div className="mb-5 border-b pb-5">
        <h3 className="text-[20px] mb-5">Create a New Game:</h3>
        <p className="span mb-2">
          Click to create a room and get a match ID to share
        </p>
        <button className="p-button" onClick={handleCreateRoom}>
          Create Room
        </button>
      </div>

      <div className="mb-5 border-b pb-5">
        <h3 className="span mb-2">Join Existing Game:</h3>
        <label className="mb-3" htmlFor="joinRoomId">
          Match ID:{" "}
        </label>
        <input
          className="p-input mb-3"
          value={joinRoomId}
          id="joinRoomId"
          placeholder="Paste Match ID here"
          onChange={(e) => setJoinRoomId(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button className="p-button" onClick={handleJoinRoom}>
          Join Room
        </button>
      </div>

      <div className="mb-5 border-b pb-5">
        <h3 className="span-md mb-2">Join Random:</h3>
        <button className="p-button" onClick={handleRandomRoom}>
          Join Random Room
        </button>
      </div>

      <div className="mb-5 border-b pb-5">
        <h3 className="span-md mb-2">List Rooms:</h3>
        <button className="p-button" onClick={handleListMatches}>
          List all Rooms
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
