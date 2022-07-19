const path = require('path');
const fs = require('fs');

let response = []

/**
 * The order of tested values determine the correctness of the if/else validation
 * because chromatic.stories includes the "stories" word, for this reason
 * if the stories validation comes before chromatic validation, it will always
 * falls into stories never reaching chromatic. But because chromatic its not included
 * into stories check, if it coming before stories it will match for "chromatic"
 * and it will be rejected for "stories" falling at the sotires validation fi/else.
 */
const README = 'README';
const chromatic = 'chromatic';
const stories = 'stories';

let rootLevel = {
    README: 0,
    stories: 0,
    chromatic: 0
};

function rootFileChecker(filename){
  return rootLevel[filename] === 0
}

function rootChecker(filename) {
    if (filename.includes(README)) {
      if(rootFileChecker(README)){
        // console.log('filename', filename);
        rootLevel.README = rootLevel.README + 1;
        return true;
      } else {
        return {success:false, message:`Not allowed more than 1 ${README} file`}
      }
    } else if (filename.includes(chromatic)) {
      // console.log('filename', filename);
    if(rootFileChecker(chromatic)){
        rootLevel[chromatic] = rootLevel[chromatic] + 1;
        return true;
      } else {
        return {success:false, message:`Not allowed more than 1 ${chromatic} file`}
      }
    } else if (filename.includes(stories)) {
      if(rootFileChecker(stories)){
        // console.log('filename', filename);
        rootLevel.stories = rootLevel.stories + 1;
        return true;
      } else {
        return {success:false, message:`Not allowed more than 1 ${stories} file`}
      }
    } else if (
        !filename.includes(README) &&
        !filename.includes(chromatic) &&
        !filename.includes(stories)
    ) {
      return `No validation required ${filename}`
    } else {
        return false;
    }
}

function validateRootLevel(relativePaths){
    

  relativePaths.forEach((item) => {
      const query = item.split('/');
      /** Root level
       * query[0] === 'packages' : It means the staged "thing" is part of a component package
       * query.length === 3 ; It means the "thing" is located in component root
       * console.log("isFile",fs.lstatSync(item).isFile()) : It means the "thing" is nothing than a file and excluding empty folders
       */
      if (
          query[0] === 'packages' &&
          query.length === 3 &&
          fs.lstatSync(item).isFile()
      ) {
          const validate = rootChecker(item)
          if ( typeof validate === "object" ) {
            response = checkResponse(validate.message)
          }
      }
  });

  Object.keys(rootLevel).map((filename) => {
    const validate = rootFileChecker(filename)
    const message = `Should be at least 1 ${filename} file in component root folder`
    if ( validate ) {
      response = checkResponse(message)
    }
  })

  return response

}

function checkResponse(message){
  if ( response.length > 0 ){
    return response.concat([message])
  } else {
    return ['0', message]
  }
}

module.exports = (absolutePaths) => {
    const cwd = process.cwd();
    const relativePaths = absolutePaths.map((file) => path.relative(cwd, file));

    return validateRootLevel(relativePaths)
};
