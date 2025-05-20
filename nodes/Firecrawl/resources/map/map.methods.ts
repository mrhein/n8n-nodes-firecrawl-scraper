import FirecrawlApp from '@mendable/firecrawl-js';
import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

export const mapMethods = {
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
