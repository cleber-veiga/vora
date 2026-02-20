import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Search, 
  MoreHorizontal, 
  ArrowUpDown,
  FileText,
  Settings,
  X,
  CheckCircle2,
  Ban,
  Trash2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { NoWorkspaceState } from '../../components/NoWorkspaceState';

interface Skill {
  id: number;
  name: string;
  description: string;
  itemsCount: number;
  status: 'active' | 'pending' | 'inactive';
  lastUpdated: string;
}

export default function Skills() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);

  const [skills, setSkills] = useState<Skill[]>([
    {
      id: 1,
      name: 'Manual de Produtos',
      description: 'Documentação completa de todos os produtos da empresa',
      itemsCount: 45,
      status: 'active',
      lastUpdated: '01/06/2026 06:23 AM',
    },
    {
      id: 2,
      name: 'FAQ Website',
      description: 'Perguntas frequentes extraídas do site',
      itemsCount: 23,
      status: 'pending',
      lastUpdated: '05/06/2026 10:15 AM',
    },
    {
      id: 3,
      name: 'Base de Clientes',
      description: 'Informações de clientes e histórico de interações',
      itemsCount: 1250,
      status: 'inactive',
      lastUpdated: '28/05/2026 02:45 PM',
    },
    {
      id: 4,
      name: 'Políticas Internas',
      description: 'Normas e procedimentos da organização',
      itemsCount: 12,
      status: 'active',
      lastUpdated: '02/06/2026 09:30 AM',
    },
  ]);

  if (!currentWorkspace) {
    return <NoWorkspaceState />;
  }

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSkillSelection = (id: number) => {
    setSelectedSkills(prev => 
      prev.includes(id) ? prev.filter(skillId => skillId !== id) : [...prev, id]
    );
  };

  const toggleAllSkills = () => {
    if (selectedSkills.length === filteredSkills.length) {
      setSelectedSkills([]);
    } else {
      setSelectedSkills(filteredSkills.map(s => s.id));
    }
  };

  const handleBulkActivate = () => {
    setSkills(prev =>
      prev.map(skill =>
        selectedSkills.includes(skill.id) ? { ...skill, status: 'active' } : skill
      )
    );
    setSelectedSkills([]);
  };

  const handleBulkDeactivate = () => {
    setSkills(prev =>
      prev.map(skill =>
        selectedSkills.includes(skill.id) ? { ...skill, status: 'inactive' } : skill
      )
    );
    setSelectedSkills([]);
  };

  const handleBulkDelete = () => {
    setSkills(prev => prev.filter(skill => !selectedSkills.includes(skill.id)));
    setSelectedSkills([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'inactive':
        return 'text-gray-400';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Disponível';
      case 'pending':
        return 'Pendente';
      case 'inactive':
        return 'Inativo';
      default:
        return status;
    }
  };

  return (
    <div className="p-6 max-w-full mx-auto text-[#f7f8f8]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#f7f8f8]">Habilidades</h1>
        <p className="text-sm text-[#8a8f98] mt-1">
          Todas as habilidades do workspace são exibidas aqui. Você pode gerenciar conhecimentos e configurações. <a href="#" className="text-[#5e6ad2] hover:text-[#6e7be2] hover:underline">Saber mais</a>
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Dropdown Todos */}
          <div className="relative">
            <select className="appearance-none bg-[#121417] border border-[#222326] text-[#f7f8f8] py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5e6ad2] cursor-pointer">
              <option>Todos</option>
              <option>Ativos</option>
              <option>Inativos</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8f98]" />
            <Input
              type="text"
              placeholder="Procurar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#121417] border-[#222326] text-sm h-9"
            />
          </div>

          {/* Sort */}
          <div className="relative hidden md:block">
             <button className="flex items-center gap-2 text-sm text-[#8a8f98] bg-[#121417] px-3 py-2 rounded-lg border border-[#222326] hover:bg-[#15181c] transition-colors">
               <span>Ordenar por: Tempo de criação</span>
               <ArrowUpDown className="h-3 w-3" />
             </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
           <Button variant="outline" className="text-[#f7f8f8] bg-[#121417] border-[#222326] hover:bg-[#15181c] h-9 text-sm">
             <Settings className="h-4 w-4 mr-2" />
             Metadados
           </Button>
           <Button 
             className="h-9 text-sm px-6 whitespace-nowrap w-auto"
             onClick={() => navigate('/workspace/skills/create')}
           >
             <Plus className="h-4 w-4 mr-2" />
             Criar habilidade
           </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-[#121417] rounded-lg border border-[#222326] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222326]">
                <th className="p-4 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-[#222326] text-[#5e6ad2] focus:ring-[#5e6ad2] h-4 w-4 bg-transparent"
                    checked={selectedSkills.length === filteredSkills.length && filteredSkills.length > 0}
                    onChange={toggleAllSkills}
                  />
                </th>
                <th className="p-4 text-xs font-medium text-[#8a8f98] uppercase tracking-wider w-16">
                  #
                </th>
                <th className="p-4 text-xs font-medium text-[#8a8f98] uppercase tracking-wider cursor-pointer group">
                  <div className="flex items-center gap-1">
                    NOME
                    <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th className="p-4 text-xs font-medium text-[#8a8f98] uppercase tracking-wider">
                  TIPO
                </th>
                <th className="p-4 text-xs font-medium text-[#8a8f98] uppercase tracking-wider cursor-pointer group">
                   <div className="flex items-center gap-1">
                    CONHECIMENTO
                    <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th className="p-4 text-xs font-medium text-[#8a8f98] uppercase tracking-wider cursor-pointer group hidden md:table-cell">
                   <div className="flex items-center gap-1">
                    ÚLTIMA ATUALIZAÇÃO
                    <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th className="p-4 text-xs font-medium text-[#8a8f98] uppercase tracking-wider">
                  STATUS
                </th>
                <th className="p-4 text-xs font-medium text-[#8a8f98] uppercase tracking-wider text-right">
                  AÇÃO
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222326]/60">
              {filteredSkills.map((skill, index) => (
                <tr key={skill.id} className="hover:bg-[#15181c] group transition-colors">
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-[#222326] text-[#5e6ad2] focus:ring-[#5e6ad2] h-4 w-4 bg-transparent"
                      checked={selectedSkills.includes(skill.id)}
                      onChange={() => toggleSkillSelection(skill.id)}
                    />
                  </td>
                  <td className="p-4 text-sm text-[#8a8f98]">
                    {index + 1}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-[#1a1d21] rounded text-[#f7f8f8] border border-[#222326]">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-[#f7f8f8]">{skill.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                     <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#1a1d21] text-[#8a8f98] border border-[#222326]">
                       <BookOpen className="w-3 h-3 mr-1" />
                       EM GERAL
                     </span>
                  </td>
                  <td className="p-4 text-sm text-[#8a8f98]">
                    {skill.itemsCount} {skill.itemsCount === 1 ? 'item' : 'itens'}
                  </td>
                   <td className="p-4 text-sm text-[#8a8f98] hidden md:table-cell">
                    {skill.lastUpdated}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${skill.status === 'active' ? 'bg-green-400' : skill.status === 'pending' ? 'bg-yellow-400' : 'bg-[#222326]'}`}></div>
                      <span className={`text-sm ${getStatusColor(skill.status)}`}>
                        {getStatusLabel(skill.status)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {/* Toggle Switch Mock */}
                       <div className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${skill.status === 'active' ? 'bg-[#5e6ad2]' : 'bg-[#222326]'}`}>
                         <div className={`absolute top-0.5 w-4 h-4 bg-[#f7f8f8] rounded-full shadow-sm transition-transform ${skill.status === 'active' ? 'left-4.5 translate-x-full -ml-5' : 'left-0.5'}`}></div>
                       </div>
                       
                       <div className="w-px h-4 bg-[#222326] mx-2"></div>

                       <button className="p-1.5 text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#15181c] rounded transition-colors border border-transparent hover:border-[#2e3035]">
                         <Settings className="h-4 w-4" />
                       </button>
                       <button className="p-1.5 text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#15181c] rounded transition-colors border border-transparent hover:border-[#2e3035]">
                         <MoreHorizontal className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Empty State */}
        {filteredSkills.length === 0 && (
          <div className="p-12 text-center text-[#8a8f98]">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-[#8a8f98]" />
            <p>Nenhuma habilidade encontrada.</p>
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedSkills.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#121417] border border-[#222326] rounded-full shadow-2xl px-6 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-3 pr-4 border-r border-[#222326]">
            <div className="bg-[#1a1d21] text-[#f7f8f8] text-xs font-bold px-2.5 py-1 rounded-full">
              {selectedSkills.length}
            </div>
            <span className="text-sm font-medium text-[#f7f8f8]">Selecionado</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              className="w-auto h-8 px-2 text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#15181c] gap-2"
              onClick={handleBulkActivate}
            >
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium">Ativar</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-auto h-8 px-2 text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#15181c] gap-2"
              onClick={handleBulkDeactivate}
            >
              <Ban className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Inativar</span>
            </Button>

            <div className="w-px h-4 bg-[#222326] mx-1"></div>

            <Button variant="ghost" className="w-auto h-8 px-2 text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#15181c] gap-2">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Metadados</span>
            </Button>
            
            <Button variant="ghost" className="w-auto h-8 px-2 text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#15181c] gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Arquivo</span>
            </Button>

            <div className="w-px h-4 bg-[#222326] mx-1"></div>
            
            <Button 
              variant="ghost" 
              className="w-auto h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm font-medium">Excluir</span>
            </Button>

            <div className="w-px h-4 bg-[#222326] mx-1"></div>

            <Button 
              variant="ghost" 
              className="w-auto h-8 px-2 text-[#8a8f98] hover:text-[#f7f8f8]"
              onClick={() => setSelectedSkills([])}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

