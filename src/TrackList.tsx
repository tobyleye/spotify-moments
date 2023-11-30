import { useEffect, useRef, useState } from "react";
import { track } from "./types";
import "./TrackList.css";
import { animated, useSpring } from "@react-spring/web";

const PlayButton = ({
  playing,
  onPlay,
  onStop,
}: {
  playing: boolean;
  onPlay: () => void;
  onStop: () => void;
}) => {
  const styles = useSpring({
    to: playing
      ? {
          clipPath: "polygon(0 0, 100% 0%, 100% 100%, 0% 100%)",
          background: "#FE0000",
        }
      : {
          clipPath: "polygon(0 0, 100% 50%, 100% 50%, 0% 100%)",
          background: "var(--accent-color)",
        },
  });
  return (
    <button
      className="play-button"
      onClick={() => {
        if (playing) {
          onStop();
        } else {
          onPlay();
        }
      }}
    >
      <animated.div
        data-paying={playing.toString()}
        style={styles}
      ></animated.div>
    </button>
  );
};

export default function TrackList({ list }: { list: track[] }) {
  const [playing, setPlaying] = useState<string | null>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    };
  }, []);

  const playTrack = (trackId: string, trackPreviewURL: string) => {
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

  const getSmallestTrackCover = (track: any) => {
    let trackImages = track?.album?.images;
    let trackCover;
    if (trackImages) {
      if (trackImages.length === 1) {
        trackCover = trackImages[0].url;
      } else if (trackImages.length === 2) {
        trackCover = trackImages[trackImages.length - 1].url;
      } else if (trackImages.length > 2) {
        trackCover = trackImages[trackImages.length - 2].url;
      }
    }
    return trackCover;
  };

  return (
    <div className="track-list">
      {list.map((track) => {
        let trackCover = getSmallestTrackCover(track);

        return (
          <div className="track" key={track.id} style={{ marginBottom: 20 }}>
            {trackCover ? (
              <div className="track-cover">
                <img src={trackCover} />
              </div>
            ) : null}
            <div>
              <h3 className="track-name">{track.name}</h3>
              <div className="track-artists">
                {track.artists.map((artist: any) => {
                  return <div key={artist.id}>{artist.name}</div>;
                })}
              </div>
              <div>
                {!track.preview_url ? (
                  <div className="track-no-preview" style={{}}>
                    No preview
                  </div>
                ) : null}
              </div>
            </div>
            {track.preview_url ? (
              <div className="track-controls">
                <PlayButton
                  playing={playing && playing === track.id ? true : false}
                  onPlay={() => playTrack(track.id, track.preview_url)}
                  onStop={pauseCurrentlyPlayingTrack}
                />
                {/* {playing && playing === track.id ? (
                  <button onClick={pauseCurrentlyPlayingTrack}>Stop</button>
                ) : (
                  <button
                    onClick={() => playTrack(track.id, track.preview_url)}
                  >
                    Play
                  </button>
                )} */}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
