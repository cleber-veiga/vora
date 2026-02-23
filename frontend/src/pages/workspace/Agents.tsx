import React, { useState } from 'react';
import {
  Bot, Plus, Search, MoreVertical, Play, Pause, Settings,
  ChevronRight, Zap,
} from 'lucide-react';
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

const MOCK_AGENTS: Agent[] = [
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

export default function Agents() {
  const { currentWorkspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  if (!currentWorkspace) {
    return <NoWorkspaceState />;
  }

  const filteredAgents = MOCK_AGENTS.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount   = MOCK_AGENTS.filter((a) => a.status === 'active').length;
  const inactiveCount = MOCK_AGENTS.filter((a) => a.status === 'inactive').length;

  return (
    <div className="max-w-[1400px] mx-auto text-[#eef0f6]">

      {/* Page header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#555b72] mb-1.5">
            <span>{currentWorkspace.name}</span>
            <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
            <span className="text-[#eef0f6] font-medium">Agentes</span>
          </div>
          <h1 className="text-2xl font-bold text-[#eef0f6] tracking-tight">Agentes</h1>
          <p className="text-sm text-[#8b90a8] mt-1">
            Gerencie os agentes de IA do workspace{' '}
            <span className="text-[#eef0f6] font-medium">{currentWorkspace.name}</span>
          </p>
        </div>
        <Button className="w-auto sm:mt-1 flex-shrink-0">
          <Plus className="h-4 w-4 mr-2" strokeWidth={2} />
          Criar Agente
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#181b22] border border-[#272b3a] rounded-xl px-4 py-3">
          <p className="text-xs text-[#8b90a8] mb-1">Total</p>
          <p className="text-2xl font-bold text-[#eef0f6]">{MOCK_AGENTS.length}</p>
        </div>
        <div className="bg-[#181b22] border border-[#272b3a] rounded-xl px-4 py-3">
          <p className="text-xs text-[#8b90a8] mb-1">Ativos</p>
          <p className="text-2xl font-bold text-green-400">{activeCount}</p>
        </div>
        <div className="bg-[#181b22] border border-[#272b3a] rounded-xl px-4 py-3">
          <p className="text-xs text-[#8b90a8] mb-1">Inativos</p>
          <p className="text-2xl font-bold text-[#8b90a8]">{inactiveCount}</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-5 flex gap-3">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555b72]"
            strokeWidth={1.5}
          />
          <Input
            type="text"
            placeholder="Buscar agentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Agent list */}
      {filteredAgents.length === 0 ? (
        <div className="bg-[#181b22] rounded-xl border border-[#272b3a] p-14 text-center">
          <div className="p-4 bg-[#1f2330] rounded-2xl w-fit mx-auto mb-5 border border-[#272b3a]">
            <Bot className="h-10 w-10 text-[#555b72]" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-semibold text-[#eef0f6] mb-2">
            {searchQuery ? 'Nenhum agente encontrado' : 'Nenhum agente criado'}
          </h3>
          <p className="text-sm text-[#8b90a8] mb-6 max-w-xs mx-auto">
            {searchQuery
              ? 'Tente ajustar sua busca ou criar um novo agente.'
              : 'Crie seu primeiro agente de IA para começar a automatizar atendimentos.'}
          </p>
          {!searchQuery && (
            <Button className="w-auto mx-auto">
              <Plus className="h-4 w-4 mr-2" strokeWidth={2} />
              Criar Primeiro Agente
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="group bg-[#181b22] rounded-xl border border-[#272b3a] p-5
                hover:border-[#5e6ad2]/40 hover:shadow-[0_0_0_1px_rgba(94,106,210,0.1),0_4px_20px_rgba(0,0,0,0.3)]
                transition-all duration-150"
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="p-2.5 bg-[#1f2330] rounded-xl border border-[#272b3a]
                    group-hover:border-[#5e6ad2]/30 group-hover:bg-[#5e6ad2]/10 transition-all"
                >
                  <Bot
                    className="h-5 w-5 text-[#8b90a8] group-hover:text-[#5e6ad2] transition-colors"
                    strokeWidth={1.5}
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === agent.id ? null : agent.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8b90a8]
                      hover:bg-[#1f2330] hover:text-[#eef0f6] border border-transparent
                      hover:border-[#272b3a] transition-all"
                  >
                    <MoreVertical className="h-4 w-4" strokeWidth={1.5} />
                  </button>

                  {openMenuId === agent.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 top-full mt-1.5 w-40 bg-[#1f2330] rounded-xl shadow-xl border border-[#272b3a] z-20 overflow-hidden">
                        <div className="p-1.5">
                          <button
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#eef0f6]
                              hover:bg-[#252a38] rounded-lg transition-colors"
                            onClick={() => setOpenMenuId(null)}
                          >
                            <Settings className="h-4 w-4 text-[#8b90a8]" strokeWidth={1.5} />
                            Configurar
                          </button>
                          <button
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#eef0f6]
                              hover:bg-[#252a38] rounded-lg transition-colors"
                            onClick={() => setOpenMenuId(null)}
                          >
                            {agent.status === 'active' ? (
                              <>
                                <Pause className="h-4 w-4 text-[#8b90a8]" strokeWidth={1.5} />
                                Pausar
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 text-[#8b90a8]" strokeWidth={1.5} />
                                Ativar
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <h3 className="text-base font-semibold text-[#eef0f6] mb-1 group-hover:text-white transition-colors">
                  {agent.name}
                </h3>
                <p className="text-sm text-[#8b90a8] line-clamp-2 leading-relaxed">
                  {agent.description}
                </p>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                    agent.status === 'active'
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-[#272b3a] text-[#8b90a8] border-[#272b3a]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      agent.status === 'active' ? 'bg-green-400' : 'bg-[#8b90a8]'
                    }`}
                  />
                  {agent.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-[#5e6ad2]/10 text-[#8b9fff] rounded-full border border-[#5e6ad2]/20">
                  <Zap className="h-3 w-3" strokeWidth={2} />
                  {agent.type}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[#272b3a]">
                <span className="text-xs text-[#555b72]">
                  Atualizado {agent.lastUpdated}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8b90a8]
                      hover:bg-[#1f2330] hover:text-[#eef0f6] border border-transparent
                      hover:border-[#272b3a] transition-all"
                    title={agent.status === 'active' ? 'Pausar' : 'Ativar'}
                  >
                    {agent.status === 'active' ? (
                      <Pause className="h-3.5 w-3.5" strokeWidth={1.5} />
                    ) : (
                      <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
                    )}
                  </button>
                  <button
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8b90a8]
                      hover:bg-[#1f2330] hover:text-[#eef0f6] border border-transparent
                      hover:border-[#272b3a] transition-all"
                    title="Configurações"
                  >
                    <Settings className="h-3.5 w-3.5" strokeWidth={1.5} />
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
