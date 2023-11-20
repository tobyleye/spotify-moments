import axios, { AxiosInstance } from "axios";
import { generateRandomString } from "./utils";

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

class SpotifyClient {
  token: string | undefined;
  _httpClient: AxiosInstance;
  constructor() {
    this.token = undefined;
    this._httpClient = axios.create({
      baseURL: "https://api.spotify.com/v1/",
    });
  }

  setToken = (token: string) => {
    this.token = token;
    this._httpClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  };

  getLikedTracks = (page: number) => {
    if (page < 1) {
      page = 1;
    }

    const limit = 50;
    let offset = (page - 1) * limit;

    return this._httpClient("https://api.spotify.com/v1/me/tracks", {
      params: {
        offset,
        limit,
      },
    });
  };

  getProfile = () => {
    return this._httpClient.get("https://api.spotify.com/v1/me");
  };
}

export const generateSpotifyLoginURL = () => {
  const state = generateRandomString(16);
  const scope = "user-read-private user-read-email user-library-read";
  const redirectUri = "http://localhost:5190";

  const params = {
    response_type: "token",
    client_id: encodeURIComponent(SPOTIFY_CLIENT_ID),
    scope: encodeURIComponent(scope),
    redirect_uri: encodeURIComponent(redirectUri),
    state: encodeURIComponent(state),
  };

  let url = `https://accounts.spotify.com/authorize?`;

  const queryString = Object.entries(params)
    .map(([key, val]) => `${key}=${val}`)
    .join("&");

  url += queryString;

  return [url, state];
};

export default new SpotifyClient();
