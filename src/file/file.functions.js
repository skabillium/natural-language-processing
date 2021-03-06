const { Lemma } = require('../lemma');
const config = require('../config');

const fs = require('fs-extra');
const xml = require('xml2js');
const path = require('path');
const mongoose = require('mongoose');

/************************************* 
			Project question 1
**************************************/

/**
 * Parse XML file and store inverted index in the database.
 * @param {String} filename Name of file to be parsed.
 */
async function parse_xml_file(filename = config.files.default_xml_name) {
	try {
		// Initialize XML parser and get file contents.
		const parser = new xml.Parser();
		const file = fs.readFileSync(
			path.join(config.files.root_dir, filename),
			'utf8'
		);
		const parsed = await parser.parseStringPromise(file);

		console.log(
			`Importing ${parsed.inverted_index.lemma.length} lemmas from ${filename}`
		);

		let result = [];

		// Save every inverted index lemma in database.
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

		console.log(`Successfully imported ${result.length} lemmas`);
		return;
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
		// Get file contents.
		const file = require(path.join(config.files.root_dir, filename));
		console.log(`Importing ${file.length} lemmas from ${filename}`);

		let result = [];

		// Save every inverted index lemma in database.
		for (let i = 0; i < file.length; i++) {
			const file_entry = file[i];

			let lemma = {
				_id: mongoose.Types.ObjectId(),
				name: file_entry.name,
				articles: {},
			};

			file_entry.documents.forEach(
				(doc) => (lemma.articles[doc.id] = { weight: doc.weight })
			);

			lemma = await new Lemma(lemma);
			await lemma.save();

			result.push({ id: lemma._id, name: lemma.name });
		}

		console.log(`Successfully imported ${result.length} lemmas`);

		return;
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
		// Get every lemma from database.
		const lemmas = await Lemma.find({}, { name: 1, articles: 1 }).lean();
		console.log(`Exporting ${lemmas.length} lemmas into ${filename}`);

		// Initialize inverted index object in the required format.
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

		// Initialize XML builder module and write to file.
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
		// Get every lemma from database.
		const lemmas = await Lemma.find({}, { name: 1, articles: 1 }).lean();
		console.log(`Exporting ${lemmas.length} lemmas into ${filename}`);

		// Initialize inverted index object in the required format.
		const file = lemmas.map((lemma) => {
			let entry = { name: lemma.name, documents: [] };

			for (let article_id in lemma.articles) {
				entry.documents.push({
					id: article_id,
					weight: lemma.articles[article_id].weight,
				});
			}

			return entry;
		});

		// Write to file
		return fs.outputFile(
			path.join(config.files.root_dir, filename),
			JSON.stringify(file)
		);
	} catch (error) {
		throw error;
	}
}

/**
 * Parse a given inverted index file and store in database. Previous lemmas will be deleted.
 * Only XML and JSON formats are acceptable.
 * @param {String} filename Name of file to be parsed
 */
async function parse_file(filename = config.files.default_xml_name) {
	try {
		// Delete previous lemmas
		const deleted = await Lemma.deleteMany({});

		console.log(`Deleting previous ${deleted.deletedCount} lemmas`);

		const split = filename.split('.');

		if (split.length !== 2) return Promise.reject('Invalid file name');

		switch (split[1]) {
			case 'xml':
				return parse_xml_file(filename);
			case 'json':
				return parse_json_file(filename);
			default:
				return Promise.reject('Invalid file extension');
		}
	} catch (error) {
		throw error;
	}
}

/**
 * Export all lemmas from database to a file with the given name. Only XML and JSON formats are acceptable.
 * @param {String} filename Name of file to be exported.
 */
async function export_file(filename = config.files.default_xml_name) {
	try {
		const split = filename.split('.');

		if (split.length !== 2) return Promise.reject('Invalid file name');

		switch (split[1]) {
			case 'xml':
				return export_xml_file(filename);
			case 'json':
				return export_json_file(filename);
			default:
				return Promise.reject('Invalid file extension');
		}
	} catch (error) {
		throw error;
	}
}

/************************************* 
			Project question 2
**************************************/

module.exports = {
	parse_xml_file,
	parse_json_file,
	export_xml_file,
	export_json_file,
	parse_file,
	export_file,
};
