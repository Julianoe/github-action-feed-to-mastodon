// Native Node modules
const { existsSync } = require("fs");
const path = require("node:path");

// Third party dependencies
const {
  getInput,
  info,
  notice,
  warning,
  setOutput,
  setFailed,
} = require("@actions/core");

// Local dependencies
const processFeed = require("./lib/process-feed");

async function run() {
  try {
    // Get Action parameters
    const feedUrl = getInput("feedUrl", { required: true });
    const globalDelayToots = getInput("globalDelayToots");
    const cacheDirectory = getInput("cacheDirectory");
    const cacheTimestampFile = getInput("cacheTimestampFile");

    // Compute full paths
    const cacheDirectoryFullPath = path.join(process.cwd(), cacheDirectory);
    const cacheTimestampFileFullPath = path.join(
      cacheDirectoryFullPath,
      cacheTimestampFile
    );

    // Get values from existing caches
    let jsonTimestamp = { timestamp: 0 };
    if (existsSync(cacheTimestampFileFullPath)) {
      jsonTimestamp = require(cacheTimestampFileFullPath);
      info(`Previous attempt timestamp: ${jsonTimestamp.timestamp}`);
    } else {
      warning("No cache found.");
    }

    if (Date.now() < jsonTimestamp.timestamp + globalDelayToots * 60 * 1000) {
      warning(`Too soon…`);
      return;
    }

    const tootUrl = await processFeed(feedUrl);
    if (tootUrl) {
      notice(`Success! ${tootUrl}`);
    } else {
      warning("No item to toot");
    }
    setOutput("tootUrl", tootUrl);
  } catch (error) {
    setFailed(error.message);
  }
}

run();
