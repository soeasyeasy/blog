#requires -version 5.1

param(
    [Parameter(Mandatory=$false)]
    [string]$Registry = "your-registry.com",
    
    [Parameter(Mandatory=$false)]
    [string]$FrontendImageName = "blogos-frontend",
    
    [Parameter(Mandatory=$false)]
    [string]$BackendImageName = "blogos-backend",
    
    [Parameter(Mandatory=$false)]
    [string]$Tag = $(Get-Date -Format "yyyyMMdd-HHmmss"),
    
    [Parameter(Mandatory=$false)]
    [switch]$PushOnly = $false
)

# 设置镜像全名
$FrontendImageFull = "${Registry}/${FrontendImageName}:${Tag}"
$BackendImageFull = "${Registry}/${BackendImageName}:${Tag}"
$FrontendLatest = "${Registry}/${FrontendImageName}:latest"
$BackendLatest = "${Registry}/${BackendImageName}:latest"

Write-Host "开始构建项目并推送镜像到仓库..." -ForegroundColor Green

if (-not $PushOnly) {
    # 1. 构建前端应用
    Write-Host "构建前端应用..." -ForegroundColor Yellow
    Set-Location -Path "$PSScriptRoot"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "前端依赖安装失败"
        exit 1
    }

    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "前端构建失败"
        exit 1
    }

    # 2. 构建后端应用
    Write-Host "构建后端应用..." -ForegroundColor Yellow
    Set-Location -Path "$PSScriptRoot\backend"
    mvn clean package -DskipTests
    if ($LASTEXITCODE -ne 0) {
        Write-Error "后端构建失败"
        exit 1
    }

    # 3. 构建前端Docker镜像
    Write-Host "构建前端Docker镜像: $FrontendImageFull" -ForegroundColor Yellow
    Set-Location -Path "$PSScriptRoot"
    docker build -t $FrontendImageFull -f Dockerfile .
    if ($LASTEXITCODE -ne 0) {
        Write-Error "前端Docker镜像构建失败"
        exit 1
    }

    # 4. 构建后端Docker镜像
    Write-Host "构建后端Docker镜像: $BackendImageFull" -ForegroundColor Yellow
    docker build -t $BackendImageFull -f backend/Dockerfile .
    if ($LASTEXITCODE -ne 0) {
        Write-Error "后端Docker镜像构建失败"
        exit 1
    }
} else {
    Write-Host "跳过构建步骤，直接推送已有镜像..." -ForegroundColor Yellow
    
    # 检查镜像是否存在
    $frontendImageExists = docker images -q $FrontendImageFull
    $backendImageExists = docker images -q $BackendImageFull
    
    if (-not $frontendImageExists) {
        Write-Error "前端镜像 $FrontendImageFull 不存在"
        exit 1
    }
    
    if (-not $backendImageExists) {
        Write-Error "后端镜像 $BackendImageFull 不存在"
        exit 1
    }
}

# 5. 登录镜像仓库
Write-Host "请确保已经通过 docker login $Registry 登录到镜像仓库" -ForegroundColor Cyan

# 6. 推送镜像到仓库
Write-Host "推送前端镜像..." -ForegroundColor Yellow
docker push $FrontendImageFull
if ($LASTEXITCODE -ne 0) {
    Write-Error "前端镜像推送失败"
    exit 1
}

Write-Host "推送后端镜像..." -ForegroundColor Yellow
docker push $BackendImageFull
if ($LASTEXITCODE -ne 0) {
    Write-Error "后端镜像推送失败"
    exit 1
}

# 7. 添加 latest 标签并推送
Write-Host "添加 latest 标签并推送..." -ForegroundColor Yellow
docker tag $FrontendImageFull $FrontendLatest
docker tag $BackendImageFull $BackendLatest

docker push $FrontendLatest
if ($LASTEXITCODE -ne 0) {
    Write-Error "前端 latest 标签镜像推送失败"
    exit 1
}

docker push $BackendLatest
if ($LASTEXITCODE -ne 0) {
    Write-Error "后端 latest 标签镜像推送失败"
    exit 1
}

Write-Host "所有镜像已成功构建并推送!" -ForegroundColor Green