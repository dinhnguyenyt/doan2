const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ModelComments = new Schema({
    username : {type : String , default : ""},
    comments : {type : String , default : ""},
});

module.exports = mongoose.model('comments', ModelComments);
