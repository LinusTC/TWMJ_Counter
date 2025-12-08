import axios from 'axios'

const twmj_api = axios.create({
    baseURL: "https://1090c2bbf090.ngrok-free.app",
})

export default twmj_api;