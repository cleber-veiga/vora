import api from './api';

export interface Skill {
  id: number;
  workspace_id: number;
  name: string;
  slug: string;
  description?: string;
  skill: 'hard' | 'soft';
  status: 'draft' | 'active' | 'inactive' | 'archived';
  use: 'realeased' | 'unreleased';
  created_by_id?: number;
  updated_by_id?: number;
  created_at: string;
  updated_at: string;
}

export interface SkillKnowledge {
  id: number;
  skill_id: number;
  source_type: 'file' | 'website' | 'text' | 'youtube';
  name: string;
  content?: string;
  s3_bucket?: string;
  s3_key?: string;
  s3_region?: string;
  s3_url?: string;
  file_name?: string;
  file_size?: number;
  file_mime_type?: string;
  file_hash?: string;
  file_extension?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error?: string;
  processed_at?: string;
  total_chunks: number;
  total_tokens: number;
  created_at: string;
  updated_at: string;
}

export interface SkillMaterial {
  id: number;
  skill_id: number;
  material_type: 'pdf' | 'video' | 'audio' | 'image';
  name: string;
  description?: string;
  usage_context: string;
  s3_bucket: string;
  s3_key: string;
  s3_region?: string;
  s3_url?: string;
  s3_presigned_url?: string;
  presigned_url_expires_at?: string;
  file_name: string;
  file_size: number;
  file_mime_type: string;
  file_hash: string;
  file_extension?: string;
  duration?: number;
  width?: number;
  height?: number;
  page_count?: number;
  thumbnail_s3_key?: string;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SkillRetrievalConfig {
  id: number;
  skill_id: number;
  parent_chunk_size: number;
  child_chunk_size: number;
  chunk_overlap: number;
  max_results: number;
  similarity_threshold: number;
  embedding_model: string;
  embedding_dimensions: number;
  qdrant_collection_name: string;
  advanced_config?: any;
  created_at: string;
  updated_at: string;
}

export interface FileUploadResponse {
  s3_key: string;
  s3_url: string;
  s3_bucket: string;
  s3_region: string;
  file_size: number;
  file_hash: string;
  file_name: string;
  file_mime_type: string;
}

export interface SkillValidation {
  valid: boolean;
  errors: string[];
}

class SkillService {
  // ============= Skill CRUD =============
  
  async createSkill(data: {
    workspace_id: number;
    name: string;
    description?: string;
    skill: 'hard' | 'soft';
    status?: 'draft' | 'active';
  }): Promise<Skill> {
    const response = await api.post('/skill/', data);
    return response.data;
  }

  async getSkill(skillId: number): Promise<Skill> {
    const response = await api.get(`/skill/${skillId}`);
    return response.data;
  }

  async updateSkill(skillId: number, data: Partial<Skill>): Promise<Skill> {
    const response = await api.put(`/skill/${skillId}`, data);
    return response.data;
  }

  async deleteSkill(skillId: number): Promise<void> {
    await api.delete(`/skill/${skillId}`);
  }

  async listSkills(): Promise<Skill[]> {
    const response = await api.get('/skill/');
    return response.data;
  }

  // ============= Knowledge =============

  async createKnowledge(skillId: number, data: {
    source_type: 'file' | 'website' | 'text' | 'youtube';
    name: string;
    content?: string;
    s3_bucket?: string;
    s3_key?: string;
    s3_region?: string;
    s3_url?: string;
    file_name?: string;
    file_size?: number;
    file_mime_type?: string;
    file_hash?: string;
    file_extension?: string;
  }): Promise<SkillKnowledge> {
    const response = await api.post(`/skill/${skillId}/knowledge`, {
      ...data,
      skill_id: skillId
    });
    return response.data;
  }

  async listKnowledge(skillId: number): Promise<SkillKnowledge[]> {
    const response = await api.get(`/skill/${skillId}/knowledge`);
    return response.data;
  }

  async getKnowledge(knowledgeId: number): Promise<SkillKnowledge> {
    const response = await api.get(`/skill/knowledge/${knowledgeId}`);
    return response.data;
  }

  async updateKnowledge(knowledgeId: number, data: Partial<SkillKnowledge>): Promise<SkillKnowledge> {
    const response = await api.patch(`/skill/knowledge/${knowledgeId}`, data);
    return response.data;
  }

  async deleteKnowledge(knowledgeId: number): Promise<void> {
    await api.delete(`/skill/knowledge/${knowledgeId}`);
  }

  // ============= Materials =============

  async createMaterial(skillId: number, data: {
    material_type: 'pdf' | 'video' | 'audio' | 'image';
    name: string;
    description?: string;
    usage_context: string;
    s3_bucket: string;
    s3_key: string;
    s3_region?: string;
    s3_url?: string;
    file_name: string;
    file_size: number;
    file_mime_type: string;
    file_hash: string;
    file_extension?: string;
    duration?: number;
    width?: number;
    height?: number;
    page_count?: number;
    thumbnail_s3_key?: string;
  }): Promise<SkillMaterial> {
    const response = await api.post(`/skill/${skillId}/materials`, {
      ...data,
      skill_id: skillId
    });
    return response.data;
  }

  async listMaterials(skillId: number): Promise<SkillMaterial[]> {
    const response = await api.get(`/skill/${skillId}/materials`);
    return response.data;
  }

  async getMaterial(materialId: number): Promise<SkillMaterial> {
    const response = await api.get(`/skill/materials/${materialId}`);
    return response.data;
  }

  async updateMaterial(materialId: number, data: Partial<SkillMaterial>): Promise<SkillMaterial> {
    const response = await api.patch(`/skill/materials/${materialId}`, data);
    return response.data;
  }

  async deleteMaterial(materialId: number): Promise<void> {
    await api.delete(`/skill/materials/${materialId}`);
  }

  // ============= Retrieval Config =============

  async createRetrievalConfig(skillId: number, data: {
    parent_chunk_size?: number;
    child_chunk_size?: number;
    chunk_overlap?: number;
    max_results?: number;
    similarity_threshold?: number;
    embedding_model?: string;
    embedding_dimensions?: number;
    qdrant_collection_name?: string;
    advanced_config?: any;
  }): Promise<SkillRetrievalConfig> {
    const response = await api.post(`/skill/${skillId}/retrieval-config`, {
      ...data,
      skill_id: skillId
    });
    return response.data;
  }

  async getRetrievalConfig(skillId: number): Promise<SkillRetrievalConfig> {
    const response = await api.get(`/skill/${skillId}/retrieval-config`);
    return response.data;
  }

  async updateRetrievalConfig(skillId: number, data: Partial<SkillRetrievalConfig>): Promise<SkillRetrievalConfig> {
    const response = await api.patch(`/skill/${skillId}/retrieval-config`, data);
    return response.data;
  }

  // ============= File Upload =============

  async uploadKnowledgeFile(skillId: number, file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/skill/${skillId}/upload/knowledge`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadMaterialFile(skillId: number, file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/skill/${skillId}/upload/material`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // ============= Validation =============

  async validateSkill(skillId: number): Promise<SkillValidation> {
    const response = await api.get(`/skill/${skillId}/validate`);
    return response.data;
  }
}

export const skillService = new SkillService();
export default skillService;
