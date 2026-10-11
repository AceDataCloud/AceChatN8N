import type { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class AceDataChatApi implements ICredentialType {
  name = 'aceDataChatApi';
  displayName = 'Ace Data Cloud Chat API';
  documentationUrl = 'https://github.com/AceDataCloud/AceChatN8N#3-save-the-credential-in-n8n';
  icon = 'file:../nodes/LmChatAceDataCloud/icon.png' as const;
  properties: INodeProperties[] = [{
    displayName: 'API Token', name: 'apiToken', type: 'string',
    typeOptions: { password: true }, default: '', required: true,
    description: 'An Ace Data Cloud application API token with AI Chat access',
  }];
  authenticate: IAuthenticateGeneric = {
    type: 'generic', properties: { headers: { Authorization: '=Bearer {{$credentials.apiToken}}' } },
  };
  test: ICredentialTestRequest = {
    request: { baseURL: 'https://api.acedata.cloud', url: '/v1/models', method: 'GET' },
  };
}
