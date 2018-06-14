# homeless-helper-api

無家者小幫手專案之後端API

## 開發

### 軟體需求

- [Node.js](https://nodejs.org)
- [Yarn](https://yarnpkg.com)

### 步驟

* 安裝相依套件
```bash
yarn install
```

* 以Development Mode啟動Server，當原始碼被修改時會自動重啟server
```bash
yarn dev
```

* 或是，以Production Mode啟動Server
```bash
# 開始
yarn start
# 停止
yarn stop
```

## 佈署

### 軟體需求

- [docker](https://www.docker.com/)
- [docker-compose](https://docs.docker.com/compose/)

### 步驟

* 建立本專案的docker images
```bash
docker-compose build
```

* 運行服務
```bash
docker-compose up
``````
