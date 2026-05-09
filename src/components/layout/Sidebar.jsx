import React, { useState } from 'react';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, GraduationCap, Bus, Route, Calendar, ClipboardList, AlertTriangle, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sidebar({ active, onNav, collapsed, onCollapse }) {
  const { t } = useLang();
  const { logout, isAdmin } = useAuth();

  const adminGroups = [
    { label: 'Overview', items: [{ id:'dashboard', label:t.nav.dashboard, icon:LayoutDashboard }] },
    { label: 'Management', items: [
      { id:'students', label:t.nav.students, icon:GraduationCap },
      { id:'buses', label:t.nav.buses, icon:Bus },
      { id:'lines', label:t.nav.lines, icon:Route },
      { id:'schedules', label:t.nav.schedules, icon:Calendar },
    ]},
    { label: 'Operations', items: [
      { id:'trips', label:t.nav.trips, icon:ClipboardList },
      { id:'incidents', label:t.nav.incidents, icon:AlertTriangle, badge:3 },
    ]},
  ];

  const studentGroups = [
    { label: 'Overview', items: [{ id:'dashboard', label:t.nav.dashboard, icon:LayoutDashboard }] },
    { label: 'Transport', items: [
      { id:'schedules', label:t.nav.schedules, icon:Calendar },
      { id:'lines', label:t.nav.lines, icon:Route },
    ]},
  ];

  const groups = isAdmin ? adminGroups : studentGroups;

  return (
    <aside className={`fixed top-0 left-0 h-full z-30 bg-surface border-r border-border flex flex-col transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[260px]'}`}>
      {/* Brand */}
      <div className={`flex items-center h-16 border-b border-border flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'px-5'}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-700 via-primary to-accent flex items-center justify-center flex-shrink-0">
          <Bus size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="ml-2.5">
            <div className="font-bold text-sm text-foreground leading-none">UniTransport</div>
            <div className="text-xs text-muted">USTHB</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {groups.map((g, gi) => (
          <div key={gi} className="mb-5">
            {!collapsed && <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{g.label}</p>}
            <ul className="space-y-0.5">
              {g.items.map(item => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onNav(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer
                        ${isActive ? 'bg-primary-light text-primary font-semibold' : 'text-muted hover:bg-surface-alt hover:text-foreground'}
                        ${collapsed ? 'justify-center px-0 w-11 h-11 mx-auto' : ''}`}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span className="ml-auto bg-red-100 text-danger text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{item.badge}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border px-3 py-3 flex-shrink-0 space-y-0.5">
        <button onClick={() => onNav('settings')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-surface-alt hover:text-foreground transition-all ${collapsed ? 'justify-center px-0 w-11 h-11 mx-auto' : ''}`}>
          <Settings size={18} />{!collapsed && <span>{t.nav.settings}</span>}
        </button>
        <button onClick={logout} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-red-50 hover:text-danger transition-all ${collapsed ? 'justify-center px-0 w-11 h-11 mx-auto' : ''}`}>
          <LogOut size={18} />{!collapsed && <span>{t.nav.signOut}</span>}
        </button>
        {/* Collapse toggle */}
        <button onClick={onCollapse} className="w-full flex items-center justify-center py-2 text-muted hover:text-foreground transition-colors">
          {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
        </button>
      </div>
    </aside>
  );
}
