import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FileText,
  Upload,
  Trash2,
  Database,
  FileUp,
  Plus,
  Settings,
  BookOpen,
  Layers,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { cn } from '../../lib/utils';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import skillService from '../../services/skillService';
import type { Skill, SkillKnowledge, SkillMaterial, SkillRetrievalConfig } from '../../services/skillService';
import { toast } from 'react-hot-toast';
import { NoWorkspaceState } from '../../components/NoWorkspaceState';

type SkillType = 'soft' | 'hard';
type MaterialType = 'pdf' | 'video' | 'audio' | 'image';
type TabType = 'identification' | 'knowledge' | 'materials' | 'retrieval';

const tabs = [
  { id: 'identification' as TabType, label: 'Identificação', icon: BookOpen },
  { id: 'knowledge' as TabType, label: 'Conhecimentos', icon: Database },
  { id: 'materials' as TabType, label: 'Materiais', icon: Layers },
  { id: 'retrieval' as TabType, label: 'Configurações de Recuperação', icon: Settings },
];

export default function CreateSkill() {
  const navigate = useNavigate();
  const { skillId } = useParams<{ skillId?: string }>();
  const { currentWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState<TabType>('identification');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Skill data
  const [skill, setSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'hard' as SkillType
  });

  // Knowledge
  const [knowledges, setKnowledges] = useState<SkillKnowledge[]>([]);
  const [uploadingKnowledge, setUploadingKnowledge] = useState(false);
  
  // Materials
  const [materials, setMaterials] = useState<SkillMaterial[]>([]);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const [newMaterial, setNewMaterial] = useState<{
    type: MaterialType;
    name: string;
    description: string;
    usageContext: string;
    file?: File;
  }>({
    type: 'pdf',
    name: '',
    description: '',
    usageContext: ''
  });

  // Retrieval Config
  const [retrievalConfig, setRetrievalConfig] = useState<Partial<SkillRetrievalConfig>>({
    parent_chunk_size: 2048,
    child_chunk_size: 512,
    chunk_overlap: 128,
    similarity_threshold: 0.7,
    max_results: 5
  });

  // ============= Lifecycle =============

  useEffect(() => {
    if (skillId) {
      loadSkill(parseInt(skillId));
    } else {
      createDraft();
    }
  }, [skillId]);

  // ============= API Calls =============

  const createDraft = async () => {
    if (!currentWorkspace) return;
    
    setLoading(true);
    try {
      const newSkill = await skillService.createSkill({
        workspace_id: currentWorkspace.id,
        name: 'Nova Habilidade',
        description: '',
        skill: 'hard',
        status: 'draft'
      });
      
      setSkill(newSkill);
      setFormData({
        name: newSkill.name,
        description: newSkill.description || '',
        type: newSkill.skill
      });
      
      // Redirecionar para URL com ID
      navigate(`/workspace/skills/${newSkill.id}/edit`, { replace: true });
      
      toast.success('Rascunho criado!');
    } catch (error) {
      console.error('Erro ao criar rascunho:', error);
      toast.error('Erro ao criar rascunho');
    } finally {
      setLoading(false);
    }
  };

  const loadSkill = async (id: number) => {
    setLoading(true);
    try {
      const [skillData, knowledgeData, materialData, configData] = await Promise.all([
        skillService.getSkill(id),
        skillService.listKnowledge(id),
        skillService.listMaterials(id),
        skillService.getRetrievalConfig(id).catch(() => null)
      ]);
      
      setSkill(skillData);
      setFormData({
        name: skillData.name,
        description: skillData.description || '',
        type: skillData.skill
      });
      setKnowledges(knowledgeData);
      setMaterials(materialData);
      if (configData) {
        setRetrievalConfig(configData);
      }
    } catch (error) {
      console.error('Erro ao carregar skill:', error);
      toast.error('Erro ao carregar habilidade');
    } finally {
      setLoading(false);
    }
  };

  const saveIdentification = async () => {
    if (!skill) return;
    
    setSaving(true);
    try {
      const updated = await skillService.updateSkill(skill.id, {
        name: formData.name,
        description: formData.description,
        skill: formData.type
      });
      setSkill(updated);
      toast.success('Identificação salva!');
    } catch (error) {
      console.error('Erro ao salvar identificação:', error);
      toast.error('Erro ao salvar identificação');
    } finally {
      setSaving(false);
    }
  };

  const saveRetrievalConfig = async () => {
    if (!skill) return;
    
    setSaving(true);
    try {
      const updated = await skillService.updateRetrievalConfig(skill.id, retrievalConfig);
      setRetrievalConfig(updated);
      toast.success('Configurações salvas!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  // ============= Knowledge Functions =============

  const handleUploadKnowledgeFile = async (file: File) => {
    if (!skill) return;
    
    setUploadingKnowledge(true);
    try {
      // 1. Upload arquivo para S3
      const uploadResult = await skillService.uploadKnowledgeFile(skill.id, file);
      
      // 2. Criar registro de knowledge
      const knowledge = await skillService.createKnowledge(skill.id, {
        source_type: 'file',
        name: file.name,
        s3_bucket: uploadResult.s3_bucket,
        s3_key: uploadResult.s3_key,
        s3_region: uploadResult.s3_region,
        s3_url: uploadResult.s3_url,
        file_name: uploadResult.file_name,
        file_size: uploadResult.file_size,
        file_mime_type: uploadResult.file_mime_type,
        file_hash: uploadResult.file_hash
      });
      
      setKnowledges([...knowledges, knowledge]);
      toast.success('Documento adicionado! Processamento iniciado...');
      
      // 3. Monitorar processamento
      pollKnowledgeStatus(knowledge.id);
    } catch (error) {
      console.error('Erro ao adicionar conhecimento:', error);
      toast.error('Erro ao adicionar conhecimento');
    } finally {
      setUploadingKnowledge(false);
    }
  };

  const pollKnowledgeStatus = async (knowledgeId: number) => {
    const interval = setInterval(async () => {
      try {
        const knowledge = await skillService.getKnowledge(knowledgeId);
        
        // Atualizar na lista
        setKnowledges(prev => 
          prev.map(k => k.id === knowledgeId ? knowledge : k)
        );
        
        if (knowledge.processing_status === 'completed') {
          clearInterval(interval);
          toast.success(`${knowledge.name} processado com sucesso!`);
        } else if (knowledge.processing_status === 'failed') {
          clearInterval(interval);
          toast.error(`Erro ao processar ${knowledge.name}`);
        }
      } catch {
        clearInterval(interval);
      }
    }, 3000); // Verificar a cada 3 segundos
  };

  const handleDeleteKnowledge = async (knowledgeId: number) => {
    try {
      await skillService.deleteKnowledge(knowledgeId);
      setKnowledges(knowledges.filter(k => k.id !== knowledgeId));
      toast.success('Conhecimento removido!');
    } catch (error) {
      console.error('Erro ao deletar conhecimento:', error);
      toast.error('Erro ao deletar conhecimento');
    }
  };

  // ============= Material Functions =============

  const handleUploadMaterial = async () => {
    if (!skill || !newMaterial.file) return;
    
    setUploadingMaterial(true);
    try {
      // 1. Upload arquivo para S3
      const uploadResult = await skillService.uploadMaterialFile(skill.id, newMaterial.file);
      
      // 2. Criar registro de material
      const material = await skillService.createMaterial(skill.id, {
        material_type: newMaterial.type,
        name: newMaterial.name,
        description: newMaterial.description,
        usage_context: newMaterial.usageContext,
        s3_bucket: uploadResult.s3_bucket,
        s3_key: uploadResult.s3_key,
        s3_region: uploadResult.s3_region,
        s3_url: uploadResult.s3_url,
        file_name: uploadResult.file_name,
        file_size: uploadResult.file_size,
        file_mime_type: uploadResult.file_mime_type,
        file_hash: uploadResult.file_hash
      });
      
      setMaterials([...materials, material]);
      setNewMaterial({ type: 'pdf', name: '', description: '', usageContext: '' });
      setShowAddMaterial(false);
      toast.success('Material adicionado!');
    } catch (error) {
      console.error('Erro ao adicionar material:', error);
      toast.error('Erro ao adicionar material');
    } finally {
      setUploadingMaterial(false);
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    try {
      await skillService.deleteMaterial(materialId);
      setMaterials(materials.filter(m => m.id !== materialId));
      toast.success('Material removido!');
    } catch (error) {
      console.error('Erro ao deletar material:', error);
      toast.error('Erro ao deletar material');
    }
  };

  // ============= Tab Change =============

  const handleTabChange = async (newTab: TabType) => {
    if (activeTab === 'identification') {
      await saveIdentification();
    } else if (activeTab === 'retrieval') {
      await saveRetrievalConfig();
    }
    
    setActiveTab(newTab);
  };

  // ============= Activate Skill =============

  const handleActivate = async () => {
    if (!skill) return;
    
    setLoading(true);
    try {
      // 1. Validar
      const validation = await skillService.validateSkill(skill.id);
      
      if (!validation.valid) {
        toast.error('Validação falhou');
        validation.errors.forEach(error => toast.error(error));
        return;
      }
      
      // 2. Ativar
      await skillService.updateSkill(skill.id, { status: 'active' });
      toast.success('Habilidade ativada!');
      navigate('/workspace/skills');
    } catch (error) {
      console.error('Erro ao ativar habilidade:', error);
      toast.error('Erro ao ativar habilidade');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/workspace/skills');
  };

  // ============= Render =============

  if (loading && !skill) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-[#5e6ad2]" />
      </div>
    );
  }

  if (!currentWorkspace) return <NoWorkspaceState />;

  return (
    <div className="flex flex-col h-full bg-[#08090a] text-[#f7f8f8]">
      {/* Header */}
      <div className="bg-[#08090a] border-b border-[#222326] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#f7f8f8]">
              {skill?.status === 'draft' ? 'Criar Nova Habilidade' : 'Editar Habilidade'}
            </h1>
            <p className="text-sm text-[#8a8f98] mt-1">
              {skill?.status === 'draft' ? 'Rascunho - salvo automaticamente' : 'Configure todos os aspectos da sua habilidade'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            {skill?.status === 'draft' && (
              <Button onClick={handleActivate} disabled={loading || !formData.name}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Ativar Habilidade
              </Button>
            )}
            {skill?.status !== 'draft' && (
              <Button onClick={saveIdentification} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Salvar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-[#08090a] border-b border-[#222326] px-6">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-[#5e6ad2] text-[#f7f8f8]"
                    : "border-transparent text-[#8a8f98] hover:text-[#f7f8f8] hover:border-[#222326]"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Identification Tab */}
          {activeTab === 'identification' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-[#121417] rounded-lg border border-[#222326] p-6">
                <h2 className="text-lg font-semibold text-[#f7f8f8] mb-6">Informações Básicas</h2>
                
                <div className="space-y-8 max-w-4xl">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-medium text-[#f7f8f8] mb-2">
                      Nome da Habilidade <span className="text-red-400">*</span>
                    </label>
                    <Input
                      placeholder="Ex: Liderança, Python Avançado, Atendimento ao Cliente..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full"
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-[#f7f8f8] mb-2">Descrição</label>
                    <textarea
                      placeholder="Descreva brevemente esta habilidade..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="flex min-h-[80px] w-full rounded-md border border-[#222326] bg-[#08090a] px-3 py-2 text-sm placeholder:text-[#555a64] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <p className="text-xs text-[#8a8f98] mt-2">
                      Uma breve descrição para ajudar a identificar esta habilidade.
                    </p>
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="block text-sm font-medium text-[#f7f8f8] mb-3">Tipo de Habilidade</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setFormData({ ...formData, type: 'hard' })}
                        className={cn(
                          "relative flex flex-col items-start p-4 border-2 rounded-xl transition-all hover:shadow-sm",
                          formData.type === 'hard'
                            ? "border-[#5e6ad2] bg-[#15181c]"
                            : "border-[#222326] hover:border-[#5e6ad2] bg-[#121417]"
                        )}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <span className={cn(
                            "font-semibold text-base",
                            formData.type === 'hard' ? "text-[#f7f8f8]" : "text-[#8a8f98]"
                          )}>
                            Hard Skills
                          </span>
                          {formData.type === 'hard' && (
                            <CheckCircle className="h-5 w-5 text-[#5e6ad2]" />
                          )}
                        </div>
                        <p className="text-sm text-[#8a8f98] text-left">
                          Habilidades técnicas, mensuráveis e específicas para uma função.
                        </p>
                      </button>

                      <button
                        onClick={() => setFormData({ ...formData, type: 'soft' })}
                        className={cn(
                          "relative flex flex-col items-start p-4 border-2 rounded-xl transition-all hover:shadow-sm",
                          formData.type === 'soft'
                            ? "border-purple-500 bg-[#15181c]"
                            : "border-[#222326] hover:border-purple-500 bg-[#121417]"
                        )}
                      >
                         <div className="flex items-center justify-between w-full mb-2">
                          <span className={cn(
                            "font-semibold text-base",
                            formData.type === 'soft' ? "text-purple-300" : "text-[#8a8f98]"
                          )}>
                            Soft Skills
                          </span>
                          {formData.type === 'soft' && (
                            <CheckCircle className="h-5 w-5 text-purple-300" />
                          )}
                        </div>
                        <p className="text-sm text-[#8a8f98] text-left">
                          Habilidades comportamentais, interpessoais e emocionais.
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Knowledge Tab */}
          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              <div className="bg-[#121417] rounded-lg border border-[#222326] p-6">
                <h2 className="text-lg font-semibold text-[#f7f8f8] mb-4">Adicionar Conhecimento</h2>
                
                <div className="mb-4">
                  <input
                    type="file"
                    id="knowledge-file-upload"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadKnowledgeFile(file);
                    }}
                  />
                  <label htmlFor="knowledge-file-upload">
                    <Button asChild disabled={uploadingKnowledge}>
                      <span>
                        {uploadingKnowledge ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload Arquivo
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              {/* Knowledge List */}
              <div className="bg-[#121417] rounded-lg border border-[#222326] p-6">
                <h2 className="text-lg font-semibold text-[#f7f8f8] mb-4">
                  Fontes Vinculadas ({knowledges.length})
                </h2>
                
                {knowledges.length === 0 ? (
                  <div className="text-center py-8 text-[#8a8f98]">
                    Nenhuma fonte de conhecimento adicionada ainda
                  </div>
                ) : (
                  <div className="space-y-3">
                    {knowledges.map((knowledge) => (
                      <div
                        key={knowledge.id}
                        className="flex items-center justify-between p-4 border border-[#222326] rounded-lg bg-[#15181c]"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="h-5 w-5 text-[#8a8f98]" />
                          <div className="flex-1">
                            <div className="font-medium text-[#f7f8f8]">{knowledge.name}</div>
                            <div className="text-sm text-[#8a8f98]">
                              {knowledge.processing_status === 'pending' && (
                                <span className="flex items-center gap-1 text-yellow-400">
                                  <AlertCircle className="h-3 w-3" />
                                  Aguardando processamento
                                </span>
                              )}
                              {knowledge.processing_status === 'processing' && (
                                <span className="flex items-center gap-1 text-[#5e6ad2]">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Processando...
                                </span>
                              )}
                              {knowledge.processing_status === 'completed' && (
                                <span className="flex items-center gap-1 text-green-400">
                                  <CheckCircle className="h-3 w-3" />
                                  {knowledge.total_chunks} chunks • {knowledge.total_tokens} tokens
                                </span>
                              )}
                              {knowledge.processing_status === 'failed' && (
                                <span className="flex items-center gap-1 text-red-400">
                                  <XCircle className="h-3 w-3" />
                                  Erro ao processar
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKnowledge(knowledge.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              <div className="bg-[#121417] rounded-lg border border-[#222326] p-6">
                <h2 className="text-lg font-semibold text-[#f7f8f8] mb-4">Adicionar Material</h2>
                
                <Button onClick={() => setShowAddMaterial(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Material
                </Button>

                {showAddMaterial && (
                  <div className="mt-4 p-4 border border-[#222326] rounded-lg space-y-4 bg-[#15181c]">
                    <div>
                      <label className="text-sm font-medium text-[#f7f8f8]">Nome</label>
                      <Input
                        value={newMaterial.name}
                        onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#f7f8f8]">Descrição</label>
                      <textarea
                        value={newMaterial.description}
                        onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-[#222326] rounded-md bg-[#121417]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#f7f8f8]">Quando usar?</label>
                      <textarea
                        value={newMaterial.usageContext}
                        onChange={(e) => setNewMaterial({ ...newMaterial, usageContext: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-[#222326] rounded-md bg-[#121417]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#f7f8f8]">Arquivo</label>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setNewMaterial({ ...newMaterial, file });
                        }}
                        className="block w-full text-sm text-[#8a8f98] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#1a1d21] file:text-[#f7f8f8] hover:file:bg-[#222633]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUploadMaterial} disabled={uploadingMaterial}>
                        {uploadingMaterial && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Adicionar
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddMaterial(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Materials List */}
              <div className="bg-[#121417] rounded-lg border border-[#222326] p-6">
                <h2 className="text-lg font-semibold text-[#f7f8f8] mb-4">
                  Materiais ({materials.length})
                </h2>
                
                {materials.length === 0 ? (
                  <div className="text-center py-8 text-[#8a8f98]">
                    Nenhum material adicionado ainda
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-4 border border-[#222326] rounded-lg bg-[#15181c]"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <FileUp className="h-5 w-5 text-[#8a8f98]" />
                          <div className="flex-1">
                            <div className="font-medium text-[#f7f8f8]">{material.name}</div>
                            <div className="text-sm text-[#8a8f98]">{material.usage_context}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMaterial(material.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Retrieval Tab */}
          {activeTab === 'retrieval' && (
            <div className="space-y-6">
              <div className="bg-[#121417] rounded-lg border border-[#222326] p-6">
                <h2 className="text-lg font-semibold text-[#f7f8f8] mb-4">Parent-Child Chunking</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#f7f8f8]">
                      Tamanho do Chunk Pai (tokens)
                    </label>
                    <Input
                      type="number"
                      value={retrievalConfig.parent_chunk_size}
                      onChange={(e) => setRetrievalConfig({ ...retrievalConfig, parent_chunk_size: parseInt(e.target.value) })}
                      className="max-w-xs"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Tamanho do Chunk Filho (tokens)
                    </label>
                    <Input
                      type="number"
                      value={retrievalConfig.child_chunk_size}
                      onChange={(e) => setRetrievalConfig({ ...retrievalConfig, child_chunk_size: parseInt(e.target.value) })}
                      className="max-w-xs"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Sobreposição (tokens)
                    </label>
                    <Input
                      type="number"
                      value={retrievalConfig.chunk_overlap}
                      onChange={(e) => setRetrievalConfig({ ...retrievalConfig, chunk_overlap: parseInt(e.target.value) })}
                      className="max-w-xs"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Threshold de Similaridade
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={retrievalConfig.similarity_threshold}
                      onChange={(e) => setRetrievalConfig({ ...retrievalConfig, similarity_threshold: parseFloat(e.target.value) })}
                      className="max-w-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
