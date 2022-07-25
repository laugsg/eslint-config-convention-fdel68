const path = require('path');
const fs = require('fs');

/** createStore
 * This function has a variable that is used as state/store
 * to keep data for save or retrieve globally but private accessible only.
 * Makes easier to work with different parts of data.
 *
 * In this case, it is used to keep track of the packages that have to be validated,
 * its sub-folder tree and responses from the running validation.
 *
 * The concept is an Observable pattern or a Minimalistic Redux Store.
 * The main principle is to have data centralized in a variable which
 * it would only accessible by owned functions (methods-like) but
 * to be modify or retrieved throug specific simple actions only.
 *
 * It behaviour is based on Actions and Reducers, an action will be dispatched
 * carring the data targeting a reducer, a reducer will filter received actions
 * to react accordingly. Actions and reducers are unlimited, canalized through
 * a higher reducer as a main entrance to the store. To add functionality means
 * to create just one more action and one more reducer, one more field in the object
 * returned by the higher reducer, receiving the return of the new create reducer.
 * @param {function} reducer
 * @returns {object} It returns inner functions to interact with state
 */
function createStore(reducer) {
    let state;

    const getState = () => state;

    let listeners = [];
    const subscribe = (listener) => {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter(l != listener);
        };
    };

    const dispatch = (action) => {
        state = reducer(state, action);
        listeners.forEach((listener) => listener());
    };

    return {
        getState,
        subscribe,
        dispatch
    };
}

const GET_PACKAGE_PATH = 'GET_PACKAGE_PATH';
const GET_SUBFOLDER_PATH = 'GET_SUBFOLDER_PATH';
const SAVE_RESPONSE = 'SAVE_RESPONSE';
function addPackagePath(path) {
    return {
        type: GET_PACKAGE_PATH,
        path
    };
}
function addSubFolder(path) {
    return {
        type: GET_SUBFOLDER_PATH,
        path
    };
}
function addResponse(response) {
    return {
        type: SAVE_RESPONSE,
        response
    };
}
function packagePath(state = [], action) {
    switch (action.type) {
        case GET_PACKAGE_PATH:
            return state.concat([action.path]);
        default:
            return state;
    }
}
function subFolders(state = [], action) {
    switch (action.type) {
        case GET_SUBFOLDER_PATH:
            return state.concat([action.path]);
        default:
            return state;
    }
}
function lintResponse(state = [], action) {
    switch (action.type) {
        case SAVE_RESPONSE:
            return state.concat([action.response]);
        default:
            return state;
    }
}
function initState(state = {}, action) {
    return {
        packagePath: packagePath(state.packagePath, action),
        subFolders: subFolders(state.subFolders, action),
        lintResponse: lintResponse(state.lintResponse, action)
    };
}
const store = createStore(initState);

/** Files Validation : Is x-file in folder?
 * Files validation works based in the name of the file to check (const VARS),
 * a counter (named Object) which tracks "how many" files of a kind exists 
 * (to achieve two conditions: One (1) and only one (2) of a kind should exist),
 * a loop receiving a list (relative paths) of folders, files and sub-folders 
 * to validate, and finally another loop (Check counter loop) which check 
 * if any of the three file-fields of the counter object is equal to zero 
 * which means the folder to be validated doesn't have the required file.
 * 
 * @MAIN 
 * @function validatefilesInRoot {string[]} void : receives a list of relative paths to iterate
 * 
 * @HELPERS
 * @function restartFilesInRootCounter {object} void : set counter to zero before each iteration
 * @function checkFileIsNotPresent {string} boolean : checks if the value for a files is equal to zero
 * @function checkIsFileDeclared {string} object : checks if a file were declared and return an object with success as a boolean property
 * @function checkFilesInComponentRoot {string} object : filter files by name and return an object with success as a boolean property
 * 
 * @NOTES
 * The order of tested values determine the correctness of the if/else validation
 * because the file "chromatic.stories" includes the word "stories", for this reason
 * if the "stories" validation comes before "chromatic" validation, it will always
 * falls into "stories" never reaching "chromatic". But because the file "stories" 
 * doesn't includ the word "chromatic" it should come before to be matched in its case.
 */
const README = 'README';
const chromatic = 'chromatic';
const stories = 'stories';

let filesInRoot = {
    README: 0,
    stories: 0,
    chromatic: 0
};

function restartFilesInRootCounter(restartCounter) {
    Object.keys(restartCounter).map((field) => (restartCounter[field] = 0));
}

function checkFileIsNotPresent(filename) {
    return filesInRoot[filename] === 0;
}

function checkIsFileDeclared(filename) {
    if (checkFileIsNotPresent(filename)) {
        filesInRoot[filename] = filesInRoot[filename] + 1;
        return {
            success: true,
            message: `One ${filename} file is allowed`
        };
    } else {
        return {
            success: false,
            message: `Not allowed more than 1 ${filename} file`
        };
    }
}

function checkFilesInComponentRoot(filename) {
    if (filename.includes(README)) {
        return checkIsFileDeclared(README);
    } else if (filename.includes(chromatic)) {
        return checkIsFileDeclared(chromatic);
    } else if (filename.includes(stories)) {
        return checkIsFileDeclared(stories);
    } else if (
        !filename.includes(README) &&
        !filename.includes(chromatic) &&
        !filename.includes(stories)
    ) {
        return {
            success: true,
            message: `No validation required for ${filename}`
        };
    } else {
        return {
            success: true,
            message: `No validation created for ${filename}`
        };
    }
}

function validatefilesInRoot(relativePaths) {
    restartFilesInRootCounter(filesInRoot);
    let folderRoute;
    relativePaths.forEach((item) => {
        const query = getQueryArray(item);
        if (query[0] === 'packages' && query.length === 3) {
            if (isFile(item)) {
                folderRoute = `${query[0]}/${query[1]}`;
                const validate = checkFilesInComponentRoot(item);
                if ( ! validate.success ) {
                    store.dispatch(addResponse(validate.message));
                }
            }
        }
    });

    // Check counter loop
    Object.keys(filesInRoot).map((filename) => {
        if (checkFileIsNotPresent(filename)) {
            store.dispatch(
                addResponse(`${folderRoute} Should have ${filename} file.`)
            );
        }
    });

}

/** Is the folder structure (from the received Component files) valid?
 * 
 * @function validateComponentFolders {string[]} void : receives a list of paths to Components folders to iterate
 * @function getQueryArray {string} string[] : return an array of segments from the provided path
 * @function getFolderTree {string} string[] : get folder tree from an array of paths
 * @function recursiveList {string} void : recursive check if there is a index file in a folder or sub-folder
 * 
 */
function validateComponentFolders(subFoldersPath) {
    subFoldersPath.map((subFolder) => {
        const query = getQueryArray(subFolder);
        if (query[2] === 'src' || query[2] === 'dist') {
            recursiveList(subFolder);

            const baseSubFolder = getFolderTree([subFolder])[0].filter((path) =>
                isDir(path)
            );
            if (baseSubFolder.length) {
                baseSubFolder.forEach((dirPath) => {
                    const dirQuery = getQueryArray(dirPath);
                    if (
                        dirQuery[3] !== 'components' &&
                        dirQuery[3] !== 'utils'
                    ) {
                        store.dispatch(
                            addResponse(
                                `Unexpected ${dirPath}/ folder name under /src (allowed only /components and /utils)`
                            )
                        );
                    }
                });
            }
        } else {
            store.dispatch(
                addResponse(
                    `${query[2]}/ as sub-component or utility should be under src/component or src/utils, only dist/ or src/ allowed in root.`
                )
            );
        }
    });
}

/** recursiveList
 * Given a folder where its structure is uknonw,
 * validation should be  as "check if the current path is a file or folder,
 * if it's a file, then check if it's index, if it's a folder, then open it
 * an start again to check if the current path is a file or folder".
 * @param {string} folderSearch 
 * @param {string[]} fileList 
 * @param {string[]} dirList 
 * @param {number} indexCount 
 * @returns {string[]}
 */
const recursiveList = (
    folderSearch,
    fileList = [],
    dirList = [],
    indexCount = 0
) => {
    const baseSubFolder = getFolderTree([folderSearch])[0];
    baseSubFolder.forEach((path) => {
        if (isFile(path)) {
            fileList.push(path);
            const pathQuery = getQueryArray(path);
            if (pathQuery[pathQuery.length - 1].includes('index')) {
                indexCount += 1;
            }
        }
        if (isDir(path)) {
            dirList.push(path);
            return recursiveList(path, fileList, dirList);
        }
    });
    if (indexCount < 1) {
        store.dispatch(addResponse(`${folderSearch}/ should have index file.`));
    } else if (indexCount > 1) {
        store.dispatch(
            addResponse(`${folderSearch}/ should have only one index file.`)
        );
    }
    return [fileList, dirList];
};

/** getQueryArray
 * @param {string} strginPath
 * @returns {array} return an array of segments from the provided path
 */
const getQueryArray = (strginPath) => strginPath.split(path.sep);

/** getFolderTree
 * Get folder tree from an array of paths
 * @param string[] path to component packages as 'package/new-component'
 * @returns {array} List of files and folders whitin a given path
 */
const getFolderTree = (componentPackages) => {
    return componentPackages.map((folder) => {
        const root = fs.readdirSync(path.resolve(__dirname, folder));
        return root.map((file) => {
            const fullPath = path.resolve(__dirname, folder, file);
            if (isDir(fullPath)) {
                const folderPath = getRelativePaths([fullPath])[0];
                store.dispatch(addSubFolder(folderPath));
            }
            const query = fullPath.split(path.sep);
            const shortPath = query.splice(4, query.length - 1);
            const normalizedPath = path.join(...shortPath);
            return normalizedPath;
        });
    });
};

const isDir = (fullPath) => fs.lstatSync(fullPath).isDirectory();
const isFile = (fullPath) => fs.lstatSync(fullPath).isFile();

const getRelativePaths = (absolutePaths) => {
    const cwd = process.cwd();
    const relativePaths = absolutePaths.map((file) => path.relative(cwd, file));
    return relativePaths;
};

module.exports = {
    'packages/**': (absolutePaths) => {
        /** Empty parameters as AbsolutPath
         * Rules always are called,
         * but receives an empty array when condition is not match.
         * @NOTES
         * An empty array will cause a fatal error.
         */
        if (absolutePaths.length > 0) {
            const cwd = process.cwd();
            const relativePaths = getRelativePaths(absolutePaths);

            const componentPackages = [
                ...new Set(
                    relativePaths.map((stringPath) => {
                        const query = getQueryArray(stringPath);
                        const folderPath = path.join(...query.slice(0, 2));
                        if (query[0] === 'packages' && isDir(folderPath)) {
                            return folderPath;
                        }
                    })
                )
            ];

            componentPackages.map((componentPath) =>
                store.dispatch(addPackagePath(componentPath))
            );

            const componentTree = getFolderTree(store.getState().packagePath);

            const filesCheck = componentTree.map((folder) => {
                return validatefilesInRoot(folder);
            });

            const foldersCheck = validateComponentFolders(
                store.getState().subFolders
            );

            let response = store.getState().lintResponse;
            if (response.length) {
                response.unshift('The test has fail:');
                return response;
            } else {
                return ['true'];
            }
        } else {
            return ['true'];
        }
    }
};
