import { useState } from 'react';
import { Briefcase, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

export function NoWorkspaceState() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-[#121417] border border-[#222326] p-6 rounded-full mb-6">
          <Briefcase className="h-12 w-12 text-[#f7f8f8]" />
        </div>
        
        <h2 className="text-2xl font-bold text-[#f7f8f8] mb-3">
          Nenhum workspace encontrado
        </h2>
        
        <p className="text-[#8a8f98] max-w-md mb-8 text-lg">
          Esta organização ainda não possui nenhum workspace. Crie o primeiro para começar a gerenciar seus agentes e recursos.
        </p>
        
        <Button 
          size="lg" 
          onClick={() => setShowCreateModal(true)}
          className="w-auto px-6"
        >
          <Plus className="h-5 w-5 mr-2" />
          Criar Primeiro Workspace
        </Button>
      </div>

      <CreateWorkspaceModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
           // O contexto já atualiza a lista e seleciona o novo workspace, 
           // então o componente pai vai re-renderizar e mostrar o conteúdo normal
        }}
      />
    </>
  );
}
