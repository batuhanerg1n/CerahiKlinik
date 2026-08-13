import axios, { mergeConfig } from 'axios'



const  API_BASE_URL = 'https://localhost:7092/api'

const axiosInstance = axios.create({
    baseURL:'https://localhost:7092/api',
    headers:{
        'Content-Type': 'application/json',
    },
});


axiosInstance.interceptors.request.use(
    (config) => {
        const token =localStorage.getItem('token');
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
    );


    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => Promise.reject(error)
    );

    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            if ( error.response && error.response.status === 401){
                localStorage.removeItem('token');
                localStorage.removeItem('user')
                window.location.href = '/login';
            }
            return Promise.reject(error)
        }
    );
    export default axiosInstance;
    
