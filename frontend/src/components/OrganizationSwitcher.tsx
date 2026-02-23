import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Building2, Check, ChevronDown, Plus } from 'lucide-react';
import { useOrganization } from '../contexts/OrganizationContext';
import { CreateOrganizationModal } from './CreateOrganizationModal';

export const OrganizationSwitcher: React.FC = () => {
  const { currentOrganization, organizations, switchOrganization } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);

  /* Calcula posição do dropdown com base no botão trigger */
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 300),
        zIndex: 9999,
      });
    }
  }, [isOpen]);

  /* Fecha ao redimensionar */
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => setIsOpen(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  if (!currentOrganization) return null;

  const ownedOrgs       = organizations.filter((org) => org.user_role === 'OWNER');
  const participatedOrgs = organizations.filter((org) => org.user_role !== 'OWNER');

  const getRoleLabel = (role: string): string => {
    const roleMap: Record<string, string> = {
      OWNER: 'Dono',
      ADMIN: 'Admin',
      MEMBER: 'Membro',
    };
    return roleMap[role] || role;
  };

  const handleSelectOrganization = (orgId: number) => {
    switchOrganization(orgId);
    setIsOpen(false);
  };

  /* ── Dropdown content (rendered via portal) ──────────────────────── */
  const dropdownContent = isOpen
    ? ReactDOM.createPortal(
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <div
            style={dropdownStyle}
            className="bg-[#1f2330] rounded-xl shadow-2xl border border-[#272b3a] max-h-[500px] overflow-y-auto"
          >
            {/* Minhas Organizações */}
            {ownedOrgs.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1.5 text-[10px] font-bold text-[#555b72] uppercase tracking-widest">
                  Minhas Organizações
                </p>
                {ownedOrgs.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleSelectOrganization(org.id)}
                    className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-[#252a38] transition-colors"
                  >
                    <div className="p-1.5 bg-[#252a38] rounded-lg border border-[#272b3a] flex-shrink-0">
                      <Building2 className="h-4 w-4 text-[#eef0f6]" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-[#eef0f6] truncate">{org.name}</p>
                      <p className="text-xs text-[#8b90a8]">{getRoleLabel(org.user_role)}</p>
                    </div>
                    {currentOrganization.id === org.id && (
                      <Check className="h-4 w-4 text-[#5e6ad2] flex-shrink-0" strokeWidth={2} />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Organizações que Participo */}
            {participatedOrgs.length > 0 && (
              <div className="p-2 border-t border-[#272b3a]">
                <p className="px-2 py-1.5 text-[10px] font-bold text-[#555b72] uppercase tracking-widest">
                  Participo
                </p>
                {participatedOrgs.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleSelectOrganization(org.id)}
                    className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-[#252a38] transition-colors"
                  >
                    <div className="p-1.5 bg-[#252a38] rounded-lg border border-[#272b3a] flex-shrink-0">
                      <Building2 className="h-4 w-4 text-[#eef0f6]" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-[#eef0f6] truncate">{org.name}</p>
                      <p className="text-xs text-[#8b90a8]">{getRoleLabel(org.user_role)}</p>
                    </div>
                    {currentOrganization.id === org.id && (
                      <Check className="h-4 w-4 text-[#5e6ad2] flex-shrink-0" strokeWidth={2} />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Criar nova organização */}
            <div className="p-2 border-t border-[#272b3a]">
              <button
                onClick={() => { setIsOpen(false); setShowCreateModal(true); }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg
                  hover:bg-[#252a38] transition-colors text-[#5e6ad2]"
              >
                <div className="p-1.5 bg-[#5e6ad2]/10 rounded-lg border border-[#5e6ad2]/20 flex-shrink-0">
                  <Plus className="h-4 w-4 text-[#5e6ad2]" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium">Criar nova organização</span>
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
      {/* Trigger button — sem container próprio, renderizado inline na topbar */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full"
      >
        <div className="p-1.5 bg-[#252a38] rounded-lg border border-[#272b3a] flex-shrink-0">
          <Building2 className="h-4 w-4 text-[#eef0f6]" strokeWidth={1.5} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-[#eef0f6] truncate leading-tight">
            {currentOrganization.name}
          </p>
          <p className="text-xs text-[#8b90a8] leading-tight">
            {getRoleLabel(currentOrganization.user_role)}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-[#8b90a8] transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
        />
      </button>

      {/* Portal dropdown */}
      {dropdownContent}

      {/* Create modal */}
      <CreateOrganizationModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {}}
      />
    </>
  );
};
