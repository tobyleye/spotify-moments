import { Route, Router, Switch, Redirect, Link, useLocation } from "wouter";
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
      <Router>
        <AppNav user={user} />

        {loading ? (
          <div id="app-loading">loading..</div>
        ) : (
          <Switch>
            <Route path="/">
              <Landing user={user} setUser={setUser} />
            </Route>
            {user ? (
              <Route path="/liked-tracks">
                <LikedTracks />
              </Route>
            ) : null}
            <Route path="*">
              <Redirect to="/" />
            </Route>
          </Switch>
        )}
      </Router>
    </>
  );
}

const AppNav = ({ user }: { user: any }) => {
  const [location] = useLocation();

  let isIndexLocation = location === "/";

  return (
    <nav className="app-nav">
      <div>
        {isIndexLocation ? null : (
          <Link href="/" className="home-link">
            <span className="dot"></span>
            Home
          </Link>
        )}
      </div>
      <div className="">
        {user ? <button className="logout-btn">Logout</button> : null}
      </div>
    </nav>
  );
};

export default App;
