import { useState } from 'react';
import { Users as UsersIcon, Search, Mail, Shield, MoreVertical } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { NoWorkspaceState } from '../../components/NoWorkspaceState';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  avatar?: string;
  joinedAt: string;
  lastActive: string;
}

export default function Users() {
  const { currentWorkspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentWorkspace) {
    return <NoWorkspaceState />;
  }

  // Dados mockados - substituir por chamada à API
  const users: User[] = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao@empresa.com',
      role: 'owner',
      joinedAt: '15 Jan 2024',
      lastActive: 'Online',
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria@empresa.com',
      role: 'admin',
      joinedAt: '20 Jan 2024',
      lastActive: '2 horas atrás',
    },
    {
      id: 3,
      name: 'Pedro Costa',
      email: 'pedro@empresa.com',
      role: 'member',
      joinedAt: '25 Jan 2024',
      lastActive: '1 dia atrás',
    },
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const badges = {
      owner: { label: 'Proprietário', color: 'bg-purple-100 text-purple-700' },
      admin: { label: 'Administrador', color: 'bg-blue-100 text-blue-700' },
      member: { label: 'Membro', color: 'bg-gray-100 text-gray-700' },
    };
    return badges[role as keyof typeof badges] || badges.member;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-[#f7f8f8]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-[#f7f8f8]">Gerenciar Usuários</h1>
            <p className="text-[#8a8f98] mt-1">
              Gerencie os membros do workspace {currentWorkspace?.name}
            </p>
          </div>
          <Button className="w-auto">
            <Mail className="h-4 w-4 mr-2" />
            Convidar Usuário
          </Button>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8a8f98]" />
          <Input
            type="text"
            placeholder="Buscar usuários por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de Usuários */}
      {filteredUsers.length === 0 ? (
        <div className="bg-[#121417] rounded-xl border border-[#222326] p-12 text-center">
          <div className="p-4 bg-[#1a1d21] rounded-full w-fit mx-auto mb-4 border border-[#222326]">
            <UsersIcon className="h-12 w-12 text-[#8a8f98]" />
          </div>
          <h3 className="text-lg font-semibold text-[#f7f8f8] mb-2">
            Nenhum usuário encontrado
          </h3>
          <p className="text-[#8a8f98] mb-6">
            Tente ajustar sua busca ou convide novos usuários
          </p>
        </div>
      ) : (
        <div className="bg-[#121417] rounded-xl border border-[#222326] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-transparent border-b border-[#222326]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entrou em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Atividade
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222326]">
                {filteredUsers.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-[#15181c] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#1a1d21] border border-[#222326] flex items-center justify-center text-[#f7f8f8] font-semibold text-sm">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div className="font-medium text-[#f7f8f8]">{user.name}</div>
                            <div className="text-sm text-[#8a8f98]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${roleBadge.color}`}>
                          <Shield className="h-3 w-3" />
                          {roleBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8a8f98]">
                        {user.joinedAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${user.lastActive === 'Online' ? 'text-green-400 font-medium' : 'text-[#8a8f98]'}`}>
                          {user.lastActive}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="p-2 hover:bg-[#15181c] rounded-lg transition-colors border border-transparent hover:border-[#2e3035]">
                          <MoreVertical className="h-5 w-5 text-[#8a8f98]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
