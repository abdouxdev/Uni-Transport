import React from 'react';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { User, Globe, Bell, Shield, Key } from 'lucide-react';

export default function SettingsPage() {
  const { t, locale, setLocale } = useLang();
  const { user } = useAuth();

  const handleLanguageChange = (e) => {
    setLocale(e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.nav?.settings || 'Paramètres'}</h1>
        <p className="text-muted mt-1">Gérez vos préférences de compte et les paramètres de l'application.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar for settings (Visual only for now) */}
        <div className="col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-primary-light text-primary font-medium rounded-lg text-sm text-left">
            <User size={18} /> Profil
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-muted hover:bg-surface-alt hover:text-foreground font-medium rounded-lg text-sm text-left transition-colors">
            <Globe size={18} /> Langue & Région
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-muted hover:bg-surface-alt hover:text-foreground font-medium rounded-lg text-sm text-left transition-colors">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-muted hover:bg-surface-alt hover:text-foreground font-medium rounded-lg text-sm text-left transition-colors">
            <Shield size={18} /> Sécurité
          </button>
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          
          {/* Profile Section */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="text-primary" size={20} /> Informations Personnelles
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Nom</label>
                  <div className="px-3 py-2 bg-surface-alt border border-border rounded-lg text-sm text-foreground">
                    {user?.nom || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Prénom</label>
                  <div className="px-3 py-2 bg-surface-alt border border-border rounded-lg text-sm text-foreground">
                    {user?.prenom || 'N/A'}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Adresse Email</label>
                <div className="px-3 py-2 bg-surface-alt border border-border rounded-lg text-sm text-foreground">
                  {user?.email || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Rôle</label>
                <div className="px-3 py-2 bg-surface-alt border border-border rounded-lg text-sm text-foreground capitalize">
                  {user?.role || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="text-primary" size={20} /> Préférences
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Langue de l'interface</label>
                <select 
                  value={locale}
                  onChange={handleLanguageChange}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="fr">Français (FR)</option>
                  <option value="en">English (EN)</option>
                  <option value="ar">العربية (AR)</option>
                </select>
                <p className="text-xs text-muted mt-2">Choisissez la langue d'affichage de l'application.</p>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Key className="text-primary" size={20} /> Sécurité
            </h2>
            <div className="space-y-4">
              <button className="px-4 py-2 bg-surface-alt border border-border hover:bg-border transition-colors rounded-lg text-sm font-medium">
                Changer le mot de passe
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
