# 05 实战篇：Next.js + AI SDK 6 完整项目脚手架说明

> 从零搭建可扩展的 AI Chat 项目：流式对话、结构化输出、Tool Calling、RAG 预留位

**系列导航**：[总览](./00-AI学习路线总览.md) · [入门](./01-AI应用开发入门教程.md) · [附录](./04-附录-Prompt模板库与评测用例.md) · [面试篇](./06-面试篇-AI应用开发常见题.md)

**官方参考：**

- [AI SDK 文档](https://sdk.vercel.ai/docs)
- [AI SDK 6 发布公告](https://vercel.com/blog/ai-sdk-6)
- [Next.js AI 模板](https://vercel.com/templates/next.js/nextjs-ai-chatbot)

---

## 目录

1. [项目目标与能力清单](#1-项目目标与能力清单)
2. [环境准备](#2-环境准备)
3. [目录结构](#3-目录结构)
4. [初始化步骤](#4-初始化步骤)
5. [核心代码实现](#5-核心代码实现)
6. [扩展：Tool Calling Agent](#6-扩展tool-calling-agent)
7. [扩展：结构化输出 API](#7-扩展结构化输出-api)
8. [扩展：RAG 接口预留](#8-扩展rag-接口预留)
9. [部署与生产配置](#9-部署与生产配置)
10. [常见问题](#10-常见问题)

---

## 1. 项目目标与能力清单

本脚手架 `ai-chat-starter` 提供：

| 能力 | 说明 |
|------|------|
| 流式 Chat | `useChat` + 服务端 `streamText` |
| 多模型切换 | OpenAI / DeepSeek 等 via `@ai-sdk/*` |
| 会话持久化 | 可选：localStorage 或 DB |
| Tool Calling | 查天气 / 查订单示例 |
| 结构化 API | 简历解析 → JSON |
| 安全 | API Key 仅服务端，`.env.local` |
| 评测就绪 | `prompts/` + `eval/` 目录 |

**技术栈：** Next.js 15+ · React 19 · TypeScript · Tailwind CSS · AI SDK 6

---

## 2. 环境准备

### 2.1 必需软件

```bash
node -v   # >= 20
npm -v    # >= 10
```

### 2.2 创建项目（方式 A：官方模板）

```bash
npx create-next-app@latest ai-chat-starter
# TypeScript: Yes
# App Router: Yes
# Tailwind: Yes
# src/ directory: 可选
```

### 2.3 安装 AI 依赖

```bash
cd ai-chat-starter

npm install ai @ai-sdk/react @ai-sdk/openai zod
# 若用 DeepSeek（OpenAI 兼容）
npm install @ai-sdk/openai   # 通过 baseURL 指向 DeepSeek
```

### 2.4 环境变量

```bash
# .env.local（不要提交 Git）
OPENAI_API_KEY=sk-...

# 可选：DeepSeek
# DEEPSEEK_API_KEY=sk-...
# AI_PROVIDER=deepseek
```

```gitignore
# .gitignore 确保包含
.env.local
.env*.local
```

---

## 3. 目录结构

```
ai-chat-starter/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # Chat 主页
│   ├── globals.css
│   └── api/
│       ├── chat/
│       │   └── route.ts         # 流式对话
│       ├── extract/
│       │   └── route.ts         # 结构化 JSON
│       └── agent/
│           └── route.ts         # Tool Calling（可选）
├── components/
│   ├── chat/
│   │   ├── chat-panel.tsx       # 消息列表 + 输入框
│   │   ├── message-list.tsx
│   │   └── tool-invocation.tsx  # 工具调用 UI
│   └── ui/                      # Button、Input 等
├── lib/
│   ├── ai/
│   │   ├── models.ts            # 模型/provider 配置
│   │   ├── prompts.ts           # 加载 prompt 模板
│   │   └── tools.ts             # Agent 工具定义
│   └── utils.ts
├── prompts/
│   └── system/
│       └── assistant.txt
├── eval/                        # 评测用例（见附录）
│   └── datasets/
├── .env.local
├── .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

> **说明：** AI SDK 6 也支持 Server Actions 替代 API Route。本脚手架用 **API Route**，与 `useChat` 默认集成最简单；复杂 App 可再迁到 Server Actions。

---

## 4. 初始化步骤

### 4.1 一键命令汇总

```bash
npx create-next-app@latest ai-chat-starter --typescript --tailwind --eslint --app --no-src-dir
cd ai-chat-starter
npm install ai @ai-sdk/react @ai-sdk/openai zod
mkdir -p app/api/chat app/api/extract app/api/agent
mkdir -p components/chat lib/ai prompts/system eval/datasets
cp .env.example .env.local   # 手动填入 Key
```

### 4.2 `.env.example`

```bash
OPENAI_API_KEY=
# AI_MODEL=gpt-4o-mini
# DEEPSEEK_API_KEY=
# AI_PROVIDER=openai
```

---

## 5. 核心代码实现

### 5.1 模型配置 `lib/ai/models.ts`

```typescript
import { createOpenAI } from '@ai-sdk/openai';

const provider = process.env.AI_PROVIDER ?? 'openai';

const openai = createOpenAI({
  apiKey:
    provider === 'deepseek'
      ? process.env.DEEPSEEK_API_KEY
      : process.env.OPENAI_API_KEY,
  baseURL:
    provider === 'deepseek'
      ? 'https://api.deepseek.com/v1'
      : undefined,
});

export const chatModel = openai(process.env.AI_MODEL ?? 'gpt-4o-mini');
```

---

### 5.2 Chat API `app/api/chat/route.ts`

```typescript
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { chatModel } from '@/lib/ai/models';

export const maxDuration = 60; // Vercel：允许长流式

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: chatModel,
      system: `你是简洁专业的中文助手。不确定时说不知道，不要编造。`,
      messages: await convertToModelMessages(messages),
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[chat]', error);
    return new Response(JSON.stringify({ error: '服务暂时不可用' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

---

### 5.3 Chat 页面 `app/page.tsx`

```tsx
import { ChatPanel } from '@/components/chat/chat-panel';

export default function Home() {
  return (
    <main className="mx-auto flex h-screen max-w-3xl flex-col p-4">
      <h1 className="mb-4 text-xl font-semibold">AI 助手</h1>
      <ChatPanel />
    </main>
  );
}
```

---

### 5.4 Chat 组件 `components/chat/chat-panel.tsx`

```tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export function ChatPanel() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, error } = useChat();

  const isLoading = status === 'streaming' || status === 'submitted';

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={m.role === 'user' ? 'text-right' : 'text-left'}
          >
            <span className="text-xs text-gray-500">{m.role}</span>
            <div className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
              {m.parts.map((part, i) =>
                part.type === 'text' ? <span key={i}>{part.text}</span> : null,
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <p className="text-sm text-gray-400">正在思考…</p>
        )}
        {error && (
          <p className="text-sm text-red-500">出错了，请重试</p>
        )}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim() || isLoading) return;
          sendMessage({ text: input });
          setInput('');
        }}
      >
        <input
          className="flex-1 rounded border px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息…"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          发送
        </button>
      </form>
    </div>
  );
}
```

> AI SDK 6 中 `useChat` 默认 POST 到 `/api/chat`；消息结构使用 `parts` 数组（支持 text、tool 等多类型）。

---

### 5.5 本地运行

```bash
npm run dev
# 打开 http://localhost:3000
```

---

## 6. 扩展：Tool Calling Agent

### 6.1 工具定义 `lib/ai/tools.ts`

```typescript
import { tool } from 'ai';
import { z } from 'zod';

export const weatherTool = tool({
  description: '查询指定城市当前天气',
  parameters: z.object({
    city: z.string().describe('城市名，如：上海'),
  }),
  execute: async ({ city }) => {
    // 演示：替换为真实 API
    return { city, temp: 26, condition: '多云' };
  },
});

export const getOrderTool = tool({
  description: '按订单号查询订单状态',
  parameters: z.object({
    orderId: z.string(),
  }),
  execute: async ({ orderId }) => {
    const mock: Record<string, object> = {
      '8821': { status: 'shipped', tracking: 'SF123456' },
    };
    return mock[orderId] ?? { error: '订单不存在' };
  },
});
```

### 6.2 Agent API `app/api/agent/route.ts`

```typescript
import {
  streamText,
  convertToModelMessages,
  UIMessage,
  stepCountIs,
} from 'ai';
import { chatModel } from '@/lib/ai/models';
import { weatherTool, getOrderTool } from '@/lib/ai/tools';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: chatModel,
    system: `你是业务助手，可查天气和订单。需要实时数据时必须调用工具。`,
    messages: await convertToModelMessages(messages),
    tools: {
      weather: weatherTool,
      getOrder: getOrderTool,
    },
    stopWhen: stepCountIs(5), // 最多 5 步，防死循环
  });

  return result.toUIMessageStreamResponse();
}
```

前端：`useChat({ api: '/api/agent' })`，并渲染 `tool-*` 类型 parts（见 AI SDK 6 Agent 文档）。

---

## 7. 扩展：结构化输出 API

### 7.1 简历解析 `app/api/extract/route.ts`

```typescript
import { generateObject } from 'ai';
import { z } from 'zod';
import { chatModel } from '@/lib/ai/models';

const ResumeSchema = z.object({
  name: z.string(),
  skills: z.array(z.string()),
  years: z.number(),
  level: z.enum(['junior', 'mid', 'senior']),
});

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text || typeof text !== 'string') {
    return Response.json({ error: '缺少 text' }, { status: 400 });
  }

  try {
    const { object } = await generateObject({
      model: chatModel,
      schema: ResumeSchema,
      system: '从简历文本提取结构化信息，缺失字段合理推断或留空数组。',
      prompt: text,
      temperature: 0,
    });

    return Response.json(object);
  } catch (e) {
    console.error('[extract]', e);
    return Response.json({ error: '解析失败' }, { status: 500 });
  }
}
```

### 7.2 前端调用示例

```typescript
async function parseResume(text: string) {
  const res = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('解析失败');
  return res.json();
}
```

---

## 8. 扩展：RAG 接口预留

### 8.1 检索层抽象 `lib/ai/retrieval.ts`

```typescript
export type Chunk = {
  id: string;
  text: string;
  source: string;
  score?: number;
};

/** 替换为 Qdrant / pgvector 实现 */
export async function retrieve(query: string, topK = 5): Promise<Chunk[]> {
  // TODO: embedding + vector search
  console.log('[retrieve]', query);
  return [];
}

export function formatContext(chunks: Chunk[]): string {
  return chunks
    .map((c, i) => `[${i + 1}] 来源：${c.source}\n${c.text}`)
    .join('\n\n');
}
```

### 8.2 RAG Chat Route（片段）

```typescript
import { retrieve, formatContext } from '@/lib/ai/retrieval';

// 在 streamText 前：
const lastUser = /* 从 messages 取最后一条 user 文本 */;
const chunks = await retrieve(lastUser);
const context = formatContext(chunks);

const result = streamText({
  model: chatModel,
  system: `仅根据参考资料回答，标注 [n]。资料不足时说不知道。\n\n【参考资料】\n${context}`,
  messages: await convertToModelMessages(messages),
  temperature: 0.2,
});
```

后续接入：OpenAI Embedding + Qdrant，见 [中级教程](./02-AI应用开发中级教程.md) 第 2 节。

---

## 9. 部署与生产配置

### 9.1 Vercel 部署

```bash
npm i -g vercel
vercel
```

在 Vercel Dashboard → Settings → Environment Variables 添加 `OPENAI_API_KEY`。

`next.config.ts` 一般无需特殊配置；API Route 默认 Node.js runtime。

### 9.2 生产 checklist

- [ ] `.env.local` 未提交 Git
- [ ] API Route 有 `maxDuration`（Pro 可至 300s）
- [ ] 速率限制（如 `upstash/ratelimit`）
- [ ] 错误不向前端泄露 stack trace
- [ ] 可选：Langfuse / Helicone 记录 trace

### 9.3 Docker 自建（概念）

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
```

`next.config.ts` 需 `output: 'standalone'`。

---

## 10. 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| `useChat` 无响应 | Key 未配置 / Route 404 | 检查 `.env.local` 与 `app/api/chat/route.ts` |
| 流式中断 | Vercel 超时 | 设 `maxDuration`；Pro 计划 |
| JSON 解析失败 | 模型输出非纯 JSON | 用 `generateObject` + Zod |
| CORS 错误 | 前端直连 OpenAI | Key 必须走自家 API Route |
| 工具死循环 | Agent 反复调 tool | `stopWhen: stepCountIs(N)` |
| 中文乱码 | 响应头 | `Content-Type: text/event-stream; charset=utf-8` |

---

## 附录：package.json 脚本建议

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "eval": "promptfoo eval",
    "eval:view": "promptfoo view"
  }
}
```

---

## 下一步

1. 把 `prompts/system/` 与 [附录-Prompt模板库](./04-附录-Prompt模板库与评测用例.md) 对接  
2. 接入向量库，完成 RAG  
3. 加 promptfoo 评测进 CI  
4. 阅读 [中级教程](./02-AI应用开发中级教程.md) 的 LangGraph + MCP 章节升级 Agent  

---

*文档版本：2026 · AI SDK 6 · Next.js App Router*
