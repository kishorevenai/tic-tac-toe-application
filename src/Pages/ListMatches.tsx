import { useEffect, useState } from "react";
import client, { createSession } from "../nakamaClient";

function AvailableRooms() {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMatches() {
      try {
        // Authenticate
        const s = await createSession(
          "player_" + Math.floor(Math.random() * 10000)
        );

        // List matches
        const limit = 10;
        const authoritative = false; // only works if your match is authoritative (has server handler)
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
        <ul className="space-y-2">
          {matches.map((match) => (
            <li key={match.match_id} className="border p-2 rounded">
              <p>
                <strong>Room ID:</strong> {match.match_id}
              </p>
              <p>
                <strong>Players:</strong> {match.size}
              </p>
              <p>
                <strong>Max Players:</strong> {match.max_size}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AvailableRooms;
