import axios from 'axios'

const twmj_api = axios.create({
    baseURL: "https://36c0afc42eaa.ngrok-free.app",
})

export default twmj_api;