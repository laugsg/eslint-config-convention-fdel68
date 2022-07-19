const path = require("path");
const fileSystemConfig = require("./convention-FDEL68-filesystem.config")


/** Convention FDEL-68
 * Filename should be one of the allowed variants
 * for lint-staged configuration files.
 * - lint-staged.config (JS | MJS)
 * - .lintstagedrc (JS | JSON | YML | MJS | CJS)
 */

module.exports = {
  ...fileSystemConfig,
  "*":(absolutePaths) => {
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
  return [`npx eslint -c ${process.cwd()}/node_modules/eslint-config-convention-fdel68/config/convention-FDEL68.naming-rules.config.json ${filteredPaths.join(" ")}`];
}
}