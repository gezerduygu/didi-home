import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, LogIn, LogOut, Mail, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  girisYap,
  hesapOlustur,
  sifreSifirlamaGonder,
  yeniSifreBelirle,
  cikisYap,
  girisHatasiniCevir
} from '../auth';

/**
 * Yönetici giriş ekranı (Aşama 2).
 * Görünüm, önceki şifre kartıyla aynı tutuldu; yalnızca içerik değişti.
 *
 * Akışlar:
 *  · giris          : e-posta + şifre
 *  · kayit          : ilk kurulum — hesap oluştur, e-postadaki onay bağlantısına tıkla
 *  · sifre-unuttum  : şifre sıfırlama bağlantısı gönder
 *  · yeni-sifre     : e-postadaki bağlantıdan gelindiğinde yeni şifre belirle
 *  · yetkisiz       : giriş yapılmış ama e-posta yönetici listesinde değil
 */

type Mod = 'giris' | 'kayit' | 'sifre-unuttum';

interface AdminLoginProps {
  oturumEposta: string | null;
  sifreYenilemeModu: boolean;
  onSifreYenilendi: () => void;
  onClose: () => void;
}

const EN_AZ_SIFRE = 8;

const inputSinifi =
  'w-full bg-transparent border border-brand-sand focus:border-brand-charcoal px-3 py-2.5 rounded-[2px] text-sm text-brand-charcoal outline-none transition-all';
const etiketSinifi = 'block text-[10px] font-medium text-brand-warmgray uppercase tracking-widest mb-1.5';

export default function AdminLogin({ oturumEposta, sifreYenilemeModu, onSifreYenilendi, onClose }: AdminLoginProps) {
  const { language } = useLanguage();
  const tr = language === 'tr';

  const [mod, setMod] = useState<Mod>('giris');
  const [eposta, setEposta] = useState('');
  const [sifre, setSifre] = useState('');
  const [sifreTekrar, setSifreTekrar] = useState('');
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState('');
  const [bilgi, setBilgi] = useState('');

  const modDegistir = (yeni: Mod) => {
    setMod(yeni);
    setHata('');
    setBilgi('');
    setSifre('');
    setSifreTekrar('');
  };

  const calistir = async (islem: () => Promise<void>) => {
    setHata('');
    setBilgi('');
    setBekliyor(true);
    try {
      await islem();
    } catch (e) {
      setHata(girisHatasiniCevir(e instanceof Error ? e.message : String(e), language));
    } finally {
      setBekliyor(false);
    }
  };

  const sifreleriKontrolEt = (): boolean => {
    if (sifre.length < EN_AZ_SIFRE) {
      setHata(tr ? `Şifre en az ${EN_AZ_SIFRE} karakter olmalı.` : `Password must be at least ${EN_AZ_SIFRE} characters.`);
      return false;
    }
    if (sifre !== sifreTekrar) {
      setHata(tr ? 'Şifreler birbiriyle aynı değil.' : 'Passwords do not match.');
      return false;
    }
    return true;
  };

  const gonder = (e: React.FormEvent) => {
    e.preventDefault();

    if (sifreYenilemeModu) {
      if (!sifreleriKontrolEt()) return;
      calistir(async () => {
        await yeniSifreBelirle(sifre);
        onSifreYenilendi();
      });
      return;
    }

    if (mod === 'giris') {
      calistir(async () => {
        await girisYap(eposta, sifre);
      });
    } else if (mod === 'kayit') {
      if (!sifreleriKontrolEt()) return;
      calistir(async () => {
        await hesapOlustur(eposta, sifre);
        setBilgi(
          tr
            ? 'Hesap oluşturuldu. E-posta adresinize bir onay bağlantısı gönderdik; bağlantıya tıkladığınızda panele giriş yapmış olacaksınız.'
            : 'Account created. We sent a confirmation link to your email; clicking it will sign you in.'
        );
      });
    } else {
      calistir(async () => {
        await sifreSifirlamaGonder(eposta);
        setBilgi(
          tr
            ? 'Şifre belirleme bağlantısı e-posta adresinize gönderildi. Gelen kutunuzu (ve istenmeyen klasörünü) kontrol edin.'
            : 'A password link was sent to your email. Check your inbox (and spam folder).'
        );
      });
    }
  };

  // ---------- Başlık ve buton metinleri ----------
  const yetkisiz = Boolean(oturumEposta) && !sifreYenilemeModu;

  const baslik = sifreYenilemeModu
    ? tr ? 'Yeni Şifre Belirle' : 'Set New Password'
    : yetkisiz
      ? tr ? 'Yetkisiz Hesap' : 'Unauthorized Account'
      : mod === 'kayit'
        ? tr ? 'Yönetici Hesabı Oluştur' : 'Create Admin Account'
        : mod === 'sifre-unuttum'
          ? tr ? 'Şifremi Unuttum' : 'Forgot Password'
          : tr ? 'Yönetici Girişi' : 'Admin Panel Login';

  const butonMetni = sifreYenilemeModu
    ? tr ? 'ŞİFREYİ KAYDET' : 'SAVE PASSWORD'
    : mod === 'kayit'
      ? tr ? 'HESABI OLUŞTUR' : 'CREATE ACCOUNT'
      : mod === 'sifre-unuttum'
        ? tr ? 'BAĞLANTI GÖNDER' : 'SEND LINK'
        : tr ? 'GİRİŞ YAP' : 'LOGIN';

  const epostaGerekli = !sifreYenilemeModu;
  const sifreGerekli = sifreYenilemeModu || mod !== 'sifre-unuttum';
  const tekrarGerekli = sifreYenilemeModu || mod === 'kayit';

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 font-sans">
      <motion.div
        className="w-full max-w-md bg-brand-beige border border-brand-sand/50 rounded-sm p-8 shadow-xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-12 h-12 bg-brand-sand/30 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-terracotta">
          {sifreYenilemeModu ? <KeyRound size={20} /> : <Lock size={20} />}
        </div>
        <span className="text-[10px] font-sans tracking-[0.3em] text-brand-terracotta uppercase block mb-1">Didi Home</span>
        <h2 className="font-serif text-2xl font-light text-brand-charcoal mb-6">{baslik}</h2>

        {/* Giriş yapılmış ama yönetici değil */}
        {yetkisiz ? (
          <div className="space-y-4">
            <p className="text-xs text-brand-warmgray leading-relaxed">
              {tr
                ? `"${oturumEposta}" hesabı yönetici olarak tanımlı değil.`
                : `"${oturumEposta}" is not registered as an administrator.`}
            </p>
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-brand-sand hover:border-brand-charcoal text-brand-charcoal text-xs tracking-widest uppercase transition-colors rounded-[2px]"
              >
                {tr ? 'MAĞAZAYA DÖN' : 'RETURN TO SHOP'}
              </button>
              <button
                type="button"
                onClick={() => cikisYap()}
                className="flex-1 py-2.5 bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-beige text-xs tracking-widest uppercase transition-colors rounded-[2px] flex items-center justify-center gap-1.5"
              >
                <LogOut size={13} />
                {tr ? 'ÇIKIŞ YAP' : 'LOGOUT'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={gonder} className="space-y-4 text-left">
            {epostaGerekli && (
              <div>
                <label className={etiketSinifi}>{tr ? 'E-POSTA' : 'EMAIL'}</label>
                <input
                  type="email"
                  value={eposta}
                  onChange={(e) => setEposta(e.target.value)}
                  placeholder={tr ? 'ornek@eposta.com' : 'name@example.com'}
                  className={inputSinifi}
                  autoComplete="email"
                  required
                  autoFocus
                />
              </div>
            )}

            {sifreGerekli && (
              <div>
                <label className={etiketSinifi}>
                  {sifreYenilemeModu ? (tr ? 'YENİ ŞİFRE' : 'NEW PASSWORD') : tr ? 'ŞİFRE' : 'PASSWORD'}
                </label>
                <input
                  type="password"
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  placeholder={tekrarGerekli ? (tr ? `En az ${EN_AZ_SIFRE} karakter` : `At least ${EN_AZ_SIFRE} characters`) : '••••••••'}
                  className={inputSinifi}
                  autoComplete={tekrarGerekli ? 'new-password' : 'current-password'}
                  required
                  autoFocus={sifreYenilemeModu}
                />
              </div>
            )}

            {tekrarGerekli && (
              <div>
                <label className={etiketSinifi}>{tr ? 'ŞİFRE (TEKRAR)' : 'PASSWORD (AGAIN)'}</label>
                <input
                  type="password"
                  value={sifreTekrar}
                  onChange={(e) => setSifreTekrar(e.target.value)}
                  className={inputSinifi}
                  autoComplete="new-password"
                  required
                />
              </div>
            )}

            {hata && <p className="text-xs text-brand-terracotta font-medium tracking-wide text-center">{hata}</p>}

            {bilgi && (
              <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-[2px] p-3 leading-relaxed flex gap-2">
                <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                <span>{bilgi}</span>
              </p>
            )}

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-brand-sand hover:border-brand-charcoal text-brand-charcoal text-xs tracking-widest uppercase transition-colors rounded-[2px]"
              >
                {tr ? 'MAĞAZAYA DÖN' : 'RETURN TO SHOP'}
              </button>
              <button
                type="submit"
                disabled={bekliyor}
                className="flex-1 py-2.5 bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-beige text-xs tracking-widest uppercase transition-colors rounded-[2px] flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {bekliyor ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : mod === 'sifre-unuttum' && !sifreYenilemeModu ? (
                  <Mail size={13} />
                ) : (
                  <LogIn size={13} />
                )}
                {butonMetni}
              </button>
            </div>

            {/* Mod değiştirme bağlantıları */}
            {!sifreYenilemeModu && (
              <div className="pt-3 border-t border-brand-sand/40 flex flex-col items-center gap-1.5 text-[11px] text-brand-warmgray">
                {mod !== 'giris' && (
                  <button type="button" onClick={() => modDegistir('giris')} className="hover:text-brand-charcoal underline underline-offset-2">
                    {tr ? 'Giriş ekranına dön' : 'Back to login'}
                  </button>
                )}
                {mod !== 'sifre-unuttum' && (
                  <button type="button" onClick={() => modDegistir('sifre-unuttum')} className="hover:text-brand-charcoal underline underline-offset-2">
                    {tr ? 'Şifremi unuttum' : 'Forgot password'}
                  </button>
                )}
                {mod !== 'kayit' && (
                  <button type="button" onClick={() => modDegistir('kayit')} className="hover:text-brand-charcoal underline underline-offset-2">
                    {tr ? 'İlk kez mi giriyorsunuz? Hesap oluşturun' : 'First time? Create your account'}
                  </button>
                )}
              </div>
            )}
          </form>
        )}
      </motion.div>
    </div>
  );
}
