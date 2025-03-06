/* eslint-disable n8n-nodes-base/node-dirname-against-convention */
import FirecrawlApp from '@mendable/firecrawl-js';
import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

// Helper function to parse URLs input
export function parseUrlsInput(urlsInput: string): string[] {
	if (!urlsInput) return [];

	// Check if input is already a JSON array
	if (urlsInput.trim().startsWith('[') && urlsInput.trim().endsWith(']')) {
		try {
			const parsed = JSON.parse(urlsInput);
			if (Array.isArray(parsed)) {
				return parsed.map((url) => url.toString().trim());
			}
		} catch (e) {
			// If JSON parsing fails, continue with other methods
		}
	}

	// Split by comma if it's a comma-separated list
	if (urlsInput.includes(',')) {
		return urlsInput.split(',').map((url) => url.trim());
	}

	// Single URL case
	return [urlsInput.trim()];
}

// Helper function to generate schema from JSON example
export function generateSchemaFromExample(jsonExample: any): any {
	if (jsonExample === null) {
		return { type: 'null' };
	}

	if (Array.isArray(jsonExample)) {
		if (jsonExample.length === 0) {
			return {
				type: 'array',
				items: {
					type: 'string',
				},
			};
		}

		// If it's an array, generate schema for the first item
		// and use it as the items schema
		const itemSchema = generateSchemaFromExample(jsonExample[0]);
		return {
			type: 'array',
			items: itemSchema,
		};
	}

	if (typeof jsonExample === 'object') {
		const properties: Record<string, any> = {};
		const required: string[] = [];

		// Generate schema for each property
		for (const [key, value] of Object.entries(jsonExample)) {
			properties[key] = generateSchemaFromExample(value);
			required.push(key);
		}

		return {
			type: 'object',
			properties,
			required,
		};
	}

	// Simple types
	const type = typeof jsonExample;
	return { type };
}

export class Firecrawl implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Firecrawl',
		name: 'firecrawl',
		icon: 'file:../../icons/flames-icon.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with the Firecrawl API',
		defaults: {
			name: 'Firecrawl',
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
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Scrape',
						value: 'scrape',
						description: 'Scrape a single URL',
						action: 'Scrape a single URL',
					},
					{
						name: 'Crawl',
						value: 'crawl',
						description: 'Crawl a website',
						action: 'Crawl a website',
					},
					{
						name: 'Map',
						value: 'map',
						description: 'Map URLs from a website',
						action: 'Map urls from a website',
					},
					{
						name: 'Extract',
						value: 'extract',
						description: 'Extract structured data from URLs',
						action: 'Extract structured data from urls',
					},
				],
				default: 'scrape',
			},

			// Scrape operation parameters
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				required: true,
				description: 'The URL to scrape',
				placeholder: 'https://example.com',
				displayOptions: {
					show: {
						operation: ['scrape'],
					},
				},
			},
			{
				displayName: 'Enable Debug Logs',
				name: 'enableDebugLogs',
				type: 'boolean',
				default: false,
				description: 'Whether to enable debug logs in the output',
				displayOptions: {
					show: {
						operation: ['scrape', 'extract'],
					},
				},
			},

			// Crawl operation parameters
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				required: true,
				description: 'The starting URL to crawl',
				placeholder: 'https://example.com',
				displayOptions: {
					show: {
						operation: ['crawl'],
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
				displayOptions: {
					show: {
						operation: ['crawl'],
					},
				},
			},

			// Map operation parameters
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				required: true,
				description: 'The starting URL to map',
				placeholder: 'https://example.com',
				displayOptions: {
					show: {
						operation: ['map'],
					},
				},
			},

			// Extract operation parameters
			{
				displayName: 'URL(s)',
				name: 'urls',
				type: 'string',
				default: '',
				required: true,
				description:
					'The URL(s) to extract data from. For multiple URLs, use comma-separated values or JSON array format [url1, url2, ...].',
				placeholder: 'https://example.com or [https://example1.com, https://example2.com]',
				displayOptions: {
					show: {
						operation: ['extract'],
					},
				},
			},
			{
				displayName: 'Extraction Method',
				name: 'extractionMethod',
				type: 'options',
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
				displayOptions: {
					show: {
						operation: ['extract'],
					},
				},
			},
			{
				displayName: 'Extraction Prompt',
				name: 'extractionPrompt',
				type: 'string',
				default: '',
				description: 'The prompt to guide the extraction process',
				displayOptions: {
					show: {
						operation: ['extract'],
						extractionMethod: ['simple', 'schema'],
					},
				},
				placeholder: 'Extract the main content from this website',
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
				description: 'How to define the schema for extraction',
				displayOptions: {
					show: {
						operation: ['extract'],
						extractionMethod: ['schema'],
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
				description: 'A JSON example that represents the data structure you want to extract',
				displayOptions: {
					show: {
						operation: ['extract'],
						extractionMethod: ['schema'],
						schemaDefinitionType: ['example'],
					},
				},
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
				default:
					'{\n  "type": "object",\n  "properties": {\n    "title": {\n      "type": "string",\n      "description": "The title of the page"\n    },\n    "description": {\n      "type": "string",\n      "description": "The meta description or summary of the page"\n    },\n    "is_product_page": {\n      "type": "boolean",\n      "description": "Whether this page is a product page"\n    },\n    "links": {\n      "type": "array",\n      "items": {\n        "type": "string"\n      },\n      "description": "Important links found on the page"\n    }\n  },\n  "required": ["title", "description"]\n}',
				description:
					'The schema definition in standard JSON Schema format. Define the structure you want to extract.',
				displayOptions: {
					show: {
						operation: ['extract'],
						extractionMethod: ['schema'],
						schemaDefinitionType: ['manual'],
					},
				},
				hint: 'Use standard JSON Schema format with "type", "properties", and optional "required" fields',
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

		// Get the selected operation
		const operation = this.getNodeParameter('operation', 0) as string;

		// Process each item
		for (let i = 0; i < items.length; i++) {
			try {
				switch (operation) {
					case 'scrape': {
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
						break;
					}

					case 'crawl': {
						// Get parameters
						const url = this.getNodeParameter('url', i) as string;
						const limit = this.getNodeParameter('limit', i) as number;

						// Prepare crawl parameters
						const crawlParams: any = {
							limit,
							formats: ['markdown'], // Only use markdown format
						};

						// Crawl URL
						const crawlResponse = await firecrawl.crawlUrl(url, crawlParams);

						// Add result to return data
						returnData.push({
							json: {
								success: true,
								data: crawlResponse,
							},
						});
						break;
					}

					case 'map': {
						// Get parameters
						const url = this.getNodeParameter('url', i) as string;

						// Prepare map parameters
						const mapParams: any = {};

						// Map URL
						const mapResponse = await firecrawl.mapUrl(url, mapParams);

						// Add result to return data
						returnData.push({
							json: {
								success: true,
								data: mapResponse,
							},
						});
						break;
					}

					case 'extract': {
						// Get parameters
						const urlsInput = this.getNodeParameter('urls', i) as string;
						const urls = parseUrlsInput(urlsInput);
						const enableDebugLogs = this.getNodeParameter('enableDebugLogs', i, false) as boolean;

						if (urls.length === 0) {
							throw new NodeOperationError(this.getNode(), 'No valid URLs provided', {
								itemIndex: i,
							});
						}

						const extractionMethod = this.getNodeParameter('extractionMethod', i) as
							| 'simple'
							| 'schema';

						// Create extraction options
						const extractOptions: any = {};

						// Add prompt for both simple and schema-based extraction
						const prompt = this.getNodeParameter('extractionPrompt', i) as string;
						if (prompt) {
							extractOptions.prompt = prompt;
						}

						// Add schema for schema-based extraction
						if (extractionMethod === 'schema') {
							let schema;
							const schemaDefinitionType = this.getNodeParameter('schemaDefinitionType', i) as
								| 'example'
								| 'manual';

							try {
								if (schemaDefinitionType === 'example') {
									// Generate schema from JSON example
									const jsonExampleString = this.getNodeParameter('jsonExample', i) as string;
									const jsonExample = JSON.parse(jsonExampleString);
									schema = generateSchemaFromExample(jsonExample);

									if (enableDebugLogs) {
										console.log('JSON example:', JSON.stringify(jsonExample, null, 2));
										console.log('Generated schema:', JSON.stringify(schema, null, 2));
									}
								} else {
									// Use manually defined schema
									const schemaDefinition = this.getNodeParameter('schemaDefinition', i) as string;
									schema = JSON.parse(schemaDefinition);

									if (enableDebugLogs) {
										console.log('Manual schema:', JSON.stringify(schema, null, 2));
									}
								}

								// Add schema to options
								extractOptions.schema = schema;
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									`Invalid schema: ${error instanceof Error ? error.message : String(error)}`,
									{ itemIndex: i },
								);
							}
						}

						// Log the extraction parameters if debug is enabled
						if (enableDebugLogs) {
							console.log('URLs:', JSON.stringify(urls, null, 2));
							console.log('Extract options:', JSON.stringify(extractOptions, null, 2));
						}

						// Call the extract method
						const extractResult = await firecrawl.extract(urls, extractOptions);

						// Log the result if debug is enabled
						if (enableDebugLogs) {
							console.log('Extract result:', JSON.stringify(extractResult, null, 2));
						}

						// Add result to return data
						returnData.push({
							json: {
								success: true,
								data: extractResult,
								debug: enableDebugLogs
									? {
											urls,
											options: extractOptions,
										}
									: undefined,
							},
						});
						break;
					}

					default:
						throw new NodeOperationError(this.getNode(), `Operation ${operation} is not supported`);
				}
			} catch (error: unknown) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				console.error(`${operation} error:`, errorMessage);

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

