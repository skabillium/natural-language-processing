const axios = require('axios');
const { isEmpty } = require('lodash');
const { JSDOM } = require('jsdom');
const mongoose = require('mongoose');

const { nlpService } = require('../nlp');
const config = require('../config');
const Article = require('./article.model');

/**
 * Get New York Times home page and extract the article urls
 */
async function get_nyt_urls() {
	try {
		const response = await axios.get(config.urls.nyt);

		// If no response errors occurred continue
		if (response.status !== 200)
			throw new Error('Something went wrong when fetching home page');

		const dom = new JSDOM(response.data);

		let urls = [];

		// Select all article elements
		dom.window.document.querySelectorAll('article').forEach((article) => {
			// Select all anchor elements
			article.querySelectorAll('a').forEach((anchor) => {
				// Extract url from anchor
				const link = anchor.getAttribute('href');
				if (!isEmpty(link) && link.includes('.html')) {
					// Check if link is relative or absolute and save accordingly
					if (link.includes('http')) urls.push(link);
					else urls.push(config.urls.nyt + link);
				}
			});
		});

		return urls;
	} catch (error) {
		throw error;
	}
}

async function get_cbs_urls() {
	try {
		const response = await axios.get(config.urls.cbs);

		// If no response errors occurred continue
		if (response.status !== 200)
			throw new Error('Something went wrong when fetching home page');

		const dom = new JSDOM(response.data);

		let urls = [];

		dom.window.document.querySelectorAll('.item__anchor').forEach((anchor) => {
			const link = anchor.getAttribute('href');
			if (!link.includes('video') && !link.includes('pictures'))
				urls.push(link);
		});

		return urls;
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
		if (response.status !== 200)
			throw new Error('Something went wrong when fetching home page');

		const dom = new JSDOM(response.data);

		// Extract headline and body
		const headline = dom.window.document.querySelector(
			'h1[itemprop="headline"]'
		).textContent;
		let body = '';
		dom.window.document
			.querySelectorAll('.StoryBodyCompanionColumn')
			.forEach((b) => {
				b.querySelectorAll('p').forEach((p) => (body += p.textContent + ' '));
			});

		return { headline, body };
	} catch (error) {
		throw error;
	}
}

async function parse_cbs_article(url) {
	try {
		const response = await axios.get(url);

		// If no response errors occurred continue
		if (response.status !== 200)
			throw new Error('Something went wrong when fetching home page');

		const dom = new JSDOM(response.data);

		// Extract headline and body
		const headline = dom.window.document.querySelector('.content__title')
			.textContent;

		let body = '';
		dom.window.document
			.querySelectorAll('p')
			.forEach((p) => (body += p.textContent));

		return { headline, body };
	} catch (error) {
		throw error;
	}
}

/**
 * Scrape and parse all New York Times home page articles.
 */
async function fetch_articles() {
	try {
		const [nyt_urls, cbs_urls] = await Promise.all([
			get_nyt_urls(),
			get_cbs_urls(),
		]);

		console.log(
			`Fetching ${nyt_urls.length} NYT articles and ${cbs_urls.length} CBS articles`
		);
		// const urls = [...nyt_urls, ...cbs_urls];
		const urls = [nyt_urls[6], cbs_urls[0]];
		let articles = [];

		for (let i = 0; i < urls.length; i++) {
			const url = urls[i];
			let parsed = {};

			// If article already exists in database, don't parse it
			if (await Article.exists({ url })) continue;

			console.log(`Parsing ${url}`);

			// If parsing error occurs, continue with the rest of the articles
			try {
				// Check if url is from nyt or cbs and parse accordingly
				if (url.includes(config.urls.nyt))
					parsed = await parse_nyt_article(url);
				else parsed = await parse_cbs_article(url);
			} catch (error) {
				continue;
			}

			const pos_tags = nlpService.tag_text(parsed.body);

			const article = new Article({
				_id: mongoose.Types.ObjectId(),
				url,
				headline: parsed.headline,
				body: parsed.body,
				pos_tags,
			});

			const saved = await article.save();

			articles.push({
				id: saved._id,
				url: saved.url,
			});
		}

		console.log(`${articles.length} articles were successfully inserted`);

		return articles;
	} catch (error) {
		throw error;
	}
}

module.exports = {
	get_nyt_urls,
	get_cbs_urls,
	parse_nyt_article,
	parse_cbs_article,
	fetch_articles,
};
