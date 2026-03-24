# ============================================
# Upay Client Deployment Script
# Usage: .\deploy-client.ps1 -ClientCode "ABC" -ClientName "ABC Company"
# ============================================

param(
    [Parameter(Mandatory=$true)]
    [string]$ClientCode,
    
    [Parameter(Mandatory=$true)]
    [string]$ClientName,
    
    [string]$Domain = "",
    [string]$Theme = "orange"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================"
Write-Host "Upay Client Deployment"
Write-Host "========================================"
Write-Host "Client Code: $ClientCode"
Write-Host "Client Name: $ClientName"
Write-Host "Domain: $(if($Domain){$Domain}else{"(using default)"})"
Write-Host "Theme: $Theme"
Write-Host ""

# 1. 验证模板存在
$templatePath = "C:\Users\Owner\cloudflare\UpayClient\_Template"
if (-not (Test-Path $templatePath)) {
    Write-Error "Template not found at $templatePath"
    exit 1
}

# 2. 创建客户目录
$clientPath = "C:\Users\Owner\cloudflare\UpayClient\$ClientCode"
Write-Host "Step 1: Creating client directory..."
if (Test-Path $clientPath) {
    Write-Warning "Directory already exists. Updating..."
} else {
    Copy-Item -Recurse $templatePath $clientPath
    Write-Host "✅ Directory created"
}

# 3. 生成 API Key
$apiKey = [System.Guid]::NewGuid().ToString().Replace("-", "")
Write-Host "Step 2: Generated API Key: $apiKey"

# 4. 创建配置文件
$configContent = @"
{
  "clientCode": "$ClientCode",
  "clientName": "$ClientName",
  "domain": "$Domain",
  "theme": "$Theme",
  "apiKey": "$apiKey",
  "apiBaseUrl": "https://easylink-api.jimsbond007.workers.dev/api/v1"
}
"@

$configContent | Out-File -FilePath "$clientPath\config.json" -Encoding UTF8
Write-Host "✅ Config file created"

# 5. 注册到数据库
Write-Host "Step 3: Registering tenant in database..."
$sql = @"
INSERT OR IGNORE INTO tenants (client_code, client_name, domain, api_key, config_json) 
VALUES ('$ClientCode', '$ClientName', '$Domain', '$apiKey', '{"theme": "$Theme"}');
SELECT id FROM tenants WHERE client_code = '$ClientCode';
"@

# 执行 SQL (需要在 Easylink 目录下)
Set-Location C:\Users\Owner\cloudflare\Easylink\easylink-infra\database
try {
    $result = npx wrangler d1 execute payment-db --remote --command="$sql" 2>&1
    Write-Host "✅ Tenant registered"
} catch {
    Write-Warning "Failed to register tenant. Please run manually."
}

# 6. 创建 Pages 项目
Write-Host "Step 4: Creating Cloudflare Pages project..."
$projectName = "upay-client-$($ClientCode.ToLower())"
try {
    npx wrangler pages project create $projectName --production-branch=main 2>&1 | Out-Null
    Write-Host "✅ Pages project created: $projectName"
} catch {
    Write-Warning "Project may already exist. Continuing..."
}

# 7. 部署
Write-Host "Step 5: Deploying..."
Set-Location $clientPath
try {
    npx wrangler pages deploy . --project-name=$projectName --branch=main 2>&1
    Write-Host "✅ Deployment complete"
} catch {
    Write-Error "Deployment failed: $_"
    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host "Deployment Summary"
Write-Host "========================================"
Write-Host "Client Code: $ClientCode"
Write-Host "API Key: $apiKey"
Write-Host "Pages Project: $projectName"
Write-Host "API Endpoint: https://easylink-api.jimsbond007.workers.dev/api/v1/client/$ClientCode"
Write-Host ""
Write-Host "Next Steps:"
Write-Host "1. Configure custom domain (if needed): $Domain"
Write-Host "2. Test API connection"
Write-Host "3. Customize UI/theme"
Write-Host ""
