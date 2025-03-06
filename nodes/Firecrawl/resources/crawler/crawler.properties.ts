import { INodeProperties } from 'n8n-workflow';

// Fields for the Crawler resource
const crawlerFields: INodeProperties[] = [
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['crawler'],
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
			},
		},
		default: 50,
		description: 'Max number of results to return',
	},
];

// Export all properties for the Crawler resource
export const crawlerProperties: INodeProperties[] = [...crawlerFields];
