import React, { useState } from 'react';
import { Building2, Check, ChevronDown, Plus } from 'lucide-react';
import { useOrganization } from '../contexts/OrganizationContext';
import { CreateOrganizationModal } from './CreateOrganizationModal';

export const OrganizationSwitcher: React.FC = () => {
  const { currentOrganization, organizations, switchOrganization } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!currentOrganization) {
    return null;
  }

  // Separar organizações por tipo
  const ownedOrgs = organizations.filter(org => org.user_role === 'OWNER');
  const participatedOrgs = organizations.filter(org => org.user_role !== 'OWNER');

  const handleSelectOrganization = (orgId: number) => {
    switchOrganization(orgId);
    setIsOpen(false);
  };

  const getRoleLabel = (role: string): string => {
    const roleMap: { [key: string]: string } = {
      'OWNER': 'Dono',
      'ADMIN': 'Admin',
      'MEMBER': 'Membro',
    };
    return roleMap[role] || role;
  };

  return (
    <>
      <div className="relative">
        {/* Botão do seletor */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#222326] bg-[#121417] hover:bg-[#15181c] transition-colors min-w-[200px]"
        >
          <div className="p-1.5 bg-[#1a1d21] rounded border border-[#222326]">
            <Building2 className="h-4 w-4 text-[#f7f8f8]" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-[#f7f8f8] truncate">
              {currentOrganization.name}
            </p>
            <p className="text-xs text-[#8a8f98]">
              {getRoleLabel(currentOrganization.user_role)}
            </p>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-[#8a8f98] transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            {/* Backdrop para fechar ao clicar fora */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu dropdown */}
            <div className="absolute top-full left-0 mt-2 w-80 bg-[#121417] rounded-lg shadow-lg border border-[#222326] z-20 max-h-[500px] overflow-y-auto">
              {/* Minhas Organizações */}
              {ownedOrgs.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1.5 text-xs font-semibold text-[#8a8f98] uppercase">
                    Minhas Organizações
                  </p>
                  {ownedOrgs.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => handleSelectOrganization(org.id)}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#15181c] transition-colors"
                    >
                      <div className="p-1.5 bg-[#1a1d21] rounded border border-[#222326]">
                        <Building2 className="h-4 w-4 text-[#f7f8f8]" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-[#f7f8f8]">
                          {org.name}
                        </p>
                        <p className="text-xs text-[#8a8f98]">
                          {getRoleLabel(org.user_role)}
                        </p>
                      </div>
                      {currentOrganization.id === org.id && (
                        <Check className="h-4 w-4 text-[#5e6ad2]" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Organizações que Participo */}
              {participatedOrgs.length > 0 && (
                <div className="p-2 border-t border-[#222326]">
                  <p className="px-2 py-1.5 text-xs font-semibold text-[#8a8f98] uppercase">
                    Participo
                  </p>
                  {participatedOrgs.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => handleSelectOrganization(org.id)}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#15181c] transition-colors"
                    >
                      <div className="p-1.5 bg-[#1a1d21] rounded border border-[#222326]">
                        <Building2 className="h-4 w-4 text-[#f7f8f8]" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-[#f7f8f8]">
                          {org.name}
                        </p>
                        <p className="text-xs text-[#8a8f98]">
                          {getRoleLabel(org.user_role)}
                        </p>
                      </div>
                      {currentOrganization.id === org.id && (
                        <Check className="h-4 w-4 text-[#5e6ad2]" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Botão Criar Nova Organização */}
              <div className="p-2 border-t border-[#222326]">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowCreateModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#15181c] transition-colors text-[#5e6ad2]"
                >
                  <div className="p-1.5 bg-[#1a1d21] rounded border border-[#222326]">
                    <Plus className="h-4 w-4 text-[#5e6ad2]" />
                  </div>
                  <span className="text-sm font-medium">
                    Criar nova organização
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Criação */}
      <CreateOrganizationModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          // Organização criada com sucesso
          console.log('Organização criada com sucesso!');
        }}
      />
    </>
  );
};
