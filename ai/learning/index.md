欢迎来到大模型（LLM）的深度学习之旅。既然你想系统地了解，那我们就从底层逻辑开始，像剥洋葱一样，从核心的“数学炼金术”一直聊到最前沿的“AI 代理生态”。

## 1. 大模型的大致原理：概率的艺术

大模型本质上是一个极其复杂的**概率预测器**。它的核心任务非常简单：**根据上文，预测下一个字（Token）出现的概率。**

* **Transformer 架构：** 这是所有现代 LLM 的地基。它引入了 **Self-Attention（自注意力）** 机制，让模型在处理一个词时，能“同时看到”句子中其他所有词，并判断哪些词对当前词最重要。
* **预训练（Pre-training）：** 像给 AI 喂下整个互联网的图书、代码和网页。模型在这个阶段通过**自监督学习**（自己考自己，遮住一个词猜它是啥）来掌握语言规律和世界常识。

> 其数学表达可以简化为：给定序列 $S = \{w_1, w_2, ..., w_{i-1}\}$，模型在计算 $P(w_i | S)$，即在已知前文的情况下，下一个词 $w_i$ 的条件概率分布。

## 2. 反向传播与模型微调：如何让它变聪明？

如果说预训练是“博览群书”，那么反向传播就是“纠错总结”，微调则是“专业培训”。

### 反向传播 (Backpropagation)
这是模型学习的**动力引擎**。
1.  **前向传播：** 输入数据，模型给出一个预测答案。
2.  **计算损失 (Loss)：** 比较预测答案和标准答案的差距（Loss）。
3.  **反向传播：** 利用微积分的**链式法则 (Chain Rule)**，将这个误差从输出层往回传，计算出每一个参数（权重 $w$）对误差的“贡献度”（即梯度 $\nabla$）。
4.  **优化：** 根据梯度更新参数，使得下次遇到类似问题时误差更小。

### 模型微调 (Fine-tuning)
预训练的模型虽然博学，但说话可能没礼貌或不符合特定格式。
* **SFT (有监督微调)：** 用高质量的问答对（指令-回答）训练模型，让它学会听指挥。
* **LoRA (低秩自适应)：** 2026 年主流的微调技术。它不改变模型的主体参数，而是像贴“补丁”一样只训练一小部分新增参数，既省显存又高效。

## 3. Prompt、RAG 与 Function Calling：给模型加 Buff

这三者是解决大模型“幻觉”和“知识过时”的三板斧。

* **Prompt (提示词工程)：** 沟通的艺术。通过角色设定、少样本学习 (Few-shot) 等技巧，引导模型输出更符合预期的内容。
* **RAG (检索增强生成)：** 给模型一本“参考书”。模型不再只靠记忆，而是先去私有数据库里**检索**相关信息，再结合这些信息进行**生成**。这解决了大模型不知道“你家门锁密码”或“昨天的新闻”的问题。
* **Function Calling (函数调用)：** 给模型一双“手”。当模型发现需要实时数据（如查天气、订机票）时，它不会胡编，而是输出一段特定格式的代码（如 JSON），通知外部系统去执行操作并返回结果。

## 4. Agent、MCP 与 Skill：从对话框到数字化身

这是目前 AI 发展的最高阶段，让 AI 从“聊天工具”进化为“办事员”。

### Agent (智能体)
Agent = LLM + 规划 + 记忆 + 工具使用。它不仅会说话，还能拆解复杂任务。例如：你让它“写个调研报告并自动发邮件”，它会自己搜索、汇总、排版、发邮件，遇到错误还会自我修正。

### MCP (Model Context Protocol)
这是由 Anthropic 在 2024 年底提出并在 2025-2026 年大规模普及的**模型上下文协议**。
* **痛点：** 以前每个 AI 工具都要单独写接口，很麻烦。
* **作用：** MCP 提供了一个标准化的“插座”。只要数据源（如你的 GitHub、Google Drive）和 AI 客户端都遵循 MCP，AI 就能无缝读取你的本地数据和工具，无需重复开发。

### Skill (技能)
Skill 是 Agent 能够执行的具体能力单元。
* 一个 Agent 可以拥有多个 Skill（如：Python 绘图、SQL 查询、长文本总结）。
* 在 MCP 框架下，Skill 变得可插拔、可复用。

### 系统学习建议表

| 阶段     | 重点                                  | 推荐工具/框架                         |
| :------- | :------------------------------------ | :------------------------------------ |
| **入门** | 理解 Transformer、Tokenizer、概率生成 | Hugging Face 官方教程                 |
| **进阶** | 掌握 RAG 流程、向量数据库 (Vector DB) | LangChain, LlamaIndex                 |
| **实战** | 微调小模型、编写 Function Calling     | Unsloth, Ollama, PyTorch              |
| **前沿** | 构建多 Agent 协作系统、接入 MCP 协议  | CrewAI, AutoGen, Claude Desktop (MCP) |

## 代码

实现一个 RAG（检索增强生成）系统，最直观的理解就是：**给 AI 一本它没读过的书，让它先翻书，再回答。**

为了让你看清底层逻辑，我们不使用过于封装的框架（如 LangChain 的高级 API），而是用 Python 手写一个包含**向量化、检索、提示词组装**的极简流程。

### 1. RAG 系统的五个核心步骤

1. **载入文档 (Load)**：准备你的私有知识库。
2. **切片与向量化 (Embedding)**：将文字变成计算机能懂的向量（数字列表）。
3. **创建索引 (Index)**：把向量存进一个“图书馆”。
4. **检索 (Retrieve)**：根据用户的问题，去图书馆找出最相关的段落。
5. **生成 (Generate)**：把问题和段落一起塞给大模型，让它总结答案。

------

### 2. Python 代码实现

我们将使用 `sentence-transformers` 来生成向量，用 `faiss` 做向量检索。这两个库在 2026 年依然是轻量级本地处理的标准。

Python

```
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
# 加载一个轻量级的预训练模型，将文本转为向量
model = SentenceTransformer('all-MiniLM-L6-v2') 
embeddings = model.encode(documents)

# --- 第三步：构建向量索引 (Vector Index) ---
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension) # 使用 L2 距离（欧氏距离）进行相似度匹配
index.add(np.array(embeddings))      # 将文档向量存入索引

# --- 第四步：检索函数 ---
def retrieve(query, top_k=2):
    query_embedding = model.encode([query])
    distances, indices = index.search(np.array(query_embedding), top_k)
    return [documents[i] for i in indices[0]]

# --- 第五步：生成 (模拟 LLM 调用) ---
def generate_answer(query):
    # 1. 检索相关上下文
    context_list = retrieve(query)
    context = "\n".join(context_list)
    
    # 2. 构造增强后的 Prompt
    prompt = f"""
    你是一个助手。请基于以下提供的参考资料回答问题。
    如果资料中没有提到，请说不知道。
    
    【参考资料】：
    {context}
    
    【问题】：
    {query}
    
    【回答】：
    """
    
    # 3. 这里通常调用 LLM API (如 Gemini 或 GPT)
    # 为了演示，我们打印出最终的 Prompt
    print("--- 构造的增强 Prompt ---")
    print(prompt)
    return "（此处应返回 LLM 根据 Prompt 生成的文本）"

# 测试一下
user_question = "2026 年发布的 Gemini 模型叫什么？"
generate_answer(user_question)
```

------

### 3. 为什么这个流程很重要？

- **解决幻觉**：如果没有 RAG，模型可能会乱猜 2026 年的模型名字。有了资料，它只能在提供的范围内回答。
- **数学原理**：检索的核心是**余弦相似度**或**欧氏距离**。
  - 两个向量在空间中越接近（夹角越小），代表语义越相似。
  - 公式表达：$cos(\theta) = \frac{A \cdot B}{\|A\| \|B\|}$
- **时效性**：你只需要更新 `documents` 列表并重新生成索引，模型就立刻“知道”了最新的新闻。

### 4. 2026 年的进阶技巧

在实际工业级应用中，上面的基础版还需要以下升级：

- **语义切片 (Chunking)**：如果文档太长（比如几百页的 PDF），需要按语义块切分，而不是简单的按行切。
- **多路召回 (Hybrid Search)**：结合“关键词搜索（传统数据库）”和“语义搜索（向量数据库）”。
- **重排 (Rerank)**：先粗略找 50 个相关的，再用更强力的模型给这 50 个精确排序，选前 3 个。

你想尝试**给这个系统增加一个真正的 LLM API 调用**（如 Gemini API），还是想了解**向量数据库（如 Milvus 或 Pinecone）在大规模数据下是如何工作的？**

## 示例

为了让你对“生产环境”中的大模型应用有更直观的认识，我们分别来看一下如何通过代码调用最新的 **Gemini API**，以及**向量数据库**在处理千万级甚至亿级数据时，到底在背后玩了什么“数学魔术”。

------

### 1. LLM API 调用：以 Gemini 为例

在 2026 年，调用 API 已经非常标准化。除了发送一段文字，你通常还会设置 **Temperature（随机度）** 和 **System Instruction（系统指令）**。

Python

```
import google.generativeai as genai
import os

# 1. 配置 API Key
genai.configure(api_key="YOUR_GEMINI_API_KEY")

# 2. 初始化模型 (假设使用最新的 Gemini 3 Flash)
model = genai.GenerativeModel(
    model_name="gemini-3-flash",
    system_instruction="你是一位资深的后端架构师，说话简洁专业，必要时带一点冷幽默。"
)

# 3. 设置生成参数
generation_config = {
    "temperature": 0.7,  # 越高越有创意，越低越严谨
    "top_p": 0.95,
    "max_output_tokens": 1024,
}

# 4. 发起调用
chat = model.start_chat(history=[])
response = chat.send_message(
    "请简述为什么 2026 年 RAG 仍然比纯长上下文模型更省钱？",
    generation_config=generation_config
)

print(f"AI 回复：\n{response.text}")
```

------

### 2. 向量数据库在大规模数据下是如何工作的？

当你只有几千条数据时，用上一个回复里的 `IndexFlatL2`（全量暴力搜索）没问题。但当数据达到 **1 亿条** 时，暴力搜索每一条向量的相似度会导致服务器宕机。

在大规模场景下，向量数据库（如 Milvus, Pinecone, Weaviate）核心使用了 **ANN（Approximate Nearest Neighbor，近似最近邻）** 算法。它不再追求 100% 的精确，而是用 1% 的精度损失换取 1000 倍的搜索速度。

#### 核心技术 A：HNSW (分层导航小世界图)

这是目前最流行的索引算法。它像建立一个“社交网络”：

- **顶层**：只有少数几个点，跨度很大。搜索时先在顶层快速定位到大概区域。
- **底层**：点非常密集。定位后跳到下一层，进行精细搜索。

> 这种思路非常像跳表（Skip List）或多级索引。

#### 核心技术 B：IVF (倒排文件索引)

将空间划分为很多个“簇”（Cluster）。

1. **聚类**：先把一亿个点聚成 10,000 个类别。
2. **搜索**：用户问题进来，先判断它属于哪几个类，然后只在那几个类里找。

> 搜索范围从 1 亿瞬间降到了几万。

#### 核心技术 C：PQ (乘积量化)

**这是省钱的关键。** 一个 1536 维的向量非常占内存。PQ 算法通过“压缩”技术，把一个 128 bit 的浮点数压缩成 8 bit 的编码，虽然会有损耗，但内存占用能减少 90% 以上。

------

### 3. 大规模向量库操作示例 (以 Milvus 为例)

在实际开发中，你不会手动写 HNSW 的数学实现，而是通过配置参数来告诉数据库：“我想要高性能”。

Python

```
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType

# 1. 定义 Schema（结构）
fields = [
    FieldSchema(name="pk", dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=768) # 向量维度
]
schema = CollectionSchema(fields, "我的大规模知识库")
collection = Collection("knowledge_base", schema)

# 2. 关键：创建高性能 HNSW 索引
index_params = {
    "metric_type": "L2",        # 使用欧氏距离
    "index_type": "HNSW",       # 关键：指定使用 HNSW 算法
    "params": {
        "M": 16,                # 每个节点的邻居数
        "efConstruction": 200   # 构建时的搜索深度
    }
}
collection.create_index(field_name="vector", index_params=index_params)

# 3. 搜索时的配置
search_params = {"metric_type": "L2", "params": {"ef": 64}} # ef 越高，越准但越慢
results = collection.search(
    data=[[0.1, 0.2, ...]], # 查询向量
    anns_field="vector",
    param=search_params,
    limit=5
)
```

------

### 总结：两者的配合

在现代系统中，这二者是这样分工的：

1. **向量数据库**：负责在“知识海洋”里用不到 100 毫秒的时间捞起最相关的 3-5 条数据。
2. **LLM API**：负责把这 3-5 条数据读懂，并用人类听得懂的话组织好语言发给你。

**下一步建议：**

既然你对系统学习大模型感兴趣，要不要尝试在本地部署一个 **Ollama**？这样你就可以不用花钱买 API Key，直接在自己电脑上运行模型来测试这些 Python 代码。你想了解怎么在电脑上跑起一个 Llama 3 或 DeepSeek 吗？

## 本地部署

既然你对大模型的本地部署和实战感兴趣，那我们今天就聊聊目前全球最流行的本地大模型运行框架：**Ollama**。

你可以把它理解为大模型界的“Docker”。在没有 Ollama 之前，本地跑一个模型需要配置复杂的 Python 环境、安装 CUDA 驱动、手动下载几十 GB 的模型文件。而现在，只需要一行命令。

------

### 1. 为什么 2026 年大家都在玩本地模型？

虽然 Gemini、GPT-4 很强，但本地模型（如 Llama 3、DeepSeek V3）有三个不可替代的优势：

- **零成本**：不需要 API Key，只要你的电脑配置够（尤其是显卡内存），想跑多少次就跑多少次。
- **绝对隐私**：数据不出本地，不用担心你的私有文档被上传到云端。
- **离线可用**：在没有网络的情况下，依然可以进行代码辅助、文档总结。

------

### 2. 快速上手：三步跑起你的第一个本地模型

#### 第一步：安装 Ollama

去 [Ollama 官网](https://ollama.com/) 下载对应操作系统的安装包（Windows/Mac/Linux）。

#### 第二步：运行模型 (以 DeepSeek 为例)

打开终端（Terminal 或 PowerShell），输入以下命令：

Bash

```
# 自动下载并运行 DeepSeek 14B 模型 (建议 16G 内存以上的机器)
ollama run deepseek-v2:14b
```

模型加载完成后，你就可以直接在终端里跟它聊天了。

#### 第三步：常用命令清单

- `ollama list`：查看本地已下载的模型。
- `ollama rm [model_name]`：删除模型以释放空间。
- `ollama pull [model_name]`：仅下载模型而不立即运行。

------

### 3. Python 实战：像调用 API 一样调用本地模型

在 2026 年，Ollama 已经原生兼容了 OpenAI 的 API 接口协议。这意味着你写的很多 RAG 代码，只需要**改一个 URL 地址**，就能从付费的云端 API 切换到免费的本地模型。

Python

```
# 确保你已经 pip install openai
from openai import OpenAI

# 1. 指向本地 Ollama 服务的地址
client = OpenAI(
    base_url='http://localhost:11434/v1',
    api_key='ollama', # Ollama 不需要真实的 Key，随便填
)

# 2. 发起请求
response = client.chat.completions.create(
  model="deepseek-v2:14b",
  messages=[
    {"role": "system", "content": "你是一个本地运行的助手。"},
    {"role": "user", "content": "解释一下什么是量子纠缠？"}
  ]
)

print(f"本地模型回复：\n{response.choices[0].message.content}")
```

------

### 4. 深度知识点：量化 (Quantization) —— 它是怎么跑进普通电脑的？

你可能会好奇，一个几百 GB 的模型，是怎么塞进十几 GB 的显存里的？

核心技术叫 **量化**。

- **原理**：模型参数原本是 16 位或 32 位的浮点数（很占空间）。通过量化算法（如 GGUF 格式），我们可以把它们压缩成 4 位甚至更低，就像把高清视频压缩成 720P。
- **代价**：虽然会损失一点点智力，但体积会缩小 4-8 倍，推理速度提升 10 倍以上。

------

### 5. 本地 vs 云端 API：你应该怎么选？

| **特性**     | **云端 API (Gemini/GPT)** | **本地模型 (Ollama + Llama 3)** |
| ------------ | ------------------------- | ------------------------------- |
| **智力水平** | 极高 (SOTA)               | 中高 (开源顶尖水平)             |
| **响应速度** | 取决于网络                | 取决于你的 GPU (显存越快越爽)   |
| **数据隐私** | 有风险                    | 绝对安全                        |
| **成本**     | 按量付费                  | 硬件一次性投入                  |
| **多模态**   | 支持极佳 (图片/视频)      | 部分支持 (Llava/Minicpm)        |

------

### 进阶建议

如果你想构建一个完整的系统，建议将 **Ollama** 与 **Dify** 或 **AnythingLLM** 配合使用。这些工具提供了图形化界面，让你通过拖拽就能把本地模型变成一个带 UI 的知识库。

**你想尝试在本地通过 Python 实现一个“PDF 聊天机器人”（把 RAG 和本地模型结合起来）吗？或者你对硬件配置（显存、内存）对模型运行的影响更感兴趣？**
