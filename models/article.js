'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArticleSchema = Schema({
    title: String,
    img: String,
    content: String,
    date: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Article', ArticleSchema); // articles