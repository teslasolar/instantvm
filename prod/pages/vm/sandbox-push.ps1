# sandbox-push.ps1 — runs INSIDE Windows Sandbox, pushes state to GitHub Issues
param(
    [string]$Token = $env:GH_TOKEN,
    [string]$Repo = "teslasolar/instantvm",
    [string]$Label = "sandbox-state",
    [int]$IntervalSec = 30
)

$api = "https://api.github.com/repos/$Repo/issues"
$headers = @{
    "Authorization" = "token $Token"
    "Content-Type" = "application/json"
    "Accept" = "application/vnd.github+json"
}

function Get-SandboxState {
    $mem = [math]::Round((Get-CimInstance Win32_OperatingSystem).TotalVisibleMemorySize / 1024)
    $cpu = (Get-CimInstance Win32_Processor).Name
    $procs = (Get-Process).Count
    $uptime = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
    @{
        hostname = $env:COMPUTERNAME
        os = (Get-CimInstance Win32_OperatingSystem).Caption
        memory_mb = $mem
        cpu = $cpu
        processes = $procs
        boot_time = $uptime.ToString("o")
        ts = (Get-Date).ToString("o")
        type = "sandbox"
    }
}

function Push-State($state) {
    $json = $state | ConvertTo-Json -Compress
    $body = @{
        title = "sandbox:$($state.hostname)"
        body = "``````json`n$json`n``````"
        labels = @($Label)
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri $api -Method Post -Headers $headers -Body $body -ErrorAction Stop | Out-Null
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Pushed state to GitHub"
    } catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Push failed: $_"
    }
}

Write-Host "=== Sandbox Bridge ==="
Write-Host "Repo: $Repo"
Write-Host "Interval: ${IntervalSec}s"
Write-Host ""

while ($true) {
    $state = Get-SandboxState
    Push-State $state
    Start-Sleep -Seconds $IntervalSec
}
