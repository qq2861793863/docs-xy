# 大模型系统学习：从原理到实践

本文从底层逻辑出发，依次梳理 **Transformer 与概率建模**、**训练与微调**、**Prompt / RAG / 工具调用**、**Agent 与 MCP**，并配有 **手写 RAG**、**API 与向量库**、**本地 Ollama 部署** 等可运行示例，便于系统入门与进阶。

---

## 上篇：概念与原理

### 1. 大模型在做什么：概率预测

大模型本质上是一个极其复杂的**概率预测器**：**根据上文，预测下一个 Token 出现的概率。**

- **Transformer 架构**：现代 LLM 的通用底座。通过 **Self-Attention（自注意力）**，模型在处理当前词时能关联句中其他位置，并学习哪些词对当前预测更重要。
- **预训练（Pre-training）**：在海量文本（图书、代码、网页等）上做 **自监督学习**（例如掩码预测下一个词），从而习得语言规律与常识。

> 可简写为：给定序列 \(S = \{w_1, w_2, \ldots, w_{i-1}\}\)，模型估计 \(P(w_i \mid S)\)，即下一词 \(w_i\) 的条件概率分布。

### 2. 反向传播与微调：如何变「聪明」

若把预训练比作「博览群书」，则 **反向传播** 是纠错机制，**微调** 则是面向任务的专业训练。

#### 2.1 反向传播（Backpropagation）

1. **前向传播**：输入数据，得到预测。
2. **计算损失（Loss）**：衡量预测与标签的差距。
3. **反向传播**：用 **链式法则** 将误差从输出层向输入层回传，得到各参数对损失的梯度 \(\nabla\)。
4. **优化**：按梯度更新权重，使类似样本上的误差下降。

#### 2.2 模型微调（Fine-tuning）

通用预训练模型未必符合语气、格式或领域要求。

- **SFT（有监督微调）**：用高质量「指令—回答」对训练，使模型更听话、更稳。
- **LoRA（低秩自适应）**：在不大改主体参数的前提下，仅训练少量新增矩阵（「补丁」），省显存、易迭代，是当前常用的微调手段之一。

### 3. Prompt、RAG 与 Function Calling

三者常用来缓解 **幻觉**、**知识过时** 与 **无法直连外部系统** 等问题。

| 手段 | 作用简述 |
| :--- | :------- |
| **Prompt（提示工程）** | 通过角色、结构、Few-shot 等引导输出形态与质量。 |
| **RAG（检索增强生成）** | 先从知识库 **检索** 相关片段，再 **生成** 答案，适合私域与最新信息。 |
| **Function Calling** | 模型输出结构化调用（如 JSON），由外部系统执行并回传结果，适合天气、订票等实时能力。 |

### 4. Agent、MCP 与 Skill：从对话到办事

- **Agent（智能体）**：LLM + 规划 + 记忆 + 工具。能拆解任务、调用工具并在出错时调整策略。
- **MCP（Model Context Protocol）**：模型与数据源/工具之间的 **标准化协议**（如 Anthropic 推动的生态），减少为每个产品单独对接的成本。
- **Skill（技能）**：Agent 可插拔的能力单元（如绘图、SQL、长文摘要）；在 MCP 等框架下更易复用与组合。

#### 系统学习路径（参考）

| 阶段 | 重点 | 工具/框架（示例） |
| :--- | :--- | :--- |
| **入门** | Transformer、Tokenizer、概率式生成 | Hugging Face 教程 |
| **进阶** | RAG 流程、向量数据库 | LangChain、LlamaIndex |
| **实战** | 小模型微调、Function Calling | Unsloth、Ollama、PyTorch |
| **前沿** | 多 Agent、MCP 接入 | CrewAI、AutoGen、Claude Desktop（MCP）等 |

---

## 中篇：实践示例

### 5. 手写极简 RAG 流程

RAG 的直观理解是：**先给模型可检索的「参考书」，再基于检索结果回答。**

下面用 Python 串起 **载入文档 → 向量化 → 建索引 → 检索 → 组装 Prompt**，避免过度封装，便于看清数据流。（生成步仅打印 Prompt；接入真实 LLM 时替换为 API 调用即可。）

#### 5.1 五个核心步骤

1. **载入文档（Load）**：准备知识库文本。
2. **切片与向量化（Embedding）**：文本转为稠密向量。
3. **创建索引（Index）**：向量存入可检索结构（此处用 FAISS）。
4. **检索（Retrieve）**：按问题向量取 Top-K 相关段落。
5. **生成（Generate）**：将问题与上下文一并送入 LLM。

#### 5.2 代码示例

依赖：`pip install sentence-transformers faiss-cpu`

```python
# 安装依赖: pip install sentence-transformers faiss-cpu
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# --- 第一步：准备私有知识库 ---
documents = [
    "Gemini 3 Flash 是 2026 年发布的最新高性能大模型，支持原生多模态。 ",
    "RAG 技术的全称是 Retrieval-Augmented Generation，中文叫检索增强生成。",
    "反向传播算法是神经网络训练的核心，利用链式法则计算梯度。",
    "MCP 协议（模型上下文协议）是由 Anthropic 提出的标准化数据接入方案。",
    "北京目前的自动驾驶网约车已经在多个区域实现了全无人商业化运营。"
]

# --- 第二步：向量化 (Embedding) ---
model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(documents)

# --- 第三步：构建向量索引 ---
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(np.array(embeddings))

# --- 第四步：检索 ---
def retrieve(query, top_k=2):
    query_embedding = model.encode([query])
    distances, indices = index.search(np.array(query_embedding), top_k)
    return [documents[i] for i in indices[0]]

# --- 第五步：生成（此处仅演示 Prompt；生产环境调用 LLM API）---
def generate_answer(query):
    context_list = retrieve(query)
    context = "\n".join(context_list)
    prompt = f"""
    你是一个助手。请基于以下提供的参考资料回答问题。
    如果资料中没有提到，请说不知道。

    【参考资料】：
    {context}

    【问题】：
    {query}

    【回答】：
    """
    print("--- 构造的增强 Prompt ---")
    print(prompt)
    return "（此处应返回 LLM 根据 Prompt 生成的文本）"

user_question = "2026 年发布的 Gemini 模型叫什么？"
generate_answer(user_question)
```

#### 5.3 为何重要

- **抑制幻觉**：答案被约束在检索到的片段范围内，减少凭空捏造。
- **相似度**：常见度量包括 **余弦相似度** 与 **欧氏距离**（L2）；语义相近的向量在空间中更接近。余弦相似度：\(\cos\theta = \frac{A \cdot B}{\|A\|\|B\|}\)。
- **时效性**：更新 `documents` 并重建索引即可刷新知识，无需重训大模型。

#### 5.4 工程向的常见增强

- **语义切片（Chunking）**：长文档按段落/语义块切分，而非简单按行。
- **混合检索（Hybrid Search）**：关键词检索 + 向量检索并行或融合。
- **重排（Rerank）**：先粗召回较多候选，再用交叉编码器等模型精排 Top-N。

### 6. 调用 LLM API 与大规模向量检索

#### 6.1 以 Gemini 为例的 API 调用

典型配置包括 **Temperature**（随机性）与 **System Instruction**（系统人设）。以下为示意代码，请将 API Key 置于环境变量或安全配置中，勿硬编码提交到仓库。

```python
import google.generativeai as genai
import os

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY"))

model = genai.GenerativeModel(
    model_name="gemini-3-flash",
    system_instruction="你是一位资深的后端架构师，说话简洁专业，必要时带一点冷幽默。"
)

generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
    "max_output_tokens": 1024,
}

chat = model.start_chat(history=[])
response = chat.send_message(
    "请简述为什么 2026 年 RAG 仍然比纯长上下文模型更省钱？",
    generation_config=generation_config,
)

print(f"AI 回复：\n{response.text}")
```

#### 6.2 向量数据库与 ANN

数据量较小时，`IndexFlatL2` 暴力检索可行；当规模到 **千万、亿级** 时，全量比对成本过高。Milvus、Pinecone、Weaviate 等系统普遍采用 **ANN（近似最近邻）**：以可控精度损失换取数量级加速。

| 技术 | 思路简述 |
| :--- | :------- |
| **HNSW** | 分层图结构，上层粗定位、下层细搜索，类似跳表/多级索引。 |
| **IVF** | 向量聚类成簇；查询先判簇，再在少数簇内搜索，缩小扫描范围。 |
| **PQ（乘积量化）** | 压缩向量表示，降低内存与 IO；适合超大规模部署。 |

#### 6.3 Milvus 索引配置示意

实际开发中通过索引类型与参数选用 HNSW 等算法，而非手写底层实现：

```python
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType

fields = [
    FieldSchema(name="pk", dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=768),
]
schema = CollectionSchema(fields, "我的大规模知识库")
collection = Collection("knowledge_base", schema)

index_params = {
    "metric_type": "L2",
    "index_type": "HNSW",
    "params": {"M": 16, "efConstruction": 200},
}
collection.create_index(field_name="vector", index_params=index_params)

search_params = {"metric_type": "L2", "params": {"ef": 64}}
# 查询时传入真实 query 向量，例如 model.encode([query])[0].tolist()
# results = collection.search(data=[query_vector], anns_field="vector", param=search_params, limit=5)
```

#### 6.4 分工小结

1. **向量库**：毫秒级从海量向量中取出最相关的若干条。
2. **LLM API**：基于检索结果组织自然语言回答。

---

## 下篇：本地部署（Ollama）

### 7. 为何使用本地模型

相对云端 API，本地推理（如 Llama、DeepSeek 等通过 Ollama 运行）常见优势包括：

- **无按次计费**：硬件允许即可反复实验。
- **数据不出域**：适合敏感文档与内网环境。
- **离线可用**：弱网或无网场景仍可辅助开发与阅读。

### 8. Ollama 快速上手

**安装**：从 [Ollama 官网](https://ollama.com/) 下载对应系统安装包。

**运行示例**（需足够内存/显存，机型不足可选用更小标签）：

```bash
# 自动下载并运行 DeepSeek 14B（建议 16G 内存以上）
ollama run deepseek-v2:14b
```

**常用命令**：

- `ollama list`：已下载模型列表  
- `ollama pull <name>`：仅下载  
- `ollama rm <name>`：删除以释放空间  

### 9. 用 OpenAI 兼容客户端调用本地 Ollama

Ollama 提供与 OpenAI Chat API 兼容的 HTTP 接口，便于把原有云端代码改为指向本地：

```python
# pip install openai
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",
)

response = client.chat.completions.create(
    model="deepseek-v2:14b",
    messages=[
        {"role": "system", "content": "你是一个本地运行的助手。"},
        {"role": "user", "content": "解释一下什么是量子纠缠？"},
    ],
)

print(f"本地模型回复：\n{response.choices[0].message.content}")
```

### 10. 量化（Quantization）在做什么

大模型参数量大，全精度浮点占用显存高。**量化**将权重以更低比特表示（如配合 GGUF 等格式），在轻微精度损失下显著减小体积、加快推理，使消费级显卡也能跑较大模型。

### 11. 云端 API 与本地模型对比（简表）

| 特性 | 云端 API（如 Gemini / GPT） | 本地（Ollama + 开源权重） |
| :--- | :--- | :--- |
| 能力上限 | 通常接近当前商用最强 | 取决于所选开源模型与规模 |
| 延迟 | 受网络影响 | 受本机 GPU/CPU 影响 |
| 隐私 | 数据出境/服务商策略需评估 | 数据可完全留在本地 |
| 成本 | 按量计费 | 主要为硬件一次性投入 |
| 多模态 | 云端产品通常较完善 | 依赖具体模型（如 Llava 等） |

### 12. 进阶组合建议

若需要图形化编排与知识库 UI，可将 **Ollama** 与 **Dify**、**AnythingLLM** 等工具组合，把本地模型接入拖拽式工作流或对话界面。

---

## 延伸阅读

- 在上一节 RAG 代码中接入真实 LLM（Gemini / OpenAI 兼容端点等），即可形成完整闭环。  
- 大规模场景可深入 **Milvus / Pinecone** 的索引参数调优与 **混合检索 + Rerank** 流水线。  
- 硬件方面可关注显存容量与量化档位对可运行模型规模的影响。
