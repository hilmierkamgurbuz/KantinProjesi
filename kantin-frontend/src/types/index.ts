export enum KullaniciRolu {
  YONETICI = 'admin',
  KULLANICI = 'user',
  PESIN_MUSTERI = 'cash_customer',
}

export enum SiparisTuru {
  VERESIYE = 'credit',
  PESIN = 'cash',
}

export interface Kullanici {
  id: string;
  ad: string;
  soyad: string;
  telefon: string;
  rol: KullaniciRolu;
  bakiye: number;
  aktifMi: boolean;
  olusturulmaTarihi: string;
  guncellenmeTarihi: string;
}

export interface Kategori {
  id: string;
  ad: string;
  aciklama?: string;
  urunler?: Urun[];
  olusturulmaTarihi: string;
  guncellenmeTarihi: string;
}

export interface Urun {
  id: string;
  ad: string;
  kategoriId: string;
  kategori?: Kategori;
  fiyatSecenekleri: number[];
  manuelFiyatVarMi: boolean;
  varsayilanFiyat?: number;
  aktifMi: boolean;
  olusturulmaTarihi: string;
  guncellenmeTarihi: string;
}

export interface SiparisOgesi {
  id?: string;
  urunId: string;
  urun?: Urun;
  miktar: number;
  birimFiyat: number;
  toplamFiyat: number;
}

export interface Siparis {
  id: string;
  kullaniciId: string;
  kullanici?: Kullanici;
  tur: SiparisTuru;
  toplamTutar: number;
  notlar?: string;
  ogeler: SiparisOgesi[];
  olusturulmaTarihi: string;
  guncellenmeTarihi: string;
}

export interface Odeme {
  id: string;
  kullaniciId: string;
  kullanici?: Kullanici;
  tutar: number;
  notlar?: string;
  olusturulmaTarihi: string;
}

export interface Gider {
  id: string;
  aciklama: string;
  tutar: number;
  olusturulmaTarihi: string;
}

export interface GirisYaniti {
  kullanici: Kullanici;
  token: string;
}

export interface KayitOlusturmaDto {
  ad: string;
  soyad: string;
  telefon: string;
  sifre: string;
  rol?: KullaniciRolu;
}

export interface GirisYapmaDto {
  telefon: string;
  sifre: string;
}

export interface SiparisOlusturmaDto {
  kullaniciId: string;
  tur?: SiparisTuru;
  ogeler: {
    urunId: string;
    miktar: number;
    birimFiyat: number;
  }[];
  notlar?: string;
}

export interface OdemeOlusturmaDto {
  kullaniciId: string;
  tutar: number;
  notlar?: string;
}