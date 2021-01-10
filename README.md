# Natural Language Processing

NLP school project for indexing and categorizing websites, made with NodeJS. This project consists of the following 2 questions:

1. Creating an inverted lemma index from new york times and cbs articles. The purpose of the index is the querying of lemmas
   extracted from the articles.
2. Creating a method to categorize a given document according to it's similarity with a given categorized document.

## Getting started

To install the project you will need:

- NodeJs, a javascript server runtime library.
- npm, package manager for NodeJs

If you have installed the dependencies required run the following commands:

```BASH
    # Clone repository
    git clone https://github.com/skabillium/natural-language-processing.git

    # Install project
    cd natural-language-processing
    npm install
```

The project is implemented as a CLI so every command should be run in the root directory of the project in the following manner:

```BASH
    npm start <COMMAND> <OPTIONS>
```

Before starting the project make sure to replace the default database connection string, in the src/config.js file, with the one you will be using.

## Question 1

There are the following functionalities regarding the first question:

#### 1. Fetch articles

Scrape the home pages of the new york times and cbs websites & save them to the database

```BASH
    npm start fetch articles
```

#### 2. Fetch distinct lemmas

Extract the distinct lemmas from the saved articles and save them to the database.

```BASH
    npm start fetch lemmas
```

#### 3. Create/Fetch inverted index

Create inverted index from database lemmas

```BASH
    npm start fetch index
```

#### 4. Find lemmas

Query the inverted index with space separated search terms

```BASH
    npm start find <TERM1> <TERM2> ...
```

#### 5. Export index

Export inverted index to XML or JSON file. If no file is provided, an XML file will be created.

```BASH
    npm start export <FILENAME>

    # Some examples
    npm start export index.json
    npm start export index.xml
```

#### 6. Import index

Import inverted index from file. If no file is provided, the cli will look for inverted-index.xml

```BASH
    npm start import <FILENAME>

    # Some examples
    npm start import index.json
    npm start import index.xml
```

#### 7. Test response times

In order for this function to work a query file like the following must be provided. The file must be in the project root directory.

```JSON
    [
        ["term1","term2","term3"],
        ["term4"],
        ["term5","term6"]
    ]
```

```BASH
    npm start <FILENAME>

    # Example
    npm start import queries.json
```

#### 8. Get article/lemma

Get an article or a lemma from the database.

```BASH
    # Article
    npm start get article <ARTICLE_ID>

    #Lemma
    npm start get lemma <LEMMA_ID>
```

#### 9. Delete article/lemma

Delete an article or lemma from the database.

```BASH
    #Article
    npm start delete article <ARTICLE_ID>

    #Lemma
    npm start delete lemma <LEMMA_ID>
```

### Question 2

There are the following functionalities regarding the second question:

#### 1. Train

Import a categorized corpus for training.

```BASH
    npm start train /path/to/corpus/
```

#### 2. Compare

Compare document with the categorized corpus and categorize it.

```BASH
    npm start compare /path/to/file/
```
