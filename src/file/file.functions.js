const { Lemma } = require('../lemma');
const config = require('../config');

const fs = require('fs-extra');
const xml = require('xml2js');
const path = require('path');
const mongoose = require('mongoose');

/**
 * Parse XML file and store inverted index in the database.
 * @param {String} filename Name of file to be parsed.
 */
async function parse_xml_file(filename = config.files.default_xml_name) {
	try {
		const parser = new xml.Parser();
		const file = fs.readFileSync(
			path.join(config.files.root_dir, filename),
			'utf8'
		);
		const parsed = await parser.parseStringPromise(file);

		let result = [];

		for (let i = 0; i < parsed.inverted_index.lemma.length; i++) {
			const l = parsed.inverted_index.lemma[i];

			let formatted_lemma = {
				_id: mongoose.Types.ObjectId(),
				name: l.$.name,
				articles: {},
			};

			l.document.forEach(
				(d) => (formatted_lemma.articles[d.$.id] = { weight: d.$.weight })
			);

			const lemma = new Lemma(formatted_lemma);

			await lemma.save();
			result.push({ name: formatted_lemma.name, id: formatted_lemma._id });
		}

		return result;
	} catch (error) {
		throw error;
	}
}

/**
 * Parse JSON file and store inverted index to database.
 * @param {String} filename JSON file name.
 */
async function parse_json_file(filename = config.files.default_json_name) {
	try {
		const file = require(path.join(config.files.root_dir, filename));
		let result = [];

		for (let i = 0; i < file.length; i++) {
			const l = file[i];

			const lemma = {
				_id: mongoose.Types.ObjectId(),
				...l,
			};

			result.push({ id: lemma._id, name: lemma.name });
		}

		return result;
	} catch (error) {
		throw error;
	}
}

/**
 * Export database inverted index to file.
 * @param {String} filename Name of file to be exported.
 */
async function export_xml_file(filename = config.files.default_xml_name) {
	try {
		const lemmas = await Lemma.find({}, { name: 1, articles: 1 }).lean();
		const index_obj = {
			inverted_index: {
				lemma: lemmas.map((lemma) => {
					let l = {};
					l.$ = { name: lemma.name };
					l.document = [];

					for (let article_id in lemma.articles) {
						l.document.push({
							$: { id: article_id, weight: lemma.articles[article_id].weight },
						});
					}

					return l;
				}),
			},
		};

		const builder = new xml.Builder();
		const file = builder.buildObject(index_obj);

		return fs.outputFile(path.join(config.files.root_dir, filename), file);
	} catch (error) {
		throw error;
	}
}

/**
 * Export database inverted index to json file.
 * @param {String} filename JSON file name.
 */
async function export_json_file(filename = config.files.default_json_name) {
	try {
		const lemmas = await Lemma.find({}, { name: 1, documents: 1 }).lean();

		return fs.outputFile(
			path.join(config.files.root_dir, filename),
			JSON.stringify(lemmas)
		);
	} catch (error) {
		throw error;
	}
}

async function parse_file(filename = config.files.default_xml_name) {
	try {
		// Delete previous lemmas
		await Lemma.deleteMany({});

		const split = filename.split('.');

		if (split.length !== 2) return Promise.reject('Invalid file name');

		switch (split[1]) {
			case 'xml':
				// code block
				return parse_xml_file(filename);
			case 'json':
				// code block
				return parse_json_file(filename);
			default:
				// code block
				return Promise.reject('Invalid file extension');
		}
	} catch (error) {
		throw error;
	}
}

async function export_file(filename = config.files.default_xml_name) {
	try {
		const split = filename.split('.');

		if (split.length !== 2) return Promise.reject('Invalid file name');

		switch (split[1]) {
			case 'xml':
				// code block
				return export_xml_file(filename);
			case 'json':
				// code block
				return export_json_file(filename);
			default:
				// code block
				return Promise.reject('Invalid file extension');
		}
	} catch (error) {
		throw error;
	}
}

module.exports = {
	parse_xml_file,
	parse_json_file,
	export_xml_file,
	export_json_file,
	parse_file,
	export_file,
};
