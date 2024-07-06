import axios, { type AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
	baseURL: "https://police-helicopter-camera/",
});

export default api;
