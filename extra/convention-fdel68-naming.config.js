const path = require("path");
module.exports = (absolutePaths) => {
  const cwd = process.cwd();
  const relativePaths = absolutePaths.map((file) => path.relative(cwd, file));
  const filteredPaths = relativePaths.filter((file) => {
    /** Remove files
     * JSON and Markdown files should not be linted,
     * they are filtered out from paths to provide just allowed ones.
     */
    if (
      ! file.includes(".config") &&
      path.extname(file) !== ".json" &&
      path.extname(file) !== ".md" &&
      path.extname(file) !== ""
    ) {
      return file;
    }
  });
  return [`npx eslint -c convention-FDEL68.naming-rules.config.json ${filteredPaths.join(" ")}`];
};
