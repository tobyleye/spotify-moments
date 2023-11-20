import { useRef, useState } from "react";
import { track } from "./types";

export default function TrackList({ list }: { list: track[] }) {
  const [playing, setPlaying] = useState<string | null>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTrack = (trackId: string, trackPreviewURL: string, track: any) => {
    let isCurrentlyPlaying = playing !== null && audioRef.current !== null;
    if (isCurrentlyPlaying) {
      // stop it. we can only play one track at a time.
      audioRef.current!.pause();
    }
    let audio = new Audio(trackPreviewURL);
    audio.onplay = () => {
      setPlaying(trackId);
    };
    audio.onended = () => {
      setPlaying(null);
      audioRef.current = null;
    };
    audio.play();
    audioRef.current = audio;
  };

  const pauseCurrentlyPlayingTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(null);
    }
  };

  return (
    <div>
      {list.map((track) => (
        <div key={track.id} style={{ marginBottom: 20 }}>
          <h3>{track.name}</h3>

          <div>
            Artists:
            {track.artists.map((artist: any) => {
              return <div key={artist.id}>{artist.name}</div>;
            })}
          </div>
          {track.preview_url ? (
            <div>
              {playing && playing === track.id ? (
                <button onClick={pauseCurrentlyPlayingTrack}>Stop</button>
              ) : (
                <button
                  onClick={() => playTrack(track.id, track.preview_url, track)}
                >
                  Play
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                fontSize: 12,
                background: "red",
                color: "white",
                opacity: 0.5,
                display: "inline-block",
              }}
            >
              No preview
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
