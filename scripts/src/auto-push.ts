import { execSync } from 'child_process';

// Use the exact path to git since it was missing from the standard PATH earlier
const GIT_CMD = 'E:\\Git\\cmd\\git.exe';
// Read interval from command line argument or default to 10 minutes
const args = process.argv.slice(2);
const INTERVAL_MINUTES = args.length > 0 ? parseFloat(args[0]) : 10;
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

function runGit(args: string) {
  try {
    return execSync(`"${GIT_CMD}" ${args}`, { stdio: 'pipe' }).toString();
  } catch (error: any) {
    throw new Error(error.stderr ? error.stderr.toString() : error.message);
  }
}

function autoPush() {
  const timestamp = new Date().toLocaleString();
  console.log(`\n[${timestamp}] Waking up to check for changes...`);
  
  try {
    // Check if there are any changes (modified, added, deleted, untracked)
    const status = runGit('status --porcelain');
    
    if (!status.trim()) {
      console.log(`[${timestamp}] No changes detected. Going back to sleep.`);
      return;
    }

    console.log(`[${timestamp}] Changes detected. Preparing to commit...`);
    
    // Stage all changes
    runGit('add .');
    
    // Commit
    const commitMsg = `chore: auto-commit checkpoint at ${timestamp}`;
    runGit(`commit -m "${commitMsg}"`);
    console.log(`[${timestamp}] Committed with message: "${commitMsg}"`);
    
    // Push to the current branch (assumes remote is 'origin' and branch is set up)
    console.log(`[${timestamp}] Pushing to GitHub...`);
    runGit('push');
    
    console.log(`[${timestamp}] ✅ Successfully pushed to GitHub.`);
  } catch (err: any) {
    console.error(`[${timestamp}] ❌ Auto-push failed:`, err.message);
  }
}

console.log(`=============================================================`);
console.log(`🚀 Starting Caremesh Auto-Push Script`);
console.log(`⏰ Interval: Every ${INTERVAL_MINUTES} minutes`);
console.log(`=============================================================`);

// Run once immediately on start
autoPush();

// Then loop forever
setInterval(autoPush, INTERVAL_MS);
