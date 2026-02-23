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
  Kanban,
  ChevronRight,
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
      ],
    },
    {
      title: 'RECURSOS',
      items: [
        { icon: Bot,      label: 'Agentes',      path: '/workspace/agents' },
        { icon: BookOpen, label: 'Habilidades',  path: '/workspace/skills' },
        { icon: Database, label: 'CRMs',         path: '/workspace/crms' },
      ],
    },
    {
      title: 'GERENCIAMENTO',
      items: [
        { icon: Users,    label: 'Acessos',      path: '/workspace/users' },
        { icon: Settings, label: 'Preferências', path: '/workspace/settings' },
      ],
    },
    {
      title: 'CADASTROS',
      items: [
        { icon: Kanban, label: 'Quadros', path: '/workspace/kanban' },
      ],
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('selected_organization_id');
    localStorage.removeItem('selected_organization_slug');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  /* ── Sidebar Content ─────────────────────────────────────────────── */
  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => {
    const [hoveredItem, setHoveredItem] = useState<{ label: string; top: number } | null>(null);

    return (
      <div className="flex flex-col h-full bg-transparent">

        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-[#272b3a] flex-shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="bg-gradient-to-br from-[#5e6ad2] to-[#7c3aed] p-1.5 rounded-lg flex-shrink-0 shadow-[0_0_14px_rgba(94,106,210,0.35)]">
            <Bot className="h-5 w-5 text-white" {...ICON_PROPS} />
          </div>
          {!collapsed && (
            <span className="text-[17px] font-bold text-[#eef0f6] tracking-tight">Vora</span>
          )}
        </div>

        {/* Workspace Switcher */}
        <div className={`p-3 border-b border-[#272b3a] flex-shrink-0 ${collapsed ? 'px-2' : ''}`}>
          <WorkspaceSwitcher collapsed={collapsed} />
        </div>

        {/* Navigation */}
        <nav
          className={`flex-1 py-3 overflow-y-auto overflow-x-hidden space-y-5
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']
            ${collapsed ? 'px-2' : 'px-3'}`}
        >
          {!currentWorkspace ? (
            <div className="p-4 bg-[#181b22] rounded-xl border border-[#272b3a] text-center">
              {!collapsed ? (
                <p className="text-sm text-[#8b90a8]">Selecione ou crie um workspace.</p>
              ) : (
                <LayoutDashboard className="h-5 w-5 mx-auto text-[#8b90a8]" {...ICON_PROPS} />
              )}
            </div>
          ) : (
            menuGroups.map((group, index) => (
              <div key={index} className={collapsed ? 'flex flex-col items-center w-full' : ''}>
                {!collapsed ? (
                  <h3 className="text-[10px] font-semibold text-[#555b72] uppercase tracking-widest mb-2 px-2">
                    {group.title}
                  </h3>
                ) : (
                  <div className="w-6 h-px bg-[#272b3a] my-1.5" />
                )}

                <div className="space-y-0.5 w-full flex flex-col items-center">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                        onMouseEnter={(e) => {
                          if (collapsed) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredItem({ label: item.label, top: rect.top + rect.height / 2 });
                          }
                        }}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`
                          flex items-center transition-all duration-150 relative group border
                          ${collapsed
                            ? 'w-10 h-10 justify-center rounded-xl mx-auto'
                            : 'w-full gap-2.5 px-3 py-2 rounded-lg text-sm font-medium'
                          }
                          ${active
                            ? collapsed
                              ? 'bg-[rgba(94,106,210,0.18)] text-[#5e6ad2] border-[#5e6ad2]/30'
                              : 'bg-[rgba(94,106,210,0.12)] text-[#5e6ad2] border-[#5e6ad2]/25'
                            : 'text-[#8b90a8] hover:bg-[#1f2330] hover:text-[#eef0f6] border-transparent hover:border-[#272b3a]'
                          }
                        `}
                      >
                        {/* Active left bar indicator */}
                        {active && !collapsed && (
                          <span className="absolute left-0 top-[18%] bottom-[18%] w-[3px] bg-[#5e6ad2] rounded-r-full" />
                        )}

                        <Icon
                          className={`flex-shrink-0 transition-colors ${collapsed ? 'h-5 w-5' : 'h-4 w-4'} ${active ? 'text-[#5e6ad2]' : 'text-[#8b90a8] group-hover:text-[#eef0f6]'}`}
                          {...ICON_PROPS}
                        />

                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#5e6ad2] text-white rounded-full">
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

        {/* Collapsed tooltip */}
        {collapsed && hoveredItem && (
          <div
            className="fixed left-20 ml-2 px-2.5 py-1.5 bg-[#1f2330] text-[#eef0f6] text-xs font-medium rounded-lg border border-[#272b3a] z-[9999] whitespace-nowrap pointer-events-none shadow-lg"
            style={{ top: hoveredItem.top, transform: 'translateY(-50%)' }}
          >
            {hoveredItem.label}
            <div className="absolute left-0 top-1/2 -translate-x-[3px] -translate-y-1/2 w-2 h-2 bg-[#1f2330] border-l border-b border-[#272b3a] rotate-45" />
          </div>
        )}
      </div>
    );
  };

  /* ── Main Layout ─────────────────────────────────────────────────── */
  return (
    <div className="flex h-screen bg-[#0d0f14] text-[#eef0f6] overflow-hidden">

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col bg-[#111318] border-r border-[#272b3a] h-full overflow-hidden transition-all duration-300 flex-shrink-0 ${
          desktopSidebarOpen ? 'w-[230px]' : 'w-[72px]'
        }`}
      >
        <SidebarContent collapsed={!desktopSidebarOpen} />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-[230px] bg-[#111318] border-r border-[#272b3a] z-50 lg:hidden flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-[#272b3a]">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-[#5e6ad2] to-[#7c3aed] p-1.5 rounded-lg shadow-[0_0_14px_rgba(94,106,210,0.35)]">
                  <Bot className="h-5 w-5 text-white" {...ICON_PROPS} />
                </div>
                <span className="text-[17px] font-bold text-[#eef0f6] tracking-tight">Vora</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1f2330] border border-transparent hover:border-[#272b3a] transition-all"
              >
                <X className="h-4 w-4 text-[#8b90a8]" {...ICON_PROPS} />
              </button>
            </div>
            <SidebarContent collapsed={false} />
          </aside>
        </>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Desktop Topbar */}
        <header className="hidden lg:flex h-14 bg-[#111318] border-b border-[#272b3a] items-center justify-between px-5 z-30 flex-shrink-0">

          {/* Left side */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
              className="w-9 h-9 flex items-center justify-center text-[#8b90a8] hover:bg-[#1f2330] rounded-lg transition-all border border-transparent hover:border-[#272b3a]"
              title={desktopSidebarOpen ? 'Recolher menu' : 'Expandir menu'}
            >
              <PanelLeft className="h-4 w-4" {...ICON_PROPS} />
            </button>

            <div className="h-5 w-px bg-[#272b3a]" />

            <div className="ml-4">
               <OrganizationSwitcher />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="w-9 h-9 flex items-center justify-center text-[#8b90a8] hover:bg-[#1f2330] rounded-lg transition-all border border-transparent hover:border-[#272b3a]"
              title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
            >
              {theme === 'light'
                ? <Moon className="h-4 w-4" {...ICON_PROPS} />
                : <Sun  className="h-4 w-4" {...ICON_PROPS} />
              }
            </button>

            <button className="relative w-9 h-9 flex items-center justify-center text-[#8b90a8] hover:bg-[#1f2330] rounded-lg transition-all border border-transparent hover:border-[#272b3a]">
              <Bell className="h-4 w-4" {...ICON_PROPS} />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-red-500 rounded-full border-2 border-[#111318]" />
            </button>

            <div className="h-5 w-px bg-[#272b3a]" />

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="h-8 w-8 rounded-full overflow-hidden border-2 border-[#272b3a] hover:border-[#5e6ad2] transition-all"
              >
                <img src="/robot.png" alt="Foto de perfil" className="h-full w-full object-cover" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-[#1f2330] rounded-xl shadow-xl border border-[#272b3a] z-20 overflow-hidden">
                    <div className="px-3 py-3 border-b border-[#272b3a]">
                      <p className="text-sm font-semibold text-[#eef0f6]">Minha conta</p>
                      <p className="text-xs text-[#8b90a8] mt-0.5">Gerenciar perfil e configurações</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#eef0f6] hover:bg-[#252a38] rounded-lg transition-colors"
                      >
                        <UserIcon className="h-4 w-4 text-[#8b90a8]" {...ICON_PROPS} />
                        Perfil
                        <ChevronRight className="h-3.5 w-3.5 text-[#555b72] ml-auto" />
                      </button>
                      <button
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#eef0f6] hover:bg-[#252a38] rounded-lg transition-colors"
                      >
                        <Settings className="h-4 w-4 text-[#8b90a8]" {...ICON_PROPS} />
                        Preferências
                        <ChevronRight className="h-3.5 w-3.5 text-[#555b72] ml-auto" />
                      </button>
                    </div>
                    <div className="p-1.5 border-t border-[#272b3a]">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="h-4 w-4" {...ICON_PROPS} />
                        Sair
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#0d0f14]">

          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[#272b3a] bg-[#111318]">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#1f2330] border border-transparent hover:border-[#272b3a] transition-all"
            >
              <Menu className="h-5 w-5 text-[#eef0f6]" {...ICON_PROPS} />
            </button>

            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-[#5e6ad2] to-[#7c3aed] p-1.5 rounded-lg">
                <Bot className="h-4 w-4 text-white" {...ICON_PROPS} />
              </div>
              <span className="font-bold text-[#eef0f6]">Vora</span>
            </div>

            <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-[#272b3a]">
              <img src="/robot.png" alt="Avatar" className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
