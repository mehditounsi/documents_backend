const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const docrequest = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  max_sending: {
    type: Number,
  },
  sending_count: {
    type: Number,
  },
  mailing_list: [
    {
      // A valider
      type: String,
    },
  ],
  template: {
    type: ObjectId,
    ref: "Template",
  },
  owner: {
    type: ObjectId,
    ref: "User",
  },
  description: {
    type: String,
  },
  activities: [
    {
      type: ObjectId,
      ref: "Activity",
    },
  ],
  parent_folder: {
    type: ObjectId,
    ref: "Folder",
  },
  old_parent_folder :{
    type : ObjectId,
    ref : 'Folder'
},
  status: {
    type: String,
    required: true,
    enum: ["EXPIRED", "ACTIVE", "DEACTIVATED", "SUSPENDED"],
    default: "ACTIVE",
  },
  expires_at: { type: Date },
  created_at: { type: Date, default: Date.now },
  last_modified: {
    modified_at: {
      type: Date,
      default: Date.now,
    },
    modifier: {
      type: ObjectId,
      ref: "User",
    },
  },
  allow_anonymous: {
      type : Boolean,
      default :false
  }
});

const DocRequest = mongoose.model("Docrequest", docrequest);

module.exports = DocRequest;
