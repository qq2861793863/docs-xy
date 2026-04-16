---
title: React 18 + React 19 核心源码知识点总结（对比版）
---

本笔记聚焦 **React 18 与 React 19 的核心机制**：Fiber 与调度、并发渲染、更新优先级（lanes）、commit 阶段、副作用、Hooks 运行模型、SSR/RSC 相关包的边界变化，以及 React 19 新增能力（Actions、相关 Hooks 等）的落点。文末附 **源码仓库链接 + tag + 关键文件路径**，并给出“对得上源码位置”的片段示例（节选/简化）。

> 说明：React 仓库结构在不同 tag 间会有重命名（例如带 `.new` 的文件逐步合并/迁移）。建议用文末固定 tag 直达链接阅读；若路径变化，优先在仓库内用搜索定位同名模块。

## 1. React 的“主链路”框架（18/19 都成立）

把 React 运行时理解为三段：

- **render/reconcile（可中断）**：构建/比较 Fiber 树，算出需要的变更（effects）
- **commit（不可中断）**：把变更真正落到宿主环境（DOM/Native），并执行副作用（layout/passive）
- **scheduler（调度）**：决定“什么时候做 render”、“做多久”、“是否让出主线程”

读源码时最重要的抓手：

- **Fiber**：每个组件实例对应一个 Fiber 节点（链表+树结构）
- **lanes**：更新优先级与批处理的“位图集合”，决定调度/插队策略
- **work loop**：`performUnitOfWork` 逐个处理 Fiber
- **completeWork / commitWork**：把“计算结果”变成真实 DOM 变更

## 2. React 18：并发渲染成为默认能力（createRoot）

### 2.1 createRoot 与并发渲染入口

- React 18 推荐 `createRoot`，其内部创建 Concurrent Root，render 可被中断、可恢复
- 并发不是“并行线程”，而是 **可中断渲染 + 更精细的调度**

概念示例（用户代码）：

```jsx
import { createRoot } from "react-dom/client";
createRoot(document.getElementById("app")).render(<App />);
```

源码定位（ReactDOM client 入口）：

- `packages/react-dom/src/client/ReactDOMRoot.js`

### 2.2 Automatic Batching（自动批处理）

React 18 把更多场景纳入批处理（例如 promise、setTimeout 等异步回调中）。

抓源码点：

- 批处理开关/边界通常在 ReactDOM/事件系统与 reconciler 之间的桥接层

### 2.3 Transitions（useTransition / startTransition）

- 把更新分为“紧急（urgent）”与“可延后（transition）”
- transition 更新会被赋予较低优先级 lane，从而允许输入/交互更流畅

概念示例：

```jsx
const [isPending, startTransition] = useTransition();
startTransition(() => {
  setQuery(next);
});
```

源码定位抓手：

- `packages/react-reconciler/src/ReactFiberLane*`（lanes 定义与优先级运算）
- `packages/react-reconciler/src/ReactFiberWorkLoop*`（调度与 work loop）

### 2.4 Suspense（并发语义下更稳定）

React 18 的 Suspense 与数据加载/流式 SSR 的结合更成熟：渲染遇到“未就绪”可挂起，等待后续恢复。

源码定位抓手：

- reconciler 中 Suspense 相关 fiber/tag 处理（work loop / beginWork 分支）

## 3. Fiber：组件如何被“执行”为 UI

### 3.1 beginWork / completeWork（构建与收尾）

- **beginWork**：根据 fiber.type 进入函数组件/类组件/host 组件等分支，生成子 fiber
- **completeWork**：把子树收尾，生成宿主实例（例如 DOM node）或更新 payload

源码定位抓手：

- `packages/react-reconciler/src/ReactFiberBeginWork*`
- `packages/react-reconciler/src/ReactFiberCompleteWork*`

### 3.2 commit 阶段（不可中断）

commit 典型分三类副作用：

- **mutation**：DOM 插入/删除/属性更新
- **layout**：同步执行的 layout effects（`useLayoutEffect`）
- **passive**：异步执行的 effects（`useEffect`）

源码定位抓手：

- `packages/react-reconciler/src/ReactFiberCommitWork*`
- `packages/react-reconciler/src/ReactFiberCommitEffects*`

## 4. Hooks：为什么“调用顺序”必须稳定

Hooks 的本质：**在当前 fiber 上维护一条 hook 链表**（单向链表），每次 render 以相同顺序遍历它来读写 state。

概念级简化示意：

```js
// 当前正在渲染的 fiber 上挂一串 hook 节点
// update 时按顺序复用旧 hook，生成新 hook
```

源码定位（最关键）：

- `packages/react-reconciler/src/ReactFiberHooks*`
- `packages/react/src/ReactHooks.js`（对外 hooks API 的薄封装/分发）

## 5. Scheduler 与 lanes：更新优先级如何影响体验

你要理解的最小集合：

- **lane 是一组 bit**：不同 bit 代表不同优先级/类型的更新
- **合并**：同一批 render 会处理一组 lanes
- **插队/打断**：高优 lane 可以打断低优 lane 正在进行的工作

源码定位抓手：

- `packages/react-reconciler/src/ReactFiberLane*`
- `packages/scheduler/src/forks/Scheduler*`（React 自带 scheduler 包的实现）

## 6. React 19：重点变化（与源码阅读关联最强的部分）

> React 19 的“用户可见特性”很多来自 **更完整的 Server Components 生态对接** 与 **Actions（表单/提交语义）**，并配套新增/增强一些 hooks 与内部通路。

### 6.1 Actions：把“提交”当成一等公民（与表单/服务器交互更自然）

- **Action**：把某些异步提交/更新建模为“动作”，React 可以更好地管理 pending 状态、错误与 UI 反馈
- 常见配套：`useActionState`、`useOptimistic`（以及与表单状态相关的 API）

概念示例（示意用法，框架侧如 Next/Remix 会进一步封装）：

```jsx
const [state, action, isPending] = useActionState(async (prev, formData) => {
  // 发送到 server 或做异步提交
  return { ok: true };
}, { ok: false });
```

源码定位抓手（可能随 tag 微调，优先用仓库内搜索关键字 `useActionState` / `Optimistic`）：

- `packages/react/src/ReactHooks.js`
- `packages/react-reconciler/src/ReactFiberHooks*`
- `packages/react-dom/src/*`（与表单、事件、提交相关的桥接层）

### 6.2 “use” 与 Suspense 边界（更面向 async/数据）

- `use(promise)` 让组件能够以更统一方式消费 async 结果（配合 Suspense）
- 这类能力通常与 RSC/SSR 流式渲染的边界更相关

源码定位抓手：

- `packages/react/src/ReactHooks.js`（对外 API）
- `packages/react-server-dom-webpack/src/*`（RSC 相关客户端/服务端实现）

### 6.3 Server Components（RSC）相关包边界更明确

如果你想从源码角度理解 RSC，建议从“Flight 协议”切入：

- 客户端接收 server 发来的 model（序列化的组件树/引用）
- 运行时把它还原为可渲染的元素/树，再交给 reconciler

源码定位抓手：

- `packages/react-server-dom-webpack/src/client/*`
- `packages/react-server-dom-webpack/src/server/*`
- `packages/react-client/src/*`（依版本可能存在/重组）

## 7. 推荐的源码阅读顺序（快速闭环）

- **入口**：`react-dom/client` 的 root 创建与 render
- **work loop**：找到 `performUnitOfWork` 一路看 begin/complete
- **lanes**：看一次“更新如何分配 lane、如何选择 next lanes”
- **commit**：看 DOM mutation + effects 执行顺序
- **hooks**：看 `renderWithHooks` 如何创建/复用 hook 链
- **（可选）RSC/SSR**：看 `react-server-dom-webpack` 的 client/server 各自做什么

---

## 8. 源码链接与“对应片段路径”（建议用固定 tag 打开）

### 8.1 React 源码仓库

- **源码仓库**：[facebook/react](https://github.com/facebook/react)

### 8.2 React 18（推荐 tag：`v18.2.0`）

便捷直达（tag + 路径）：

- `https://github.com/facebook/react/blob/v18.2.0/<path>`

常用定位路径（相对仓库根目录，部分文件在 tag 中带 `.new` 或无 `.new`）：

- **createRoot**：`packages/react-dom/src/client/ReactDOMRoot.js`
- **work loop**：`packages/react-reconciler/src/ReactFiberWorkLoop*`
- **lanes**：`packages/react-reconciler/src/ReactFiberLane*`
- **begin/complete**：`packages/react-reconciler/src/ReactFiberBeginWork*`、`packages/react-reconciler/src/ReactFiberCompleteWork*`
- **commit**：`packages/react-reconciler/src/ReactFiberCommitWork*`、`packages/react-reconciler/src/ReactFiberCommitEffects*`
- **hooks 实现**：`packages/react-reconciler/src/ReactFiberHooks*`
- **scheduler**：`packages/scheduler/src/forks/Scheduler*`

### 8.3 React 19（推荐 tag：`v19.0.0`）

便捷直达（tag + 路径）：

- `https://github.com/facebook/react/blob/v19.0.0/<path>`

重点定位（除了 reconciler 核心链路外）：

- **Hooks API 汇总**：`packages/react/src/ReactHooks.js`
- **Hooks 运行时实现**：`packages/react-reconciler/src/ReactFiberHooks*`
- **DOM 侧桥接（表单/事件/提交）**：`packages/react-dom/src/*`
- **RSC（Flight）**：`packages/react-server-dom-webpack/src/client/*`、`packages/react-server-dom-webpack/src/server/*`

