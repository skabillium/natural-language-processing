const axios = require('axios');
const cheerio = require('cheerio');
const { isEmpty } = require('lodash');

const config = require('../config');

async function get_nyt_articles() {
	try {
		const response = await axios.get(config.urls.nyt);

		if (response.status == 200) {
			const $ = cheerio.load(response.data);

			let urls = [];
			const links = $('.assetWrapper');

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

async function parse_nyt_article(url) {
	try {
		const response = await axios.get(url);

		if (response.status === 200) {
			const $ = cheerio.load(response.data);

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

async function get_wsj_articles() {
	try {
		const response = await axios.get(config.urls.wsj);

		const $ = cheerio.load(response.data);

		if (response.status === 200) {
		} else {
			throw new Error('Something went wrong when fetching article');
		}
	} catch (error) {
		throw error;
	}
}

async function parse_wsj_article(url) {}

async function get_cnn_articles() {}

async function parse_cnn_article() {}
