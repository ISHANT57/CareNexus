$startDate = [datetime]"2026-06-15"
$endDate = [datetime]::Now
$totalDays = ($endDate - $startDate).Days

Write-Host "Starting automated commits from $($startDate.ToString('yyyy-MM-dd')) to $($endDate.ToString('yyyy-MM-dd'))..."

# Ensure we are tracking everything
git add .

# Get all staged files
$stagedFiles = git diff --name-only --cached

if (-not $stagedFiles) {
    Write-Host "No files to commit. Make sure you have uncommitted changes."
    exit
}

# Professional commit messages pool
$commitMessages = @(
    "feat: implement core modules and update dependencies",
    "refactor: improve code structure and optimize performance",
    "fix: resolve minor bugs and UI inconsistencies",
    "chore: update project configuration and build scripts",
    "feat: add new API endpoints and database models",
    "style: format code according to linting rules",
    "docs: update documentation and inline comments",
    "feat: enhance user dashboard and authentication flow",
    "refactor: clean up deprecated functions and unused imports",
    "perf: optimize rendering and state management",
    "feat: integrate external services and webhooks",
    "test: add unit tests for critical components",
    "chore: clean up project workspace",
    "feat: finalize initial project setup and scaffolding",
    "fix: address edge cases in data processing"
)

# Shuffle files to distribute them randomly across commits
$filesList = $stagedFiles -split "`n" | Where-Object { $_ -ne "" }
$shuffledFiles = $filesList | Sort-Object { Get-Random }

# Group files into chunks based on total days
$filesPerDay = [Math]::Max(1, [Math]::Ceiling($shuffledFiles.Count / ($totalDays + 1)))

$currentDay = 0
$fileIndex = 0

# Unstage everything first so we can commit chunk by chunk
git reset

while ($fileIndex -lt $shuffledFiles.Count) {
    $commitDate = $startDate.AddDays($currentDay)
    
    # If we overshoot the end date, clamp it to today
    if ($commitDate -gt $endDate) {
        $commitDate = $endDate
    }

    $dateStr = $commitDate.ToString("yyyy-MM-ddTHH:mm:ss")
    $env:GIT_AUTHOR_DATE = $dateStr
    $env:GIT_COMMITTER_DATE = $dateStr

    # Select files for this chunk
    $chunk = $shuffledFiles | Select-Object -Skip $fileIndex -First $filesPerDay
    
    foreach ($file in $chunk) {
        git add $file
    }

    # Pick a random professional commit message
    $message = $commitMessages | Get-Random

    Write-Host "Committing $($chunk.Count) files on $dateStr with message: $message"
    git commit -m $message --quiet

    $fileIndex += $filesPerDay
    $currentDay++
}

Write-Host "Finished! You can now run 'git push origin main' to push your changes."
