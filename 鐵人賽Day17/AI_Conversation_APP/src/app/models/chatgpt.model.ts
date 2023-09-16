export interface WhisperResponseModel {
  text: string;
}

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessageModel {
  role?: ChatRole;
  name?: string;
  content: string;
}

export interface ChatRequestModel {
  model: string;
  messages: ChatMessageModel[];
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  max_tokens?: number;
}

export interface ChatResponseModel {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatChoicesModel[];
  usage: ChatUsageModel
}

export interface ChatChoicesModel {
  index: number;
  message: ChatMessageModel;
  finish_reason: string;
}

export interface ChatUsageModel {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
