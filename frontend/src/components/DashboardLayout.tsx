import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bot,
  BookOpen,
  Settings,
  Users,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Bell,
  User as UserIcon,
  Sun,
  Moon,
  PanelLeft,
  Database,
  Kanban
} from 'lucide-react';
import { OrganizationSwitcher } from './OrganizationSwitcher';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { useWorkspace } from '../contexts/WorkspaceContext';

const ICON_PROPS = { strokeWidth: 1.5 };

interface DashboardLayoutProps {
  children: ReactNode;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentWorkspace } = useWorkspace();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const menuGroups: MenuGroup[] = [
    {
      title: 'VISÃO GERAL',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/workspace/dashboard' },
      ]
    },
    {
      title: 'RECURSOS',
      items: [
        { icon: Bot, label: 'Agentes', path: '/workspace/agents' },
        { icon: BookOpen, label: 'Habilidades', path: '/workspace/skills' },
        { icon: Database, label: 'CRMs', path: '/workspace/crms' },
      ]
    },
    {
      title: 'GERENCIAMENTO',
      items: [
        { icon: Users, label: 'Acessos', path: '/workspace/users' },
        { icon: Settings, label: 'Preferências', path: '/workspace/settings' },
      ]
    },
    {
      title: 'CADASTROS',
      items: [
        { icon: Kanban, label: 'Quadros', path: '/workspace/kanban' },
      ]
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('selected_organization_id');
    localStorage.removeItem('selected_organization_slug');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => {
    const [hoveredItem, setHoveredItem] = useState<{ label: string, top: number } | null>(null);

    return (
    <div className="flex flex-col h-full bg-transparent transition-colors duration-200">
      {/* Sidebar Header (Logo) */}
      <div className={`flex items-center h-16 px-4 border-b border-[#222326] ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="bg-[#1a1d21] p-1.5 rounded-lg flex-shrink-0 border border-[#222326]">
          <Bot className="h-5 w-5 text-[#f7f8f8]" {...ICON_PROPS} />
        </div>
        {!collapsed && (
          <span className="text-xl font-semibold text-[#f7f8f8] tracking-tight">Vora</span>
        )}
      </div>

      {/* Seletores */}
      <div className={`p-4 space-y-4 ${collapsed ? 'px-2' : ''}`}>
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      {/* Menu de Navegação */}
      <nav className={`flex-1 py-2 overflow-y-auto overflow-x-hidden space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] ${collapsed ? 'px-2' : 'px-4'}`}>
        {!currentWorkspace ? (
          <div className="p-4 bg-[#121417] rounded-xl border border-[#222326] text-center">
            {!collapsed ? (
              <p className="text-sm text-[#8a8f98]">
                Selecione ou crie um workspace.
              </p>
            ) : (
              <LayoutDashboard className="h-5 w-5 mx-auto text-[#8a8f98]" {...ICON_PROPS} />
            )}
          </div>
        ) : (
          menuGroups.map((group, index) => (
            <div key={index} className={collapsed ? 'flex flex-col items-center w-full' : ''}>
              {!collapsed ? (
                <h3 className="text-xs font-semibold text-[#8a8f98] uppercase tracking-wider mb-2 px-2">
                  {group.title}
                </h3>
              ) : (
                <div className="w-8 h-px bg-[#222326] my-2" />
              )}
              <div className="space-y-1 w-full flex flex-col items-center">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                      onMouseEnter={(e) => {
                        if (collapsed) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredItem({ label: item.label, top: rect.top + (rect.height / 2) });
                        }
                      }}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`flex items-center transition-colors relative group border border-transparent ${
                        collapsed
                          ? 'w-10 h-10 justify-center rounded-xl mx-auto'
                          : 'w-full gap-3 px-3 py-2 rounded-lg text-sm font-medium'
                      } ${
                        active
                          ? 'bg-[#1a1d21] text-[#f7f8f8] border-[#2e3035]'
                          : 'text-[#8a8f98] hover:bg-[#15181c] hover:text-[#f7f8f8] hover:border-[#2e3035]'
                      }`}
                      title={undefined}
                    >
                      <Icon
                        className={`flex-shrink-0 ${collapsed ? 'h-5 w-5' : 'h-4 w-4'} ${active ? 'text-[#f7f8f8]' : 'text-[#8a8f98] group-hover:text-[#f7f8f8]'}`}
                        {...ICON_PROPS}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-[#1a1d21] text-[#f7f8f8] rounded-full border border-[#222326]">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </nav>

      {/* Portal/Fixed Tooltip for collapsed state */}
      {collapsed && hoveredItem && (
        <div 
          className="fixed left-20 ml-2 px-2 py-1 bg-[#121417] text-[#f7f8f8] text-xs rounded border border-[#222326] z-[9999] whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150"
          style={{ top: hoveredItem.top, transform: 'translateY(-50%)' }}
        >
          {hoveredItem.label}
          {/* Seta indicativa */}
          <div className="absolute left-0 top-1/2 -translate-x-[3px] -translate-y-1/2 w-2 h-2 bg-[#121417] border-l border-b border-[#222326] rotate-45" />
        </div>
      )}
    </div>
  )};

  return (
    <div className="flex h-screen bg-[#08090a] text-[#f7f8f8] transition-colors duration-200 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside 
        className={`hidden lg:flex lg:flex-col bg-[#121417] border-r border-[#222326] h-full overflow-hidden transition-all duration-300 ${
          desktopSidebarOpen ? 'w-72' : 'w-20'
        }`}
      >
        <SidebarContent collapsed={!desktopSidebarOpen} />
      </aside>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-[#121417] border-r border-[#222326] z-50 lg:hidden flex flex-col">
            <div className="h-16 flex items-center justify-between px-6 border-b border-[#222326]">
              <span className="text-xl font-semibold text-[#f7f8f8]">Vora</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-[#15181c] border border-transparent hover:border-[#2e3035]"
              >
                <X className="h-5 w-5 text-[#8a8f98]" {...ICON_PROPS} />
              </button>
            </div>
            <SidebarContent collapsed={false} />
          </aside>
        </>
      )}

      {/* Área Principal (Header + Conteúdo) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar Desktop */}
        <header className="hidden lg:flex h-14 bg-[#121417] border-b border-[#222326] items-center justify-between px-6 z-30 flex-shrink-0 transition-colors duration-200">
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle */}
            <button
              onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
              className="p-2 text-[#8a8f98] hover:bg-[#15181c] rounded-lg transition-colors border border-transparent hover:border-[#2e3035]"
              title={desktopSidebarOpen ? "Recolher menu" : "Expandir menu"}
            >
              <PanelLeft className="h-5 w-5" {...ICON_PROPS} />
            </button>

            {/* Organization Switcher */}
            <div className="ml-4">
               <OrganizationSwitcher />
            </div>
          </div>

          {/* Ações Direita */}
          <div className="flex items-center gap-4">
             {/* Theme Toggle */}
             <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 text-[#8a8f98] hover:bg-[#15181c] rounded-full transition-colors border border-transparent hover:border-[#2e3035]"
              title={theme === 'light' ? "Modo escuro" : "Modo claro"}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" {...ICON_PROPS} /> : <Sun className="h-5 w-5" {...ICON_PROPS} />}
            </button>

            {/* Notificações */}
            <button className="relative p-2 text-[#8a8f98] hover:bg-[#15181c] rounded-full transition-colors border border-transparent hover:border-[#2e3035]">
              <Bell className="h-5 w-5" {...ICON_PROPS} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-[#121417]" />
            </button>

            {/* Perfil */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="h-9 w-9 rounded-full overflow-hidden border border-[#222326] hover:border-[#2e3035] transition-colors"
                title="Menu do usuário"
              >
                <img
                  src="/robot.png"
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#121417] rounded-lg shadow-lg border border-[#222326] z-20 overflow-hidden">
                    <button
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#f7f8f8] hover:bg-[#15181c] transition-colors"
                    >
                      <UserIcon className="h-4 w-4 text-[#8a8f98]" {...ICON_PROPS} />
                      Perfil
                    </button>
                    <button
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#f7f8f8] hover:bg-[#15181c] transition-colors"
                    >
                      <Settings className="h-4 w-4 text-[#8a8f98]" {...ICON_PROPS} />
                      Preferências
                    </button>
                    <div className="h-px bg-[#222326]" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#f7f8f8] hover:bg-[#15181c] transition-colors"
                    >
                      <LogOut className="h-4 w-4 text-[#8a8f98]" {...ICON_PROPS} />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-y-auto bg-[#08090a] p-6 transition-colors duration-200">
          {/* Header Mobile */}
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-[#15181c] border border-transparent hover:border-[#2e3035]"
            >
              <Menu className="h-6 w-6 text-[#f7f8f8]" {...ICON_PROPS} />
            </button>
            
            {/* Logo Mobile */}
            <div className="flex items-center gap-2">
              <div className="bg-[#1a1d21] p-1.5 rounded-lg border border-[#222326]">
                <Bot className="h-4 w-4 text-[#f7f8f8]" {...ICON_PROPS} />
              </div>
              <span className="font-semibold text-[#f7f8f8]">Vora</span>
            </div>

            {/* Avatar Mobile */}
            <div className="h-8 w-8 bg-[#1a1d21] rounded-full flex items-center justify-center border border-[#222326]">
              <UserIcon className="h-4 w-4 text-[#f7f8f8]" {...ICON_PROPS} />
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );

};
