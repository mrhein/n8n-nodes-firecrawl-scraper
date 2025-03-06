/* eslint-disable n8n-nodes-base/node-dirname-against-convention */
import FirecrawlApp from '@mendable/firecrawl-js';
import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class FirecrawlCrawl implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Firecrawl Crawl',
		name: 'firecrawlCrawl',
		icon: 'file:../../icons/firecrawl-crawler.svg',
		group: ['transform'],
		version: 1,
		description: 'Crawl a website using Firecrawl API',
		defaults: {
			name: 'Firecrawl Crawl',
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
				default: 50,
				description: 'Max number of results to return',
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
	}
}
