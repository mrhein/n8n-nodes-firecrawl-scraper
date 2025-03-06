import { INodeProperties } from 'n8n-workflow';

// Operations for the Scrape resource
const operations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['scrape'],
		},
	},
	default: 'scrapeUrl',
	options: [
		{
			name: 'Scrape URL',
			value: 'scrapeUrl',
			description: 'Scrape a single URL',
			action: 'Scrape a single URL',
		},
	],
};

// Fields for the Scrape URL operation
const scrapeUrlFields: INodeProperties[] = [
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['scrape'],
				operation: ['scrapeUrl'],
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
				operation: ['scrapeUrl'],
			},
		},
		default: false,
		description: 'Whether to enable debug logs in the output',
	},
];

// Export all properties for the Scrape resource
export const scrapeProperties: INodeProperties[] = [operations, ...scrapeUrlFields];
