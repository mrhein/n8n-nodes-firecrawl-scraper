import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class FirecrawlApi implements ICredentialType {
	name = 'firecrawlApi';
	displayName = 'Firecrawl API';
	documentationUrl = 'https://firecrawl.dev/docs';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'The API key for authenticating with Firecrawl API. Get your API key from firecrawl.dev',
		},
	];
}
