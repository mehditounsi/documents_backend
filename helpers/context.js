var httpContext = require('express-http-context');

exports.getUser = ()=>{
    return httpContext.get('gUser')
}

exports.getUserId=()=>{
    return httpContext.get('gUserID')
}

exports.getUserIpAddress=()=>{
    return httpContext.get('gUserIP')
}


exports.getLanguage=() =>{
    return httpContext.get('gLanguage') ?? 'Fr'
}


exports.getUserLogin= ()=>{
    return httpContext.get('UserLogin')
}

exports.getUserIP= () =>{
    return httpContext.get('gUserIP')
}

exports.getUserRootFolder = ()=>{
    return httpContext.get('root').toString()
}

exports.getUserInboxFolder = ()=>{
 return httpContext.get('inbox').toString()
}

exports.getUserTrashFolder = ()=>{
    return httpContext.get('trash')
}

exports.getUserStarredFolder = ()=>{
    return httpContext.get('starred')
}