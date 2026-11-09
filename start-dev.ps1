# WorkSphere Development Runner
# Starts both WorkSphere.Server and WorkSphere.Client concurrently

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting WorkSphere (Full-Stack Dev Mode) " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Start Client dev server in a new background process or job
Write-Host "`n[1/2] Starting WorkSphere.Client (Vite on http://localhost:5173)..." -ForegroundColor Yellow
$clientProcess = Start-Process npm -ArgumentList "run dev" -WorkingDirectory "$PSScriptRoot\WorkSphere.Client" -PassThru

# Start Server
Write-Host "[2/2] Starting WorkSphere.Server (.NET Web API on http://localhost:5069)..." -ForegroundColor Green
Write-Host "`nPress Ctrl+C to terminate both servers.`n" -ForegroundColor DarkGray

try {
    dotnet run --project "$PSScriptRoot\WorkSphere.Server\WorkSphere.Server.csproj" --launch-profile "api-only"
}
finally {
    Write-Host "`nShutting down WorkSphere.Client (Process ID $($clientProcess.Id))..." -ForegroundColor Yellow
    Stop-Process -Id $clientProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "WorkSphere development session terminated." -ForegroundColor Cyan
}

