import { INodeProperties } from 'n8n-workflow';

// Fields for the Map resource
const mapFields: INodeProperties[] = [
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['map'],
			},
		},
		default: '',
		required: true,
		description: 'The starting URL to map',
		placeholder: 'https://example.com',
	},
];

// Export all properties for the Map resource
export const mapProperties: INodeProperties[] = [...mapFields];
