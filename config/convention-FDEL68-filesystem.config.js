const path = require("path");
module.exports = (absolutePaths) => {
  const cwd = process.cwd();
  const relativePaths = absolutePaths.map((file) => path.relative(cwd, file));
  console.log("query", relativePaths)
};
