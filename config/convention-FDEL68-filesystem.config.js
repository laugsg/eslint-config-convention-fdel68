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


















//#region middle code
// const path = require('path');
// const fs = require('fs');

// //#region Store
// function createStore(reducer) {
//     let state;

//     const getState = () => state;

//     let listeners = [];
//     const subscribe = (listener) => {
//         listeners.push(listener);
//         return () => {
//             listeners = listeners.filter(l != listener);
//         };
//     };

//     const dispatch = (action) => {
//         state = reducer(state, action);
//         listeners.forEach((listener) => listener());
//     };

//     return {
//         getState,
//         subscribe,
//         dispatch
//     };
// }

// const GET_PACKAGE_PATH = 'GET_PACKAGE_PATH';
// const GET_SUBFOLDER_PATH = 'GET_SUBFOLDER_PATH';
// function addPackagePath(path) {
//     return {
//         type: GET_PACKAGE_PATH,
//         path
//     };
// }
// function addSubFolder(path) {
//     console.log('path', path);
//     return {
//         type: GET_SUBFOLDER_PATH,
//         path
//     };
// }
// function packagePath(state = [], action) {
//     switch (action.type) {
//         case GET_PACKAGE_PATH:
//             return state.concat([action.path]);
//         default:
//             return state;
//     }
// }
// function subFolders(state = [], action) {
//     switch (action.type) {
//         case GET_SUBFOLDER_PATH:
//             return state.concat([action.path]);
//         default:
//             return state;
//     }
// }
// function initState(state = {}, action) {
//     return {
//         packagePath: packagePath(state.packagePath, action),
//         subFolders: subFolders(state.subFolders, action)
//     };
// }
// const store = createStore(initState);
// store.subscribe(() => {
//     console.log('The new state is:', store.getState());
// });
// //#endregion

// //#region
// let response = [];

// /**
//  * The order of tested values determine the correctness of the if/else validation
//  * because chromatic.stories includes the "stories" word, for this reason
//  * if the stories validation comes before chromatic validation, it will always
//  * falls into stories never reaching chromatic. But because chromatic its not included
//  * into stories check, if it coming before stories it will match for "chromatic"
//  * and it will be rejected for "stories" falling at the sotires validation fi/else.
//  */
//  const README = 'README';
//  const chromatic = 'chromatic';
//  const stories = 'stories';
 
//  let filesInRoot = {
//      README: 0,
//      stories: 0,
//      chromatic: 0
//  };
 
//  function restartFilesInRootCounter(restartCounter){
//    Object.keys(restartCounter).map( field => restartCounter[field] = 0)
//  }
 
//  function checkFileIsNotPresent(filename) {
//      return filesInRoot[filename] === 0;
//  }
 
//  function checkIsFileDeclared(filename) {
//      if (checkFileIsNotPresent(filename)) {
//          filesInRoot[filename] = filesInRoot[filename] + 1;
//          return true;
//      } else {
//          return {
//              success: false,
//              message: `Not allowed more than 1 ${filename} file`
//          };
//      }
//  }
 
//  function checkFilesInComponentRoot(filename) {
//      if (filename.includes(README)) {
//          return checkIsFileDeclared(README);
//      } else if (filename.includes(chromatic)) {
//          return checkIsFileDeclared(chromatic);
//      } else if (filename.includes(stories)) {
//          return checkIsFileDeclared(stories);
//      } else if (
//          !filename.includes(README) &&
//          !filename.includes(chromatic) &&
//          !filename.includes(stories)
//      ) {
//          return `No validation required ${filename}`;
//      } else {
//          return false;
//      }
//  }
//  //#endregion
 
//  function validatefilesInRoot(relativePaths) {
//    restartFilesInRootCounter(filesInRoot)
//      relativePaths.forEach((item) => {
//          const query = getQueryArray(item);
//          console.log("query",query)
//          const splittedPath = query.slice(0, 3);
//          const baseRoute = path.join(...splittedPath);
//          if (query[0] === 'packages' && query.length >= 3) {
//              if (fs.lstatSync(baseRoute).isFile()) {
//                  const validate = checkFilesInComponentRoot(item);
//                  if (typeof validate === 'object') {
//                      response = checkResponse(validate.message);
//                  }
//              } 
//              // else if (isDir(baseRoute)) {
//              //     if (splittedPath[2] === 'src' || splittedPath[2] === 'dist') {
//              //         // console.log("should be an index", item)
//              //         const baseSubFolder = path.join(...query.slice(0, 4));
//              //         if (isDir(baseSubFolder)) {
//              //             // const folderTree = getFolderTree([baseSubFolder]);
//              //             // console.log(baseSubFolder,folderTree)
//              //             // const folderItems = getQueryArray(item);
//              //             // console.log('query', query);
//              //             if (query[3] !== 'components' && query[3] !== 'utils') {
//              //                 response = checkResponse(
//              //                     `Unexpected ${path.join(
//              //                         ...query.slice(3, 4)
//              //                     )}/ folder name under /src (allowed only /components and /utils)`
//              //                 );
//              //             }
//              //         }
//              //     } else {
//              //         response = checkResponse(
//              //             `${splittedPath[2]}/ as sub-component or utility should be under src/, only dist/ or src/ allowed in root.`
//              //         );
//              //     }
//              // }
//          }
//      });
 
//      Object.keys(filesInRoot).map((filename) => {
//          if (checkFileIsNotPresent(filename)) {
//              response = checkResponse(
//                  `Should have ${filename} file in component root folder`
//              );
//          }
//      });
 
//      return response;
//  }
 
//  function validateComponentFolders(){
   
//      if (splittedPath[2] === 'src' || splittedPath[2] === 'dist') {
//          // console.log("should be an index", item)
//          const baseSubFolder = path.join(...query.slice(0, 4));
//          if (isDir(baseSubFolder)) {
//              if (query[3] !== 'components' && query[3] !== 'utils') {
//                  response = checkResponse(
//                      `Unexpected ${path.join(
//                          ...query.slice(3, 4)
//                      )}/ folder name under /src (allowed only /components and /utils)`
//                  );
//              }
//          }
//      } else {
//          response = checkResponse(
//              `${splittedPath[2]}/ as sub-component or utility should be under src/, only dist/ or src/ allowed in root.`
//          );
//      }
 
//  }
 
//  function checkResponse(message) {
//      if (response.length > 0) {
//          return response.concat([message]);
//      } else {
//          return ['The test has fail:', message];
//      }
//  }
 
//  // function checkResponse(message) {
//  //   if (response.length > 0) {
//  //       return response.concat([message]);
//  //   } else {
//  //       return ['The test has fail:', message];
//  //   }
//  // }
 
//  module.exports = {
//      'packages/**': (absolutePaths) => {
//          const cwd = process.cwd();
//          const relativePaths = getRelativePaths(absolutePaths);
 
//          const componentPackages = [
//              ...new Set(
//                  relativePaths.map((stringPath) => {
//                      return getFolderPath(stringPath);
//                  })
//              )
//          ];
 
//          componentPackages.map((componentPath) =>
//              store.dispatch(addPackagePath(componentPath))
//          );
 
//          const componentTree = getFolderTree(store.getState().packagePath);
 
//          console.log(
//              'componentTree',
//              componentTree.map((folder) => {
//                  return validatefilesInRoot(folder);
//              })
//          );
 
//          // return validatefilesInRoot(relativePaths);
//          return ['0'];
//      }
//  };
 
//  const getFolderPath = (stringPath) => {
//      // console.log("stringPath", stringPath)
//      const query = getQueryArray(stringPath);
//      // console.log("query", query)
//      const folderPath = path.join(...query.slice(0, 2));
//      // console.log("folderPath", folderPath)
//      if (query[0] === 'packages' && isDir(folderPath)) {
//          return folderPath;
//      }
//  };
 
//  /** getQueryArray
//   * @param {string} strginPath
//   * @returns {array} return an array of segments from the provided path
//   */
//  const getQueryArray = (strginPath) => strginPath.split(path.sep);
 
//  /** getFolderTree
//   * Get folder tree from an array of paths
//   * @param string[] path to component packages as 'package/new-component'
//   * @returns {array} List of files and folders whitin a given path
//   */
//  const getFolderTree = (componentPackages) => {
//      return componentPackages.map((folder) => {
//          const root = fs.readdirSync(path.resolve(__dirname, folder));
//          return root.map((file) => {
//              const fullPath = path.resolve(__dirname, folder, file);
//              if (isDir(fullPath)) {
//                  const folderPath = getRelativePaths([fullPath])[0];
//                  console.log('folderPath', folderPath);
//                  store.dispatch(addSubFolder(folderPath));
//              }
//              const query = fullPath.split(path.sep);
//              const shortPath = query.splice(4, query.length - 1);
//              const normalizedPath = path.join(...shortPath);
//              return normalizedPath;
//          });
//      });
//  };
 
//  const isDir = (fullPath) => fs.lstatSync(fullPath).isDirectory();
 
//  const getRelativePaths = (absolutePaths) => {
//      const cwd = process.cwd();
//      const relativePaths = absolutePaths.map((file) => path.relative(cwd, file));
//      return relativePaths;
//  };
//#endregion