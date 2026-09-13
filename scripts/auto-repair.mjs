import { execSync } from 'child_process';
import fs from 'fs';

// Maximum attempts for auto-repair
const MAX_ATTEMPTS = 2;
const REPAIR_FILE = '.auto-repair-attempts';

function getCurrentAttempts() {
  if (fs.existsSync(REPAIR_FILE)) {
    return parseInt(fs.readFileSync(REPAIR_FILE, 'utf8'), 10);
  }
  return 0;
}

function incrementAttempts(attempts) {
  fs.writeFileSync(REPAIR_FILE, (attempts + 1).toString());
}

function clearAttempts() {
  if (fs.existsSync(REPAIR_FILE)) fs.unlinkSync(REPAIR_FILE);
}

try {
  console.log('Running standard lint and build checks...');
  execSync('npm run lint', { stdio: 'inherit' });
  execSync('npm run typecheck', { stdio: 'inherit' });
  clearAttempts(); // Success, clear tracking
  process.exit(0);
} catch (error) {
  const attempts = getCurrentAttempts();
  
  if (attempts >= MAX_ATTEMPTS) {
    console.error('❌ Maximum auto-repair attempts reached. Failing workflow to prevent infinite loops.');
    clearAttempts();
    process.exit(1);
  }

  console.log(`\n⚠️ Detected a failure (Attempt ${attempts + 1}/${MAX_ATTEMPTS}). Attempting safe auto-repair...`);
  incrementAttempts(attempts);

  try {
    // Attempt to automatically fix linting issues
    console.log('Running `eslint --fix`...');
    execSync('npx eslint --fix .', { stdio: 'inherit' });
    
    // You could add other safe, deterministic fixes here
    
    console.log('✅ Auto-repair applied. Please re-run the validation.');
    
    // In a real CI environment, you would want to commit the changes here
    // However, committing directly from this script requires the git environment
    // to be configured with the bot token. We'll leave the commit step to the GitHub Action.
    
    process.exit(2); // Special exit code to tell the Action to commit
  } catch (repairError) {
    console.error('❌ Auto-repair failed or did not resolve all issues.');
    process.exit(1);
  }
}
