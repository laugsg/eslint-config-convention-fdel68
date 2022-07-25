# Design System Standards for Components

Filesystem and Naming conventions for exports, variables, components name, required files and folders to follow the correct format for Package structure.

Convention stablished in [FDEL68](https://cuponation.atlassian.net/jira/software/c/projects/FDEL/boards/322?modal=detail&selectedIssue=FDEL-68&assignee=6175c9a72097220071fda78e): Create Linting for package filesystem structure and naming convention.

## Naming

It requires two extra files that should be at the project root `convention-FDEL68-naming.config.js` and `convention-FDEL68.naming-rules.config.json`.

convention-FDEL68-naming.config.js will receive just the commited files, then will filter them removing markdown files and json files to lint just component related ones.

convention-FDEL68.naming-rules.config.json will provide the convention-FDEL68-naming.config.js for file rules. It's just a custom configuration file which implements the convention package.

## Run at pre-commit only

Currently, to acheive the whole convention topics, the configuration is splitted in two files which requires specific implementation:

As first step, install the convention as a NPM Package `yarn add --dev eslint-config-convention-FDEL68 -W`

### Config

1. project root : drop the files `convention-FDEL68-naming.config.js` and `convention-FDEL68.naming-rules.config.json`
2. .husky/pre-commit : include in lint-staged command `yarn lint-staged --config convention-FDEL68-naming.config.js`

## Acceptance Criteria

* [x] Naming 
    1. folder/filenames
          1. should be kebab-case
    2. types/Components
          1. should be PascalCase
    3. default export
          1. should be named export





## File System Structure

It requires one extra files that should be at the project root `convention-FDEL68-filesystem.config.js`.

convention-FDEL68-filesystem.config.js will receive a list of commited files as an array of strings, then it will validate the component package folders structure (based in acceptance criteria) and it will check for required files.

1. .husky/pre-commit : include in lint-staged command `yarn lint-staged --config convention-FDEL68-filesystem.config.js`


## File System Structure Scheme

* Query : Top Level
    1. packages/component-name
* Query : Root level (Component)
    1. ../files-in-root
    2. ../src/
* Query : Src level
    1. ../component-files
    2. ../utils/
* Misc : Src level

## Acceptance Criteria

* File system
    * [x] component-name/ : Component level
        1. should have a README
        2. should have a stories
        3. should have a chromatic.stories

  * Misc : 
      1. [x] all sub-components should live inside src/components folder
      2. [x] all utilities should live inside src/utils folder
      3. [x] unexpected folder name under /src (allowed only /components and /utils
      4. [x] should have a index file inside each folder

## theorical assumptions about sub-component folder

A Compoenent package has the following structure:

* Component folder (as root)
    * src folder (component files)
        * utils (inside src folder)
    * finally, files related to configs and testing

Because of this structure, where src/ and dist/ folders are the only folders in the component package, we could assume that _"any other folder would be a sub-component"_. Then it is possible to _invalidate_ the presence of any other folder than src.



































































