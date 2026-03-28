# Node.js 完整教程：从入门到进阶

---

## 一、Node.js 概述与环境搭建

### 1.1 Node.js 是什么

Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时环境，让 JavaScript 可以在服务器端运行。核心特点：

- **事件驱动**：基于事件循环处理异步操作
- **非阻塞 I/O**：I/O 操作不会阻塞主线程
- **单线程**：主线程为单线程，通过事件循环处理并发
- **跨平台**：支持 Windows、macOS、Linux

### 1.2 安装与版本管理

```bash
# 使用 nvm（Node Version Manager）管理多版本（推荐）
# Windows 使用 nvm-windows：https://github.com/coreybutler/nvm-windows

# 安装指定版本
nvm install 20
nvm install 18.17.0

# 切换版本
nvm use 20

# 查看已安装的版本
nvm list

# 查看 Node.js 和 npm 版本
node -v
npm -v
```

### 1.3 包管理器

```bash
# npm（Node.js 自带）
npm init -y                      # 初始化项目
npm install express              # 安装依赖（生产）
npm install -D typescript        # 安装开发依赖
npm install -g nodemon           # 全局安装
npm uninstall express            # 卸载
npm update                       # 更新所有包
npm list --depth=0               # 查看已安装的包

# yarn
npm install -g yarn
yarn init -y
yarn add express
yarn add -D typescript
yarn remove express

# pnpm（推荐：更快、更省磁盘空间）
npm install -g pnpm
pnpm init
pnpm add express
pnpm add -D typescript
pnpm remove express
```

### 1.4 package.json 详解

```json
{
  "name": "my-node-app",
  "version": "1.0.0",
  "description": "Node.js 示例项目",
  "main": "dist/index.js",        // CommonJS 入口
  "module": "dist/index.mjs",     // ESModule 入口
  "type": "module",                // 启用 ESModule（.js 文件默认为 ESM）
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2"          // ^ 兼容更新（主版本不变）
  },
  "devDependencies": {
    "typescript": "~5.3.0",       // ~ 小版本更新
    "@types/express": "^4.17.21",
    "nodemon": "^3.0.0"
  },
  "engines": {
    "node": ">=18.0.0"            // 要求的 Node.js 版本
  }
}
```

### 1.5 CommonJS vs ESModule

```javascript
// ====== CommonJS（传统方式，Node.js 默认） ======
// 导出
// math.js
const add = (a, b) => a + b
const subtract = (a, b) => a - b
module.exports = { add, subtract }
// 或
exports.multiply = (a, b) => a * b

// 导入
const { add, subtract } = require('./math')
const fs = require('fs')

// ====== ESModule（推荐，现代标准） ======
// 需要 package.json 中设置 "type": "module"
// 或使用 .mjs 扩展名

// 导出 math.mjs
export const add = (a, b) => a + b
export const subtract = (a, b) => a - b
export default function multiply(a, b) { return a * b }

// 导入
import multiply, { add, subtract } from './math.mjs'
import fs from 'fs'
import { readFile } from 'fs/promises'
```

---

## 二、核心模块

### 2.1 path 模块

```javascript
import path from 'path'

// 路径拼接（自动处理分隔符）
path.join('/users', 'john', 'documents')  // '/users/john/documents'
path.join(__dirname, '..', 'config')      // 上级目录的 config

// 解析为绝对路径
path.resolve('src', 'index.js')  // '/当前工作目录/src/index.js'

// 获取路径信息
path.basename('/home/user/file.txt')      // 'file.txt'
path.basename('/home/user/file.txt', '.txt') // 'file'
path.dirname('/home/user/file.txt')       // '/home/user'
path.extname('/home/user/file.txt')       // '.txt'

// 解析路径
path.parse('/home/user/file.txt')
// { root: '/', dir: '/home/user', base: 'file.txt', ext: '.txt', name: 'file' }

// 格式化路径对象为字符串
path.format({ dir: '/home/user', name: 'file', ext: '.txt' })
// '/home/user/file.txt'

// 判断是否是绝对路径
path.isAbsolute('/foo/bar')  // true
path.isAbsolute('./foo')     // false

// 计算相对路径
path.relative('/data/orandea/test', '/data/orandea/impl')  // '../impl'
```

### 2.2 fs 模块

```javascript
import fs from 'fs'
import { readFile, writeFile, mkdir, readdir, stat, unlink, rename, copyFile } from 'fs/promises'

// ====== 读取文件 ======

// 同步读取（阻塞，慎用）
const contentSync = fs.readFileSync('file.txt', 'utf-8')

// 回调方式
fs.readFile('file.txt', 'utf-8', (err, data) => {
  if (err) throw err
  console.log(data)
})

// Promise 方式（推荐）
async function readFileDemo() {
  try {
    const content = await readFile('file.txt', 'utf-8')
    console.log(content)
  } catch (err) {
    console.error('读取失败:', err)
  }
}

// ====== 写入文件 ======
// 写入（覆盖）
await writeFile('output.txt', '写入的内容', 'utf-8')

// 追加写入
await fs.promises.appendFile('log.txt', '新增一行\n')

// ====== 目录操作 ======
// 创建目录（recursive: true 递归创建）
await mkdir('path/to/dir', { recursive: true })

// 读取目录
const files = await readdir('src')
console.log(files) // ['index.ts', 'utils.ts']

// 读取目录（包含文件类型）
const entries = await readdir('src', { withFileTypes: true })
entries.forEach(entry => {
  console.log(`${entry.name} - ${entry.isDirectory() ? '目录' : '文件'}`)
})

// ====== 文件信息 ======
const stats = await stat('file.txt')
console.log(stats.size)          // 文件大小（字节）
console.log(stats.isFile())      // 是否是文件
console.log(stats.isDirectory()) // 是否是目录
console.log(stats.mtime)         // 最后修改时间

// ====== 其他操作 ======
await rename('old.txt', 'new.txt')   // 重命名/移动
await copyFile('src.txt', 'dest.txt') // 复制
await unlink('file.txt')              // 删除文件

// 判断文件是否存在
import { access, constants } from 'fs/promises'
try {
  await access('file.txt', constants.F_OK)
  console.log('文件存在')
} catch {
  console.log('文件不存在')
}

// ====== 文件监听 ======
fs.watch('src', { recursive: true }, (eventType, filename) => {
  console.log(`${filename} 发生了 ${eventType} 事件`)
})
```

### 2.3 http 模块

```javascript
import http from 'http'

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  // req：请求对象
  console.log(`${req.method} ${req.url}`)
  console.log('Headers:', req.headers)

  // 路由处理
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end('<h1>首页</h1>')
  } else if (req.method === 'GET' && req.url === '/api/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify([{ id: 1, name: '张三' }]))
  } else if (req.method === 'POST' && req.url === '/api/users') {
    // 读取 POST 请求体
    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString()
    })
    req.on('end', () => {
      const data = JSON.parse(body)
      res.writeHead(201, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ id: 2, ...data }))
    })
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not Found')
  }
})

// 监听端口
server.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000')
})
```

### 2.4 events 模块

```javascript
import { EventEmitter } from 'events'

// EventEmitter 是 Node.js 事件驱动架构的核心
class MyEmitter extends EventEmitter {}
const emitter = new MyEmitter()

// 监听事件
emitter.on('data', (payload) => {
  console.log('收到数据:', payload)
})

// 只监听一次
emitter.once('connect', () => {
  console.log('连接成功（只触发一次）')
})

// 触发事件
emitter.emit('data', { id: 1, name: '张三' })
emitter.emit('connect')
emitter.emit('connect') // 不会再触发

// 移除监听器
const handler = (data) => console.log(data)
emitter.on('message', handler)
emitter.off('message', handler) // 或 removeListener

// 错误事件（必须监听，否则会抛出异常）
emitter.on('error', (err) => {
  console.error('发生错误:', err.message)
})
emitter.emit('error', new Error('something went wrong'))

// 实际应用：自定义事件系统
class OrderService extends EventEmitter {
  createOrder(order) {
    // 创建订单逻辑...
    console.log('订单已创建:', order.id)
    // 发出事件，解耦后续处理
    this.emit('orderCreated', order)
  }
}

const orderService = new OrderService()

// 不同模块监听同一事件
orderService.on('orderCreated', (order) => {
  console.log('发送确认邮件:', order.id)
})
orderService.on('orderCreated', (order) => {
  console.log('更新库存:', order.id)
})

orderService.createOrder({ id: 'ORD001', total: 99.99 })
```

### 2.5 stream 模块

```javascript
import { createReadStream, createWriteStream } from 'fs'
import { Transform, pipeline } from 'stream'
import { promisify } from 'util'

const pipelineAsync = promisify(pipeline)

// 可读流：逐块读取大文件（避免一次性加载到内存）
const readStream = createReadStream('large-file.txt', {
  encoding: 'utf-8',
  highWaterMark: 64 * 1024 // 每次读取 64KB
})

readStream.on('data', (chunk) => {
  console.log(`读取了 ${chunk.length} 字节`)
})
readStream.on('end', () => console.log('读取完毕'))
readStream.on('error', (err) => console.error(err))

// 可写流
const writeStream = createWriteStream('output.txt')
writeStream.write('第一行\n')
writeStream.write('第二行\n')
writeStream.end('最后一行') // end 后不能再写入

// 管道：将可读流数据导入可写流（最常用的方式）
// 复制文件
createReadStream('source.txt')
  .pipe(createWriteStream('destination.txt'))

// Transform 流：在读写过程中转换数据
const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase())
    callback()
  }
})

// 管道链
await pipelineAsync(
  createReadStream('input.txt'),
  upperCase,
  createWriteStream('output.txt')
)
console.log('转换完成')

// 实际应用：处理大文件（如 CSV 逐行处理）
import { createInterface } from 'readline'

const rl = createInterface({
  input: createReadStream('data.csv'),
  crlfDelay: Infinity
})

let lineCount = 0
for await (const line of rl) {
  lineCount++
  // 逐行处理
  const columns = line.split(',')
  console.log(`第 ${lineCount} 行:`, columns)
}
```

### 2.6 child_process 模块

```javascript
import { exec, execSync, spawn, fork } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// exec：执行 shell 命令（适合短命令，有输出缓冲区限制）
exec('ls -la', (error, stdout, stderr) => {
  if (error) {
    console.error('执行错误:', error)
    return
  }
  console.log('输出:', stdout)
})

// Promise 方式
const { stdout } = await execAsync('node --version')
console.log('Node 版本:', stdout.trim())

// 同步执行（阻塞）
const result = execSync('echo hello').toString()

// spawn：适合长时间运行的进程（如实时日志）
const child = spawn('ping', ['localhost', '-c', '3'])

child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`)
})

child.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`)
})

child.on('close', (code) => {
  console.log(`子进程退出码: ${code}`)
})

// fork：创建 Node.js 子进程（可通过 IPC 通信）
// parent.js
const worker = fork('./worker.js')

worker.send({ type: 'start', data: [1, 2, 3, 4, 5] })

worker.on('message', (msg) => {
  console.log('收到子进程消息:', msg)
})

// worker.js
// process.on('message', (msg) => {
//   if (msg.type === 'start') {
//     const result = msg.data.reduce((sum, n) => sum + n, 0)
//     process.send({ type: 'result', data: result })
//   }
// })
```

---

## 三、异步编程

### 3.1 事件循环详解

```
Node.js 事件循环的 6 个阶段：

┌───────────────────────┐
│        timers          │  ← setTimeout / setInterval 回调
├───────────────────────┤
│   pending callbacks    │  ← 系统级回调（如 TCP 错误）
├───────────────────────┤
│     idle, prepare      │  ← 内部使用
├───────────────────────┤
│        poll             │  ← I/O 回调（文件读写、网络请求等）
├───────────────────────┤
│        check            │  ← setImmediate 回调
├───────────────────────┤
│    close callbacks      │  ← close 事件回调（如 socket.on('close')）
└───────────────────────┘

微任务队列（在每个阶段之间执行）：
1. process.nextTick 队列（优先级最高）
2. Promise 微任务队列
```

```javascript
// 执行顺序示例
console.log('1. 同步代码')

setTimeout(() => {
  console.log('5. setTimeout')
}, 0)

setImmediate(() => {
  console.log('6. setImmediate')
})

Promise.resolve().then(() => {
  console.log('3. Promise 微任务')
})

process.nextTick(() => {
  console.log('2. nextTick（优先于 Promise）')
})

console.log('4. 同步代码结束')

// 输出顺序：1 → 4 → 2 → 3 → 5 → 6（5 和 6 的顺序不确定）
```

### 3.2 async / await 最佳实践

```javascript
// 1. 基本用法
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('获取用户失败:', error)
    throw error // 重新抛出，让调用者处理
  }
}

// 2. 并发执行（互不依赖的任务）
async function loadDashboard(userId) {
  // ✅ Promise.all 并发请求
  const [user, posts, notifications] = await Promise.all([
    fetchUser(userId),
    fetchPosts(userId),
    fetchNotifications(userId)
  ])
  return { user, posts, notifications }
}

// 3. Promise.allSettled（不因单个失败而中断）
async function loadData() {
  const results = await Promise.allSettled([
    fetch('/api/a'),
    fetch('/api/b'),
    fetch('/api/c')
  ])

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`请求 ${index} 成功:`, result.value)
    } else {
      console.log(`请求 ${index} 失败:`, result.reason)
    }
  })
}

// 4. 串行执行（有依赖关系）
async function processOrders(orderIds) {
  const results = []
  for (const id of orderIds) {
    const result = await processOrder(id) // 一个接一个
    results.push(result)
  }
  return results
}

// 5. 控制并发数
async function parallelLimit(tasks, limit) {
  const results = []
  const executing = new Set()

  for (const task of tasks) {
    const promise = task().then(result => {
      executing.delete(promise)
      return result
    })
    executing.add(promise)
    results.push(promise)

    if (executing.size >= limit) {
      await Promise.race(executing)
    }
  }

  return Promise.all(results)
}

// 6. 错误处理封装
function tryCatch(fn) {
  return async (...args) => {
    try {
      const data = await fn(...args)
      return [null, data]
    } catch (error) {
      return [error, null]
    }
  }
}

const safeFetchUser = tryCatch(fetchUser)
const [error, user] = await safeFetchUser(1)
if (error) {
  console.log('出错了:', error)
} else {
  console.log('用户:', user)
}
```

---

## 四、Express 框架

### 4.1 基本使用

```bash
npm install express
npm install -D @types/express
```

```typescript
import express, { Request, Response, NextFunction } from 'express'

const app = express()

// 内置中间件
app.use(express.json())                          // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true }))  // 解析 URL 编码请求体
app.use(express.static('public'))                // 静态文件服务

// 基本路由
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World')
})

app.get('/api/users', (req, res) => {
  const { page = '1', limit = '10' } = req.query
  res.json({ page, limit, data: [] })
})

app.get('/api/users/:id', (req, res) => {
  const { id } = req.params
  res.json({ id, name: '张三' })
})

app.post('/api/users', (req, res) => {
  const { name, email } = req.body
  // 创建用户逻辑...
  res.status(201).json({ id: 1, name, email })
})

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params
  const updates = req.body
  res.json({ id, ...updates })
})

app.delete('/api/users/:id', (req, res) => {
  res.status(204).send()
})

// 启动服务器
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
```

### 4.2 中间件

```typescript
import express, { Request, Response, NextFunction } from 'express'

const app = express()

// 中间件执行顺序：从上到下依次执行

// 1. 应用级中间件（日志记录）
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  console.log(`→ ${req.method} ${req.url}`)

  // 响应完成时记录耗时
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`← ${req.method} ${req.url} ${res.statusCode} ${duration}ms`)
  })

  next() // 必须调用 next() 将控制权传递给下一个中间件
})

// 2. 路由级中间件
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ error: '未授权' })
  }
  // 验证 token...
  (req as any).userId = 'decoded-user-id'
  next()
}

// 应用到特定路由
app.get('/api/profile', authMiddleware, (req, res) => {
  res.json({ userId: (req as any).userId })
})

// 3. 路由组
const router = express.Router()

router.get('/', (req, res) => {
  res.json({ message: '用户列表' })
})

router.get('/:id', (req, res) => {
  res.json({ id: req.params.id })
})

router.post('/', (req, res) => {
  res.status(201).json(req.body)
})

// 挂载到路径前缀
app.use('/api/users', router)

// 4. 错误处理中间件（四个参数）
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('错误:', err.stack)
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})
```

### 4.3 第三方中间件

```typescript
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import compression from 'compression'

const app = express()

// CORS 跨域
app.use(cors({
  origin: ['http://localhost:5173', 'https://example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

// Helmet 安全头
app.use(helmet())

// Morgan 请求日志
app.use(morgan('dev')) // 开发模式
// app.use(morgan('combined')) // 生产模式

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100,                  // 最多 100 个请求
  message: '请求过于频繁，请稍后再试'
})
app.use('/api/', limiter)

// Gzip 压缩
app.use(compression())
```

### 4.4 RESTful API 完整示例

```typescript
// routes/userRoutes.ts
import { Router, Request, Response } from 'express'

interface User {
  id: number
  name: string
  email: string
}

// 模拟数据库
let users: User[] = [
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' },
]
let nextId = 3

const router = Router()

// GET /api/users - 获取用户列表
router.get('/', (req: Request, res: Response) => {
  const { page = '1', limit = '10', search } = req.query

  let result = users
  if (search) {
    result = users.filter(u =>
      u.name.includes(search as string) || u.email.includes(search as string)
    )
  }

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)
  const startIndex = (pageNum - 1) * limitNum
  const paginatedUsers = result.slice(startIndex, startIndex + limitNum)

  res.json({
    data: paginatedUsers,
    total: result.length,
    page: pageNum,
    limit: limitNum
  })
})

// GET /api/users/:id - 获取单个用户
router.get('/:id', (req: Request, res: Response) => {
  const user = users.find(u => u.id === parseInt(req.params.id))
  if (!user) {
    return res.status(404).json({ error: '用户不存在' })
  }
  res.json(user)
})

// POST /api/users - 创建用户
router.post('/', (req: Request, res: Response) => {
  const { name, email } = req.body

  if (!name || !email) {
    return res.status(400).json({ error: '姓名和邮箱为必填项' })
  }

  const newUser: User = { id: nextId++, name, email }
  users.push(newUser)
  res.status(201).json(newUser)
})

// PUT /api/users/:id - 更新用户
router.put('/:id', (req: Request, res: Response) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id))
  if (index === -1) {
    return res.status(404).json({ error: '用户不存在' })
  }

  users[index] = { ...users[index], ...req.body }
  res.json(users[index])
})

// DELETE /api/users/:id - 删除用户
router.delete('/:id', (req: Request, res: Response) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id))
  if (index === -1) {
    return res.status(404).json({ error: '用户不存在' })
  }

  users.splice(index, 1)
  res.status(204).send()
})

export default router
```

---

## 五、数据库操作

### 5.1 MongoDB + Mongoose

```bash
npm install mongoose
```

```typescript
import mongoose, { Schema, Document, model } from 'mongoose'

// 连接数据库
await mongoose.connect('mongodb://localhost:27017/myapp', {
  // Mongoose 6+ 不再需要大部分连接选项
})
console.log('MongoDB 已连接')

// 定义接口
interface IUser extends Document {
  name: string
  email: string
  age: number
  role: 'user' | 'admin'
  createdAt: Date
}

// 定义 Schema
const userSchema = new Schema<IUser>({
  name: { type: String, required: [true, '姓名为必填项'], trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+@\w+\.\w+$/, '请输入有效的邮箱']
  },
  age: { type: Number, min: 0, max: 150 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
})

// 创建模型
const User = model<IUser>('User', userSchema)

// CRUD 操作
// 创建
const user = await User.create({ name: '张三', email: 'zhangsan@test.com', age: 25 })

// 查询
const allUsers = await User.find()                           // 查询所有
const admins = await User.find({ role: 'admin' })            // 条件查询
const oneUser = await User.findById('64abc...')               // 通过 ID 查询
const foundUser = await User.findOne({ email: 'zhangsan@test.com' })

// 分页查询
const page = 1, limit = 10
const users = await User.find()
  .sort({ createdAt: -1 })        // 按创建时间倒序
  .skip((page - 1) * limit)       // 跳过
  .limit(limit)                    // 限制数量
  .select('name email')            // 只返回指定字段
  .lean()                          // 返回普通对象（性能更好）

const total = await User.countDocuments()

// 更新
await User.findByIdAndUpdate('64abc...', { age: 26 }, { new: true })
await User.updateMany({ role: 'user' }, { $set: { age: 0 } })

// 删除
await User.findByIdAndDelete('64abc...')
await User.deleteMany({ age: { $lt: 18 } })
```

### 5.2 MySQL + TypeORM

```bash
npm install typeorm mysql2 reflect-metadata
```

```typescript
import { DataSource, Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm'

// 实体定义
@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 50 })
  name: string

  @Column({ unique: true })
  email: string

  @Column({ default: true })
  isActive: boolean

  @OneToMany(() => Post, post => post.author)
  posts: Post[]

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}

@Entity()
class Post {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @Column('text')
  content: string

  @ManyToOne(() => User, user => user.posts)
  author: User
}

// 数据源配置
const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'password',
  database: 'myapp',
  entities: [User, Post],
  synchronize: true,  // 开发环境自动同步表结构
  logging: true
})

// 初始化连接
await AppDataSource.initialize()

// 操作数据
const userRepository = AppDataSource.getRepository(User)

// 创建
const user = userRepository.create({ name: '张三', email: 'zhangsan@test.com' })
await userRepository.save(user)

// 查询
const allUsers = await userRepository.find()
const userWithPosts = await userRepository.find({ relations: ['posts'] })
const oneUser = await userRepository.findOneBy({ id: 1 })

// QueryBuilder（复杂查询）
const users = await userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.posts', 'post')
  .where('user.isActive = :active', { active: true })
  .orderBy('user.createdAt', 'DESC')
  .skip(0)
  .take(10)
  .getMany()
```

---

## 六、认证与安全

### 6.1 JWT 认证

```bash
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
```

```typescript
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { Request, Response, NextFunction } from 'express'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

// 密码加密
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// 密码验证
async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// 生成 JWT
function generateToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// 验证 JWT
function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
}

// 认证中间件
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: '缺少认证令牌' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = verifyToken(token)
    ;(req as any).user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: '令牌无效或已过期' })
  }
}

// 角色授权中间件
function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: '权限不足' })
    }
    next()
  }
}

// 注册接口
app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body
  const hashedPassword = await hashPassword(password)
  // 保存用户到数据库...
  const user = { id: '1', email, name, role: 'user' }
  const token = generateToken({ userId: user.id, role: user.role })
  res.status(201).json({ user, token })
})

// 登录接口
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  // 从数据库查找用户...
  const user = { id: '1', email, name: '张三', role: 'user', passwordHash: '...' }
  const isValid = await comparePassword(password, user.passwordHash)
  if (!isValid) {
    return res.status(401).json({ error: '邮箱或密码错误' })
  }
  const token = generateToken({ userId: user.id, role: user.role })
  res.json({ user: { id: user.id, email, name: user.name }, token })
})

// 受保护的路由
app.get('/api/profile', authMiddleware, (req, res) => {
  res.json({ user: (req as any).user })
})

// 需要管理员权限
app.delete('/api/users/:id', authMiddleware, authorize('admin'), (req, res) => {
  res.json({ message: '用户已删除' })
})
```

---

## 七、WebSocket 实时通信

### 7.1 Socket.IO

```bash
npm install socket.io
# 客户端
npm install socket.io-client
```

```typescript
// 服务端
import { createServer } from 'http'
import { Server } from 'socket.io'
import express from 'express'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

// 在线用户管理
const onlineUsers = new Map<string, { userId: string; username: string }>()

io.on('connection', (socket) => {
  console.log(`用户连接: ${socket.id}`)

  // 用户加入
  socket.on('join', ({ userId, username }) => {
    onlineUsers.set(socket.id, { userId, username })
    socket.join(`user:${userId}`) // 加入个人房间

    // 广播在线用户列表
    io.emit('onlineUsers', Array.from(onlineUsers.values()))
    io.emit('systemMessage', `${username} 加入了聊天室`)
  })

  // 加入房间
  socket.on('joinRoom', (room: string) => {
    socket.join(room)
    socket.to(room).emit('systemMessage', `有新用户加入了 ${room}`)
  })

  // 发送消息
  socket.on('message', ({ room, content }) => {
    const user = onlineUsers.get(socket.id)
    if (!user) return

    const message = {
      id: Date.now().toString(),
      userId: user.userId,
      username: user.username,
      content,
      timestamp: new Date().toISOString()
    }

    // 发送到房间（包括发送者）
    io.to(room).emit('message', message)
  })

  // 私聊
  socket.on('privateMessage', ({ targetUserId, content }) => {
    const sender = onlineUsers.get(socket.id)
    if (!sender) return
    io.to(`user:${targetUserId}`).emit('privateMessage', {
      from: sender,
      content,
      timestamp: new Date().toISOString()
    })
  })

  // 正在输入
  socket.on('typing', ({ room }) => {
    const user = onlineUsers.get(socket.id)
    if (user) {
      socket.to(room).emit('typing', { username: user.username })
    }
  })

  // 断开连接
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id)
    onlineUsers.delete(socket.id)
    if (user) {
      io.emit('onlineUsers', Array.from(onlineUsers.values()))
      io.emit('systemMessage', `${user.username} 离开了聊天室`)
    }
  })
})

httpServer.listen(3000, () => {
  console.log('WebSocket 服务器运行在 http://localhost:3000')
})
```

```typescript
// 客户端
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000')

// 连接成功
socket.on('connect', () => {
  console.log('已连接:', socket.id)
  socket.emit('join', { userId: '1', username: '张三' })
})

// 接收消息
socket.on('message', (message) => {
  console.log('新消息:', message)
})

// 发送消息
socket.emit('message', { room: 'general', content: '你好！' })

// 断开连接
socket.on('disconnect', () => {
  console.log('已断开连接')
})
```

---

## 八、进阶主题

### 8.1 Cluster 集群

```javascript
import cluster from 'cluster'
import { cpus } from 'os'
import express from 'express'

const numCPUs = cpus().length

if (cluster.isPrimary) {
  // 主进程：创建工作进程
  console.log(`主进程 ${process.pid} 启动，CPU 核心数: ${numCPUs}`)

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 退出，重启中...`)
    cluster.fork() // 自动重启
  })
} else {
  // 工作进程：运行 Express 服务
  const app = express()

  app.get('/', (req, res) => {
    res.send(`Hello from Worker ${process.pid}`)
  })

  app.listen(3000, () => {
    console.log(`工作进程 ${process.pid} 已启动`)
  })
}
```

### 8.2 Worker Threads 多线程

```javascript
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads'

if (isMainThread) {
  // 主线程：创建 Worker 处理 CPU 密集型任务
  function runWorker(data) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL(import.meta.url), { workerData: data })
      worker.on('message', resolve)
      worker.on('error', reject)
      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker exited with code ${code}`))
      })
    })
  }

  // 并行计算
  const results = await Promise.all([
    runWorker({ start: 0, end: 25000000 }),
    runWorker({ start: 25000001, end: 50000000 }),
    runWorker({ start: 50000001, end: 75000000 }),
    runWorker({ start: 75000001, end: 100000000 }),
  ])

  const totalSum = results.reduce((a, b) => a + b, 0)
  console.log('总和:', totalSum)
} else {
  // Worker 线程
  const { start, end } = workerData
  let sum = 0
  for (let i = start; i <= end; i++) {
    sum += i
  }
  parentPort.postMessage(sum)
}
```

### 8.3 PM2 进程管理

```bash
# 安装
npm install -g pm2

# 启动应用
pm2 start dist/index.js --name my-app

# 集群模式启动（自动根据 CPU 核心数创建多个实例）
pm2 start dist/index.js -i max --name my-app

# 常用命令
pm2 list                  # 查看所有进程
pm2 logs my-app           # 查看日志
pm2 monit                 # 实时监控
pm2 restart my-app        # 重启
pm2 stop my-app           # 停止
pm2 delete my-app         # 删除
pm2 reload my-app         # 零停机重载

# 保存进程列表，开机自启
pm2 save
pm2 startup
```

```javascript
// ecosystem.config.js - PM2 配置文件
module.exports = {
  apps: [{
    name: 'my-app',
    script: 'dist/index.js',
    instances: 'max',         // 集群模式
    exec_mode: 'cluster',
    max_memory_restart: '500M', // 内存超限重启
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/error.log',
    out_file: './logs/out.log'
  }]
}

// 使用配置文件启动
// pm2 start ecosystem.config.js --env production
```

### 8.4 Docker 部署

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# 利用 Docker 缓存层，先复制依赖文件
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# 复制源码并构建
COPY . .
RUN pnpm build

# 生产镜像
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# 从构建阶段复制编译产物
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# 非 root 用户运行
USER node

CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://mongo:27017/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
    restart: always

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mongo-data:
```

---

## 九、性能优化

### 9.1 常见优化策略

```typescript
// 1. 使用流处理大文件（避免一次性读入内存）
import { createReadStream } from 'fs'
import { pipeline } from 'stream/promises'

app.get('/download', async (req, res) => {
  res.setHeader('Content-Type', 'application/octet-stream')
  await pipeline(createReadStream('large-file.zip'), res)
})

// 2. 数据库查询优化
// - 使用索引
// - 只查询需要的字段 (select / projection)
// - 分页查询
// - 避免 N+1 查询（使用 populate / join）

// 3. 缓存
import NodeCache from 'node-cache'
const cache = new NodeCache({ stdTTL: 300 }) // 5 分钟过期

async function getCachedData(key: string, fetchFn: () => Promise<any>) {
  const cached = cache.get(key)
  if (cached) return cached

  const data = await fetchFn()
  cache.set(key, data)
  return data
}

// 4. 压缩响应
import compression from 'compression'
app.use(compression())

// 5. 异步错误处理包装
function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

app.get('/api/data', asyncHandler(async (req, res) => {
  const data = await fetchData()
  res.json(data)
}))
```

### 9.2 内存泄漏排查

```javascript
// 1. 使用 --inspect 启动调试
// node --inspect dist/index.js
// 然后在 Chrome 中打开 chrome://inspect

// 2. 监控内存使用
setInterval(() => {
  const usage = process.memoryUsage()
  console.log({
    rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,        // 总内存
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`, // 堆总量
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,  // 已用堆
    external: `${Math.round(usage.external / 1024 / 1024)} MB`   // C++ 对象
  })
}, 30000)

// 常见内存泄漏原因：
// 1. 全局变量不断增长（如缓存没有过期机制）
// 2. 未清理的事件监听器
// 3. 未关闭的数据库连接 / 定时器
// 4. 闭包引用大对象
```

---

> **总结**：Node.js 的核心价值在于用 JavaScript 统一前后端开发语言，以及其高效的异步 I/O 模型（非常适合 I/O 密集型应用）。建议从核心模块和 Express 框架入门，逐步学习数据库、认证、WebSocket 等进阶内容。生产环境部署时关注安全、性能和可靠性。
