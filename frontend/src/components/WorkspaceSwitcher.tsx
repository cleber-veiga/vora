import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Briefcase, Check, ChevronDown, Plus } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

export const WorkspaceSwitcher: React.FC<{ collapsed?: boolean }> = ({ collapsed }) => {
  const { currentWorkspace, workspaces, switchWorkspace, loading } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);

  /* Calcula posição do dropdown com base no botão trigger */
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      if (collapsed) {
        // Sidebar recolhida: abre à direita do botão
        setDropdownStyle({
          position: 'fixed',
          top: rect.top,
          left: rect.right + 8,
          width: 280,
          zIndex: 9999,
        });
      } else {
        // Sidebar expandida: abre abaixo do botão, alinhado à esquerda
        setDropdownStyle({
          position: 'fixed',
          top: rect.bottom + 6,
          left: rect.left,
          width: Math.max(rect.width, 280),
          zIndex: 9999,
        });
      }
    }
  }, [isOpen, collapsed]);

  /* Fecha ao redimensionar */
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => setIsOpen(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const getRoleLabel = (role?: string): string => {
    const roleMap: Record<string, string> = {
      MANAGER: 'Gerente',
      EDITOR: 'Editor',
      VIEWER: 'Visualizador',
    };
    return roleMap[role || ''] || 'Membro';
  };

  const handleSelectWorkspace = (workspaceId: number) => {
    switchWorkspace(workspaceId);
    setIsOpen(false);
  };

  /* ── Loading state ───────────────────────────────────────────────── */
  if (loading) {
    if (collapsed) {
      return (
        <div className="flex justify-center p-2">
          <div className="p-1.5 bg-[#1f2330] border border-[#272b3a] rounded-lg animate-pulse">
            <Briefcase className="h-4 w-4 text-[#eef0f6]" strokeWidth={1.5} />
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#272b3a] bg-[#1f2330]">
        <div className="p-1.5 bg-[#252a38] rounded-lg border border-[#272b3a] animate-pulse">
          <Briefcase className="h-4 w-4 text-[#eef0f6]" strokeWidth={1.5} />
        </div>
        <p className="text-sm text-[#8b90a8]">Carregando...</p>
      </div>
    );
  }

  /* ── No workspace state ──────────────────────────────────────────── */
  if (!currentWorkspace && workspaces.length === 0) {
    if (collapsed) {
      return (
        <>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex justify-center w-full p-2 rounded-lg hover:bg-[#1f2330] transition-colors"
            title="Criar novo Workspace"
          >
            <div className="p-1.5 bg-[#1f2330] border border-[#272b3a] rounded-lg">
              <Plus className="h-4 w-4 text-[#5e6ad2]" strokeWidth={1.5} />
            </div>
          </button>
          <CreateWorkspaceModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            onSuccess={() => {}}
          />
        </>
      );
    }
    return (
      <>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#272b3a]
            bg-transparent hover:bg-[#1f2330] transition-colors w-full"
        >
          <div className="p-1.5 bg-[#1f2330] rounded-lg border border-[#272b3a]">
            <Plus className="h-4 w-4 text-[#5e6ad2]" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-medium text-[#eef0f6]">Criar novo Workspace...</span>
        </button>
        <CreateWorkspaceModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={() => {}}
        />
      </>
    );
  }

  /* ── Dropdown content (rendered via portal) ──────────────────────── */
  const dropdownContent = isOpen
    ? ReactDOM.createPortal(
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <div
            style={dropdownStyle}
            className="bg-[#1f2330] rounded-xl shadow-2xl border border-[#272b3a] max-h-[400px] overflow-y-auto"
          >
            {workspaces.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1.5 text-[10px] font-bold text-[#555b72] uppercase tracking-widest">
                  Workspaces
                </p>
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => handleSelectWorkspace(workspace.id)}
                    className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg
                      hover:bg-[#252a38] transition-colors"
                  >
                    <div className="p-1.5 bg-[#252a38] rounded-lg border border-[#272b3a] flex-shrink-0">
                      <Briefcase className="h-4 w-4 text-[#5e6ad2]" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-[#eef0f6] truncate">
                        {workspace.name}
                      </p>
                      <p className="text-xs text-[#8b90a8]">
                        {getRoleLabel(workspace.user_role)}
                      </p>
                    </div>
                    {currentWorkspace?.id === workspace.id && (
                      <Check className="h-4 w-4 text-[#5e6ad2] flex-shrink-0" strokeWidth={2} />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="p-2 border-t border-[#272b3a]">
              <button
                onClick={() => { setIsOpen(false); setShowCreateModal(true); }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg
                  hover:bg-[#252a38] transition-colors text-[#5e6ad2]"
              >
                <div className="p-1.5 bg-[#5e6ad2]/10 rounded-lg border border-[#5e6ad2]/20 flex-shrink-0">
                  <Plus className="h-4 w-4 text-[#5e6ad2]" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium">Criar novo workspace</span>
              </button>
            </div>
          </div>
        </>,
        document.body
      )
    : null;

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg border transition-all w-full
          ${isOpen
            ? 'border-[#5e6ad2]/40 bg-[#1f2330]'
            : 'border-[#272b3a] bg-transparent hover:bg-[#1f2330] hover:border-[#3a4060]'
          }
          ${collapsed ? 'justify-center p-2 border-transparent bg-transparent hover:bg-[#1f2330]' : 'px-3 py-2'}
        `}
      >
        <div
          className={`p-1.5 rounded-lg border flex-shrink-0 transition-all
            ${isOpen ? 'bg-[#5e6ad2]/15 border-[#5e6ad2]/30' : 'bg-[#1f2330] border-[#272b3a]'}
          `}
        >
          <Briefcase
            className={`h-4 w-4 transition-colors ${isOpen ? 'text-[#5e6ad2]' : 'text-[#8b90a8]'}`}
            strokeWidth={1.5}
          />
        </div>

        {!collapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-[#eef0f6] truncate">
                {currentWorkspace?.name}
              </p>
              <p className="text-xs text-[#8b90a8] truncate">
                {getRoleLabel(currentWorkspace?.user_role)}
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-[#8b90a8] transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
              strokeWidth={1.5}
            />
          </>
        )}
      </button>

      {/* Portal dropdown */}
      {dropdownContent}

      {/* Create modal */}
      <CreateWorkspaceModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {}}
      />
    </>
  );
};
