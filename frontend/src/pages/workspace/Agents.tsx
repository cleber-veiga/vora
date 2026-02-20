import { useState } from 'react';
import { Bot, Plus, Search, MoreVertical, Play, Pause, Settings } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { NoWorkspaceState } from '../../components/NoWorkspaceState';

interface Agent {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  type: string;
  lastUpdated: string;
}

export default function Agents() {
  const { currentWorkspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentWorkspace) {
    return <NoWorkspaceState />;
  }

  // Dados mockados - substituir por chamada à API
  const agents: Agent[] = [
    {
      id: 1,
      name: 'Assistente de Vendas',
      description: 'Auxilia clientes com dúvidas sobre produtos e realiza vendas',
      status: 'active',
      type: 'Chatbot',
      lastUpdated: '2 horas atrás',
    },
    {
      id: 2,
      name: 'Suporte Técnico',
      description: 'Resolve problemas técnicos e abre tickets quando necessário',
      status: 'active',
      type: 'Chatbot',
      lastUpdated: '1 dia atrás',
    },
    {
      id: 3,
      name: 'FAQ Automático',
      description: 'Responde perguntas frequentes automaticamente',
      status: 'inactive',
      type: 'Chatbot',
      lastUpdated: '3 dias atrás',
    },
  ];

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto text-[#f7f8f8]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-[#f7f8f8]">Agentes</h1>
            <p className="text-[#8a8f98] mt-1">
              Gerencie os agentes de IA do workspace {currentWorkspace?.name}
            </p>
          </div>
          <Button className="w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Criar Agente
          </Button>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8a8f98]" />
          <Input
            type="text"
            placeholder="Buscar agentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de Agentes */}
      {filteredAgents.length === 0 ? (
        <div className="bg-[#121417] rounded-xl border border-[#222326] p-12 text-center">
          <div className="p-4 bg-[#1a1d21] rounded-full w-fit mx-auto mb-4 border border-[#222326]">
            <Bot className="h-12 w-12 text-[#8a8f98]" />
          </div>
          <h3 className="text-lg font-semibold text-[#f7f8f8] mb-2">
            {searchQuery ? 'Nenhum agente encontrado' : 'Nenhum agente criado'}
          </h3>
          <p className="text-[#8a8f98] mb-6">
            {searchQuery
              ? 'Tente ajustar sua busca ou criar um novo agente'
              : 'Crie seu primeiro agente de IA para começar'}
          </p>
          {!searchQuery && (
            <Button className="w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Agente
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
              <div
              key={agent.id}
              className="bg-[#121417] rounded-xl border border-[#222326] p-6 hover:border-[#2e3035] transition-colors"
            >
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-[#1a1d21] rounded-lg border border-[#222326]">
                  <Bot className="h-6 w-6 text-[#f7f8f8]" />
                </div>
                <button className="p-2 hover:bg-[#15181c] rounded-lg transition-colors border border-transparent hover:border-[#2e3035]">
                  <MoreVertical className="h-5 w-5 text-[#8a8f98]" />
                </button>
              </div>

              {/* Conteúdo */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-[#f7f8f8] mb-1">
                  {agent.name}
                </h3>
                <p className="text-sm text-[#8a8f98] line-clamp-2">
                  {agent.description}
                </p>
              </div>

              {/* Metadados */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    agent.status === 'active'
                      ? 'bg-green-500/10 text-green-300 border border-green-500/40'
                      : 'bg-[#1a1d21] text-[#8a8f98] border border-[#222326]'
                  }`}
                >
                  {agent.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-[#1a1d21] text-[#8a8f98] rounded-full border border-[#222326]">
                  {agent.type}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[#222326]">
                <span className="text-xs text-[#8a8f98]">
                  Atualizado {agent.lastUpdated}
                </span>
                <div className="flex gap-1">
                  <button
                    className="p-2 hover:bg-[#15181c] rounded-lg transition-colors border border-transparent hover:border-[#2e3035]"
                    title={agent.status === 'active' ? 'Pausar' : 'Ativar'}
                  >
                    {agent.status === 'active' ? (
                      <Pause className="h-4 w-4 text-[#8a8f98]" />
                    ) : (
                      <Play className="h-4 w-4 text-[#8a8f98]" />
                    )}
                  </button>
                  <button
                    className="p-2 hover:bg-[#15181c] rounded-lg transition-colors border border-transparent hover:border-[#2e3035]"
                    title="Configurações"
                  >
                    <Settings className="h-4 w-4 text-[#8a8f98]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
