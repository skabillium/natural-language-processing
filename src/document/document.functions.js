const path = require('path');
const fs = require('fs-extra');
const mongoose = require('mongoose');
const { isEmpty } = require('lodash');

const Document = require('./document.model');
const { nlpService } = require('../nlp');

/**
 * Calculate tf-idf vectors for every categorized document given from path
 * @param {String} dir_path Path to categorized document directory
 */
async function train(dir_path) {
	try {
		// Resolve path to absolute
		dir_path = path.resolve(dir_path);

		const categories = fs.readdirSync(dir_path);
		let stems = {};
		let saved_documents = [];

		// Initialize the tf-idf calculator
		const tfidf = nlpService.tfidf;

		// For every category in directory
		for (let i = 0; i < 1; i++) {
			const category_name = categories[i];
			const category_path = path.join(dir_path, category_name);

			// Get all documents
			const documents = fs.readdirSync(category_path);

			// For every document
			for (let j = 0; j < documents.length; j++) {
				const document_name = documents[j];
				const document_path = path.join(category_path, document_name);

				console.log(`Processing document ${category_name}/${document_name}`);

				// Get document text and stem every word
				const document_text = fs.readFileSync(document_path, 'utf-8');
				const stemmed = nlpService.stem_text(document_text);

				// Extract the unique stems from text
				stemmed.forEach((stem) => {
					if (isEmpty(stems[stem])) stems[stem] = '';
				});

				// Save document to database
				const document = new Document({
					_id: mongoose.Types.ObjectId(),
					name: document_name,
					category: category_name,
					text: document_text,
					stems: stemmed,
				});

				// await document.save();
				saved_documents.push(document._id);

				// Add document to tf-idf calculator
				tfidf.addDocument(stemmed);
			}
		}

		const stem_array = Object.keys(stems);
		console.log(
			`Extracted ${stem_array.length} stems from ${saved_documents.length} documents`
		);

		// Get tf-idf vector for every document and save to database
		fs.writeFileSync('yolo.json', JSON.stringify(stem_array));

		return;
	} catch (error) {
		throw error;
	}
}

async function compare(doc_path) {
	try {
	} catch (error) {
		throw error;
	}
}

module.exports = { train, compare };
