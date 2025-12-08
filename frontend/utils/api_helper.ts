import axios from "axios";

const twmj_api = axios.create({
    baseURL: "http://95.40.51.74",
});

export default twmj_api;
