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
          background: "var(--primary-color)",
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

const LazyImage = ({ src }: { src: string }) => {
  const [show, setShow] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  const styles = useSpring({
    from: {
      opacity: 0,
    },
    to: show
      ? {
          opacity: 1,
        }
      : null,
  });

  useEffect(() => {
    let observer: IntersectionObserver;
    let disconnected = false;
    if (element) {
      let options = {
        rootMargin: "0px",
        threshold: 1.0,
      };

      observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShow(true);
            observer.disconnect();
            disconnected = true;
          }
        });
      }, options);
      observer.observe(element);
    }

    return () => {
      if (observer && !disconnected) {
        observer.disconnect();
      }
    };
  }, [element]);

  useEffect(() => {
    if (show && src) {
      let image = new Image();
      image.onload = () => {
        setLoaded(true);
      };
      image.src = src;
    }
  }, [src, show]);

  return (
    <div ref={setElement}>
      {loaded && <animated.img style={styles} src={src} />}
    </div>
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
      {list.map((track, index) => {
        let trackCover = getSmallestTrackCover(track);
        const trackIsPlaying = playing === track.id;
        let trackNo = String(index + 1).padStart(2, "0");
        return (
          <div
            className={["track", trackIsPlaying ? "is-playing" : ""].join(" ")}
            key={track.id}
          >
            {trackCover ? (
              <div className="track-cover">
                <div className="track-no">{trackNo}</div>
                <LazyImage src={trackCover} />
              </div>
            ) : null}
            <div>
              <h3 className="track-name">{track.name}</h3>
              <div className="track-artists">
                {track.artists.map((artist: any) => artist.name).join(", ")}
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
