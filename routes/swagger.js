const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../config/api_documentation.json');
// YAML = require('yamljs');
// const fs = require('fs');
// const swaggerDocument = fs.readFileSync(__dirname + '/../config/api_documentation.yaml',);

// function YAMLtoJSON(yamlStr) { 
// 	var obj = YAML.parse(yamlStr); 
// 	var jsonStr = JSON.stringify(obj); 
// 	return jsonStr; 
// } 

module.exports = (router) => {
    router.use('/api-docs', swaggerUi.serve , swaggerUi.setup(swaggerDocument));
}