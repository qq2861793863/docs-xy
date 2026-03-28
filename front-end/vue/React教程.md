# React 完整教程：从入门到进阶

---

## 一、React 概述与环境搭建

### 1.1 React 是什么

React 是由 Meta（Facebook）开发和维护的用于构建用户界面的 JavaScript 库。它的核心理念包括：

- **声明式**：描述 UI 应该是什么样子，React 负责更新 DOM
- **组件化**：将 UI 拆分为独立、可复用的组件
- **单向数据流**：数据从父组件流向子组件，保证数据流向清晰可预测
- **虚拟 DOM**：通过 Diff 算法高效更新真实 DOM

### 1.2 使用 Vite 创建项目

```bash
# 使用 Vite 创建 React + TypeScript 项目（推荐）
npm create vite@latest my-react-app -- --template react-ts

# 进入项目目录并安装依赖
cd my-react-app
npm install

# 启动开发服务器
npm run dev
```

```bash
# 使用 Create React App（CRA）— 已不推荐用于新项目
npx create-react-app my-app --template typescript
```

### 1.3 项目目录结构

```
my-react-app/
├── public/                 # 静态资源
│   └── vite.svg
├── src/
│   ├── assets/             # 需构建处理的静态资源
│   ├── components/         # 公共组件
│   ├── hooks/              # 自定义 Hooks
│   ├── pages/              # 页面组件
│   ├── router/             # 路由配置
│   ├── store/              # 状态管理
│   ├── services/           # API 请求
│   ├── types/              # 类型定义
│   ├── utils/              # 工具函数
│   ├── App.tsx             # 根组件
│   ├── App.css
│   ├── main.tsx            # 入口文件
│   └── vite-env.d.ts       # Vite 类型声明
├── index.html              # HTML 模板
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
└── package.json
```

### 1.4 JSX 语法详解

```tsx
// JSX 是 JavaScript 的语法扩展，允许在 JS 中编写类 HTML 结构
// JSX 最终会被编译为 React.createElement() 调用

function App() {
  const name = '张三'
  const isLoggedIn = true
  const items = ['苹果', '香蕉', '橘子']
  const imageUrl = '/logo.png'

  return (
    <div>
      {/* 表达式插值：使用花括号 */}
      <h1>你好，{name}</h1>
      <p>{1 + 2}</p>
      <p>{new Date().toLocaleDateString()}</p>

      {/* 属性绑定：className 代替 class，htmlFor 代替 for */}
      <div className="container">
        <label htmlFor="input">输入框</label>
        <input id="input" />
      </div>

      {/* 内联样式：使用对象，属性名驼峰写法 */}
      <div style={{ color: 'red', fontSize: '16px', backgroundColor: '#f0f0f0' }}>
        带样式的文字
      </div>

      {/* 动态属性 */}
      <img src={imageUrl} alt="logo" />

      {/* 条件渲染 */}
      {isLoggedIn ? <p>欢迎回来</p> : <p>请登录</p>}
      {isLoggedIn && <p>只在登录时显示</p>}

      {/* 列表渲染：必须提供唯一 key */}
      <ul>
        {items.map((item, index) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      {/* JSX 中不能使用 if/for 等语句，只能用表达式 */}
      {/* Fragment：不产生多余 DOM 节点 */}
      <>
        <p>片段1</p>
        <p>片段2</p>
      </>

      {/* 危险地插入 HTML（类似 v-html，注意 XSS 风险） */}
      <div dangerouslySetInnerHTML={{ __html: '<b>加粗</b>' }} />
    </div>
  )
}
```

---

## 二、组件基础

### 2.1 函数组件（推荐）

```tsx
// 函数组件是 React 推荐的组件写法
// 它就是一个返回 JSX 的函数

// 基本函数组件
function Welcome() {
  return <h1>Hello, World!</h1>
}

// 箭头函数写法
const Welcome2: React.FC = () => {
  return <h1>Hello, World!</h1>
}

// 带 Props 的组件
interface GreetingProps {
  name: string
  age?: number // 可选属性
}

function Greeting({ name, age = 18 }: GreetingProps) {
  return (
    <div>
      <h2>你好，{name}</h2>
      <p>年龄：{age}</p>
    </div>
  )
}

// 使用组件
function App() {
  return (
    <div>
      <Welcome />
      <Greeting name="张三" age={25} />
      <Greeting name="李四" /> {/* age 使用默认值 18 */}
    </div>
  )
}
```

### 2.2 Props 详解

```tsx
// Props 是组件的输入，从父组件传入，组件内只读

interface CardProps {
  title: string
  content: string
  footer?: React.ReactNode  // 可选，接受任意可渲染内容
  children?: React.ReactNode // 特殊 prop：组件标签内的内容
  onClick?: () => void       // 回调函数
  variant?: 'primary' | 'secondary' // 联合类型
  style?: React.CSSProperties      // 样式对象类型
}

function Card({ title, content, footer, children, onClick, variant = 'primary' }: CardProps) {
  return (
    <div className={`card card-${variant}`} onClick={onClick}>
      <div className="card-header">{title}</div>
      <div className="card-body">
        <p>{content}</p>
        {children}
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  )
}

// 使用
function App() {
  return (
    <Card
      title="标题"
      content="内容"
      variant="primary"
      onClick={() => console.log('clicked')}
      footer={<button>操作</button>}
    >
      {/* 这部分是 children */}
      <p>额外的子内容</p>
    </Card>
  )
}
```

### 2.3 条件渲染

```tsx
function StatusDisplay({ status }: { status: 'loading' | 'error' | 'success' }) {
  // 方式1：三元表达式
  // return status === 'loading' ? <Loading /> : <Content />

  // 方式2：逻辑与 &&
  // return status === 'error' && <ErrorMessage />

  // 方式3：提前 return
  if (status === 'loading') {
    return <div className="spinner">加载中...</div>
  }

  if (status === 'error') {
    return <div className="error">出错了</div>
  }

  return <div className="success">加载成功</div>
}

// 方式4：对象映射（适合多条件）
function StatusIcon({ status }: { status: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    loading: <span>⏳</span>,
    error: <span>❌</span>,
    success: <span>✅</span>,
  }

  return <>{iconMap[status] ?? <span>❓</span>}</>
}
```

### 2.4 列表渲染

```tsx
interface User {
  id: number
  name: string
  email: string
}

function UserList({ users }: { users: User[] }) {
  // key 的重要性：
  // 1. 帮助 React 识别哪些元素发生了变化
  // 2. 必须是唯一且稳定的值
  // 3. 避免使用数组索引作为 key（除非列表静态不变）

  if (users.length === 0) {
    return <p>暂无用户</p>
  }

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          <strong>{user.name}</strong> - {user.email}
        </li>
      ))}
    </ul>
  )
}

// 提取列表项为独立组件
function UserItem({ user }: { user: User }) {
  return (
    <li>
      <strong>{user.name}</strong> - {user.email}
    </li>
  )
}

function UserListRefactored({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map((user) => (
        <UserItem key={user.id} user={user} />
      ))}
    </ul>
  )
}
```

### 2.5 事件处理

```tsx
function EventDemo() {
  // React 使用合成事件（SyntheticEvent），跨浏览器兼容

  // 点击事件
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('点击坐标:', e.clientX, e.clientY)
    e.preventDefault()  // 阻止默认行为
    e.stopPropagation() // 阻止冒泡
  }

  // 输入事件
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('输入值:', e.target.value)
  }

  // 表单提交
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    console.log('表单数据:', Object.fromEntries(formData))
  }

  // 键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('按下回车')
    }
  }

  // 传递参数
  const handleItemClick = (id: number) => {
    console.log('点击了项目:', id)
  }

  return (
    <div>
      <button onClick={handleClick}>点击我</button>
      <input onChange={handleChange} onKeyDown={handleKeyDown} />
      <form onSubmit={handleSubmit}>
        <input name="username" />
        <button type="submit">提交</button>
      </form>

      {/* 传递参数的两种方式 */}
      <button onClick={() => handleItemClick(1)}>项目1</button>
      <button onClick={handleItemClick.bind(null, 2)}>项目2</button>
    </div>
  )
}
```

### 2.6 受控组件与非受控组件

```tsx
import { useState, useRef } from 'react'

// 受控组件：表单值由 React state 控制
function ControlledForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [gender, setGender] = useState('male')
  const [agree, setAgree] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ name, email, gender, agree })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="姓名"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="邮箱"
      />
      <select value={gender} onChange={(e) => setGender(e.target.value)}>
        <option value="male">男</option>
        <option value="female">女</option>
      </select>
      <label>
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        同意协议
      </label>
      <button type="submit">提交</button>
    </form>
  )
}

// 非受控组件：表单值由 DOM 自身管理，通过 ref 获取
function UncontrolledForm() {
  const nameRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('姓名:', nameRef.current?.value)
    console.log('文件:', fileRef.current?.files)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* defaultValue 设置初始值，之后由 DOM 管理 */}
      <input ref={nameRef} defaultValue="默认值" />
      {/* 文件输入始终是非受控的 */}
      <input ref={fileRef} type="file" />
      <button type="submit">提交</button>
    </form>
  )
}
```

---

## 三、State 与生命周期

### 3.1 useState

```tsx
import { useState } from 'react'

function Counter() {
  // useState 返回 [当前值, 更新函数]
  const [count, setCount] = useState(0)   // 初始值 0
  const [name, setName] = useState('')    // 初始值空字符串

  // 对象类型 state
  const [user, setUser] = useState({ name: '张三', age: 25 })

  // 数组类型 state
  const [items, setItems] = useState<string[]>([])

  return (
    <div>
      {/* 直接设置新值 */}
      <button onClick={() => setCount(count + 1)}>
        计数: {count}
      </button>

      {/* 函数式更新：基于上一个 state 计算新值（推荐用于依赖旧值的场景） */}
      <button onClick={() => setCount(prev => prev + 1)}>
        +1
      </button>

      {/* 更新对象：必须创建新对象（展开运算符） */}
      <button onClick={() => setUser(prev => ({ ...prev, age: prev.age + 1 }))}>
        增加年龄: {user.age}
      </button>

      {/* 更新数组：必须创建新数组 */}
      <button onClick={() => setItems(prev => [...prev, `项目${prev.length + 1}`])}>
        添加项目
      </button>
      <button onClick={() => setItems(prev => prev.filter((_, i) => i !== 0))}>
        删除第一项
      </button>
      <button onClick={() => setItems(prev => prev.map((item, i) => i === 0 ? '修改后' : item))}>
        修改第一项
      </button>
    </div>
  )
}

// 惰性初始化：初始值需要复杂计算时使用函数形式
function ExpensiveInitial() {
  // 函数只在首次渲染时执行，后续渲染不会重复计算
  const [data, setData] = useState(() => {
    const initialData = someExpensiveComputation()
    return initialData
  })

  return <div>{JSON.stringify(data)}</div>
}
```

### 3.2 状态更新的特性

```tsx
import { useState } from 'react'

function BatchUpdateDemo() {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    // React 18 自动批处理：多次 setState 合并为一次渲染
    setCount(c => c + 1) // 不会立即渲染
    setCount(c => c + 1) // 不会立即渲染
    setCount(c => c + 1) // 三次更新合并，只渲染一次，count 最终 +3

    // 注意：直接使用值而非函数式更新会有问题
    // setCount(count + 1) // 这三行都基于同一个 count 值
    // setCount(count + 1) // 最终只 +1
    // setCount(count + 1)
  }

  // 状态更新是异步的，不能在 setState 后立即获取新值
  const handleUpdate = () => {
    setCount(42)
    console.log(count) // 仍然是旧值！
    // 如果需要对新值做操作，使用 useEffect 监听
  }

  return <button onClick={handleClick}>Count: {count}</button>
}
```

### 3.3 useReducer

```tsx
import { useReducer } from 'react'

// 适用于复杂的状态逻辑（多个子值、下一个状态依赖上一个状态）
interface State {
  count: number
  step: number
  history: number[]
}

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'set_step'; payload: number }
  | { type: 'reset' }

const initialState: State = {
  count: 0,
  step: 1,
  history: []
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return {
        ...state,
        count: state.count + state.step,
        history: [...state.history, state.count + state.step]
      }
    case 'decrement':
      return {
        ...state,
        count: state.count - state.step,
        history: [...state.history, state.count - state.step]
      }
    case 'set_step':
      return { ...state, step: action.payload }
    case 'reset':
      return initialState
    default:
      return state
  }
}

function CounterWithReducer() {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <div>
      <p>计数: {state.count}（步长: {state.step}）</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <input
        type="number"
        value={state.step}
        onChange={(e) => dispatch({ type: 'set_step', payload: Number(e.target.value) })}
      />
      <button onClick={() => dispatch({ type: 'reset' })}>重置</button>
      <p>历史记录: {state.history.join(', ')}</p>
    </div>
  )
}
```

---

## 四、React Hooks 深入

### 4.1 useEffect

```tsx
import { useState, useEffect } from 'react'

function EffectDemo() {
  const [count, setCount] = useState(0)
  const [userId, setUserId] = useState(1)

  // 1. 每次渲染后执行（无依赖数组）
  useEffect(() => {
    console.log('每次渲染后都执行')
  })

  // 2. 只在挂载时执行一次（空依赖数组）
  useEffect(() => {
    console.log('组件挂载')

    // 清理函数：组件卸载时执行
    return () => {
      console.log('组件卸载，清理资源')
    }
  }, [])

  // 3. 依赖变化时执行
  useEffect(() => {
    document.title = `点击了 ${count} 次`
  }, [count]) // 只在 count 变化时执行

  // 4. 异步请求（常见模式）
  useEffect(() => {
    let isCancelled = false // 防止组件卸载后更新状态

    async function fetchUser() {
      try {
        const response = await fetch(`/api/users/${userId}`)
        const data = await response.json()
        if (!isCancelled) {
          // 只在组件仍然挂载时更新状态
          console.log(data)
        }
      } catch (error) {
        if (!isCancelled) {
          console.error(error)
        }
      }
    }

    fetchUser()

    return () => {
      isCancelled = true // 组件卸载时标记取消
    }
  }, [userId])

  // 5. 使用 AbortController 取消请求
  useEffect(() => {
    const controller = new AbortController()

    fetch(`/api/data`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err)
        }
      })

    return () => controller.abort() // 卸载时取消请求
  }, [])

  // 6. 事件监听
  useEffect(() => {
    const handleResize = () => console.log(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 7. 定时器
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
    return () => clearInterval(timer) // 清理定时器
  }, [])

  return <div>Count: {count}</div>
}
```

### 4.2 useContext

```tsx
import { createContext, useContext, useState, type ReactNode } from 'react'

// 1. 创建 Context
interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

// 2. 自定义 Hook 封装 Context 消费（推荐）
function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// 3. Provider 组件
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 4. 消费 Context
function ThemedButton() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      style={{
        background: theme === 'dark' ? '#333' : '#fff',
        color: theme === 'dark' ? '#fff' : '#333'
      }}
    >
      当前主题: {theme}
    </button>
  )
}

// 5. 在应用中使用
function App() {
  return (
    <ThemeProvider>
      <ThemedButton />
    </ThemeProvider>
  )
}
```

### 4.3 useRef

```tsx
import { useRef, useState, useEffect } from 'react'

function RefDemo() {
  // 1. DOM 引用
  const inputRef = useRef<HTMLInputElement>(null)
  const divRef = useRef<HTMLDivElement>(null)

  const focusInput = () => {
    inputRef.current?.focus()
  }

  const scrollToDiv = () => {
    divRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 2. 存储可变值（不会触发重新渲染）
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const renderCountRef = useRef(0)
  const prevValueRef = useRef<string>('')

  useEffect(() => {
    renderCountRef.current += 1
    console.log(`渲染次数: ${renderCountRef.current}`)
  })

  // 3. 保存前一个 state 值
  const [value, setValue] = useState('')

  useEffect(() => {
    prevValueRef.current = value // 更新后保存当前值
  }, [value])

  console.log(`当前值: ${value}, 上一个值: ${prevValueRef.current}`)

  // 4. 保存定时器引用
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      console.log('tick')
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  return (
    <div>
      <input ref={inputRef} value={value} onChange={e => setValue(e.target.value)} />
      <button onClick={focusInput}>聚焦输入框</button>
      <button onClick={startTimer}>开始</button>
      <button onClick={stopTimer}>停止</button>
      <div ref={divRef}>目标元素</div>
    </div>
  )
}
```

### 4.4 useMemo 与 useCallback

```tsx
import { useState, useMemo, useCallback, memo } from 'react'

// memo 包裹的组件只在 props 变化时才重新渲染
const ExpensiveList = memo(function ExpensiveList({
  items,
  onItemClick
}: {
  items: number[]
  onItemClick: (id: number) => void
}) {
  console.log('ExpensiveList 渲染了')
  return (
    <ul>
      {items.map(item => (
        <li key={item} onClick={() => onItemClick(item)}>{item}</li>
      ))}
    </ul>
  )
})

function App() {
  const [count, setCount] = useState(0)
  const [numbers] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

  // useMemo：缓存计算结果，依赖不变时返回缓存值
  const expensiveResult = useMemo(() => {
    console.log('执行昂贵计算...')
    return numbers.reduce((sum, n) => sum + n * n, 0)
  }, [numbers]) // 只在 numbers 变化时重新计算

  // useMemo 缓存过滤后的列表
  const evenNumbers = useMemo(() => {
    return numbers.filter(n => n % 2 === 0)
  }, [numbers])

  // useCallback：缓存函数引用，依赖不变时返回同一个函数
  // 配合 React.memo 子组件使用，避免子组件不必要的重新渲染
  const handleItemClick = useCallback((id: number) => {
    console.log('点击了:', id)
  }, []) // 空依赖：函数引用永远不变

  // 如果回调依赖某些值
  const handleItemClickWithCount = useCallback((id: number) => {
    console.log('点击了:', id, '当前计数:', count)
  }, [count]) // count 变化时函数引用更新

  return (
    <div>
      <p>计算结果: {expensiveResult}</p>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      {/* count 变化时，ExpensiveList 不会重新渲染（因为 props 没变） */}
      <ExpensiveList items={evenNumbers} onItemClick={handleItemClick} />
    </div>
  )
}
```

### 4.5 自定义 Hook

```tsx
// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react'

function useLocalStorage<T>(key: string, initialValue: T) {
  // 惰性初始化：从 localStorage 读取
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  // value 变化时同步到 localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }, [key, value])

  return [value, setValue] as const
}

// 使用
function App() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  const [count, setCount] = useLocalStorage('count', 0)

  return (
    <div>
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        主题: {theme}
      </button>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
    </div>
  )
}
```

```tsx
// hooks/useDebounce.ts
import { useState, useEffect } from 'react'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// 使用：搜索防抖
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    if (debouncedSearch) {
      // 发起搜索请求
      fetch(`/api/search?q=${debouncedSearch}`)
    }
  }, [debouncedSearch])

  return <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
}
```

```tsx
// hooks/useToggle.ts
import { useState, useCallback } from 'react'

function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => setValue(v => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return { value, toggle, setTrue, setFalse }
}

// 使用
function Modal() {
  const { value: isOpen, toggle, setFalse: close } = useToggle()

  return (
    <div>
      <button onClick={toggle}>切换弹窗</button>
      {isOpen && (
        <div className="modal">
          <p>弹窗内容</p>
          <button onClick={close}>关闭</button>
        </div>
      )}
    </div>
  )
}
```

### 4.6 Hooks 规则

```tsx
// React Hooks 必须遵守的规则：

// 1. 只在函数组件或自定义 Hook 的顶层调用
// ✅ 正确
function Good() {
  const [count, setCount] = useState(0)
  useEffect(() => { /* ... */ }, [])
  return <div>{count}</div>
}

// ❌ 错误：不能在条件语句、循环、嵌套函数中调用
function Bad({ condition }: { condition: boolean }) {
  // if (condition) {
  //   const [count, setCount] = useState(0) // ❌ 条件调用
  // }
  //
  // for (let i = 0; i < 3; i++) {
  //   useEffect(() => {}) // ❌ 循环中调用
  // }

  // 正确做法：Hook 照常调用，在内部处理条件
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (condition) {
      // 在 Hook 内部处理条件
    }
  }, [condition])

  return <div>{count}</div>
}

// 2. 不能在普通函数中调用（必须是组件或自定义 Hook）
// ❌ function regularFunction() { useState(0) }
// ✅ function useCustomHook() { return useState(0) } // 以 use 开头
```

---

## 五、React Router

### 5.1 安装与基本配置

```bash
npm install react-router-dom
```

```tsx
// router/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// 路由懒加载
const Home = lazy(() => import('@/pages/Home'))
const About = lazy(() => import('@/pages/About'))
const UserDetail = lazy(() => import('@/pages/UserDetail'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const DashboardOverview = lazy(() => import('@/pages/dashboard/Overview'))
const DashboardSettings = lazy(() => import('@/pages/dashboard/Settings'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Login = lazy(() => import('@/pages/Login'))

// 路由守卫组件
function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('token')
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

// Loading 组件
function Loading() {
  return <div className="loading">加载中...</div>
}

// 使用 Suspense 包裹懒加载组件
function LazyWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LazyWrapper><Home /></LazyWrapper>
  },
  {
    path: '/about',
    element: <LazyWrapper><About /></LazyWrapper>
  },
  {
    path: '/login',
    element: <LazyWrapper><Login /></LazyWrapper>
  },
  {
    path: '/user/:id',
    element: <LazyWrapper><UserDetail /></LazyWrapper>
  },
  {
    path: '/dashboard',
    element: (
      <AuthGuard>
        <LazyWrapper><Dashboard /></LazyWrapper>
      </AuthGuard>
    ),
    children: [
      { index: true, element: <LazyWrapper><DashboardOverview /></LazyWrapper> },
      { path: 'settings', element: <LazyWrapper><DashboardSettings /></LazyWrapper> },
    ]
  },
  {
    path: '*',
    element: <LazyWrapper><NotFound /></LazyWrapper>
  }
])
```

```tsx
// main.tsx
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

function App() {
  return <RouterProvider router={router} />
}
```

### 5.2 路由使用

```tsx
import {
  Link,
  NavLink,
  Outlet,
  useParams,
  useNavigate,
  useSearchParams,
  useLocation
} from 'react-router-dom'

// 导航组件
function Navigation() {
  return (
    <nav>
      {/* Link：基础导航 */}
      <Link to="/">首页</Link>
      <Link to="/about">关于</Link>

      {/* NavLink：带激活状态的导航 */}
      <NavLink
        to="/dashboard"
        className={({ isActive }) => isActive ? 'nav-active' : ''}
      >
        仪表盘
      </NavLink>
    </nav>
  )
}

// 嵌套路由布局
function Dashboard() {
  return (
    <div>
      <h1>仪表盘</h1>
      <nav>
        <Link to="/dashboard">概览</Link>
        <Link to="/dashboard/settings">设置</Link>
      </nav>
      {/* Outlet 渲染子路由匹配的组件 */}
      <Outlet />
    </div>
  )
}

// 获取路由参数
function UserDetail() {
  const { id } = useParams<{ id: string }>()  // 动态路由参数
  const [searchParams, setSearchParams] = useSearchParams() // 查询参数
  const navigate = useNavigate()  // 编程式导航
  const location = useLocation()  // 当前位置信息

  const page = searchParams.get('page') || '1'

  const goBack = () => navigate(-1)
  const goHome = () => navigate('/')
  const goWithState = () => navigate('/about', { state: { from: 'user' }, replace: true })

  return (
    <div>
      <p>用户 ID: {id}</p>
      <p>页码: {page}</p>
      <p>当前路径: {location.pathname}</p>
      <button onClick={() => setSearchParams({ page: '2' })}>第2页</button>
      <button onClick={goBack}>返回</button>
      <button onClick={goHome}>回首页</button>
    </div>
  )
}
```

---

## 六、状态管理

### 6.1 Redux Toolkit

```bash
npm install @reduxjs/toolkit react-redux
```

```tsx
// store/slices/counterSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface CounterState {
  value: number
  status: 'idle' | 'loading' | 'failed'
}

const initialState: CounterState = {
  value: 0,
  status: 'idle'
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      // Redux Toolkit 使用 Immer，可以"直接修改" state
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
    reset: () => initialState
  }
})

export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions
export default counterSlice.reducer
```

```tsx
// store/slices/userSlice.ts - 异步操作
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: number
  name: string
  email: string
}

interface UserState {
  list: User[]
  current: User | null
  loading: boolean
  error: string | null
}

// 异步 Thunk
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('请求失败')
      return await response.json() as User[]
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null
  } as UserState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.current = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { setCurrentUser } = userSlice.actions
export default userSlice.reducer
```

```tsx
// store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './slices/counterSlice'
import userReducer from './slices/userSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer
  }
})

// 导出类型
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// 类型化的 Hooks
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

```tsx
// 在组件中使用
import { useAppSelector, useAppDispatch } from '@/store'
import { increment, decrement } from '@/store/slices/counterSlice'
import { fetchUsers } from '@/store/slices/userSlice'
import { useEffect } from 'react'

function Counter() {
  const count = useAppSelector(state => state.counter.value)
  const dispatch = useAppDispatch()

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => dispatch(increment())}>+1</button>
      <button onClick={() => dispatch(decrement())}>-1</button>
    </div>
  )
}

function UserList() {
  const { list, loading, error } = useAppSelector(state => state.user)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  if (loading) return <p>加载中...</p>
  if (error) return <p>错误: {error}</p>

  return (
    <ul>
      {list.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### 6.2 Zustand 轻量状态管理

```bash
npm install zustand
```

```tsx
// store/useStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface BearState {
  bears: number
  name: string
  increase: () => void
  decrease: () => void
  reset: () => void
  setName: (name: string) => void
  fetchBears: () => Promise<void>
}

// Zustand 用法非常简洁
const useBearStore = create<BearState>()(
  devtools(
    persist(
      (set, get) => ({
        bears: 0,
        name: '熊',
        increase: () => set((state) => ({ bears: state.bears + 1 })),
        decrease: () => set((state) => ({ bears: Math.max(0, state.bears - 1) })),
        reset: () => set({ bears: 0 }),
        setName: (name) => set({ name }),
        // 异步操作
        fetchBears: async () => {
          const response = await fetch('/api/bears')
          const data = await response.json()
          set({ bears: data.count })
        }
      }),
      { name: 'bear-storage' } // persist 配置
    )
  )
)

// 在组件中使用（无需 Provider 包裹）
function BearCounter() {
  // 选择性订阅：只在 bears 变化时重新渲染
  const bears = useBearStore(state => state.bears)
  const increase = useBearStore(state => state.increase)

  return (
    <div>
      <p>{bears} 只熊</p>
      <button onClick={increase}>多一只</button>
    </div>
  )
}
```

---

## 七、进阶特性

### 7.1 React.memo / forwardRef / useImperativeHandle

```tsx
import { forwardRef, useImperativeHandle, useRef, memo } from 'react'

// forwardRef：向子组件传递 ref
// useImperativeHandle：自定义暴露给父组件的实例方法

interface InputHandle {
  focus: () => void
  clear: () => void
  getValue: () => string
}

const FancyInput = forwardRef<InputHandle, { placeholder?: string }>(
  function FancyInput({ placeholder }, ref) {
    const inputRef = useRef<HTMLInputElement>(null)

    // 自定义暴露给父组件的方法
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => {
        if (inputRef.current) inputRef.current.value = ''
      },
      getValue: () => inputRef.current?.value || ''
    }))

    return <input ref={inputRef} placeholder={placeholder} />
  }
)

// 父组件
function Parent() {
  const inputRef = useRef<InputHandle>(null)

  return (
    <div>
      <FancyInput ref={inputRef} placeholder="请输入" />
      <button onClick={() => inputRef.current?.focus()}>聚焦</button>
      <button onClick={() => inputRef.current?.clear()}>清空</button>
      <button onClick={() => alert(inputRef.current?.getValue())}>获取值</button>
    </div>
  )
}
```

### 7.2 Portals 传送门

```tsx
import { createPortal } from 'react-dom'
import { useState } from 'react'

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  // createPortal 将子节点渲染到 DOM 的其他位置
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
        <button onClick={onClose}>关闭</button>
      </div>
    </div>,
    document.body // 渲染到 body 下
  )
}

function App() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <button onClick={() => setShowModal(true)}>打开弹窗</button>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2>弹窗标题</h2>
          <p>弹窗内容</p>
        </Modal>
      )}
    </div>
  )
}
```

### 7.3 Error Boundary 错误边界

```tsx
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

// 错误边界只能用类组件实现
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  // 当子组件抛出错误时调用
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  // 记录错误信息
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('错误边界捕获:', error, errorInfo)
    // 上报错误到监控服务
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h2>出错了</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// 使用
function App() {
  return (
    <ErrorBoundary fallback={<div>页面崩溃了，请刷新</div>}>
      <RiskyComponent />
    </ErrorBoundary>
  )
}
```

### 7.4 虚拟 DOM 与 Diff 算法

```
React 渲染流程：

1. 状态变化 → 生成新的虚拟 DOM 树（React Element 对象）
2. 新旧虚拟 DOM 进行 Diff 比较
3. 计算出最小变更集
4. 批量更新真实 DOM

Diff 策略（O(n) 复杂度）：
1. 同层比较：只比较同级节点，不跨层
2. 类型比较：不同类型的元素直接替换整个子树
3. key 比较：相同 key 的元素被认为是同一个节点
   - 没有 key：按顺序比较（插入/删除会导致大量更新）
   - 有唯一 key：精确匹配，只更新变化的节点

Fiber 架构（React 16+）：
- 将渲染工作拆分为可中断的小任务（Fiber 节点）
- 可以暂停、恢复、优先级调度
- 实现了并发渲染（Concurrent Mode）的基础
- 时间切片：每帧留出时间给浏览器处理用户交互
```

---

## 八、TypeScript 与 React

### 8.1 常用类型

```tsx
import { type FC, type PropsWithChildren, type ReactNode, type CSSProperties } from 'react'

// 组件 Props 类型
interface ButtonProps {
  text: string
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  icon?: ReactNode
  style?: CSSProperties
  className?: string
}

// 带 children 的 Props
interface LayoutProps {
  children: ReactNode  // 推荐显式声明
  sidebar?: ReactNode
}

// 或使用 PropsWithChildren
type CardProps = PropsWithChildren<{
  title: string
}>

// 事件类型
type ClickHandler = React.MouseEventHandler<HTMLButtonElement>
type ChangeHandler = React.ChangeEventHandler<HTMLInputElement>
type SubmitHandler = React.FormEventHandler<HTMLFormElement>
type KeyboardHandler = React.KeyboardEventHandler<HTMLInputElement>

// 泛型组件
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => ReactNode
  keyExtractor: (item: T) => string | number
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}

// 使用泛型组件
interface User { id: number; name: string }

function App() {
  const users: User[] = [{ id: 1, name: '张三' }]
  return (
    <List
      items={users}
      keyExtractor={user => user.id}
      renderItem={user => <span>{user.name}</span>}
    />
  )
}
```

---

## 九、工程化与最佳实践

### 9.1 Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux']
        }
      }
    }
  }
})
```

### 9.2 CSS 方案

```tsx
// 1. CSS Modules
// Button.module.css
// .button { padding: 8px 16px; }
// .primary { background: blue; color: white; }

import styles from './Button.module.css'
function Button() {
  return <button className={`${styles.button} ${styles.primary}`}>按钮</button>
}

// 2. Tailwind CSS（推荐）
function TailwindButton() {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
      按钮
    </button>
  )
}

// 3. styled-components
// import styled from 'styled-components'
// const StyledButton = styled.button<{ $primary?: boolean }>`
//   padding: 8px 16px;
//   background: ${props => props.$primary ? 'blue' : 'white'};
//   color: ${props => props.$primary ? 'white' : 'black'};
// `
```

### 9.3 项目结构最佳实践

```
src/
├── assets/                  # 静态资源
├── components/              # 公共组件
│   ├── ui/                  # 基础 UI 组件
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.module.css
│   │   │   └── index.ts
│   │   └── Input/
│   └── business/            # 业务公共组件
├── hooks/                   # 自定义 Hooks
├── pages/                   # 页面组件
│   ├── Home/
│   ├── Dashboard/
│   └── User/
├── router/                  # 路由配置
├── store/                   # 状态管理
│   ├── slices/
│   └── index.ts
├── services/                # API 请求
│   ├── request.ts           # Axios 封装
│   └── modules/
├── types/                   # 全局类型定义
├── utils/                   # 工具函数
├── constants/               # 常量
├── App.tsx
└── main.tsx
```

---

> **总结**：本教程涵盖了 React 从基础到进阶的核心知识。建议先掌握 JSX、组件、Props 和 State，然后深入 Hooks（尤其是 useEffect 和自定义 Hook），再学习路由和状态管理。React 的核心思想是"UI = f(state)"——界面是状态的函数，理解这一点，很多设计模式就自然而然了。
