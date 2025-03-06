import { INodeProperties } from 'n8n-workflow';

// Operations for the Crawler resource
const operations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['crawler'],
		},
	},
	default: 'crawlUrl',
	options: [
		{
			name: 'Crawl URL',
			value: 'crawlUrl',
			description: 'Crawl a website',
			action: 'Crawl a website',
		},
	],
};

// Fields for the Crawl URL operation
const crawlUrlFields: INodeProperties[] = [
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['crawler'],
				operation: ['crawlUrl'],
			},
		},
		default: '',
		required: true,
		description: 'The starting URL to crawl',
		placeholder: 'https://example.com',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['crawler'],
				operation: ['crawlUrl'],
			},
		},
		default: 50,
		description: 'Max number of results to return',
	},
];

// Export all properties for the Crawler resource
export const crawlerProperties: INodeProperties[] = [operations, ...crawlUrlFields];
