# Only gateway for GPU-heavy processes on the shared Windows RTX 4070.
# A Windows named mutex protects across BOTH self-hosted runner processes on this PC.
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$Executable,
  [string[]]$CommandArguments = @(),
  [ValidateRange(1, 86400)][int]$WaitTimeoutSeconds = 21600
)

$ErrorActionPreference = 'Stop'
$mutex = [System.Threading.Mutex]::new($false, 'Global\OperatorTranslationGpuHeavy')
$hasLock = $false
$commandExit = 1
try {
  try {
    $hasLock = $mutex.WaitOne([TimeSpan]::FromSeconds($WaitTimeoutSeconds))
  } catch [System.Threading.AbandonedMutexException] {
    # Previous holder crashed: this process now owns the mutex.
    $hasLock = $true
  }
  if (-not $hasLock) {
    throw 'GPU_EXCLUSIVE_LOCK_TIMEOUT: another translation job is using this PC GPU.'
  }
  Write-Host 'GPU_EXCLUSIVE_LOCK_ACQUIRED'
  & $Executable @CommandArguments
  if ($null -eq $LASTEXITCODE) {
    $commandExit = 0
  } else {
    $commandExit = [int]$LASTEXITCODE
  }
} finally {
  if ($hasLock) {
    $mutex.ReleaseMutex()
    Write-Host 'GPU_EXCLUSIVE_LOCK_RELEASED'
  }
  $mutex.Dispose()
}
if ($commandExit -ne 0) {
  exit $commandExit
}
