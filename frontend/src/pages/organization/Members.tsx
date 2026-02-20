import { useState, useEffect } from 'react';
import { useOrganization, type OrganizationMember } from '../../contexts/OrganizationContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader } from '../../components/ui/dialog';
import { Loader2, UserPlus, Trash2 } from 'lucide-react';

export default function OrganizationMembers() {
  const { 
    currentOrganization, 
    getOrganizationMembers, 
    inviteMember, 
    updateMemberRole, 
    removeMember 
  } = useOrganization();
  
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  
  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    if (currentOrganization) {
      loadMembers();
    }
  }, [currentOrganization]);

  const loadMembers = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      const data = await getOrganizationMembers(currentOrganization.id);
      setMembers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization) return;
    
    try {
      setInviteLoading(true);
      await inviteMember(currentOrganization.id, inviteEmail, inviteRole);
      setInviteOpen(false);
      setInviteEmail('');
      setInviteRole('MEMBER');
      await loadMembers();
      alert('Membro convidado com sucesso!');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Erro ao convidar membro');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!currentOrganization) return;
    try {
      await updateMemberRole(currentOrganization.id, userId, newRole);
      // Otimistic update or reload
      setMembers(members.map(m => m.user_id === userId ? { ...m, role: newRole } : m));
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Erro ao atualizar papel');
      loadMembers(); // Revert on error
    }
  };

  const handleRemove = async (userId: number) => {
    if (!currentOrganization) return;
    if (!confirm('Tem certeza que deseja remover este membro?')) return;

    try {
      await removeMember(currentOrganization.id, userId);
      setMembers(members.filter(m => m.user_id !== userId));
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Erro ao remover membro');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const canManage = currentOrganization?.user_role === 'OWNER' || currentOrganization?.user_role === 'ADMIN';

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#8a8f98]" />
      </div>
    );
  }

  return (
    <div className="bg-[#121417] rounded-xl border border-[#222326]">
      <div className="p-6 border-b border-[#222326] flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-[#f7f8f8]">Membros</h2>
          <p className="text-sm text-[#8a8f98] mt-1">
            Gerencie quem tem acesso à organização
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setInviteOpen(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Convidar Membro
          </Button>
        )}
      </div>

      <div className="divide-y divide-[#222326]">
        {members.map((member) => (
          <div key={member.user_id} className="p-4 flex items-center justify-between hover:bg-[#15181c] transition-colors">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-[#1a1d21] border border-[#222326] flex items-center justify-center text-[#f7f8f8] font-semibold text-sm">
                {getInitials(member.user.full_name || member.user.email)}
              </div>
              <div>
                <p className="font-medium text-[#f7f8f8]">
                  {member.user.full_name || 'Usuário sem nome'}
                </p>
                <p className="text-sm text-[#8a8f98]">{member.user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {canManage && member.role !== 'OWNER' ? (
                  <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                  className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled={member.role === 'OWNER' && members.filter(m => m.role === 'OWNER').length <= 1}
                >
                  <option value="MEMBER">Membro</option>
                  <option value="ADMIN">Admin</option>
                  {currentOrganization.user_role === 'OWNER' && (
                    <option value="OWNER">Dono</option>
                  )}
                </select>
              ) : (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  member.role === 'OWNER' 
                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/40' 
                    : member.role === 'ADMIN'
                    ? 'bg-blue-500/10 text-blue-300 border border-blue-500/40'
                    : 'bg-[#1a1d21] text-[#8a8f98] border border-[#222326]'
                }`}>
                  {member.role}
                </span>
              )}

              {canManage && member.role !== 'OWNER' && (
                  <Button
                   variant="ghost"
                   size="icon"
                   className="text-[#8a8f98] hover:text-red-400 hover:bg-red-500/10"
                   onClick={() => handleRemove(member.user_id)}
                 >
                   <Trash2 className="h-4 w-4" />
                 </Button>
              )}
            </div>
          </div>
        ))}
        
        {members.length === 0 && (
          <div className="p-8 text-center text-[#8a8f98]">
            Nenhum membro encontrado.
          </div>
        )}
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader onClose={() => setInviteOpen(false)}>
            <h2 className="text-xl font-semibold">Convidar Membro</h2>
          </DialogHeader>
          
          <form onSubmit={handleInvite} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#f7f8f8] mb-1">
                Email do Usuário
              </label>
              <Input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="exemplo@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#f7f8f8] mb-1">
                Permissão
              </label>
              <select
                className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                <option value="MEMBER">Membro</option>
                <option value="ADMIN">Admin</option>
                {currentOrganization?.user_role === 'OWNER' && (
                  <option value="OWNER">Dono</option>
                )}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={inviteLoading}>
                {inviteLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Convidando...
                  </>
                ) : (
                  'Enviar Convite'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
