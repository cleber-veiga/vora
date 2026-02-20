import { 
  Database, 
  Plus
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { NoWorkspaceState } from '../../components/NoWorkspaceState';

export default function CRMs() {
  const { currentWorkspace } = useWorkspace();

  if (!currentWorkspace) {
    return <NoWorkspaceState />;
  }

  return (
    <div className="p-6 max-w-full mx-auto animate-in fade-in duration-500 text-[#f7f8f8]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#f7f8f8]">CRMs</h1>
        <p className="text-sm text-[#8a8f98] mt-1">
          Gerencie seus bancos de dados de clientes e contatos.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-12 bg-[#121417] rounded-xl border border-[#222326]">
        <Database className="h-12 w-12 text-[#8a8f98] mb-3" />
        <h3 className="text-lg font-medium text-[#f7f8f8]">Nenhum CRM configurado</h3>
        <p className="text-[#8a8f98] max-w-sm text-center mt-2 mb-6">
          Esta funcionalidade está sendo reestruturada.
        </p>
        <Button 
          className="w-auto"
          onClick={() => {}}
          disabled
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo CRM
        </Button>
      </div>
    </div>
  );
}
