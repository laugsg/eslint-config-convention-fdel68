# Design System Standards for Components

Filesystem and Naming conventions for exports, variables, components name, required files and folders to follow the correct format for Package structure.

Convention stablished in [FDEL68](https://cuponation.atlassian.net/jira/software/c/projects/FDEL/boards/322?modal=detail&selectedIssue=FDEL-68&assignee=6175c9a72097220071fda78e): Create Linting for package filesystem structure and naming convention.

It requires two extra files that should be at the project root `lint-staged.config.js` and `convention-FDEL68.json`.

lint-staged.config.js will receive just the commited files, then will filter them removing markdown files and json files to lint just component related ones.

convention-FDEL68.json will provide the convention-FDEL68.json for file rules. It's just a custom configuration file which implements the convention package.

