import { supplyModel } from '@n8n/ai-node-sdk';
import { NodeConnectionTypes, UserError } from 'n8n-workflow';
import type { INodeType, INodeTypeDescription, ISupplyDataFunctions, SupplyData } from 'n8n-workflow';

const baseUrl = 'https://api.acedata.cloud/v1';

export class LmChatAceDataCloud implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Ace Data Cloud Chat Model',
    name: 'lmChatAceDataCloud',
    icon: { light: 'file:icon.png', dark: 'file:icon.dark.png' },
    group: ['transform'],
    version: [1],
    description: 'Use an Ace Data Cloud chat model in an AI Agent or chain',
    subtitle: '={{ $parameter["model"] }}',
    defaults: { name: 'Ace Data Cloud Chat Model' },
    inputs: [],
    outputs: [NodeConnectionTypes.AiLanguageModel],
    outputNames: ['Model'],
    credentials: [{ name: 'aceDataChatApi', required: true }],
    codex: {
      categories: ['AI'],
      subcategories: {
        AI: ['Language Models', 'Root Nodes'],
        'Language Models': ['Chat Models (Recommended)'],
      },
      resources: {
        primaryDocumentation: [{ url: 'https://github.com/AceDataCloud/AceChatN8N#quick-start' }],
        credentialDocumentation: [{ url: 'https://github.com/AceDataCloud/AceChatN8N#3-save-the-credential-in-n8n' }],
      },
    },
    properties: [{
      displayName: 'Model',
      name: 'model',
      type: 'string',
      default: 'gpt-4.1-mini',
      required: true,
      description: 'An Ace Data Cloud chat-completions model ID available to your application key',
    }],
  };

  async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
    const credentials = await this.getCredentials('aceDataChatApi');
    const token = credentials.apiToken;
    if (typeof token !== 'string' || !token.trim())
      throw new UserError('An Ace Data Cloud Chat API credential is required');
    const rawModel = this.getNodeParameter('model', itemIndex);
    if (typeof rawModel !== 'string' || !rawModel.trim() || rawModel.length > 128)
      throw new UserError('Enter a chat-completions model ID of at most 128 characters');
    return supplyModel(this, {
      type: 'openai',
      baseUrl,
      apiKey: token.trim(),
      model: rawModel.trim(),
      useResponsesApi: false,
      maxRetries: 0,
      timeout: 300000,
    });
  }
}
