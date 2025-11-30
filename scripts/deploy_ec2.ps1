<#
.SYNOPSIS
    Automates the deployment of WeatherWise to an AWS EC2 instance.

.DESCRIPTION
    This script connects to an EC2 instance via SSH, installs Docker and Git,
    clones the repository, and starts the application using Docker Compose.

.PARAMETER IpAddress
    The public IP address of the EC2 instance.

.PARAMETER KeyPath
    The path to the .pem private key file.
<#
.SYNOPSIS
    Automates the deployment of WeatherWise to an AWS EC2 instance.

.DESCRIPTION
    This script connects to an EC2 instance via SSH, installs Docker and Git,
    clones the repository, and starts the application using Docker Compose.

.PARAMETER IpAddress
    The public IP address of the EC2 instance.

.PARAMETER KeyPath
    The path to the .pem private key file.

.EXAMPLE
    .\deploy_ec2.ps1 -IpAddress "1.2.3.4" -KeyPath "C:\path\to\key.pem"
#>

param (
    [Parameter(Mandatory = $true)]
    [string]$IpAddress,

    [Parameter(Mandatory = $true)]
    [string]$KeyPath,

    [Parameter(Mandatory = $true)]
    [string]$ApiKey
)

$User = "ec2-user"
$RepoUrl = "https://github.com/Bhavya3604/WeatherWise.git"

# SSH Command wrapper
function Invoke-SSHCommand {
    param (
        [string]$Command
    )
    ssh -i $KeyPath -o StrictHostKeyChecking=no "$User@$IpAddress" $Command
}

Write-Host "Deploying to $IpAddress..." -ForegroundColor Cyan

# 1. Update system and install Git/Docker
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Invoke-SSHCommand "sudo yum update -y && sudo yum install git docker -y"
Invoke-SSHCommand "sudo service docker start && sudo usermod -a -G docker ec2-user"

# 2. Install Docker Compose & Buildx
Write-Host "Installing Docker Compose & Buildx..." -ForegroundColor Yellow
Invoke-SSHCommand 'sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose'
Invoke-SSHCommand 'sudo chmod +x /usr/local/bin/docker-compose'

# Install Buildx (Required for compose build)
Invoke-SSHCommand 'mkdir -p ~/.docker/cli-plugins'
Invoke-SSHCommand 'curl -SL https://github.com/docker/buildx/releases/download/v0.20.0/buildx-v0.20.0.linux-amd64 -o ~/.docker/cli-plugins/docker-buildx'
Invoke-SSHCommand 'chmod +x ~/.docker/cli-plugins/docker-buildx'

# 3. Clone Repository
Write-Host "Cloning repository..." -ForegroundColor Yellow
Invoke-SSHCommand "if [ ! -d 'WeatherWise' ]; then git clone $RepoUrl; else cd WeatherWise && git pull; fi"

# 4. Setup Environment
Write-Host "Configuring environment..." -ForegroundColor Yellow
$EnvContent = @"
APP_NAME=WeatherWise API
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=production-secret-key-$(Get-Random)
DATABASE_URL=sqlite+aiosqlite:///./weatherwise.db
OPENWEATHER_API_KEY=$ApiKey
ALLOWED_ORIGINS=[""http://localhost:3000"",""http://$IpAddress:3000""]
ML_MODEL_PATH=ml/models/weather_lstm.pt
ML_SCALER_PATH=ml/models/scaler.pkl
"@

# Escape double quotes for bash
$EnvContentEscaped = $EnvContent -replace '"', '\"'
Invoke-SSHCommand "cd WeatherWise && echo ""$EnvContentEscaped"" > .env"

# 5. Start Application
Write-Host "Starting application..." -ForegroundColor Yellow
Invoke-SSHCommand "cd WeatherWise && /usr/local/bin/docker-compose --env-file .env -f docker-compose.prod.yml up -d --build"

Write-Host "Deployment initiated! Check http://$IpAddress:3000" -ForegroundColor Green
