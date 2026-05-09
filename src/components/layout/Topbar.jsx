import React, { useState, useEffect } from 'react';
import { Search, Bell, Sun, Moon, Globe, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';

export default function Topbar() {
  const { dark, toggle } = useTheme();
  const { locale, setLocale, t } = useLang();
  const { user } = useAuth();
  const [clock, setClock] = useState(new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => { const id = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(id); }, []);

  const notifications = [
    { id:1, text: t.notifications.newRequest, time: '8 min', type: 'info' },
    { id:2, text: t.notifications.accepted, time: '22 min', type: 'success' },
    { id:3, text: t.notifications.announcement, time: '1h', type: 'warning' },
  ];

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center px-4 lg:px-6 gap-4 flex-shrink-0 sticky top-0 z-10">
      {/* Search */}
      <div className="flex-1 max-w-sm hidden md:flex relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input type="text" placeholder={`${t.common.search}...`}
          className="w-full pl-9 pr-3 py-2 bg-surface-alt border border-border rounded-lg text-sm text-foreground placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>

      <div className="flex-1" />

      {/* Live clock */}
      <div className="hidden lg:flex flex-col items-end text-xs">
        <span className="font-semibold text-foreground tabular-nums">{clock.toLocaleTimeString(locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-FR' : 'en-US')}</span>
        <span className="text-muted">{clock.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-FR' : 'en-US', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}</span>
      </div>

      {/* Language */}
      <div className="relative">
        <button onClick={() => { setLangOpen(!langOpen); setNotifOpen(false); }} className="p-2 rounded-lg text-muted hover:bg-surface-alt hover:text-foreground transition-all">
          <Globe size={18} />
        </button>
        {langOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-36 bg-surface border border-border rounded-xl shadow-xl z-50 py-1 animate-fade-in">
              {[['en','English'],['fr','Français'],['ar','العربية']].map(([code, label]) => (
                <button key={code} onClick={() => { setLocale(code); setLangOpen(false); }}
                  className={`w-full px-4 py-2 text-sm text-left hover:bg-surface-alt transition-colors ${locale===code?'text-primary font-semibold':'text-foreground'}`}>
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Theme toggle */}
      <button onClick={toggle} className="p-2 rounded-lg text-muted hover:bg-surface-alt hover:text-foreground transition-all">
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Notifications */}
      <div className="relative">
        <button onClick={() => { setNotifOpen(!notifOpen); setLangOpen(false); }} className="p-2 rounded-lg text-muted hover:bg-surface-alt hover:text-foreground transition-all relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>
        {notifOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-xl z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <p className="font-semibold text-sm text-foreground">{t.notifications.title}</p>
                <span className="text-xs text-primary font-medium cursor-pointer hover:underline">{t.notifications.markAllRead}</span>
              </div>
              <ul className="divide-y divide-border max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <li key={n.id} className="px-4 py-3 hover:bg-surface-alt transition-colors cursor-pointer">
                    <p className="text-sm text-foreground">{n.text}</p>
                    <p className="text-xs text-muted mt-0.5">{n.time}</p>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-2.5 border-t border-border">
                <span className="text-xs text-primary font-medium cursor-pointer hover:underline">{t.notifications.viewAll}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Profile */}
      <div className="flex items-center gap-2.5 cursor-pointer">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 via-primary to-accent flex items-center justify-center text-white text-xs font-bold">
          {user?.prenom?.[0]}{user?.nom?.[0]}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-foreground leading-none">{user?.prenom} {user?.nom}</p>
          <span className="text-xs text-primary font-medium capitalize">{user?.role}</span>
        </div>
      </div>
    </header>
  );
}
