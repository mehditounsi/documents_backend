const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const keystore = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['CSD', 'CAC']
  },
  box: {
    type: ObjectId,
    ref: 'Box'
  },
  user: {
    type: ObjectId,
    ref: 'User'
  },
  owner: {
    type: ObjectId,
    ref: 'User'
  },
  csd: {
    key: {
      type: String
    },
    iv: {
      type: String
    },
    nonce_length : Number,
    mac_length : Number
  },
  cac: {
    pb : String,
    pv : String,
    nonce : String,
    mac : String,
    nonce_length : Number,
    mac_length : Number
  },
  status : {
    type  : String,
    required : true,
    enum:['ACTIVE','DESACTIVATED'],
    default:'ACTIVE'
},
  created_at: { type: Date, default: Date.now }
});


const Keystore = mongoose.model('Keystore', keystore);

module.exports = Keystore;