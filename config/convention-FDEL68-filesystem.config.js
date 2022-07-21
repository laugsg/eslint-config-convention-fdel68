const path = require('path');
const fs = require('fs');

let response = [];

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

let filesInRoot = {
    README: 0,
    stories: 0,
    chromatic: 0
};

function checkFileIsNotPresent(filename) {
    return filesInRoot[filename] === 0;
}

function checkIsFileDeclared(filename) {
  if (checkFileIsNotPresent(filename)) {
    filesInRoot[filename] = filesInRoot[filename] + 1;
    return true;
  } else {
    return {
          success: false,
          message: `Not allowed more than 1 ${filename} file`
      };
  }
}

function checkFilesInComponentRoot(filename) {
  if (filename.includes(README)) {
    return checkIsFileDeclared(README)
  } else if (filename.includes(chromatic)) {
    return checkIsFileDeclared(chromatic)
  } else if (filename.includes(stories)) {
      return checkIsFileDeclared(stories)
  } else if (
      !filename.includes(README) &&
      !filename.includes(chromatic) &&
      !filename.includes(stories)
  ) {
      return `No validation required ${filename}`;
  } else {
      return false;
  }
}

function validatefilesInRoot(relativePaths) {

    relativePaths.forEach((item) => {
        const query = item.split(path.sep);
        const splittedPath = query.slice(0, 3)
        if (query[0] === 'packages' && query.length >= 3) {
          if (fs.lstatSync(path.join(...splittedPath)).isFile()) {
            const validate = checkFilesInComponentRoot(item);
            if (typeof validate === 'object') {
              response = checkResponse(validate.message);
            }
          }
          else if (fs.lstatSync(path.join(...splittedPath)).isDirectory()) {
            if (splittedPath[2] === 'src' || splittedPath[2] === 'dist') {
              console.log("should be an index", item)
              if (fs.lstatSync(path.join(...query.slice(0, 4))).isDirectory()) {
                      if (query[3] !== 'components' && query[3] !== 'utils'){
                          response = checkResponse(`Unexpected ${path.join(...query.slice(3, 4))}/ folder name under /src (allowed only /components and /utils)`)
                        }
                    }
                } else {
                response = checkResponse(
                    `${splittedPath[2]}/ as sub-component or utility should be under src/, only dist/ or src/ allowed in root.`
                );
            }
          }
        }


    });

    // console.log("response", response)
    
    Object.keys(filesInRoot).map((filename) => {
      if (checkFileIsNotPresent(filename)){
        response = checkResponse(`Should be at least 1 ${filename} file in component root folder`)
      }
    });

    return response;
}

function checkResponse(message) {
    if (response.length > 0) {
        return response.concat([message]);
    } else {
        return ['The test has fail:', message];
    }
}

module.exports = {
  "packages/**/*.{ts,tsx}":(absolutePaths) => {
    const cwd = process.cwd();
    const relativePaths = absolutePaths.map((file) => path.relative(cwd, file));

    return validatefilesInRoot(relativePaths);
    // return ['0']
}
}
