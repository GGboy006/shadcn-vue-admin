# shadcn-vue-admin 运维部署手册

## 一、项目信息

| 项目 | 内容 |
|------|------|
| Git 仓库 | http://gitlab.icitychina.com.cn/front/xiaoqu-zhanzhang-c |
| 分支 | main |
| 构建产物 | dist/（纯静态 SPA） |
| 包管理器 | pnpm |
| Node | >= 22.15 |
| pnpm | >= 10 |

## 二、Jenkins 配置

### 2.1 前置准备

1. 安装 `NodeJS` 插件
2. 配置 NodeJS 工具：Name = `Node22`，Version = 22.x
3. 添加凭据：
   - ID：`prod-api-url`
   - 类型：Secret text
   - 值：生产环境 API 地址

### 2.2 环境变量

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `VITE_BASE_URL` | 是 | 应用部署基础路径（生产环境为 `/xiaoqu-b/`，本地开发为 `/`） |
| `VITE_SERVER_API_URL` | 是 | 后端 API 基础地址 |
| `VITE_SERVER_API_PREFIX` | 是 | API 路径前缀 |
| `VITE_SERVER_API_TIMEOUT` | 否 | 请求超时（毫秒） |

### 2.3 Jenkinsfile

放到项目根目录：

```groovy
pipeline {
    agent any

    tools {
        nodejs 'Node22'
    }

    environment {
        VITE_BASE_URL = '/xiaoqu-b/'
        VITE_SERVER_API_URL = credentials('prod-api-url')  
        VITE_SERVER_API_PREFIX = '/residential-web/web'
        VITE_SERVER_API_TIMEOUT = '40000'
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm install -g pnpm'
                sh 'pnpm install --frozen-lockfile'
            }
        }
        stage('Build') {
            steps {
                sh 'pnpm build'
            }
        }
        stage('Archive') {
            steps {
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }
    }
}
```

### 2.4 创建 Pipeline

1. 新建 Item → Pipeline
2. Git 仓库：`http://gitlab.icitychina.com.cn/front/xiaoqu-zhanzhang-c`
3. 分支：`*/main`
4. Script Path：`Jenkinsfile`

## 三、Nginx 部署

```nginx
server {
    listen 80;
    server_name admin.your-domain.com;

    root /var/www/shadcn-vue-admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

部署命令：

```bash
scp -r dist/ user@server:/var/www/shadcn-vue-admin/
scp nginx.conf user@server:/etc/nginx/conf.d/shadcn-vue-admin.conf
ssh user@server "nginx -t && systemctl reload nginx"
```

## 四、注意事项

1. **环境变量构建时注入**：`VITE_` 开头的变量只在构建时生效，运行后无法修改
2. **子目录部署**：生产构建必须设置 `VITE_BASE_URL=/xiaoqu-b/`，本地开发保持 `/`
3. **SPA 404 问题**：Nginx 必须配置 `try_files $uri $uri/ /index.html`
4. **不要提交 `.env`**：生产变量通过 Jenkins 凭据注入
