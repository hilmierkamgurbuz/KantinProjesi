import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useYetkilendirme } from './context/YetkilendirmeContext';
import Giris from './sayfalar/Giris';
import Panel from './sayfalar/Panel';
import KullaniciHesabi from './sayfalar/KullaniciHesabi';
import NakitAkisi from './sayfalar/NakitAkisi';

function Uygulama() {
    const { kullanici, yukleniyor } = useYetkilendirme();

    if (yukleniyor) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/giris"
                    element={!kullanici ? <Giris /> : (kullanici.rol === 'admin' ? <Navigate to="/" /> : <Navigate to={`/hesap/${kullanici.id}`} />)}
                />
                <Route
                    path="/"
                    element={
                        kullanici ? (
                            kullanici.rol === 'admin' ? <Panel /> : <Navigate to={`/hesap/${kullanici.id}`} />
                        ) : <Navigate to="/giris" />
                    }
                />
                <Route
                    path="/hesap/:kullaniciId"
                    element={kullanici ? <KullaniciHesabi /> : <Navigate to="/giris" />}
                />
                <Route
                    path="/nakit-akisi"
                    element={
                        kullanici ? (
                            kullanici.rol === 'admin' ? <NakitAkisi /> : <Navigate to={`/hesap/${kullanici.id}`} />
                        ) : <Navigate to="/giris" />
                    }
                />
                {/* Eski yolları yönlendirme */}
                <Route path="/login" element={<Navigate to="/giris" />} />
                <Route path="/account/:id" element={<Navigate to="/hesap/:id" />} />
                <Route path="/cash-flow" element={<Navigate to="/nakit-akisi" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default Uygulama;
