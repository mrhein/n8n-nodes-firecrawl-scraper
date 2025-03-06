import { INodeProperties } from 'n8n-workflow';

// Operations for the Extract resource
const operations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['extract'],
		},
	},
	default: 'extractData',
	options: [
		{
			name: 'Extract Data',
			value: 'extractData',
			description: 'Extract structured data from URLs',
			action: 'Extract structured data from urls',
		},
	],
};

// Fields for the Extract Data operation
const extractDataFields: INodeProperties[] = [
	{
		displayName: 'URL(s)',
		name: 'urls',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['extract'],
				operation: ['extractData'],
			},
		},
		default: '',
		required: true,
		description:
			'The URL(s) to extract data from. For multiple URLs, use comma-separated values or JSON array format [url1, url2, ...].',
		placeholder: 'https://example.com or [https://example1.com, https://example2.com]',
	},
	{
		displayName: 'Extraction Method',
		name: 'extractionMethod',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['extract'],
				operation: ['extractData'],
			},
		},
		options: [
			{
				name: 'Simple Extraction',
				value: 'simple',
				description: 'Extract data using a prompt',
			},
			{
				name: 'Schema Based Extraction',
				value: 'schema',
				description: 'Extract data using a defined schema',
			},
		],
		default: 'simple',
		description: 'The method to use for extraction',
	},
	{
		displayName: 'Extraction Prompt',
		name: 'extractionPrompt',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['extract'],
				operation: ['extractData'],
				extractionMethod: ['simple', 'schema'],
			},
		},
		default: '',
		description: 'The prompt to guide the extraction process',
		placeholder: 'Extract the main content from this website',
	},
	{
		displayName: 'Schema Definition Type',
		name: 'schemaDefinitionType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['extract'],
				operation: ['extractData'],
				extractionMethod: ['schema'],
			},
		},
		options: [
			{
				name: 'Generate From JSON Example',
				value: 'example',
				description: 'Generate schema from a JSON example',
			},
			{
				name: 'Define Below',
				value: 'manual',
				description: 'Define schema manually in JSON Schema format',
			},
		],
		default: 'manual',
		description: 'How to define the schema for extraction',
	},
	{
		displayName: 'JSON Example',
		name: 'jsonExample',
		type: 'json',
		typeOptions: {
			alwaysOpenEditWindow: true,
			rows: 8,
		},
		displayOptions: {
			show: {
				resource: ['extract'],
				operation: ['extractData'],
				extractionMethod: ['schema'],
				schemaDefinitionType: ['example'],
			},
		},
		default: '{\n  "summary": "text",\n  "links": ["link1", "link2"]\n}',
		description: 'A JSON example that represents the data structure you want to extract',
		hint: 'Provide a JSON object that represents the structure you want to extract',
	},
	{
		displayName: 'Schema Definition',
		name: 'schemaDefinition',
		type: 'json',
		typeOptions: {
			alwaysOpenEditWindow: true,
			rows: 12,
		},
		displayOptions: {
			show: {
				resource: ['extract'],
				operation: ['extractData'],
				extractionMethod: ['schema'],
				schemaDefinitionType: ['manual'],
			},
		},
		default:
			'{\n  "type": "object",\n  "properties": {\n    "title": {\n      "type": "string",\n      "description": "The title of the page"\n    },\n    "description": {\n      "type": "string",\n      "description": "The meta description or summary of the page"\n    },\n    "is_product_page": {\n      "type": "boolean",\n      "description": "Whether this page is a product page"\n    },\n    "links": {\n      "type": "array",\n      "items": {\n        "type": "string"\n      },\n      "description": "Important links found on the page"\n    }\n  },\n  "required": ["title", "description"]\n}',
		description:
			'The schema definition in standard JSON Schema format. Define the structure you want to extract.',
		hint: 'Use standard JSON Schema format with "type", "properties", and optional "required" fields',
	},
	{
		displayName: 'Enable Debug Logs',
		name: 'enableDebugLogs',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['extract'],
				operation: ['extractData'],
			},
		},
		default: false,
		description: 'Whether to enable debug logs in the output',
	},
];

// Export all properties for the Extract resource
export const extractProperties: INodeProperties[] = [operations, ...extractDataFields];
