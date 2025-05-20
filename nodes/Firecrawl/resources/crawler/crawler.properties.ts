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
	{
		displayName: 'Only Main Content',
		name: 'onlyMainContent',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['crawler'],
			},
		},
		default: false,
		description: 'Whether to only return the main content of the page',
	},
	{
		displayName: 'Include Tags',
		name: 'includeTags',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['crawler'],
			},
		},
		default: '',
		description:
			'Comma-separated list of tags to include in the scraped data. E.g., "h1,h2,p"',
	},
	{
		displayName: 'Exclude Tags',
		name: 'excludeTags',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['crawler'],
			},
		},
		default: '',
		description:
			'Comma-separated list of tags to exclude from the scraped data. E.g., "script,style"',
	},
	{
		displayName: 'Formats',
		name: 'formats',
		type: 'multiOptions',
		displayOptions: {
			show: {
				resource: ['crawler'],
			},
		},
		options: [
			{
				name: 'Markdown',
				value: 'markdown',
				description: 'Format the output as Markdown',
			},
			{
				name: 'HTML',
				value: 'html',
				description: 'Format the output as HTML',
			},
			{
				name: 'Raw HTML',
				value: 'rawHtml',
				description: 'Format the output as raw HTML',
			},
			{
				name: 'JSON',
				value: 'json',
				description: 'Format the output as JSON',
			},
			{
				name: 'content',
				value: 'content',
				description: 'Format the output as content',
			},
			{
				name: 'links',
				value: 'links',
				description: 'Format the output as links',
			},
			{
				name: 'screenshot',
				value: 'screenshot',
				description: 'Format the output as screenshot',
			},
			{
				name: 'screenshot@fullPage',
				value: 'screenshot@fullPage',
				description: 'Format the output as full page screenshot',
			},
			{
				name: 'extract',
				value: 'extract',
				description: 'Format the output as extract',
			},
			{
				name: 'changeTracking',
				value: 'changeTracking',
				description: 'Format the output as change tracking',
			},
		],
		default: ['markdown'],
		description: 'Output formats for the scraped data',
	},
];

// Export all properties for the Crawler resource
export const crawlerProperties: INodeProperties[] = [...crawlerFields];
