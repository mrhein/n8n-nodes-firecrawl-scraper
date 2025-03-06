import { INodeProperties } from 'n8n-workflow';

// Fields for the Scrape resource
const scrapeFields: INodeProperties[] = [
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['scrape'],
			},
		},
		default: '',
		required: true,
		description: 'The URL to scrape',
		placeholder: 'https://example.com',
	},
	{
		displayName: 'Enable Debug Logs',
		name: 'enableDebugLogs',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['scrape'],
			},
		},
		default: false,
		description: 'Whether to enable debug logs in the output',
	},
];

// Export all properties for the Scrape resource
export const scrapeProperties: INodeProperties[] = [...scrapeFields];
