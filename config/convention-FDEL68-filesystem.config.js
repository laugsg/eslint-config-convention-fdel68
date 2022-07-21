const path = require('path');
const fs = require('fs');

//#region
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
//#endregion

function validatefilesInRoot(relativePaths) {

    relativePaths.forEach((item) => {
      // console.log("item",item)
        const query = item.split(path.sep);
        // console.log("query",query)
        const splittedPath = query.slice(0, 3)
        // console.log("splittedPath",splittedPath)
        const baseRoute = path.join(...splittedPath)
        // console.log("baseRoute",baseRoute)
        if (query[0] === 'packages' && query.length >= 3) {
          if (fs.lstatSync(baseRoute).isFile()) {
            // console.log("baseRoute",baseRoute)
            const validate = checkFilesInComponentRoot(item);
            if (typeof validate === 'object') {
              response = checkResponse(validate.message);
            }
          }
          else if (fs.lstatSync(baseRoute).isDirectory()) {
            if (splittedPath[2] === 'src' || splittedPath[2] === 'dist') {
              // console.log("should be an index", item)
              const baseSubFolder = path.join(...query.slice(0, 4))
              if (fs.lstatSync(baseSubFolder).isDirectory()) {
                console.log("baseSubFolder",baseSubFolder)
                const componentFolder = getFolder(baseSubFolder)
                console.log("componentFolder",componentFolder)
                // const query = item.split(path.sep);
                const folderTree = getTree(false, componentFolder, `${_dirname}/packages/${componentFolder}`)
                console.log("folderTree",folderTree)
                // console.log("src tree",fs.readdirSync(path.resolve(baseSubFolder)))
                // console.log("query",query)
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
  "packages/**":(absolutePaths) => {
    const cwd = process.cwd();
    const relativePaths = absolutePaths.map((file) => path.relative(cwd, file));

    console.log("relativePaths",relativePaths)



  /** Get directory : list
   * Extract the component name from each of staged files
   * to read the Component folder to validate its structure.
   * @returns {array} example: ['aaa', 'bbb']
   */
  const componentPackages = [...new Set(relativePaths.map((stringPath) => {
    return getFolder(stringPath)
    }))]

    const componentTree = getTree(componentPackages)
    console.log("componentTree", componentTree)
    
    console.log("componentTree",componentTree.map( folder => {
      return validatefilesInRoot(folder);
    }))

    // return validatefilesInRoot(relativePaths);
    return ['0']
}
}

const getFolder = (stringPath) => {
  const query = stringPath.split(path.sep);
  if (
    query[0] === 'packages' &&
    fs.lstatSync(path.join(...query.slice(0, 2))).isDirectory()
    ) {
      return query[1]
    }
  }


const getTree = (componentPackages) => {
  console.log("lecture", componentPackages)
  return componentPackages.map(folder => {
    const root = fs.readdirSync(path.resolve(__dirname, 'packages', folder))
    return root.map(file => {
      const fullPath = path.resolve(__dirname, 'packages', folder, file)
      console.log("fullPath", fullPath)
      const query = fullPath.split(path.sep);
      const shortPath = query.splice(4, query.length - 1)
      const normalizedPath = path.join(...shortPath)
      return normalizedPath
    })
  })
}