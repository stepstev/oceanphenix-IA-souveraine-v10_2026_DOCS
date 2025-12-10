# OceanPhenix V10 - Installation Locale (Windows PowerShell)

param(
    [Parameter(Position=0)]
    [ValidateSet("install", "start", "stop", "restart", "logs", "status", "clean", "help")]
    [string]$Action = "help"
)

function Show-Help {
    Write-Host "`nOceanPhenix V10 Manager - Installation Locale" -ForegroundColor Cyan
    Write-Host "----------------------------------------------------------------"
    Write-Host ".\install-local-v10.ps1 install  : Prepare l'environnement"
    Write-Host ".\install-local-v10.ps1 start    : Demarre tous les services"
    Write-Host ".\install-local-v10.ps1 stop     : Arrete tous les services"
    Write-Host ".\install-local-v10.ps1 restart  : Redemarre tout"
    Write-Host ".\install-local-v10.ps1 logs     : Affiche les logs"
    Write-Host ".\install-local-v10.ps1 status   : Etat des services"
    Write-Host ".\install-local-v10.ps1 clean    : Nettoie les conteneurs"
    Write-Host "----------------------------------------------------------------`n"
}

function Install-Environment {
    Write-Host "`nInitialisation de OceanPhenix V10..." -ForegroundColor Cyan
    
    # Verifier Docker
    try {
        $dockerVersion = docker --version
        Write-Host "[OK] Docker detecte: $dockerVersion" -ForegroundColor Green
    } catch {
        Write-Host "[ERREUR] Docker n'est pas installe" -ForegroundColor Red
        Write-Host "Installez Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        exit 1
    }
    
    # Creer le fichier .env
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Host "[OK] .env cree depuis .env.example" -ForegroundColor Green
        }
    } else {
        Write-Host "[INFO] .env existe deja" -ForegroundColor Yellow
    }
    
    # Creer les reseaux Docker
    Write-Host "`nCreation des reseaux Docker..." -ForegroundColor Cyan
    
    docker network create v10_proxy 2>$null
    docker network create v10_internal 2>$null
    Write-Host "[OK] Reseaux crees" -ForegroundColor Green
    
    # Creer les dossiers
    $folders = @("data/documents", "backend/logs", "backups")
    foreach ($folder in $folders) {
        if (-not (Test-Path $folder)) {
            New-Item -ItemType Directory -Path $folder -Force | Out-Null
        }
    }
    Write-Host "[OK] Dossiers crees" -ForegroundColor Green
    
    Write-Host "`n[SUCCESS] Installation terminee !" -ForegroundColor Green
    Write-Host "Utilisez: .\install-local-v10.ps1 start`n" -ForegroundColor Cyan
}

function Start-Services {
    Write-Host "`nDemarrage de la stack OceanPhenix V10..." -ForegroundColor Cyan
    docker-compose --profile all up -d --remove-orphans
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n[OK] Services demarres !" -ForegroundColor Green
        Write-Host "Frontend: http://localhost:8080" -ForegroundColor Yellow
        Write-Host "API Backend: http://localhost:8000" -ForegroundColor Yellow
    }
}

function Stop-Services {
    Write-Host "`nArret des services..." -ForegroundColor Cyan
    docker-compose --profile all down
    Write-Host "[OK] Services arretes" -ForegroundColor Green
}

function Restart-Services {
    Stop-Services
    Start-Sleep -Seconds 2
    Start-Services
}

function Show-Logs {
    Write-Host "`nLogs des services (Ctrl+C pour quitter)..." -ForegroundColor Cyan
    docker-compose logs -f --tail=50
}

function Show-Status {
    Write-Host "`nEtat des services OceanPhenix V10..." -ForegroundColor Cyan
    docker-compose ps
}

function Clean-Environment {
    Write-Host "`nNettoyage de l'environnement..." -ForegroundColor Cyan
    docker-compose down --remove-orphans
    docker system prune -f
    Write-Host "[OK] Nettoyage termine" -ForegroundColor Green
}

switch ($Action) {
    "install"  { Install-Environment }
    "start"    { Start-Services }
    "stop"     { Stop-Services }
    "restart"  { Restart-Services }
    "logs"     { Show-Logs }
    "status"   { Show-Status }
    "clean"    { Clean-Environment }
    "help"     { Show-Help }
    default    { Show-Help }
}
