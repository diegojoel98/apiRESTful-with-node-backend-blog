'use strict'
var validator = require('validator');
var Article = require('../models/article');
var fs = require('fs');
var path = require('path');
const { exists } = require('../models/article');
const { param } = require('../routes/article');

var controller = {
    curso: (req, res)=>{
        var hola = req.body.hola;
        return res.status(200).send({
            nombre: 'Diego',
            apellido: 'Gongora',
            hola
        });
    },
    test: (req, res) => {
        return res.status(200).send({
            message: 'Hola desde el controlador'
        });
    },
    save: (req, res) => {
         // Recoger parametros por post
        var params = req.body;

        // Validar datos con validator
        try{
            var validateTitle = !validator.isEmpty(params.title);
            var validateContent = !validator.isEmpty(params.content);
        }catch(err) {
            return res.status(200).send({
                status: 'error',
                message: 'Error: missing data'
            });
        }

        if(validateTitle && validateContent) {
            // Crear el objeto a guardar
            var article = new Article();

            // Asignar valores
            article.title = params.title;
            article.content = params.content;
            
            if(params.img) {
                article.img = params.img;
            } else {
                article.img = null;
            }

            // Guardar el articulo (método save)
            article.save((err, articleSaved) =>{
                if(err || !articleSaved) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'Article not saved!'
                    });
                }
                return res.status(200).send({
                    status: 'success',
                    article: articleSaved
                });

            });
            // Devolver una respuesta

            /*return res.status(200).send({
                message: 'Validation successful'
            });
            return res.status(200).send({
                status: 'success',
                article
            });*/
        }
        else {
            return res.status(200).send({
                status: 'error',
                message: 'Data no valid'
            });
        }
        
    },

    getArticles: (req, res) => {
        // Find
        var query = Article.find({});
        var last = req.params.last;
        if(last || last != undefined) {
            query.limit(5);
        }

        query.sort('-_id').exec((err, articles) =>{
            if(err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'There are an error in return articles'
                });
            }
            if(!articles) {
                return res.status(404).send({
                    status: 'error',
                    message: 'There not articles'
                });
            }
            return res.status(200).send({
                status: 'success',
                articles
            });
        });        
    },

    getArticle: (req, res) => {
        // Recoger id
        var id = req.params.id;

        // Comprobar que existe
        if(!id || id == null) {
            return res.status(200).send({
                status: 'error',
                message: 'Error, id not exist'
            });
        }

        // Buscar y devolver el artículo
        Article.findById(id, (err, article) => {
            if(err || !article) {
                return res.status(404).send({
                    status: 'error',
                    message: 'There no are article'
                });
            }
            return res.status(200).send({
                status: 'success',
                article
            });
        });
    },

    updateArticle: (req, res) => {
        // View id
        var id = req.params.id;

        // Take the data sent
        var params = req.body;

        // Validate data
        try{
            var validateTitle = !validator.isEmpty(params.title);
            var validateContent = !validator.isEmpty(params.content);
        }catch(err) {
            return res.status(404).send({
                status: 'error',
                message: 'Missing data'
            });
        }

        if(validateTitle && validateContent) {
            // Find and update
            Article.findOneAndUpdate({_id: id}, params, {new: true}, (err, articleUpdate) => {
                if(err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error in server'
                    });
                }
                if(!articleUpdate) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No article'
                    });
                }
                return res.status(200).send({
                    status: 'success',
                    article: articleUpdate
                });
            });
        } else {
            return res.status(500).send({
                status: 'error',
                message: 'Data no valid'
            });
        }
    },

    deleteArticle: (req, res) => {
        // View id
        var id = req.params.id;

        // Find and delete
        Article.findByIdAndDelete({_id: id}, (err, articleRemoved) => {
            if(err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error in delete article'
                });
            }
            if(!articleRemoved) {
                return res.status(404).send({
                    status: 'error',
                    message: 'Article not found and not removed'
                });
            }

            return res.status(200).send({
                status: 'success',
                article: articleRemoved
            });
        });
    },

    upload: (req, res) => {
        // Configure connect-multiparty
        // Take the file
        var fileName = 'Image do not upload'
        
        if(!req.files) {
            return res.status(404).send({
                status: 'success',
                message: fileName
            });
        }

        // Obtain name of file
        var filePath = req.files.file0.path;
        var pathSplit = filePath.split('\\');
        /* If Linux or MAC
        var pathSplit = filePath.split('/'); */
        var fileName = pathSplit[2];
        
        // Obtain extension of file
        var extensionSplit = fileName.split('\.');
        var fileExtension = extensionSplit[1];

        // Verify extension, only images
        if(fileExtension != 'png' && fileExtension != 'jpg' && fileExtension != 'jpeg' && fileExtension != 'gif') {
            // Delete file
            fs.unlink(filePath, (err) =>{
                return res.status(500).send({
                    status: 'error',
                    message: 'File not valid'
                });
            });
        }
        else {
            // Find article and assign the file (image)
            var id = req.params.id;

            if(id) {
                Article.findOneAndUpdate({_id: id}, {img: fileName}, {new: true}, (err, articleUpdate) => {
                    if(err) {
                        return res.status(404).send({
                            status: 'error',
                            message: 'Error in save file'
                        });
                    }
    
                    return res.status(200).send({
                        status: 'success',
                        article: articleUpdate
                    });
                });
            } else {
                return res.status(200).send({
                    status: 'success',
                    img: fileName
                });
            }
        }
            
    },

    getImage: (req, res) => {
        // Get file
        var file = req.params.image;
        var pathFile = './upload/articles/' + file;

        fs.exists(pathFile, (exists) => {
            if(exists) {
                return res.sendFile(path.resolve(pathFile));
            }
            else {
                return res.status(404).send({
                    status: 'error',
                    message: 'The image does not exist'
                });
            }
        });
    },

    search: (req, res) => {
        // Get string
        var searchString = req.params.search;

        // Find and or
        Article.find({ "$or": [
            { "title": { "$regex": searchString, "$options": "i"}},
            { "content": { "$regex": searchString, "$options": "i"}}
        ]
        }).sort([['date', 'descending']]).exec((err, articles) => {
            if(err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error in search'
                });
            }
            if(!articles || articles.length <= 0) {
                return res.status(404).send({
                    status: 'error',
                    message: 'There no articles',
                    articles
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });
        });
    }

};

module.exports = controller;