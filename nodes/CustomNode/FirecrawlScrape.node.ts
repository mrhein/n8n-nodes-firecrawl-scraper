/* eslint-disable n8n-nodes-base/node-dirname-against-convention */
import FirecrawlApp from '@mendable/firecrawl-js';
import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class FirecrawlScrape implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Firecrawl Scrape',
		name: 'firecrawlScrape',
		icon: 'file:../../icons/firecrawl-scrape.svg',
		group: ['transform'],
		version: 1,
		description: 'Scrape a single URL using Firecrawl API',
		defaults: {
			name: 'Firecrawl Scrape',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'firecrawlApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				required: true,
				description: 'The URL to scrape',
				placeholder: 'https://example.com',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{
						name: 'Markdown',
						value: 'markdown',
						description: 'Output in Markdown format',
					},
				],
				default: 'markdown',
				description: 'The format of the scraped data',
			},
			{
				displayName: 'Enable Debug Logs',
				name: 'enableDebugLogs',
				type: 'boolean',
				default: false,
				description: 'Whether to enable debug logs in the output',
			},
			{
				displayName: 'Schema Definition Type',
				name: 'schemaDefinitionType',
				type: 'options',
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
				description: 'How to define the schema for scraping',
				displayOptions: {
					show: {
						outputFormat: ['json'],
					},
				},
			},
			{
				displayName: 'JSON Example',
				name: 'jsonExample',
				type: 'json',
				typeOptions: {
					alwaysOpenEditWindow: true,
					rows: 8,
				},
				default: '{\n  "summary": "text",\n  "links": ["link1", "link2"]\n}',
				description: 'A JSON example that represents the data structure you want to scrape',
				displayOptions: {
					show: {
						outputFormat: ['json'],
						schemaDefinitionType: ['example'],
					},
				},
				hint: 'Provide a JSON object that represents the structure you want to scrape',
			},
			{
				displayName: 'Schema Definition',
				name: 'schemaDefinition',
				type: 'json',
				typeOptions: {
					alwaysOpenEditWindow: true,
					rows: 12,
				},
				default:
					'{\n  "type": "object",\n  "properties": {\n    "title": {\n      "type": "string",\n      "description": "The title of the page"\n    },\n    "description": {\n      "type": "string",\n      "description": "The meta description or summary of the page"\n    },\n    "is_product_page": {\n      "type": "boolean",\n      "description": "Whether this page is a product page"\n    },\n    "links": {\n      "type": "array",\n      "items": {\n        "type": "string"\n      },\n      "description": "Important links found on the page"\n    }\n  },\n  "required": ["title", "description"]\n}',
				description:
					'The schema definition in standard JSON Schema format. Define the structure you want to scrape.',
				displayOptions: {
					show: {
						outputFormat: ['json'],
						schemaDefinitionType: ['manual'],
					},
				},
				hint: 'Use standard JSON Schema format with "type", "properties", and optional "required" fields',
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'notice',
				default: '',
				description: 'Scraping will always retrieve data in Markdown format',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const credentials = await this.getCredentials('firecrawlApi');
		const apiKey = credentials.apiKey as string;

		// Initialize Firecrawl app
		const firecrawl = new FirecrawlApp({ apiKey });

		// Process each item
		for (let i = 0; i < items.length; i++) {
			try {
				// Get parameters
				const url = this.getNodeParameter('url', i) as string;
				const outputFormat = 'markdown';
				const enableDebugLogs = this.getNodeParameter('enableDebugLogs', i, false) as boolean;

				// Create scrape options
				const scrapeOptions: any = {
					formats: [outputFormat],
				};

				// Log the scrape parameters if debug is enabled
				if (enableDebugLogs) {
					console.log('URL:', url);
					console.log('Scrape options:', JSON.stringify(scrapeOptions, null, 2));
				}

				// Scrape URL
				const scrapeResponse = await firecrawl.scrapeUrl(url, scrapeOptions);

				// Log the result if debug is enabled
				if (enableDebugLogs) {
					console.log('Scrape result:', JSON.stringify(scrapeResponse, null, 2));
				}

				// Add result to return data
				returnData.push({
					json: {
						success: true,
						data: scrapeResponse,
						debug: enableDebugLogs
							? {
									url,
									options: scrapeOptions,
								}
							: undefined,
					},
				});
			} catch (error: unknown) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				console.error('Scrape error:', errorMessage);

				if (this.continueOnFail()) {
					returnData.push({
						json: {
							success: false,
							error: errorMessage,
						},
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}
