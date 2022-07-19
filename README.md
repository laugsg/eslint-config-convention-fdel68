# Design System Standards for Components

Filesystem and Naming conventions for exports, variables, components name, required files and folders to follow the correct format for Package structure.

Convention stablished in [FDEL68](https://cuponation.atlassian.net/jira/software/c/projects/FDEL/boards/322?modal=detail&selectedIssue=FDEL-68&assignee=6175c9a72097220071fda78e): Create Linting for package filesystem structure and naming convention.

It requires two extra files that should be at the project root `convention-FDEL68-naming.config.js` and `convention-FDEL68.naming-rules.config.json`.

convention-FDEL68-naming.config.js will receive just the commited files, then will filter them removing markdown files and json files to lint just component related ones.

convention-FDEL68.naming-rules.config.json will provide the convention-FDEL68-naming.config.js for file rules. It's just a custom configuration file which implements the convention package.

## Run at pre-commit only

Currently, to acheive the whole convention topics, the configuration is splitted in two files which requires specific implementation:

As first step, install the convention as a NPM Package `yarn add --dev eslint-config-convention-FDEL68 -W`


* **Naming Config**
1. project root : drop the files `convention-FDEL68-naming.config.js` and `convention-FDEL68.naming-rules.config.json`
2. .husky/pre-commit : include in lint-staged command `yarn lint-staged --config convention-FDEL68-naming.config.js`

* **File System Structure**





## File System Structure to validate

* Query : Top Level
    1. packages/component-name
* Query : Component level
    1. ../files-in-root
    2. ../src/
* Query : Src level
    1. ../component-files
    2. ../utils/
* Constraint : Src level







## Acceptance Criteria

* [x] Naming 
    1. folder/filenames
          1. should be kebab-case
    2. types/Components
          1. should be PascalCase
    3. default export
          1. should be named export

* File system
  * component-name/ : Component level
      1. should have a README
      2. should have a stories
      3. should have a chromatic.stories
  
  * sub-folders : 
      1. /components
      2. /utils

1. all sub-components should live inside src/components folder
2. all utilities should live inside src/utils folder









































































