const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const gitignorePath = path.join(__dirname, "..", ".gitignore");

// Lines to temporarily comment out during update
const linesToComment = ["*.aar", "*.jar", ".env", ".env.*", ".env*.local"];

function commentLines(content) {
  let result = content;
  for (const line of linesToComment) {
    // Escape special regex characters
    const escaped = line.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`^(${escaped})$`, "gm");
    result = result.replace(regex, "# $1");
  }
  return result;
}

function uncommentLines(content) {
  let result = content;
  for (const line of linesToComment) {
    const escaped = line.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`^# (${escaped})$`, "gm");
    result = result.replace(regex, "$1");
  }
  return result;
}

async function main() {
  console.log("Reading .gitignore...");
  const originalContent = fs.readFileSync(gitignorePath, "utf-8");

  console.log("Commenting out lines to include files in update...");
  const commentedContent = commentLines(originalContent);
  fs.writeFileSync(gitignorePath, commentedContent);

  try {
    console.log("Running eas update...");
    execSync('npx eas update --branch g_release -m "Update!"', {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
  } finally {
    console.log("Restoring .gitignore...");
    const currentContent = fs.readFileSync(gitignorePath, "utf-8");
    const restoredContent = uncommentLines(currentContent);
    fs.writeFileSync(gitignorePath, restoredContent);
    console.log("Done!");
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
