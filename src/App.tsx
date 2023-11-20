import { Route, Router, Switch } from "wouter";
import Landing from "./Landing";
import LikedTracks from "./Likedtracks";
import { useEffect, useState } from "react";

import spotifyClient from "./spotifyClient";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async (accessToken: string) => {
      try {
        setLoading(true);
        spotifyClient.setToken(accessToken);
        const { data } = await spotifyClient.getProfile();
        setUser(data);
      } catch {
        console.log("silent error");
        localStorage.removeItem("accessToken");
      } finally {
        setLoading(false);
      }
    };

    // check if there's token in localStorage
    let accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      loadUser(accessToken);
    }
  }, []);

  return (
    <>
      <div>
        {loading ? (
          <div>loading..</div>
        ) : (
          <Router>
            <Switch>
              <Route path="/">
                <Landing user={user} setUser={setUser} />
              </Route>
              {user ? (
                <Route path="/liked-tracks">
                  <LikedTracks />
                </Route>
              ) : null}
            </Switch>
          </Router>
        )}
      </div>
    </>
  );
}

export default App;
