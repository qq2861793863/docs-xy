---
title: Vue2 + Vue3 源码核心总结（对比版）
---

本笔记聚焦 **Vue2 与 Vue3 源码“主链路”与关键抽象**：响应式、组件渲染、编译、更新调度、Diff，以及它们在架构上的差异。文末附 **源码仓库链接 + 关键文件路径**，并给出能“对上源码位置”的片段示例。

> 说明：示例代码含“节选/简化”，用于帮助你在源码中定位并理解设计意图；不同 tag/commit 之间文件名可能有轻微移动，建议优先以文末给的 tag 链接为准。

## 1. 架构总览：Vue2 vs Vue3

- **Vue2（`vuejs/vue`）**：Options API 为中心，响应式基于 `Object.defineProperty`；编译器与运行时同仓；`Watcher` + `Dep` 驱动更新；VNode & patch。
- **Vue3（`vuejs/core`）**：Monorepo（`packages/*`）；响应式基于 `Proxy` + effect；运行时（`runtime-core/runtime-dom`）与编译（`compiler-*`）解耦；渲染器可适配多平台（renderer 抽象）；更精细的编译优化（patchFlags、hoist、static tree）。

## 2. 响应式系统：核心概念与差异

### 2.1 Vue2：`Dep` / `Watcher` / `defineReactive`

- **依赖收集**：getter 触发 `dep.depend()`，把当前 `Watcher` 收集进来
- **派发更新**：setter 触发 `dep.notify()`，把相关 `Watcher` 依次 `update()`
- **局限**：数组/新增属性需要额外处理（`set/delete`、数组方法重写），深层对象递归 walk 成本高

简化示意（便于对照源码阅读）：

```js
// defineReactive(obj, key)
const dep = new Dep()
Object.defineProperty(obj, key, {
  get() {
    if (Dep.target) dep.depend()
    return val
  },
  set(newVal) {
    val = newVal
    dep.notify()
  }
})
```

### 2.2 Vue3：`track` / `trigger` / `effect` / `Proxy handlers`

- **依赖收集**：`track(target, key)`，以 `target -> key -> dep(Set<effect>)` 建图
- **派发更新**：`trigger(target, key)`，根据 key 精准触发相关 effect
- **优势**：天然支持新增/删除属性、数组索引与长度；按需懒代理；更好的组合能力（computed、watch、scope）

简化示意：

```js
const state = reactive({ count: 0 })
effect(() => {
  console.log(state.count) // 读取触发 track
})
state.count++ // 写入触发 trigger
```

## 3. 组件渲染主链路：从“数据变化”到“DOM 更新”

### 3.1 Vue2：render -> VNode -> patch（Watcher 驱动）

- **组件实例化**：初始化 data/props/computed/watch
- **渲染 Watcher**：负责执行 `vm._render()` 生成 VNode，并在 `vm._update(vnode)` 中 patch
- **更新队列**：`queueWatcher` + `nextTick` 批量刷新（避免重复渲染）

关键认知点：

- **首次渲染**：mount 时创建渲染 Watcher（`updateComponent`）
- **依赖建立**：render 过程中读取响应式数据，完成依赖收集
- **后续更新**：setter -> notify -> watcher.update -> queue -> flush -> render+patch

### 3.2 Vue3：component effect -> render -> patch（scheduler 驱动）

- **组件副作用**：组件渲染本质是一个 `effect`（或类似 runner），变更触发重新执行
- **调度器**：`queueJob`（微任务）合并多次更新
- **patch 更细粒度**：编译提供 patchFlags、dynamicChildren 让更新更“定点”

关键认知点：

- Vue3 的“更新触发”与 Vue2 类似，但 **依赖图/触发粒度** 更精确；渲染器抽象更清晰（跨平台）。

## 4. Diff 与 Patch：为何 Vue3 更快（常见原因）

- **patchFlags（编译期提示运行时）**：把“哪些地方会变”编码进 vnode，运行时跳过静态部分
- **静态提升 hoistStatic**：把静态 vnode 提升为常量，避免每次 render 重新创建
- **Block tree / dynamicChildren**：把动态节点收集成列表，diff 更聚焦

示意（概念级）：

```js
// 编译后的 vnode 可能带 patchFlag: TEXT / CLASS / STYLE 等
// runtime patch 根据 patchFlag 走“快路径”
```

## 5. 编译器：template 到 render 函数（Vue2 vs Vue3）

### 5.1 Vue2 编译链路

- `parse`：template -> AST
- `optimize`：标记静态节点
- `generate`：AST -> render 字符串代码

### 5.2 Vue3 编译链路（更模块化）

- `baseParse`：template -> AST
- `transform`：插件化 transform（静态提升、patchFlag 生成、表达式处理）
- `generate`：AST -> JS AST / codegen

Vue3 编译器关键点：

- transform 是“流水线”，每个 transform 负责一个优化/语义步骤
- 更容易支持不同 target（DOM、SSR、运行时内联等）

## 6. 更新调度：nextTick / job queue（两者都在做“批处理”）

- **Vue2**：`queueWatcher` 去重，`nextTick` flush
- **Vue3**：`queueJob` / `queuePostFlushCb` 等，统一调度 effect & 生命周期回调

你读源码时的抓手：

- 找“去重 Set/Map”
- 找“微任务 Promise.then”
- 找“flush 过程如何排序：父子组件、pre/post hooks”

## 7. 你可以按这条路线读源码（最短闭环）

- **响应式闭环**：`reactive/defineReactive` -> `track/dep` -> `trigger/notify`
- **渲染闭环**：mount -> render -> patch -> 更新调度 -> 再 render -> 再 patch
- **编译闭环**（可选）：parse -> transform -> generate（看一个优化点如何落到运行时）

---

## 8. 源码链接与“对应片段路径”（建议用固定 tag 打开）

### 8.1 Vue2（仓库：`vuejs/vue`）

- **源码仓库**：[vuejs/vue](https://github.com/vuejs/vue)
- **推荐 tag**：`v2.7.16`（最后一个 2.x LTS 版本，便于对齐阅读）

常用定位路径（相对仓库根目录）：

- **实例初始化**：`src/core/instance/index.js`
- **响应式入口/Observer**：`src/core/observer/index.js`
- **defineReactive**：`src/core/observer/index.js`
- **Dep**：`src/core/observer/dep.js`
- **Watcher**：`src/core/observer/watcher.js`
- **调度队列**：`src/core/observer/scheduler.js`
- **nextTick**：`src/core/util/next-tick.js`
- **patch/VNode**：`src/core/vdom/patch.js`、`src/core/vdom/vnode.js`
- **编译器入口**：`src/compiler/index.js`、`src/compiler/parser/index.js`、`src/compiler/codegen/index.js`

便捷直达（tag + 路径）示例（把 `<path>` 替换为上面路径）：

- `https://github.com/vuejs/vue/blob/v2.7.16/<path>`

### 8.2 Vue3（仓库：`vuejs/core`）

- **源码仓库**：[vuejs/core](https://github.com/vuejs/core)
- **推荐 tag**：`v3.5.0`（或你项目正在用的 3.x 版本）

常用定位路径（相对仓库根目录）：

- **reactive/effect**：`packages/reactivity/src/reactive.ts`、`packages/reactivity/src/effect.ts`
- **track/trigger**：通常在 `packages/reactivity/src/dep.ts`（依版本略有差异）
- **Proxy handlers**：`packages/reactivity/src/baseHandlers.ts`
- **computed**：`packages/reactivity/src/computed.ts`
- **watch**：`packages/runtime-core/src/apiWatch.ts`
- **渲染器核心**：`packages/runtime-core/src/renderer.ts`
- **组件实现**：`packages/runtime-core/src/component.ts`
- **调度器**：`packages/runtime-core/src/scheduler.ts`
- **runtime-dom**：`packages/runtime-dom/src/index.ts`
- **compiler-core**：`packages/compiler-core/src/parse.ts`、`packages/compiler-core/src/transform.ts`、`packages/compiler-core/src/codegen.ts`

便捷直达（tag + 路径）示例：

- `https://github.com/vuejs/core/blob/v3.5.0/<path>`

