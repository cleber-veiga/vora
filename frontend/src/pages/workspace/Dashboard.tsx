import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Button } from '../../components/ui/button';
import { NoWorkspaceState } from '../../components/NoWorkspaceState';

export default function Dashboard() {
  const { currentWorkspace } = useWorkspace();

  if (!currentWorkspace) {
    return <NoWorkspaceState />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto text-[#f7f8f8]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
        <p className="text-sm text-[#8a8f98]">
          Você está visualizando o workspace <span className="font-semibold text-[#f7f8f8]">{currentWorkspace.name}</span>.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#121417] border border-[#222326] rounded-xl p-6 hover:border-[#2e3035] transition-colors">
          <h2 className="text-base font-semibold text-[#f7f8f8] mb-2">Próximos passos</h2>
          <ul className="list-disc list-inside text-sm text-[#8a8f98] space-y-1">
            <li>Crie seus primeiros agentes de IA.</li>
            <li>Configure bases de conhecimento para alimentar os agentes.</li>
            <li>Convide membros para colaborar neste workspace.</li>
          </ul>
          <div className="mt-4">
            <Button className="w-auto bg-[#5e6ad2] hover:bg-[#6e7be2] text-[#f7f8f8] px-4 py-2 rounded-md transition-all">
              Explorar recursos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
