import FirecrawlApp from '@mendable/firecrawl-js';
import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

// Helper function to parse URLs input
function parseUrlsInput(urlsInput: string): string[] {
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
function generateSchemaFromExample(jsonExample: any): any {
	if (jsonExample === null) {
		return { type: 'null' };
	}

	if (typeof jsonExample === 'string') {
		return { type: 'string' };
	}

	if (typeof jsonExample === 'number') {
		return { type: 'number' };
	}

	if (typeof jsonExample === 'boolean') {
		return { type: 'boolean' };
	}

	if (Array.isArray(jsonExample)) {
		if (jsonExample.length === 0) {
			return {
				type: 'array',
				items: { type: 'string' }, // Default to string items for empty arrays
			};
		}

		// Use the first item as a sample for the items schema
		const itemSchema = generateSchemaFromExample(jsonExample[0]);
		return {
			type: 'array',
			items: itemSchema,
		};
	}

	if (typeof jsonExample === 'object') {
		const properties: Record<string, any> = {};

		for (const [key, value] of Object.entries(jsonExample)) {
			properties[key] = generateSchemaFromExample(value);
		}

		return {
			type: 'object',
			properties,
			required: Object.keys(properties),
		};
	}

	// Default fallback
	return { type: 'string' };
}

export const extractMethods = {
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const { apiKey, apiUrl } = await this.getCredentials('firecrawlApi') as {
			apiKey: string;
			apiUrl?: string
		};

		// Initialize Firecrawl app
		const baseUrl = apiUrl || 'https://api.firecrawl.dev';
		const firecrawl = new FirecrawlApp({ apiKey, apiUrl: baseUrl });

		// Process each item
		for (let i = 0; i < items.length; i++) {
			try {
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
				const extractionPrompt = this.getNodeParameter('extractionPrompt', i, '') as string;

				// Create extraction options
				const extractionOptions: any = {
					prompt: extractionPrompt,
				};

				// Handle schema-based extraction
				if (extractionMethod === 'schema') {
					const schemaDefinitionType = this.getNodeParameter('schemaDefinitionType', i) as
						| 'example'
						| 'manual';

					let schema: any;

					if (schemaDefinitionType === 'example') {
						const jsonExample = JSON.parse(this.getNodeParameter('jsonExample', i) as string);
						schema = generateSchemaFromExample(jsonExample);
					} else {
						// Manual schema definition
						schema = JSON.parse(this.getNodeParameter('schemaDefinition', i) as string);
					}

					extractionOptions.schema = schema;
				}

				// Log the extraction parameters if debug is enabled
				if (enableDebugLogs) {
					console.log('URLs:', urls);
					console.log('Extraction options:', JSON.stringify(extractionOptions, null, 2));
				}

				// Extract data from URLs
				const extractionResult = await firecrawl.extract(urls, extractionOptions);

				// Log the results if debug is enabled
				if (enableDebugLogs) {
					console.log('Extraction results:', JSON.stringify(extractionResult, null, 2));
				}

				// Add results to return data
				returnData.push({
					json: {
						success: true,
						data: extractionResult,
						debug: enableDebugLogs
							? {
									urls,
									options: extractionOptions,
								}
							: undefined,
					},
				});
			} catch (error: unknown) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				console.error('Extraction error:', errorMessage);

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
	},
};
