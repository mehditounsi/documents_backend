class ForbiddenError extends Error {
    constructor(message, code = 403, context, ...params) {
        super(...params);
    
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, ForbiddenError );
        }
    
        this.message = message;
        this.code = code;
        this.context = context; 
        this.date = new Date();
      }
}
 

//--------------------------------------------------
class InactiveAccountError extends Error {
    constructor(message, code = 404, context, ...params) {
        super(...params);
    
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, InactiveAccountError );
        }
    
        this.message = message;
        this.code = code;
        this.context = context; 
        this.date = new Date();
      }
}


//--------------------------------------------------
class InternalServerError extends Error {
    constructor(message, code = 500, context, ...params) {
        super(...params);
    
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, InternalServerError );
        }
    
        this.message = message;
        this.code = code;
        this.context = context; 
        this.date = new Date();
      }
}


//----------------------------------------------------
class InvalidDataError extends Error {
    constructor(message, code = 400, context, ...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(...params);
    
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, InvalidDataError );
        }
    
        this.message = message;
        this.code = code;
        this.context = context; 
        this.date = new Date();
      }
}


//-----------------------------------------------------
class UnAuthorizedError extends Error {
    constructor(message, code = 401, context, ...params) {
        super(...params);
    
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, UnAuthorizedError );
        }
    
        this.message = message;
        this.code = code;
        this.context = context; 
        this.date = new Date();
      }
}


//------------------------------------------------------
class NotFoundError extends Error {
    constructor(message, code = 404, context, ...params) {
        super(...params);
    
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, NotFoundError );
        }
    
        this.message = message;
        this.code = code;
        this.context = context; 
        this.date = new Date();
      }
}

module.exports = {
    NotFoundError : NotFoundError,
    UnAuthorizedError : UnAuthorizedError,
    InvalidDataError : InvalidDataError,
    InternalServerError : InternalServerError,
    InactiveAccountError : InactiveAccountError,
    ForbiddenError : ForbiddenError
  }
