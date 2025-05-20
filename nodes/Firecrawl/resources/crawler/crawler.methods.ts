import FirecrawlApp from '@mendable/firecrawl-js';
import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

export const crawlerMethods = {
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
				const url = this.getNodeParameter('url', i) as string;
				const limit = this.getNodeParameter('limit', i) as number;
				const onlyMainContent = this.getNodeParameter('onlyMainContent', i, false) as boolean;
				const includeTags = this.getNodeParameter('includeTags', i) as string[];
				const excludeTags = this.getNodeParameter('excludeTags', i) as string[];
				// formats with default value of ["markdown"]
				const formats = this.getNodeParameter('formats', i) as string[] || ['markdown'];
				let scrapeOptions: any = {
					formats: formats
				};
				if (includeTags.length > 0) {
					scrapeOptions.includeTags = includeTags.map((tag) => tag.trim());
				}
				if (excludeTags.length > 0) {
					scrapeOptions.excludeTags = excludeTags.map((tag) => tag.trim());
				}
				if (onlyMainContent) {
					scrapeOptions.onlyMainContent = onlyMainContent;
				}

				// Crawl URL
				const crawlResponse = await firecrawl.crawlUrl(url, {
					limit,
					scrapeOptions: scrapeOptions
				});

				// Add result to return data
				returnData.push({
					json: {
						success: true,
						data: crawlResponse,
					},
				});
			} catch (error: unknown) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							success: false,
							error: error instanceof Error ? error.message : String(error),
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
