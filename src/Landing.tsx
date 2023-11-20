import { Link, useLocation } from "wouter";
import spotifyClient, { generateSpotifyLoginURL } from "./spotifyClient";
import { useEffect, useState } from "react";

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
  const handleLogin = async () => {
    const [loginRedirectUrl, state] = generateSpotifyLoginURL();
    localStorage.setItem("loginState", state);
    window.location.assign(loginRedirectUrl);
  };

  return (
    <div>
      {loading ? (
        <div>loading...</div>
      ) : (
        <div>
          {user ? (
            <div>
              <Link href="/liked-tracks">
                <button>Explore</button>
              </Link>
            </div>
          ) : (
            <button onClick={handleLogin}>Login</button>
          )}
        </div>
      )}
    </div>
  );
}
