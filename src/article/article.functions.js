const axios = require('axios');
const cheerio = require('cheerio');
const { isEmpty } = require('lodash');

const config = require('../config');

/**
 * Get New York Times home page and extract the article urls
 */
async function get_nyt_urls() {
	try {
		const response = await axios.get(config.urls.nyt);

		// If no response errors occurred continue
		if (response.status == 200) {
			const $ = cheerio.load(response.data);

			let urls = [];
			const links = $('.assetWrapper');

			// Extract article urls
			for (let index = 0; index < links.length; index++) {
				const link = links[index];
				const anchor = $(link).find('a').attr('href');

				if (!isEmpty(anchor) && config.regex.html.test(anchor))
					urls.push(config.urls.nyt + anchor);
			}

			return urls;
		} else {
			throw new Error('Something went wrong when fetching home page');
		}
	} catch (error) {
		throw error;
	}
}

/**
 * Get a New York Times article and extract headline, summary and body
 * @param {String} url The article url
 */
async function parse_nyt_article(url) {
	try {
		const response = await axios.get(url);

		// If no response errors occurred continue
		if (response.status === 200) {
			const $ = cheerio.load(response.data);

			// Extract headline, summary and body
			const headline = $('h1').attr('itemprop', 'headline').text();
			const summary = $('#article-summary').text();
			const body = $('.StoryBodyCompanionColumn').find('p').text();

			return { headline, summary, body };
		} else {
			throw new Error('Something went wrong when fetching article');
		}
	} catch (error) {
		throw error;
	}
}

/**
 * Get Washington Post home page and extract the article urls
 */
async function get_twp_urls() {
	try {
		const response = await axios.get(config.urls.twp);

		// If no response errors occurred continue
		if (response.status === 200) {
			const $ = cheerio.load(response.data);
			const links = $('div');

			let urls = [];

			for (let index = 0; index < links.length; index++) {
				const link = links[index];
				console.log(link);
			}

			return urls;
		} else {
			throw new Error('Something went wrong when fetching article');
		}
	} catch (error) {
		throw error;
	}
}

get_twp_urls()
	.then()
	.catch((e) => console.log(e));

/**
 * Get a Washington Post news article and extract headline, summary and body
 * @param {String} url The article url
 */
async function parse_twp_article(url) {}

/**
 * Get CNN home page and extract the article urls
 */
async function get_cnn_articles() {}

/**
 * Get a CNN article and extract headline, summary and body
 * @param {String} url The article url
 */
async function parse_cnn_article(url) {}
