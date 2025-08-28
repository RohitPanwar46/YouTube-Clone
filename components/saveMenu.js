import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { getUserPlaylists, createPlaylist, addVideoInPlaylist } from "../app/lib/api";
import { FiLock, FiCheck, FiPlus } from "react-icons/fi";


export default function SaveMenu({ videoId, onClose }) {
  const { data: session } = useSession();
  const [playlists, setPlaylists] = useState([]);
  const [creatingPlaylistName, setCreatingPlaylistName] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.blur(); // keep it unfocused by default like youtube
  }, []);

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!session) return;
      try {
        const userPlaylists = await getUserPlaylists(session.accessToken);
        setPlaylists(userPlaylists || []);
      } catch (err) {
        console.error("Failed to load playlists:", err);
      }
    };
    fetchPlaylists();
  }, [session]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreatePlaylist = async () => {
    const name = creatingPlaylistName.trim();
    if (!name || !session) return;
    try {
      setLoading(true);
      const newPlaylist = await createPlaylist(name, session.accessToken);
      setPlaylists((p) => [...p, newPlaylist]);
      setSelected((s) => new Set(s).add(newPlaylist._id));
      setCreatingPlaylistName("");
    } catch (err) {
      console.error("create playlist failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = async () => {
    if (!session || selected.size === 0) {
      if (onClose) onClose();
      return;
    }
    try {
        setLoading(true);
        await Promise.all(Array.from(selected).map((playlistId) => addVideoInPlaylist(playlistId, videoId, session.accessToken)));
        // clear selection
        setSelected(new Set());
    } catch (err) {
      console.error("Add to playlist failed", err);
    } finally {
      setLoading(false);
      if (onClose) onClose();
    }
  };

  // render initials and choose a warm palette
  const getInitialsBg = (name, idx) => {
    const palettes = [
      "from-red-600 to-rose-600",
      "from-amber-500 to-orange-500",
      "from-rose-500 to-pink-500",
      "from-amber-400 to-yellow-500",
      "from-red-700 to-red-900",
    ];
    return palettes[idx % palettes.length];
  };

  return (
    <div className="fixed bottom-8 right-8 w-[360px] max-w-[92vw] z-50">
      <div className="bg-[#0b0b0b] border border-[#242424] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] overflow-hidden text-white">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between bg-[#0f0f0f]">
          <div>
            <div className="text-sm font-medium">Save to...</div>
            <div className="text-xs text-gray-400">Choose playlists to save this video</div>
          </div>
          <div className="text-xs text-gray-400">{selected.size} selected</div>
        </div>

        {/* Playlists */}
        <div className="max-h-56 overflow-auto scrollbar-thin scrollbar-thumb-[#2a2a2a]">
          <ul className="divide-y divide-[#1f1f1f]">
            {playlists.length === 0 && (
              <li className="px-4 py-4 text-sm text-gray-400">No playlists yet</li>
            )}

            {playlists.map((pl, idx) => {
              const isSelected = selected.has(pl._id);
              const initials = pl.name
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <li
                  key={pl._id}
                  onClick={() => toggleSelect(pl._id)}
                  className={`px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected ? "bg-[#151515]" : "hover:bg-[#121212]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${getInitialsBg(pl.name, idx)} flex items-center justify-center text-white font-semibold`}>{initials}</div>
                    </div>

                    <div className="text-sm text-white">{pl.name}</div>

                  </div>

                  <div className="flex items-center gap-2">
                    {pl.privacy === "private" && <FiLock className="text-gray-400" />}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isSelected ? "bg-red-600" : "border border-[#2b2b2b] text-gray-400"}`}>
                      {isSelected ? <FiCheck className="text-white" /> : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Create & Done */}
        <div className="px-4 py-3 border-t border-[#232326] bg-[#0b0b0b]">
          <div className="flex gap-2 items-center mb-3">
            <input
              ref={inputRef}
              value={creatingPlaylistName}
              onChange={(e) => setCreatingPlaylistName(e.target.value)}
              placeholder="Create new playlist"
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreatePlaylist(); }}
              className="flex-1 bg-[#0f0f0f] placeholder-gray-400 text-sm rounded-full px-3 py-2 outline-none border border-[#1f1f1f] focus:ring-2 focus:ring-red-500"
            />

            {/* Explicit Create button (label + icon) */}
            <button
              onClick={handleCreatePlaylist}
              disabled={!creatingPlaylistName.trim() || loading}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition ${creatingPlaylistName.trim() && !loading ? 'bg-red-600 text-white hover:brightness-105' : 'bg-white/6 text-gray-300 cursor-not-allowed'}`}
            >
              <FiPlus />
              <span>Create</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDone}
              disabled={loading}
              className="flex-1 py-2 rounded-full bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold shadow-md hover:brightness-105 transition"
            >
              {loading ? 'Saving...' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
