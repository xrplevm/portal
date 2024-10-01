const fs = require("fs");
const path = require("path");

// Read package.json
const packageJsonPath = path.join(process.cwd(), "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

// Check if exports field exists
if (packageJson.exports) {
    // Iterate through all export entries
    for (const [key, value] of Object.entries(packageJson.exports)) {
        // Check if the value is a string and matches the pattern ./src/**/*.ts
        if (typeof value === "string" && value.startsWith("./src/")) {
            if (value.endsWith(".ts") || value.endsWith(".tsx")) {
                // Replace with the new object structure
                packageJson.exports[key] = {
                    types: value.replace("./src/", "./dist/").replace(new RegExp("tsx?$"), "d.ts"),
                    require: value.replace("./src/", "./dist/").replace(new RegExp("tsx?$"), "js"),
                    import: value.replace("./src/", "./dist/").replace(new RegExp("tsx?$"), "mjs"),
                };
            } else {
                packageJson.exports[key] = value.replace("./src/", "./dist/");
            }
        }
    }

    // Write the updated package.json back to file
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("package.json updated successfully.");
} else {
    console.log("No exports field found in package.json.");
}
