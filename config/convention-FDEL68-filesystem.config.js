const path = require('path');
const fs = require('fs');

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
function initState(state = {}, action) {
    return {
        packagePath: packagePath(state.packagePath, action),
        subFolders: subFolders(state.subFolders, action)
    };
}
const store = createStore(initState);

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

function restartFilesInRootCounter(restartCounter) {
    Object.keys(restartCounter).map((field) => (restartCounter[field] = 0));
}

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
        return `No validation required for ${filename}`;
    } else {
        return false;
    }
}

function validatefilesInRoot(relativePaths) {
    restartFilesInRootCounter(filesInRoot);
    response = [];
    let folderRoute;
    relativePaths.forEach((item) => {
        const query = getQueryArray(item);
        if (query[0] === 'packages' && query.length === 3) {
            if (isFile(item)) {
                folderRoute = `${query[0]}/${query[1]}`;
                const validate = checkFilesInComponentRoot(item);
                if (typeof validate === 'object') {
                    checkResponse(validate.message);
                }
            }
        }
    });

    Object.keys(filesInRoot).map((filename) => {
        if (checkFileIsNotPresent(filename)) {
            checkResponse(`${folderRoute} Should have ${filename} file.`);
        }
    });

    return response;
}

function validateComponentFolders(subFoldersPath) {
    response = [];
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
                        checkResponse(
                            `Unexpected ${dirPath}/ folder name under /src (allowed only /components and /utils)`
                        );
                    }
                });
            }
        } else {
            checkResponse(
                `${query[2]}/ as sub-component or utility should be under src/component or src/utils, only dist/ or src/ allowed in root.`
            );
        }
    });
    return response;
}

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
        checkResponse(`${folderSearch}/ should have index file.`);
    } else if (indexCount > 1) {
        checkResponse(`${folderSearch}/ should have only one index file.`);
    }
    return [fileList, dirList];
};

function checkResponse(message) {
    response.push(message);
}

module.exports = {
    'packages/**': (absolutePaths) => {
        const cwd = process.cwd();
        const relativePaths = getRelativePaths(absolutePaths);

        const componentPackages = [
            ...new Set(
                relativePaths.map((stringPath) => {
                    return getFolderPath(stringPath);
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
        console.log("filesCheck", filesCheck)

        let empty = [];
        filesCheck.forEach((res, iter) => {
            const index = iter + 1;
            if (index < filesCheck.length) {
                empty = [].concat(res, filesCheck[index]);
            }
        });

        const foldersCheck = validateComponentFolders(
            store.getState().subFolders
        );

        let result;
        if (empty.length){
          empty.unshift('The test has fail:');
          result = empty.concat(foldersCheck);
        } else {
          result = ['true']
        }
        return result
    }
};

const getFolderPath = (stringPath) => {
    const query = getQueryArray(stringPath);
    const folderPath = path.join(...query.slice(0, 2));
    if (query[0] === 'packages' && isDir(folderPath)) {
        return folderPath;
    }
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
