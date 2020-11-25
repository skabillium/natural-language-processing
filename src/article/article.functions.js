const axios = require('axios');
const cheerio = require('cheerio');
const { isEmpty } = require('lodash');
const natural = require('natural');

const config = require('../config');
// const Article = require('./article.model');

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

				if (!isEmpty(anchor) && config.regex.html.test(anchor)) {
					if (anchor.includes('http')) {
						urls.push(anchor);
					} else {
						urls.push(config.urls.nyt + anchor);
					}
				}
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
 * Tag article body
 * @param {Object} body The article body
 */
function tag_article(body) {
	// Initialize tagger
	const lexicon = new natural.Lexicon(
		config.pos_tagger.language,
		config.pos_tagger.default_category,
		config.pos_tagger.default_category_capitalized
	);
	const ruleSet = new natural.RuleSet(config.pos_tagger.language);
	const tagger = new natural.BrillPOSTagger(lexicon, ruleSet);

	// Initialize tokenizer
	const tokenizer = new natural.WordTokenizer();

	const tokenized_body = tokenizer.tokenize(body);
	const result = tagger.tag(tokenized_body);
	return result.taggedWords;
}

/**
 * Scrape and parse all New York Times home page articles.
 */
async function get_articles() {
	try {
		let articles = [];
		const urls = await get_nyt_urls();
		for (let index = 0; index < urls.length; index++) {
			const url = urls[index];
			if (index === 1) break;

			let article = await parse_nyt_article(url);
			article.tags = tag_article(article.body);

			articles.push(article);
		}

		return articles;
	} catch (error) {
		throw error;
	}
}

module.exports = {
	get_nyt_urls,
	parse_nyt_article,
	tag_article,
	get_articles,
};
