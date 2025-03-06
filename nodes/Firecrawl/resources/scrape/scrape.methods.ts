import FirecrawlApp from '@mendable/firecrawl-js';
import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

export const scrapeMethods = {
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
	},
};
