export interface WhisperResponseModel {
  text: string;
}

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessageModel {
  role?: ChatRole;
  name?: string;
  content: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

export interface ChatRequestModel {
  model: string;
  messages: ChatMessageModel[];
  functions?: ChatFunctionModel[];
  function_call?: string | {
    name: string;
  },
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

export type AIStyle = 'cheerful' | 'friendly' | 'excited' | '';

export interface ChatFunctionModel {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: {
      [key: string]: any;
    }
    required: string[];
  }
}

export interface ConversationDataModel {
  gptResponseText: string;
  gptResponseTextStyle: AIStyle;
  gptResponseTextStyleDegree: number;
  gptResponseEmphasisTexts: string[];
  gptResponseEmphasisStyles: string[];
}

export interface GrammerCheckDataModel {
  hasGrammerMistake: boolean;
}

export interface GrammerDataModel extends GrammerCheckDataModel {
  mistakeSentence: string;
}
