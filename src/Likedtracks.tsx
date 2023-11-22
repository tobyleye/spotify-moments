import { useEffect, useRef, useState, useMemo } from "react";
import dayjs from "dayjs";
import spotifyClient from "./spotifyClient";
import TrackList from "./TrackList";
import { track } from "./types";
import { useTransition, animated, useSpring } from "@react-spring/web";

export default function LikedTracks() {
  const [likedTracksByYear, setLikedTracksByYear] = useState<
    Record<string, track[]>
  >({});

  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [finishedLoading, setFinishedLoading] = useState(false);
  const savedTracks = useRef<Record<string, boolean>>({});

  let ts = selectedYear ? Number(selectedYear) : null;
  const transitions = useTransition(ts, {
    key: ts,
    from: { x: "100%", opacity: 0 },
    enter: { x: "0%", opacity: 1, left: 0 },
    leave: { x: "-100%", opacity: 0 },
    // config: { duration: 1000 },
    // exitBeforeEnter: true,
  });

  useEffect(() => {
    const fetchLikedSongs = async (page: number = 1) => {
      try {
        const { data } = await spotifyClient.getLikedTracks(page);

        let incomingTracks: Record<string, track[]> = {};

        // group tracks by year
        data.items.forEach((item: any) => {
          const track = item.track;
          if (savedTracks.current[track.id] !== true) {
            let yearAdded = dayjs(item.added_at).format("YYYY");
            if (yearAdded in incomingTracks) {
              incomingTracks[yearAdded].push(track);
            } else {
              incomingTracks[yearAdded] = [track];
            }
            savedTracks.current[track.id] = true;
          }
        });

        // merge new tracks  with the current ones
        setLikedTracksByYear((oldLikedTracks) => {
          let newObject = { ...oldLikedTracks };
          for (let year in incomingTracks) {
            if (year in newObject) {
              newObject[year] = [...newObject[year], ...incomingTracks[year]];
            } else {
              newObject[year] = incomingTracks[year];
            }
          }
          return newObject;
        });

        if (data.next) {
          await fetchLikedSongs(++page);
        } else {
          setFinishedLoading(true);
        }
      } catch (err) {
        console.log("error fetching..");
      }
    };

    fetchLikedSongs();

    return () => {};
  }, []);

  const years = useMemo(
    () => Object.keys(likedTracksByYear).sort((a, b) => (a > b ? -1 : 1)),
    [likedTracksByYear]
  );

  const likedTracksInSelectedYear = selectedYear
    ? likedTracksByYear[selectedYear] ?? []
    : null;

  const styles = useSpring({
    from: {
      x: -20,
    },
    to:
      years.length > 0
        ? {
            x: 0,
          }
        : null,
  });

  console.log({ selectedYear });

  return (
    <div>
      <div>Liked Songs by year</div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ width: "30%", position: "sticky", top: 0 }}>
          {years.length > 0 ? (
            <animated.div style={styles}>
              <div>
                {years.map((year) => {
                  return (
                    <div key={year} onClick={() => setSelectedYear(year)}>
                      <h3>{year}</h3>
                    </div>
                  );
                })}
              </div>
            </animated.div>
          ) : null}
        </div>

        {!finishedLoading ? <div>loading...</div> : null}

        <div
          style={{
            width: "60%",
            border: "1px solid red",
            overflow: "hidden",
            position: "relative",
            minHeight: "80vh",
          }}
        >
          {transitions((style) => {
            return (
              <div style={{ position: "absolute" }}>
                <animated.div style={style}>
                  <div>
                    <div>
                      <h1>Your liked songs in the year {selectedYear}</h1>
                      <TrackList list={likedTracksInSelectedYear ?? []} />
                    </div>
                  </div>
                </animated.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
