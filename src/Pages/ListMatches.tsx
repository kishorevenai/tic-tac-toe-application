import { useEffect, useState } from "react";
import client, { createSession } from "../nakamaClient";
import { useNavigate } from "react-router-dom";

function AvailableRooms() {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");

  const handleJoinRoom = (roomId: string, count) => {
    if (count === 2) {
      alert("The Room is Full");
      return;
    }

    navigate(`/join-room/${roomId}`);
  };

  useEffect(() => {
    async function fetchMatches() {
      try {
        const s = await createSession(
          "player_" + Math.floor(Math.random() * 10000)
        );

        const limit = 10;
        const authoritative = false;
        const label = undefined;
        const minPlayers = 0;
        const maxPlayers = 10;
        const query = "";

        const result = await client.listMatches(
          s,
          limit,
          authoritative,
          label,
          minPlayers,
          maxPlayers
        );

        console.log("Matches:", result.matches);
        setMatches(result.matches || []);
      } catch (err: any) {
        console.error("Error fetching matches:", err);
        setError(err.message || "Error fetching matches");
      }
    }

    fetchMatches();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Available Rooms</h2>
      {error && <p className="text-red-500">{error}</p>}
      {matches.length === 0 ? (
        <p>No active rooms found.</p>
      ) : (
        <ul className="space-y-2 border-2 border-white">
          {matches.map((match) => (
            <div key={match.match_id} className="rounded border-white">
              <p>
                <strong>Room ID:</strong> {match.match_id}
              </p>
              <p>
                <strong>Players:</strong> {match.size}
              </p>
              <p>
                <strong>Max Players:</strong> {match.max_size}
              </p>
              <button
                onClick={() => handleJoinRoom(match.match_id, match.size)}
              >
                JOIN ROOM
              </button>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AvailableRooms;
