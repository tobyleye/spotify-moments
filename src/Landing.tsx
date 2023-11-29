import { Link, useLocation } from "wouter";
import spotifyClient, { generateSpotifyLoginURL } from "./spotifyClient";
import { useEffect, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import "./landing.css";

const parseQueryString = (queryString: string) => {
  const params: Record<string, string> = {};
  queryString.split("&").forEach((part) => {
    const [key, val] = part.split("=");
    params[key] = val;
  });
  return params;
};

export default function Landing({
  user,
  setUser,
}: {
  user: any;
  setUser: (user: any) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  useEffect(() => {
    const handleLoginCallback = async () => {
      let hash = window.location.hash;
      if (hash.startsWith("#")) {
        hash = hash.slice(1);
      }
      if (!hash) return;

      setLocation("/");
      setLoading(true);
      const params = parseQueryString(hash);

      let accessToken = params.access_token;
      let state = params.state ? decodeURIComponent(params.state) : "";

      try {
        if (!accessToken || localStorage.getItem("loginState") !== state) {
          throw new Error("bad token or state");
        }
        spotifyClient.setToken(accessToken);
        const { data } = await spotifyClient.getProfile();
        localStorage.setItem("accessToken", accessToken);
        setUser(data);
      } catch (error) {
        alert("error logging in");
      } finally {
        setLoading(false);
      }
    };
    handleLoginCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const springs = useSpring({
    from: { y: 20, opacity: 0 },
    to: { y: 0, opacity: 1 },
  });

  const handleLogin = async () => {
    const [loginRedirectUrl, state] = generateSpotifyLoginURL();
    localStorage.setItem("loginState", state);
    window.location.assign(loginRedirectUrl);
  };

  return (
    <div className="landing-container">
      {loading ? (
        <div>loading...</div>
      ) : (
        <animated.div style={springs}>
          {user ? (
            <div>
              <Link href="/liked-tracks">
                <button className="discover-btn landing-btn">
                  <Pulse />
                  Show me
                </button>
              </Link>
            </div>
          ) : (
            <button className="landing-btn" onClick={handleLogin}>
              Login
            </button>
          )}
        </animated.div>
      )}
      <footer className="credit">
        <p>
          A thing by{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://twitter.com/o__toby"
          >
            Tobi
          </a>
        </p>
      </footer>
    </div>
  );
}

const Pulse = () => {
  const styles = useSpring({
    from: {
      scale: 0.2,
      opacity: 0,
    },
    to: {
      scale: 1,
      opacity: 0.4,
    },
    loop: true,
  });
  return (
    <div className="pulse">
      <div className="ring-1"></div>
      <animated.div style={styles} className="ring-2"></animated.div>
    </div>
  );
};
