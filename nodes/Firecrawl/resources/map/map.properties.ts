import { INodeProperties } from 'n8n-workflow';

// Operations for the Map resource
const operations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['map'],
		},
	},
	default: 'mapUrl',
	options: [
		{
			name: 'Map URL',
			value: 'mapUrl',
			description: 'Map URLs from a website',
			action: 'Map urls from a website',
		},
	],
};

// Fields for the Map URL operation
const mapUrlFields: INodeProperties[] = [
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['map'],
				operation: ['mapUrl'],
			},
		},
		default: '',
		required: true,
		description: 'The starting URL to map',
		placeholder: 'https://example.com',
	},
];

// Export all properties for the Map resource
export const mapProperties: INodeProperties[] = [operations, ...mapUrlFields];
