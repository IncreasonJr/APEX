export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelUsed?: string;
  toolsUsed?: {
    webSearch?: boolean;
    codeExecution?: boolean;
    memory?: boolean;
  };
  attachedFile?: {
    name: string;
    size: number;
    type: string;
    url?: string;
    content?: string;
  };
}

export interface ChatRequestData {
  message: string;
  model_choice: string;
}
