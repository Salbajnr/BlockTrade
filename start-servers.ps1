# Start backend server
Write-Host "Starting backend server..."
cd server
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start"

# Start frontend server
Write-Host "Starting frontend server..."
cd ..\client
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "dev"

Write-Host "Servers started successfully!"
Write-Host "Backend: http://localhost:3000"
Write-Host "Frontend: http://localhost:5173"
