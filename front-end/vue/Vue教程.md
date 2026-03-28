# Vue.js 完整教程：从入门到进阶

---

## 一、Vue 概述与环境搭建

### 1.1 Vue 是什么

Vue.js 是一款用于构建用户界面的**渐进式 JavaScript 框架**。所谓"渐进式"，是指你可以根据项目需要，逐步引入 Vue 的各种功能模块（路由、状态管理、构建工具等），而不必一开始就全盘接受整个技术栈。

Vue 的核心特点：

- **响应式数据绑定**：数据变化自动驱动视图更新
- **组件化开发**：将 UI 拆分为可复用的独立组件
- **虚拟 DOM**：高效的 DOM 更新机制
- **易学易用**：API 设计简洁直观

### 1.2 Vue 2 与 Vue 3 的主要区别

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 响应式原理 | `Object.defineProperty` | `Proxy` |
| API 风格 | 选项式 API（Options API） | 组合式 API（Composition API）+ 选项式 |
| 生命周期 | beforeCreate, created 等 | setup, onMounted 等 |
| Fragment | 不支持（单根节点） | 支持多根节点 |
| Teleport | 无 | 内置支持 |
| TypeScript | 支持较弱 | 原生优化支持 |
| 性能 | 良好 | 更优（Tree-shaking, 编译优化） |
| 状态管理 | Vuex | Pinia（推荐）/ Vuex |

### 1.3 使用 Vite 创建 Vue 3 项目

```bash
# 使用 Vite 创建项目（推荐）
npm create vite@latest my-vue-app -- --template vue

# 进入项目目录
cd my-vue-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

使用 Vue CLI 创建项目：

```bash
# 全局安装 Vue CLI
npm install -g @vue/cli

# 创建项目
vue create my-vue-app

# 启动
cd my-vue-app
npm run serve
```

### 1.4 项目目录结构详解

```
my-vue-app/
├── public/                  # 静态资源（不经过构建处理）
│   └── favicon.ico
├── src/
│   ├── assets/              # 需要构建处理的静态资源
│   ├── components/          # 公共组件
│   ├── views/               # 页面级组件
│   ├── router/              # 路由配置
│   ├── stores/              # Pinia 状态管理
│   ├── composables/         # 组合式函数 (Hooks)
│   ├── utils/               # 工具函数
│   ├── api/                 # 接口请求
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── index.html               # HTML 模板
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
└── package.json             # 项目依赖与脚本
```

### 1.5 入口文件 main.ts

```typescript
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// 创建应用实例
const app = createApp(App)

// 注册插件
app.use(router)      // 注册路由
app.use(createPinia()) // 注册 Pinia 状态管理

// 挂载到 DOM
app.mount('#app')
```

---

## 二、模板语法基础

### 2.1 插值表达式

```vue
<template>
  <!-- 文本插值：双花括号将数据渲染为纯文本 -->
  <p>{{ message }}</p>

  <!-- 支持 JavaScript 表达式 -->
  <p>{{ count + 1 }}</p>
  <p>{{ ok ? '是' : '否' }}</p>
  <p>{{ name.split('').reverse().join('') }}</p>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('Hello Vue!')
const count = ref(10)
const ok = ref(true)
const name = ref('Vue')
</script>
```

### 2.2 v-bind 属性绑定

```vue
<template>
  <!-- 完整语法 -->
  <img v-bind:src="imageUrl" />

  <!-- 缩写（推荐） -->
  <img :src="imageUrl" />

  <!-- 动态绑定 class -->
  <div :class="{ active: isActive, 'text-danger': hasError }"></div>
  <div :class="[baseClass, isActive ? 'active' : '']"></div>

  <!-- 动态绑定 style -->
  <div :style="{ color: textColor, fontSize: fontSize + 'px' }"></div>
  <div :style="[baseStyle, overrideStyle]"></div>

  <!-- 绑定多个属性（Vue 3） -->
  <div v-bind="objectOfAttrs"></div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const imageUrl = ref('/logo.png')
const isActive = ref(true)
const hasError = ref(false)
const baseClass = ref('container')
const textColor = ref('red')
const fontSize = ref(16)

// v-bind 绑定对象：一次绑定多个属性
const objectOfAttrs = reactive({
  id: 'my-div',
  class: 'wrapper',
  title: '提示信息'
})
</script>
```

### 2.3 v-on 事件绑定

```vue
<template>
  <!-- 完整语法 -->
  <button v-on:click="handleClick">点击</button>

  <!-- 缩写（推荐） -->
  <button @click="handleClick">点击</button>

  <!-- 内联事件处理 -->
  <button @click="count++">计数: {{ count }}</button>

  <!-- 传递参数 -->
  <button @click="greet('Hello')">打招呼</button>

  <!-- 访问原生事件对象 $event -->
  <button @click="handleWithEvent($event)">带事件对象</button>

  <!-- 多事件处理 -->
  <button @click="handleA(), handleB()">多个处理器</button>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

function handleClick() {
  console.log('按钮被点击了')
}

function greet(msg: string) {
  alert(msg)
}

function handleWithEvent(event: MouseEvent) {
  console.log('点击坐标:', event.clientX, event.clientY)
}

function handleA() { console.log('A') }
function handleB() { console.log('B') }
</script>
```

### 2.4 v-model 双向绑定

```vue
<template>
  <!-- 文本输入 -->
  <input v-model="text" placeholder="请输入" />
  <p>输入内容：{{ text }}</p>

  <!-- 多行文本 -->
  <textarea v-model="content"></textarea>

  <!-- 复选框：单个绑定布尔值 -->
  <input type="checkbox" v-model="checked" />

  <!-- 复选框：多个绑定数组 -->
  <input type="checkbox" value="vue" v-model="frameworks" />
  <input type="checkbox" value="react" v-model="frameworks" />
  <input type="checkbox" value="angular" v-model="frameworks" />
  <p>选中的框架：{{ frameworks }}</p>

  <!-- 单选框 -->
  <input type="radio" value="male" v-model="gender" /> 男
  <input type="radio" value="female" v-model="gender" /> 女

  <!-- 下拉选择 -->
  <select v-model="selected">
    <option disabled value="">请选择</option>
    <option value="A">选项A</option>
    <option value="B">选项B</option>
  </select>

  <!-- 修饰符 -->
  <input v-model.lazy="lazyText" />      <!-- 在 change 事件后同步（失焦时） -->
  <input v-model.number="age" />          <!-- 自动转换为数字 -->
  <input v-model.trim="trimmedText" />    <!-- 自动去除首尾空格 -->
</template>

<script setup>
import { ref } from 'vue'

const text = ref('')
const content = ref('')
const checked = ref(false)
const frameworks = ref<string[]>([])
const gender = ref('male')
const selected = ref('')
const lazyText = ref('')
const age = ref(0)
const trimmedText = ref('')
</script>
```

### 2.5 条件渲染

```vue
<template>
  <!-- v-if / v-else-if / v-else：条件为 false 时元素不会被渲染到 DOM -->
  <div v-if="score >= 90">优秀</div>
  <div v-else-if="score >= 60">及格</div>
  <div v-else>不及格</div>

  <!-- v-show：通过 CSS display 控制显隐，元素始终在 DOM 中 -->
  <div v-show="isVisible">我通过 v-show 控制显隐</div>

  <!--
    v-if vs v-show：
    - v-if：切换开销大，适合条件很少改变的场景
    - v-show：初始渲染开销大，适合频繁切换的场景
  -->

  <!-- template 上使用 v-if（不会产生额外 DOM 节点） -->
  <template v-if="showGroup">
    <h1>标题</h1>
    <p>段落</p>
  </template>
</template>

<script setup>
import { ref } from 'vue'

const score = ref(85)
const isVisible = ref(true)
const showGroup = ref(true)
</script>
```

### 2.6 列表渲染

```vue
<template>
  <!-- 遍历数组 -->
  <ul>
    <!--
      key 的作用：帮助 Vue 识别节点身份，提升 diff 性能
      key 必须是唯一且稳定的值，避免使用 index 作为 key
    -->
    <li v-for="item in list" :key="item.id">
      {{ item.name }} - {{ item.price }}
    </li>
  </ul>

  <!-- 带索引 -->
  <div v-for="(item, index) in list" :key="item.id">
    {{ index + 1 }}. {{ item.name }}
  </div>

  <!-- 遍历对象 -->
  <div v-for="(value, key, index) in userInfo" :key="key">
    {{ index }} - {{ key }}: {{ value }}
  </div>

  <!-- 遍历数字范围 -->
  <span v-for="n in 10" :key="n">{{ n }} </span>

  <!-- v-for 与 v-if 不建议同时使用（Vue 3 中 v-if 优先级更高） -->
  <!-- 推荐使用 computed 过滤后再遍历 -->
  <li v-for="item in activeItems" :key="item.id">
    {{ item.name }}
  </li>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const list = ref([
  { id: 1, name: '苹果', price: 5, active: true },
  { id: 2, name: '香蕉', price: 3, active: false },
  { id: 3, name: '橘子', price: 4, active: true },
])

const userInfo = reactive({
  name: '张三',
  age: 25,
  city: '北京'
})

// 使用 computed 过滤，避免 v-for 和 v-if 混用
const activeItems = computed(() => list.value.filter(item => item.active))
</script>
```

### 2.7 事件修饰符

```vue
<template>
  <!-- .stop - 阻止事件冒泡 -->
  <div @click="handleOuter">
    <button @click.stop="handleInner">阻止冒泡</button>
  </div>

  <!-- .prevent - 阻止默认行为 -->
  <form @submit.prevent="handleSubmit">
    <button type="submit">提交</button>
  </form>

  <!-- .once - 事件只触发一次 -->
  <button @click.once="handleOnce">只触发一次</button>

  <!-- .self - 只在事件目标是自身时触发 -->
  <div @click.self="handleSelf">
    <button>点击按钮不触发 div 的事件</button>
  </div>

  <!-- 按键修饰符 -->
  <input @keyup.enter="handleEnter" />       <!-- 回车 -->
  <input @keyup.esc="handleEsc" />           <!-- ESC -->
  <input @keyup.tab="handleTab" />           <!-- Tab -->
  <input @keyup.ctrl.enter="handleCtrlEnter" />  <!-- Ctrl + Enter -->

  <!-- .capture - 使用捕获模式 -->
  <div @click.capture="handleCapture">...</div>

  <!-- .passive - 提升滚动性能 -->
  <div @scroll.passive="handleScroll">...</div>
</template>
```

---

## 三、组件系统

### 3.1 组件定义与注册

```vue
<!-- src/components/MyButton.vue - 单文件组件 (SFC) -->
<template>
  <button class="my-btn" @click="$emit('click')">
    <slot>默认按钮文字</slot>
  </button>
</template>

<script setup>
// 使用 <script setup> 语法糖，组件自动注册导出
defineEmits(['click'])
</script>

<style scoped>
/* scoped 确保样式只作用于当前组件 */
.my-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

```vue
<!-- 在父组件中使用 -->
<template>
  <!-- 局部注册：直接导入即可在 <script setup> 中使用 -->
  <MyButton @click="handleClick">点击我</MyButton>
</template>

<script setup>
import MyButton from './components/MyButton.vue'

function handleClick() {
  console.log('按钮被点击了')
}
</script>
```

全局注册：

```typescript
// main.ts 中全局注册
import { createApp } from 'vue'
import App from './App.vue'
import MyButton from './components/MyButton.vue'

const app = createApp(App)

// 全局注册后，所有组件中都可以直接使用 <MyButton />
app.component('MyButton', MyButton)

app.mount('#app')
```

### 3.2 Props 传值

```vue
<!-- 子组件：UserCard.vue -->
<template>
  <div class="user-card">
    <h3>{{ name }}</h3>
    <p>年龄：{{ age }}</p>
    <p>角色：{{ role }}</p>
    <ul>
      <li v-for="tag in tags" :key="tag">{{ tag }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// 使用 TypeScript 类型声明 Props（推荐）
interface Props {
  name: string
  age: number
  role?: string       // 可选属性
  tags?: string[]     // 可选属性
}

// withDefaults 设置默认值
const props = withDefaults(defineProps<Props>(), {
  role: '普通用户',
  tags: () => ['新用户']  // 引用类型默认值需要工厂函数
})

// 运行时声明方式（非 TypeScript）
// const props = defineProps({
//   name: { type: String, required: true },
//   age: { type: Number, required: true },
//   role: { type: String, default: '普通用户' },
//   tags: { type: Array, default: () => ['新用户'] }
// })
</script>
```

```vue
<!-- 父组件中使用 -->
<template>
  <UserCard
    name="张三"
    :age="25"
    role="管理员"
    :tags="['VIP', '开发者']"
  />
</template>
```

### 3.3 自定义事件 emit

```vue
<!-- 子组件：Counter.vue -->
<template>
  <div>
    <button @click="decrement">-</button>
    <span>{{ count }}</span>
    <button @click="increment">+</button>
  </div>
</template>

<script setup lang="ts">
// 声明自定义事件（带类型校验）
const emit = defineEmits<{
  (e: 'update', value: number): void
  (e: 'change', value: number, oldValue: number): void
}>()

const props = defineProps<{ count: number }>()

function increment() {
  const oldValue = props.count
  emit('update', props.count + 1)
  emit('change', props.count + 1, oldValue)
}

function decrement() {
  const oldValue = props.count
  emit('update', props.count - 1)
  emit('change', props.count - 1, oldValue)
}
</script>
```

```vue
<!-- 父组件 -->
<template>
  <Counter
    :count="count"
    @update="count = $event"
    @change="handleChange"
  />
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)

function handleChange(newVal, oldVal) {
  console.log(`值从 ${oldVal} 变为 ${newVal}`)
}
</script>
```

### 3.4 组件 v-model

```vue
<!-- 子组件：CustomInput.vue -->
<template>
  <!-- Vue 3.4+ 推荐使用 defineModel -->
  <input
    :value="model"
    @input="model = ($event.target as HTMLInputElement).value"
  />
</template>

<script setup lang="ts">
// Vue 3.4+ defineModel 宏
const model = defineModel<string>()

// 也支持多个 v-model
// const title = defineModel<string>('title')
// const content = defineModel<string>('content')
</script>
```

```vue
<!-- 父组件中使用 -->
<template>
  <CustomInput v-model="searchText" />
  <p>输入内容：{{ searchText }}</p>
</template>

<script setup>
import { ref } from 'vue'
const searchText = ref('')
</script>
```

### 3.5 插槽 Slot

```vue
<!-- 子组件：Card.vue -->
<template>
  <div class="card">
    <!-- 具名插槽：头部 -->
    <div class="card-header">
      <slot name="header">
        <h3>默认标题</h3>
      </slot>
    </div>

    <!-- 默认插槽：内容 -->
    <div class="card-body">
      <slot>默认内容</slot>
    </div>

    <!-- 作用域插槽：将子组件数据传递给父组件 -->
    <div class="card-footer">
      <slot name="footer" :count="itemCount" :total="totalPrice">
        <p>共 {{ itemCount }} 项，合计 {{ totalPrice }} 元</p>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const itemCount = ref(5)
const totalPrice = ref(199)
</script>
```

```vue
<!-- 父组件使用插槽 -->
<template>
  <Card>
    <!-- 具名插槽 -->
    <template #header>
      <h2>自定义标题</h2>
    </template>

    <!-- 默认插槽 -->
    <p>这是卡片的内容区域</p>

    <!-- 作用域插槽：解构子组件传来的数据 -->
    <template #footer="{ count, total }">
      <p>商品数量：{{ count }}，总价：{{ total }} 元</p>
      <button>去结算</button>
    </template>
  </Card>
</template>
```

### 3.6 动态组件与异步组件

```vue
<template>
  <!-- 动态组件：根据变量切换渲染不同组件 -->
  <component :is="currentTab" />

  <button @click="currentTab = TabA">Tab A</button>
  <button @click="currentTab = TabB">Tab B</button>

  <!-- KeepAlive 缓存组件实例，避免重复销毁和创建 -->
  <KeepAlive>
    <component :is="currentTab" />
  </KeepAlive>
</template>

<script setup>
import { ref, defineAsyncComponent, shallowRef } from 'vue'
import TabA from './TabA.vue'
import TabB from './TabB.vue'

// 使用 shallowRef 存储组件引用（避免不必要的深度响应）
const currentTab = shallowRef(TabA)

// 异步组件：按需加载，优化首屏性能
const AsyncDialog = defineAsyncComponent(() =>
  import('./components/HeavyDialog.vue')
)

// 带选项的异步组件
const AsyncWithOptions = defineAsyncComponent({
  loader: () => import('./components/HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,  // 加载中显示的组件
  errorComponent: ErrorDisplay,      // 加载失败显示的组件
  delay: 200,                        // 延迟显示 loading（ms）
  timeout: 3000                      // 超时时间（ms）
})
</script>
```

### 3.7 组件通信方式汇总

```vue
<!-- 1. Props / Emit：父子组件通信（最常用） -->
<!-- 见上文示例 -->

<!-- 2. provide / inject：跨层级通信（祖先→后代） -->
<!-- 祖先组件 -->
<script setup>
import { provide, ref } from 'vue'

const theme = ref('dark')
provide('theme', theme)           // 提供响应式数据
provide('appName', 'MyApp')       // 提供静态数据
</script>

<!-- 后代组件（任意深度） -->
<script setup>
import { inject } from 'vue'

// 注入数据，第二个参数是默认值
const theme = inject('theme', ref('light'))
const appName = inject('appName', 'DefaultApp')
</script>
```

```typescript
// 3. 事件总线（Vue 3 推荐用 mitt 库）
// utils/eventBus.ts
import mitt from 'mitt'

type Events = {
  'user-login': { name: string }
  'data-refresh': void
}

export const emitter = mitt<Events>()

// 发送事件
emitter.emit('user-login', { name: '张三' })

// 监听事件
emitter.on('user-login', (data) => {
  console.log(data.name)
})

// 移除监听
emitter.off('user-login')
```

---

## 四、响应式原理

### 4.1 Vue 2 的 Object.defineProperty

```javascript
// Vue 2 响应式原理简化实现
function defineReactive(obj, key, val) {
  const dep = new Dep() // 依赖收集器

  Object.defineProperty(obj, key, {
    get() {
      // 收集依赖（订阅者）
      if (Dep.target) {
        dep.addSub(Dep.target)
      }
      return val
    },
    set(newVal) {
      if (newVal === val) return
      val = newVal
      // 通知所有订阅者更新
      dep.notify()
    }
  })
}

// 缺点：
// 1. 无法检测属性的添加和删除（需要 Vue.set / Vue.delete）
// 2. 无法检测数组索引变化（需要使用 splice 等方法）
// 3. 需要递归遍历对象所有属性，性能开销大
```

### 4.2 Vue 3 的 Proxy

```javascript
// Vue 3 响应式原理简化实现
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // 收集依赖
      track(target, key)
      const result = Reflect.get(target, key, receiver)
      // 深层响应式：访问嵌套对象时递归代理
      if (typeof result === 'object' && result !== null) {
        return reactive(result)
      }
      return result
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      if (oldValue !== value) {
        // 触发更新
        trigger(target, key)
      }
      return result
    },
    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key)
      // 删除属性也能触发更新
      trigger(target, key)
      return result
    }
  })
}

// 优点：
// 1. 可以检测属性的添加和删除
// 2. 可以检测数组索引和 length 变化
// 3. 惰性代理，只有访问到的嵌套对象才会被代理
// 4. 性能更好
```

### 4.3 ref 与 reactive

```vue
<script setup>
import { ref, reactive, isRef, isReactive } from 'vue'

// ====== ref ======
// 适用于基本类型，也可用于对象
// 在 JS 中通过 .value 访问，在模板中自动解包
const count = ref(0)
console.log(count.value) // 0
count.value++

const user = ref({ name: '张三' })
user.value.name = '李四'  // 对象也用 .value

// ====== reactive ======
// 适用于对象/数组，不需要 .value
// 不能用于基本类型
const state = reactive({
  name: '张三',
  age: 25,
  hobbies: ['编程', '阅读']
})
state.name = '李四'      // 直接修改
state.hobbies.push('游泳') // 数组操作也是响应式的

// ====== 选择建议 ======
// 1. 基本类型 → ref
// 2. 对象/数组 → ref 或 reactive 都可以
// 3. 统一使用 ref 可以减少心智负担（推荐）
// 4. 表单等场景用 reactive 更方便（不用写 .value）

// 注意：reactive 不要直接替换整个对象！
let formData = reactive({ name: '' })
// formData = reactive({ name: '新值' }) // ❌ 丢失响应性
Object.assign(formData, { name: '新值' }) // ✅ 正确方式
</script>
```

### 4.4 toRef 与 toRefs

```vue
<script setup>
import { reactive, toRef, toRefs } from 'vue'

const state = reactive({
  name: '张三',
  age: 25
})

// toRef：将 reactive 对象的某个属性转为 ref
// 保持与源对象的响应式连接
const nameRef = toRef(state, 'name')
nameRef.value = '李四' // state.name 也会变为 '李四'

// toRefs：将 reactive 对象的所有属性转为 ref
// 常用于解构时保持响应性
const { name, age } = toRefs(state)
name.value = '王五'    // state.name 也会变为 '王五'

// 实际使用场景：从 composable 返回 reactive 对象时
function useUser() {
  const user = reactive({ name: '张三', age: 25 })
  // 返回 toRefs 让调用者可以解构使用
  return toRefs(user)
}

// 调用者可以解构，且保持响应性
const { name: userName, age: userAge } = useUser()
</script>
```

### 4.5 computed 计算属性

```vue
<template>
  <p>名：{{ firstName }}</p>
  <p>姓：{{ lastName }}</p>
  <p>全名：{{ fullName }}</p>
  <p>过滤后的列表：{{ filteredList }}</p>
</template>

<script setup>
import { ref, computed } from 'vue'

const firstName = ref('三')
const lastName = ref('张')

// 只读计算属性
const fullName = computed(() => lastName.value + firstName.value)

// 可写计算属性
const fullNameWritable = computed({
  get() {
    return lastName.value + firstName.value
  },
  set(newValue: string) {
    lastName.value = newValue[0]
    firstName.value = newValue.slice(1)
  }
})

// 计算属性 vs 方法：
// 1. 计算属性有缓存，依赖不变时不会重新计算
// 2. 方法每次渲染都会执行
const list = ref([1, 2, 3, 4, 5, 6, 7, 8])
const filteredList = computed(() => list.value.filter(n => n > 3))
</script>
```

### 4.6 watch 与 watchEffect

```vue
<script setup>
import { ref, reactive, watch, watchEffect } from 'vue'

const count = ref(0)
const name = ref('张三')
const state = reactive({ level: 1, score: 0 })

// ====== watch：显式指定监听源 ======

// 监听单个 ref
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} → ${newVal}`)
})

// 监听多个源
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  console.log(`count: ${oldCount} → ${newCount}`)
  console.log(`name: ${oldName} → ${newName}`)
})

// 监听 reactive 对象的某个属性（需要用 getter 函数）
watch(
  () => state.level,
  (newLevel) => {
    console.log('level 变了:', newLevel)
  }
)

// 深度监听
watch(
  () => state,
  (newState) => {
    console.log('state 变了:', newState)
  },
  { deep: true }  // 默认 reactive 对象已经是深层监听
)

// 立即执行
watch(count, (newVal) => {
  console.log('立即执行:', newVal)
}, { immediate: true })

// 只触发一次
watch(count, (newVal) => {
  console.log('只触发一次:', newVal)
}, { once: true })

// ====== watchEffect：自动收集依赖 ======
// 不需要指定监听源，回调中用到的响应式数据自动被追踪
// 立即执行一次
watchEffect(() => {
  console.log(`count: ${count.value}, name: ${name.value}`)
  // 自动追踪 count 和 name 的变化
})

// watchEffect 返回一个停止函数
const stop = watchEffect(() => {
  console.log(count.value)
})
stop() // 停止监听

// 清理副作用（如取消请求）
watchEffect((onCleanup) => {
  const controller = new AbortController()
  fetch('/api/data', { signal: controller.signal })
  onCleanup(() => controller.abort()) // 依赖变化或组件卸载时执行
})
</script>
```

---

## 五、组合式 API（Composition API）

### 5.1 setup 与 script setup

```vue
<!-- script setup 语法糖（推荐） -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 顶层的变量、函数、import 自动暴露给模板
const count = ref(0)

function increment() {
  count.value++
}

onMounted(() => {
  console.log('组件已挂载')
})
</script>

<!-- 等价的 setup() 函数写法 -->
<script lang="ts">
import { ref, onMounted, defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const count = ref(0)

    function increment() {
      count.value++
    }

    onMounted(() => {
      console.log('组件已挂载')
    })

    // 必须 return 暴露给模板的内容
    return { count, increment }
  }
})
</script>
```

### 5.2 生命周期钩子

```vue
<script setup>
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onActivated,
  onDeactivated,
  onErrorCaptured
} from 'vue'

// 组件挂载前
onBeforeMount(() => {
  console.log('DOM 还未生成')
})

// 组件挂载后（最常用：请求数据、操作 DOM）
onMounted(() => {
  console.log('DOM 已生成，可以操作 DOM 或发请求')
})

// 数据更新导致 DOM 更新前
onBeforeUpdate(() => {
  console.log('DOM 即将更新')
})

// DOM 更新完成后
onUpdated(() => {
  console.log('DOM 已更新')
})

// 组件卸载前（清理定时器、取消订阅等）
onBeforeUnmount(() => {
  console.log('即将卸载，清理资源')
})

// 组件卸载后
onUnmounted(() => {
  console.log('已卸载')
})

// KeepAlive 缓存组件被激活
onActivated(() => {
  console.log('缓存组件被激活')
})

// KeepAlive 缓存组件被停用
onDeactivated(() => {
  console.log('缓存组件被停用')
})

// 捕获后代组件的错误
onErrorCaptured((err, instance, info) => {
  console.error('捕获到错误:', err)
  return false // 返回 false 阻止错误继续向上传播
})
</script>
```

### 5.3 自定义 Hook（Composables）

```typescript
// composables/useMouse.ts
// 组合式函数命名约定以 use 开头
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }

  // 在 composable 中管理生命周期
  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  // 返回响应式状态
  return { x, y }
}
```

```typescript
// composables/useFetch.ts
import { ref, watchEffect, type Ref } from 'vue'

interface UseFetchReturn<T> {
  data: Ref<T | null>
  error: Ref<string | null>
  loading: Ref<boolean>
  refetch: () => Promise<void>
}

export function useFetch<T = any>(url: Ref<string> | string): UseFetchReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>
  const error = ref<string | null>(null)
  const loading = ref(false)

  async function fetchData() {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(typeof url === 'string' ? url : url.value)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      data.value = await response.json()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // 如果 url 是 ref，自动在 url 变化时重新请求
  if (typeof url !== 'string') {
    watchEffect(() => {
      if (url.value) fetchData()
    })
  } else {
    fetchData()
  }

  return { data, error, loading, refetch: fetchData }
}
```

```vue
<!-- 在组件中使用 composable -->
<template>
  <p>鼠标位置：{{ x }}, {{ y }}</p>
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">错误：{{ error }}</div>
  <div v-else>{{ data }}</div>
</template>

<script setup>
import { useMouse } from '@/composables/useMouse'
import { useFetch } from '@/composables/useFetch'

// 解构使用
const { x, y } = useMouse()
const { data, error, loading } = useFetch('/api/users')
</script>
```

---

## 六、Vue Router

### 6.1 安装与基本配置

```bash
npm install vue-router@4
```

```typescript
// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')  // 路由懒加载
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: { requiresAuth: false, title: '关于' }  // 路由元信息
  },
  {
    path: '/user/:id',              // 动态路由参数
    name: 'UserDetail',
    component: () => import('@/views/UserDetail.vue'),
    props: true                      // 将路由参数作为 props 传递给组件
  },
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true },
    children: [                      // 嵌套路由
      {
        path: '',                    // 默认子路由
        name: 'DashboardOverview',
        component: () => import('@/views/dashboard/Overview.vue')
      },
      {
        path: 'settings',
        name: 'DashboardSettings',
        component: () => import('@/views/dashboard/Settings.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',        // 404 页面
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),        // HTML5 History 模式
  // history: createWebHashHistory(), // Hash 模式
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 滚动行为
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

export default router
```

### 6.2 路由使用

```vue
<template>
  <nav>
    <!-- 声明式导航 -->
    <router-link to="/">首页</router-link>
    <router-link :to="{ name: 'About' }">关于</router-link>
    <router-link :to="{ name: 'UserDetail', params: { id: 1 } }">用户1</router-link>
  </nav>

  <!-- 路由出口：匹配的组件在这里渲染 -->
  <router-view />

  <!-- 带过渡动画的路由视图 -->
  <router-view v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" />
    </Transition>
  </router-view>
</template>
```

```vue
<!-- 编程式导航 -->
<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()    // 路由实例（用于跳转）
const route = useRoute()      // 当前路由信息

// 获取路由参数
console.log(route.params.id)     // 动态参数 /user/:id
console.log(route.query.page)    // 查询参数 ?page=1
console.log(route.meta.title)    // 元信息

// 跳转方式
router.push('/about')                                     // 路径
router.push({ name: 'UserDetail', params: { id: 2 } })   // 命名路由
router.push({ path: '/about', query: { page: 1 } })      // 带查询参数

router.replace('/about')    // 替换当前历史记录（不产生新记录）
router.go(-1)               // 后退
router.back()               // 后退（等同于 go(-1)）
router.forward()            // 前进
</script>
```

### 6.3 路由守卫

```typescript
// router/index.ts

// ====== 全局前置守卫 ======
router.beforeEach((to, from, next) => {
  // to：即将进入的路由
  // from：当前导航正要离开的路由
  const isAuthenticated = !!localStorage.getItem('token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    // 未登录，重定向到登录页
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next() // 放行
  }
})

// 也可以返回值代替 next()（Vue Router 4 推荐）
router.beforeEach((to) => {
  const isAuthenticated = !!localStorage.getItem('token')
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  // 不返回或返回 true 表示放行
})

// 全局后置守卫（常用于修改页面标题、发送统计）
router.afterEach((to) => {
  document.title = (to.meta.title as string) || '默认标题'
})
```

```typescript
// 路由独享守卫
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from) => {
      const userRole = getUserRole()
      if (userRole !== 'admin') {
        return { name: 'Forbidden' }
      }
    }
  }
]
```

```vue
<!-- 组件内守卫 -->
<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

// 离开当前路由前（可用于提示未保存的表单）
onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value) {
    const answer = window.confirm('有未保存的修改，确定离开吗？')
    if (!answer) return false // 取消导航
  }
})

// 路由参数变化时（如 /user/1 → /user/2）
onBeforeRouteUpdate((to) => {
  fetchUserData(to.params.id)
})
</script>
```

---

## 七、状态管理

### 7.1 Pinia 基础与进阶

```bash
npm install pinia
```

```typescript
// stores/counter.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 组合式写法（推荐，与 Composition API 风格一致）
export const useCounterStore = defineStore('counter', () => {
  // ref() → state
  const count = ref(0)
  const name = ref('计数器')

  // computed() → getters
  const doubleCount = computed(() => count.value * 2)
  const displayName = computed(() => `${name.value}: ${count.value}`)

  // function() → actions（支持异步）
  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  async function fetchCount() {
    const response = await fetch('/api/count')
    const data = await response.json()
    count.value = data.count
  }

  // $reset 需要手动实现（组合式写法）
  function $reset() {
    count.value = 0
    name.value = '计数器'
  }

  return { count, name, doubleCount, displayName, increment, decrement, fetchCount, $reset }
})
```

```typescript
// stores/user.ts - 选项式写法
import { defineStore } from 'pinia'

interface UserState {
  name: string
  token: string | null
  roles: string[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    name: '',
    token: null,
    roles: []
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.roles.includes('admin'),
    // getter 使用另一个 getter
    greeting(): string {
      return this.isLoggedIn ? `欢迎回来，${this.name}` : '请登录'
    }
  },

  actions: {
    async login(username: string, password: string) {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      })
      const data = await response.json()
      this.token = data.token
      this.name = data.name
      this.roles = data.roles
    },
    logout() {
      this.$reset()  // 选项式写法内置 $reset
    }
  }
})
```

```vue
<!-- 在组件中使用 Store -->
<template>
  <p>{{ counterStore.count }}</p>
  <p>{{ counterStore.doubleCount }}</p>
  <button @click="counterStore.increment()">+1</button>

  <p>{{ userStore.greeting }}</p>
</template>

<script setup>
import { useCounterStore } from '@/stores/counter'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const counterStore = useCounterStore()
const userStore = useUserStore()

// 解构时使用 storeToRefs 保持响应性（注意：只解构 state 和 getter）
const { count, doubleCount } = storeToRefs(counterStore)
// actions 直接解构
const { increment } = counterStore
</script>
```

### 7.2 Pinia 持久化

```bash
npm install pinia-plugin-persistedstate
```

```typescript
// main.ts
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
```

```typescript
// stores/settings.ts
export const useSettingsStore = defineStore('settings', () => {
  const theme = ref('light')
  const language = ref('zh-CN')
  return { theme, language }
}, {
  persist: {
    key: 'app-settings',       // 存储的 key
    storage: localStorage,     // 存储方式
    pick: ['theme', 'language'] // 只持久化指定字段
  }
})
```

---

## 八、进阶特性

### 8.1 Teleport 传送门

```vue
<template>
  <!-- 将内容传送到 body 下，常用于模态框、通知等 -->
  <Teleport to="body">
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>模态框标题</h2>
        <p>这个 DOM 实际挂载在 body 下</p>
        <button @click="showModal = false">关闭</button>
      </div>
    </div>
  </Teleport>

  <!-- 也可以传送到其他 CSS 选择器位置 -->
  <Teleport to="#notifications">
    <div class="toast">通知内容</div>
  </Teleport>

  <!-- disabled 属性可以动态控制是否传送 -->
  <Teleport to="body" :disabled="isMobile">
    <div class="popup">自适应弹窗</div>
  </Teleport>
</template>
```

### 8.2 Suspense 异步组件

```vue
<template>
  <Suspense>
    <!-- 异步组件加载完成后显示 -->
    <template #default>
      <AsyncComponent />
    </template>

    <!-- 加载中显示 -->
    <template #fallback>
      <div class="loading">加载中...</div>
    </template>
  </Suspense>
</template>

<script setup>
// 组件内使用顶层 await，需要配合 Suspense 使用
// AsyncComponent.vue
// <script setup>
// const data = await fetch('/api/data').then(r => r.json())
// </script>
</script>
```

### 8.3 自定义指令

```typescript
// directives/vFocus.ts
import type { Directive } from 'vue'

// 自动聚焦指令
export const vFocus: Directive = {
  mounted(el: HTMLElement) {
    el.focus()
  }
}

// 权限指令
export const vPermission: Directive<HTMLElement, string[]> = {
  mounted(el, binding) {
    const userPermissions = getUserPermissions()
    const requiredPermissions = binding.value

    const hasPermission = requiredPermissions.some(p =>
      userPermissions.includes(p)
    )

    if (!hasPermission) {
      el.parentNode?.removeChild(el)
    }
  }
}

// 防抖点击指令
export const vDebounce: Directive = {
  mounted(el, binding) {
    let timer: ReturnType<typeof setTimeout>
    const delay = binding.arg ? parseInt(binding.arg) : 300

    el.addEventListener('click', () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        binding.value()
      }, delay)
    })
  }
}
```

```vue
<template>
  <!-- 使用自定义指令 -->
  <input v-focus />
  <button v-permission="['admin', 'editor']">管理面板</button>
  <button v-debounce:500="handleSubmit">防抖提交</button>
</template>

<script setup>
import { vFocus } from '@/directives/vFocus'
import { vPermission } from '@/directives/vPermission'
import { vDebounce } from '@/directives/vDebounce'
</script>
```

### 8.4 Transition 动画

```vue
<template>
  <button @click="show = !show">切换</button>

  <!-- 单元素过渡 -->
  <Transition name="fade">
    <div v-if="show">淡入淡出的内容</div>
  </Transition>

  <!-- 列表过渡 -->
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.text }}
    </li>
  </TransitionGroup>
</template>

<script setup>
import { ref } from 'vue'
const show = ref(true)
</script>

<style>
/* Transition 动画类名 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* TransitionGroup 列表动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 移动动画 */
.list-move {
  transition: transform 0.5s ease;
}
</style>
```

### 8.5 KeepAlive 组件缓存

```vue
<template>
  <!-- 缓存所有组件 -->
  <KeepAlive>
    <component :is="currentTab" />
  </KeepAlive>

  <!-- 只缓存指定组件 -->
  <KeepAlive include="ComponentA,ComponentB">
    <component :is="currentTab" />
  </KeepAlive>

  <!-- 排除指定组件 -->
  <KeepAlive :exclude="['ComponentC']">
    <component :is="currentTab" />
  </KeepAlive>

  <!-- 最大缓存数量（LRU 策略） -->
  <KeepAlive :max="5">
    <component :is="currentTab" />
  </KeepAlive>

  <!-- 配合 router-view 使用 -->
  <router-view v-slot="{ Component }">
    <KeepAlive :include="cachedViews">
      <component :is="Component" />
    </KeepAlive>
  </router-view>
</template>
```

### 8.6 nextTick

```vue
<script setup>
import { ref, nextTick } from 'vue'

const message = ref('旧消息')
const messageEl = ref<HTMLElement>()

async function updateMessage() {
  message.value = '新消息'

  // DOM 还没更新！
  console.log(messageEl.value?.textContent) // '旧消息'

  // 等待 DOM 更新完成
  await nextTick()

  // DOM 已更新
  console.log(messageEl.value?.textContent) // '新消息'
}

// nextTick 原理：
// Vue 将 DOM 更新放在微任务队列中
// nextTick 在微任务之后执行，确保能获取到更新后的 DOM
</script>
```

### 8.7 性能优化

```vue
<template>
  <!-- v-once：只渲染一次，后续不再更新 -->
  <div v-once>{{ staticContent }}</div>

  <!-- v-memo：缓存子树，依赖变化时才重新渲染（Vue 3.2+） -->
  <div v-for="item in list" :key="item.id" v-memo="[item.selected]">
    <p>{{ item.name }}</p>
    <p>{{ item.selected ? '已选中' : '未选中' }}</p>
  </div>
</template>

<script setup>
import { defineAsyncComponent, shallowRef, markRaw } from 'vue'

// 1. 路由懒加载 / 异步组件（减小首屏体积）
const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)

// 2. shallowRef / shallowReactive（减少不必要的深层响应）
const largeData = shallowRef({ nested: { deep: 'value' } })

// 3. markRaw（标记对象永不转为响应式）
const thirdPartyLib = markRaw(someHugeObject)

// 4. 虚拟列表（处理大量列表数据）
// 推荐使用 vue-virtual-scroller 或 @tanstack/vue-virtual
</script>
```

---

## 九、TypeScript 与 Vue

### 9.1 组件类型声明

```vue
<script setup lang="ts">
import { ref, type Ref } from 'vue'

// Props 类型
interface Props {
  title: string
  count?: number
  items: Array<{ id: number; name: string }>
  callback: (id: number) => void
  status: 'active' | 'inactive'
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  status: 'active'
})

// Emit 类型
const emit = defineEmits<{
  (e: 'update', value: number): void
  (e: 'delete', id: number): void
}>()

// Expose 类型（暴露给父组件的方法/属性）
defineExpose({
  reset: () => { /* ... */ },
  validate: (): boolean => { /* ... */ return true }
})

// ref 类型推断
const count: Ref<number> = ref(0)   // 显式
const name = ref<string | null>(null) // 泛型

// 模板引用类型
const inputEl = ref<HTMLInputElement | null>(null)

// 组件实例类型
import type { ComponentPublicInstance } from 'vue'
import MyComponent from './MyComponent.vue'
const compRef = ref<InstanceType<typeof MyComponent> | null>(null)
</script>
```

---

## 十、工程化与最佳实践

### 10.1 Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')  // 路径别名
    }
  },

  server: {
    port: 3000,
    proxy: {
      // API 代理（解决开发环境跨域）
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
        // 分包策略
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus']
        }
      }
    }
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;`
      }
    }
  }
})
```

### 10.2 环境变量

```bash
# .env                 - 所有模式加载
# .env.development     - 开发模式加载
# .env.production      - 生产模式加载

# 只有 VITE_ 前缀的变量才会暴露给前端代码
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=我的应用
```

```typescript
// 使用环境变量
console.log(import.meta.env.VITE_API_BASE_URL)
console.log(import.meta.env.VITE_APP_TITLE)
console.log(import.meta.env.MODE)  // 'development' | 'production'
console.log(import.meta.env.DEV)   // boolean
console.log(import.meta.env.PROD)  // boolean

// env.d.ts - 类型声明
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 10.3 项目结构最佳实践

```
src/
├── api/                     # 接口层
│   ├── modules/             # 按模块拆分
│   │   ├── user.ts
│   │   └── product.ts
│   └── request.ts           # Axios 封装
├── assets/                  # 静态资源
│   ├── images/
│   └── styles/
│       ├── variables.scss   # 全局变量
│       └── global.scss      # 全局样式
├── components/              # 公共组件
│   ├── common/              # 通用基础组件
│   └── business/            # 业务公共组件
├── composables/             # 组合式函数
│   ├── useMouse.ts
│   └── useFetch.ts
├── directives/              # 自定义指令
├── layouts/                 # 布局组件
├── router/                  # 路由配置
│   ├── index.ts
│   └── modules/             # 路由模块
├── stores/                  # Pinia Store
├── types/                   # 类型声明
├── utils/                   # 工具函数
├── views/                   # 页面组件
├── App.vue
└── main.ts
```

---

> **总结**：本教程涵盖了 Vue.js 从基础到进阶的核心知识点。建议先掌握模板语法、组件系统和响应式原理，然后学习组合式 API 和 Vue Router，再深入状态管理和进阶特性。实际开发中，配合 TypeScript 和 Vite 能够构建高质量的现代 Web 应用。
