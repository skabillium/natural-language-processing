const path = require('path');
const fs = require('fs-extra');
const mongoose = require('mongoose');

const Document = require('./document.model');
const { nlpService } = require('../nlp');
const { Stem } = require('../stem');
const config = require('../config');

/**
 * Calculate tf-idf vectors for every categorized document given from path
 * @param {String} dir_path Path to categorized document directory
 */
async function train(dir_path) {
	try {
		// Delete previous stems and documents
		const deleted_docs = await Document.deleteMany({});

		console.log(`Deleting previous ${deleted_docs.deletedCount} documents...`);

		// Resolve given directory path to absolute
		dir_path = path.resolve(dir_path);

		// Initialize TF-IDF calculator
		const tfidf = nlpService.tfidf;

		// Get the categories from directory. ( Each subdirectory is a document category )
		const categories = fs.readdirSync(dir_path);

		// Initialize document and stem variables.
		let saved_stems = new Set();
		let saved_documents = [];

		// Parse every document in every category and store it in database.
		for (let i = 0; i < categories.length; i++) {
			const category_name = categories[i];
			const category_path = path.join(dir_path, category_name);

			// Get all documents in category.
			const documents = fs.readdirSync(category_path);

			// Process and store documents.
			for (let j = 0; j < documents.length; j++) {
				const document_name = documents[j];
				const document_path = path.join(category_path, document_name);

				console.log(`Processing document ${category_name}/${document_name}`);

				// Get document text and stem every word
				const document_text = fs.readFileSync(document_path, 'utf8');
				const stemmed = nlpService.stem_text(document_text);

				stemmed.forEach((stem_name) => {
					if (!saved_stems.has(stem_name)) {
						if (!config.regex.numbers_only.test(stem_name))
							saved_stems.add(stem_name);
					}
				});

				// Save document to database
				const document = new Document({
					_id: mongoose.Types.ObjectId(),
					name: document_name,
					category: category_name,
					text: document_text,
					stems: stemmed,
				});

				saved_documents.push(document);

				// Add document to TF-IDF calculator for later use.
				tfidf.addDocument(stemmed);
			}
		}

		// Get all saved stems in alphabetical order
		const stem_array = Array.from(saved_stems);
		stem_array.sort();

		// Clear set to free memory
		saved_stems.clear();

		console.log(
			`Extracted ${stem_array.length} stems from ${saved_documents.length} documents`
		);

		// Stem count variable to optimize performance.
		const stem_count = stem_array.length;

		stem_array.forEach((stem, i) => {
			console.log(
				`Updating TF-IDF vectors for stem ${i + 1} of ${stem_count}: ${stem}`
			);
			tfidf.tfidfs(stem, function (index, measure) {
				saved_documents[index].tfidf_vector.push(measure);
			});
		});

		// Cache stems to file and remove from memory (for performance reasons)
		console.log('Caching stems for later use...');
		fs.writeFileSync(config.files.stems_file, JSON.stringify(stem_array));
		stem_array.length = 0;

		// Save documents to database
		console.log('Saving documents to database...');
		for (let i = 0; i < saved_documents.length; i++) {
			const document = saved_documents[i];
			await document.save();
		}

		return;
	} catch (error) {
		throw error;
	}
}

/**
 * Categorize a given document and save it in the database.
 * @param {String} doc_path Uncategorized document path.
 */
async function compare(doc_path) {
	try {
		// Get file contents and stem
		const document_text = fs.readFileSync(path.resolve(doc_path), 'utf8');
		const stemmed = nlpService.stem_text(document_text);
		let tfidf_vector = [];

		// Initialize TF-IDF calculator and add document to it
		const tfidf = nlpService.tfidf;
		tfidf.addDocument(stemmed);

		// Get all saved documents from database
		const saved_documents = await Document.find(
			{},
			{ category: 1, stems: 1, tfidf_vector: 1 }
		);

		console.log('Calculating TF-IDF vector...');
		for (let i = 0; i < saved_documents.length; i++) {
			tfidf.addDocument(saved_documents[i].stems);
		}

		// Calculate TF-IDF vector for file
		const stems = require(config.files.stems_file);

		stems.forEach((stem, i) => {
			console.log(
				`Updating TF-IDF vector for stem ${i + 1} of ${stems.length}: ${stem}`
			);
			tfidf.tfidfs(stem, function (index, measure) {
				if (index === 0) tfidf_vector.push(measure);
			});
		});

		// Find closest category
		console.log('Categorizing document...');
		let max_similarity = 0;
		let category = '';

		for (let i = 0; i < saved_documents.length; i++) {
			const doc = saved_documents[i];
			const similarity = nlpService.get_similarity(
				doc.tfidf_vector,
				tfidf_vector
			);
			if (similarity > max_similarity) {
				console.log('max similarity:', max_similarity);
				max_similarity = similarity;
				category = doc.category;
			}
		}

		// Save document to database
		const document = {
			_id: mongoose.Types.ObjectId(),
			name: path.basename(doc_path),
			text: document_text,
			stems: stemmed,
			tfidf_vector,
			category,
		};

		console.dir({ category, max_similarity }, { depth: null, colors: true });

		await document.save();
		console.log('Document categorized as', category);
		return;
	} catch (error) {
		throw error;
	}
}

module.exports = { train, compare };
