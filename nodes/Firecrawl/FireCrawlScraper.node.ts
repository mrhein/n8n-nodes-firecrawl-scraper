/* eslint-disable n8n-nodes-base/node-execute-block-wrong-error-thrown */
import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

// Import resource properties
import * as crawlerProperties from './resources/crawler/crawler.properties';
import * as extractProperties from './resources/extract/extract.properties';
import * as mapProperties from './resources/map/map.properties';
import * as scrapeProperties from './resources/scrape/scrape.properties';

// Import resource methods
import { crawlerMethods } from './resources/crawler/crawler.methods';
import { extractMethods } from './resources/extract/extract.methods';
import { mapMethods } from './resources/map/map.methods';
import { scrapeMethods } from './resources/scrape/scrape.methods';

export class FireCrawlScraper implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FireCrawl Scraper',
		name: 'fireCrawlScraper',
		icon: 'file:../../icons/flames-icon.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"]}}',
		description: 'FireCrawl API for web scraping and crawling',
		defaults: {
			name: 'FireCrawl Scraper',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'firecrawlApi',
				required: true,
			},
		],

		// Define resources
		properties: [
			// Resource selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				default: 'scrape',
				options: [
					{
						name: 'Scrape',
						value: 'scrape',
						description: 'Scrape a single URL using FireCrawl',
					},
					{
						name: 'Map',
						value: 'map',
						description: 'Map scraped data to a structured format',
					},
					{
						name: 'Crawler',
						value: 'crawler',
						description: 'Crawl multiple URLs and web pages',
					},
					{
						name: 'Extract',
						value: 'extract',
						description: 'Extract specific information from scraped content',
					},
				],
			},

			// Add resource-specific properties
			...scrapeProperties.scrapeProperties,
			...mapProperties.mapProperties,
			...crawlerProperties.crawlerProperties,
			...extractProperties.extractProperties,
		],
	};

	// Execute method to handle all resources
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const resource = this.getNodeParameter('resource', 0) as string;

		// Route execution to the appropriate resource handler
		switch (resource) {
			case 'scrape':
				return scrapeMethods.execute.call(this);
			case 'map':
				return mapMethods.execute.call(this);
			case 'crawler':
				return crawlerMethods.execute.call(this);
			case 'extract':
				return extractMethods.execute.call(this);
			default:
				throw new Error(`The resource "${resource}" is not known!`);
		}
	}
}
