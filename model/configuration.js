const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

NotifEvent = {
    type: Object,
    enum: [
        {
            event: 'comment-document',
            title: "New Document Comment",
            description: "Receive notifications when someone comments a document that you have access to."
        },
        {
            event: 'comment-box',
            title: "New Box Comment",
            description: "Receive notifications when someone comments a box that you have access to."
        },
        {
            event: 'shared',
            title: "Content shared",
            description: "Box shared with someone"
        },
        {
            event: 'share',
            title: "New Share",
            description: "Receive notifications when someone shares something with you"
        },
        {
            event: 'new_content',
            title: "New Content",
            description: "Receive notifications when someone uploads a new content to a box that you have access to."
        },
        {
            event: 'download',
            title: "New Download",
            description: "Receive notifications when someone downloads a file from your box."
        }
    ]
}

        
const configuration = new mongoose.Schema({
    tokens: {
        type: [{
            type: String
        }],
        default: []
    },
    user: {
        type: ObjectId,
        ref: 'User'
    },
    notif_preferences: {
        type: [NotifEvent],
        default: [
            {
                event: 'comment-document',
                description: "",
            },
            {
                event: 'comment-box',
                description: "",
            },
            {
                event: 'share',
                description: "",
            },
            {
                event: 'shared',
                description: "",
            },
            {
                event: 'new_content',
                description: "",
            },
            {
                event: 'download',
                description: "",
            }]
    },
    system_theme: {
        type: Boolean,
        default: true
    },
    dark_theme: {
        type: Boolean,
        default: true
    },
    theme: {
        type: String,
    },
    language: {
        type: String,
        required: true,
        enum: ['en', 'fr', 'ar'],
        default: 'en'
    }
})

configuration.methods.addToken = async function (token) {
    if (token && token!=null) {
        this.tokens.push(token)
        this.tokens = [...new Set(this.tokens)]
        await this.save()
    }
}

configuration.methods.deleteToken = async function (token) {
    if (token) {
        for (var i = 0; this.tokens && i < this.tokens.length; i++) {
            if (this.tokens[i].toString() == token) {
                this.tokens.splice(i, 1)
            }
        }
    } else {
        this.tokens = []
    }
    await this.save()
}




const Configuration = mongoose.model('Configuration', configuration);

module.exports = Configuration;