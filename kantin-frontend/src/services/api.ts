import axios from 'axios';

const API_URL = 'https://yelping-rosalie-kantin-projesi-3b8c857d.koyeb.app'; // trigger Vercel rebuild

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// İstek yakalayıcı - Jeton ekle
api.interceptors.request.use(
  (config) => {
    const jeton = localStorage.getItem('token');
    if (jeton) {
      config.headers.Authorization = `Bearer ${jeton}`;
    }
    return config;
  },
  (hata) => {
    return Promise.reject(hata);
  }
);

// Yanıt yakalayıcı - Hata yönetimi
api.interceptors.response.use(
  (yanit) => yanit,
  (hata) => {
    if (hata.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('kullanici');
      window.location.href = '/login'; // Bunu da /giris yapacağız ileride
    }
    return Promise.reject(hata);
  }
);

export default api;