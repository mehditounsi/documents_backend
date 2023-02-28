const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const template = new mongoose.Schema({
    title : {
        type  : String,
        required : true
    },
    html : {
        type  : String
    },
    items : {
        type : ObjectId,
        ref : 'Tempitem'
    },
    owner : {
        type : ObjectId,
        ref : 'User'
    },
    created_at: { type: Date, default: Date.now }
});


const Template =  mongoose.model('Template', template);

module.exports = Template;