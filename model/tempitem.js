const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const tempitem = new mongoose.Schema({
    title : {
        type  : String,
        required : true
    },
    html : {
        type  : String
    },
    owner : {
        type : ObjectId,
        ref : 'User'
    },
    created_at: { type: Date, default: Date.now }
});


const Tempitem =  mongoose.model('Tempitem', tempitem);

module.exports = Tempitem;