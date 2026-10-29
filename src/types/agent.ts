/**
 * VoiceForge AI Agent Configuration & Session Types
 */

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  role: string;
  first_message: string;
  system_prompt: string;
  voice_id: string;
  voice_name: string;
  language: string;
  temperature: number;
  turn_timeout: number;
  suggested_questions: string[];
  elevenlabs_agent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface VoiceOption {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
  preview_url?: string;
  gender?: 'male' | 'female' | 'neutral';
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
}

export interface SessionRecord {
  id: string;
  agent_id: string;
  agent_name: string;
  elevenlabs_agent_id?: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  messages: ConversationMessage[];
  rating?: number;
  notes?: string;
}

export interface ServerStatus {
  gemini_configured: boolean;
  elevenlabs_configured: boolean;
  server_time: string;
  node_env: string;
}

export interface GenerateAgentRequest {
  description: string;
  role?: string;
  style?: string;
  language?: string;
  voice_preference?: string;
}
