import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYetkilendirme } from '../context/YetkilendirmeContext';

const Giris: React.FC = () => {
    const [telefon, setTelefon] = useState('');
    const [sifre, setSifre] = useState('');
    const [hata, setHata] = useState('');
    const [yukleniyor, setYukleniyor] = useState(false);
    const { girisYap } = useYetkilendirme();
    const navigate = useNavigate();

    const gonder = async (e: React.FormEvent) => {
        e.preventDefault();
        setHata('');
        setYukleniyor(true);

        try {
            await girisYap({ telefon, sifre });
            navigate('/');
        } catch (err: any) {
            console.error('Giriş hatası:', err);
            setHata(err.response?.data?.message || 'Giriş başarısız');
        } finally {
            setYukleniyor(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Kantin Yönetim Sistemi</h1>

                {hata && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {hata}
                    </div>
                )}

                <form onSubmit={gonder}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Telefon Numarası
                        </label>
                        <input
                            type="text"
                            value={telefon}
                            onChange={(e) => setTelefon(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="05xxxxxxxxx"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Şifre
                        </label>
                        <input
                            type="password"
                            value={sifre}
                            onChange={(e) => setSifre(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={yukleniyor}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-400"
                    >
                        {yukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Giris;
