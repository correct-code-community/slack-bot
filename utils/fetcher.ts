import axios from "axios";

const instance = axios.create({
  baseURL: "https://slack.com/api",
});

export default instance;
