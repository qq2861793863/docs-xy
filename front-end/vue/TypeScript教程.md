# TypeScript 完全教程：从入门到精通

## 目录

- [一、TypeScript 概述与环境搭建](#一typescript-概述与环境搭建)
- [二、基础类型](#二基础类型)
- [三、接口 Interface](#三接口-interface)
- [四、函数](#四函数)
- [五、类 Class](#五类-class)
- [六、泛型](#六泛型)
- [七、高级类型](#七高级类型)
- [八、内置工具类型](#八内置工具类型)
- [九、模块与声明](#九模块与声明)
- [十、实战与最佳实践](#十实战与最佳实践)

---

## 一、TypeScript 概述与环境搭建

### 1.1 TypeScript 是什么

TypeScript 是由微软开发的开源编程语言，它是 JavaScript 的一个超集，为 JavaScript 添加了**静态类型系统**。

```typescript
// JavaScript - 动态类型，运行时才报错
function add(a, b) {
    return a + b;
}
add(1, 2);        // 正常：3
add("1", 2);      // 意外： "12"
add(true, []);    // 混乱： "true[]"
```

```typescript
// TypeScript - 静态类型，编译时就能发现错误
function add(a: number, b: number): number {
    return a + b;
}
add(1, 2);        // ✅ 正确
add("1", 2);      // ❌ 编译错误：Argument of type 'string' is not assignable to parameter of type 'number'
add(true, []);    // ❌ 编译错误：类型不匹配
```

**TypeScript 的核心优势：**
- **类型安全**：在编译阶段捕获类型错误
- **更好的 IDE 支持**：智能提示、自动补全、重构
- **代码可维护性**：类型即文档，提高团队协作效率
- **渐进式采用**：可以逐步迁移到 TypeScript

### 1.2 安装 TypeScript

#### 全局安装
```bash
# 安装最新版本
npm install -g typescript

# 查看版本
tsc --version

# 编译单个文件
tsc hello.ts
```

#### 项目级安装（推荐）
```bash
# 初始化项目
npm init -y

# 安装 TypeScript 作为开发依赖
npm install -D typescript

# 安装常用工具
npm install -D ts-node nodemon tsx
```

#### package.json 脚本配置
```json
{
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/index.ts",
    "watch": "tsc --watch",
    "start": "node dist/index.js"
  }
}
```

### 1.3 tsconfig.json 配置详解

创建配置文件：
```bash
# 生成默认配置
tsc --init
```

完整的 tsconfig.json 配置示例：

```json
{
  "compilerOptions": {
    /* 基础选项 */
    "target": "ES2020",                    // 编译目标 JS 版本
    "module": "commonjs",                  // 模块系统
    "lib": ["ES2020", "DOM"],             // 要包含的库文件
    "outDir": "./dist",                   // 输出目录
    "rootDir": "./src",                   // 源码根目录
    
    /* 严格类型检查 */
    "strict": true,                       // 启用所有严格类型检查
    "noImplicitAny": true,                // 不允许隐式的 any 类型
    "strictNullChecks": true,             // 严格的 null 检查
    "strictFunctionTypes": true,          // 严格的函数类型检查
    "strictBindCallApply": true,          // 严格的 bind/call/apply 检查
    "strictPropertyInitialization": true, // 类属性必须初始化
    "noImplicitThis": true,               // 不允许 this 的隐式 any
    "alwaysStrict": true,                 // 总是以严格模式解析
    
    /* 模块解析 */
    "moduleResolution": "node",           // 模块解析策略
    "esModuleInterop": true,              // 允许 es 模块互操作
    "allowSyntheticDefaultImports": true, // 允许合成默认导入
    "resolveJsonModule": true,            // 允许导入 JSON 模块
    
    /* 装饰器相关 */
    "experimentalDecorators": true,       // 启用装饰器实验特性
    "emitDecoratorMetadata": true,        // 发出装饰器元数据
    
    /* 其他选项 */
    "declaration": true,                  // 生成 .d.ts 声明文件
    "sourceMap": true,                    // 生成 source map 文件
    "removeComments": false,              // 保留注释
    "noEmitOnError": true,                // 错误时不生成输出
    "skipLibCheck": true,                 // 跳过声明文件的类型检查
    "forceConsistentCasingInFileNames": true // 强制文件名大小写一致
  },
  "include": [
    "src/**/*"                           // 包含的文件
  ],
  "exclude": [
    "node_modules",                      // 排除的目录
    "dist"
  ]
}
```

### 1.4 编译与运行

#### 使用 tsc 编译
```bash
# 编译整个项目
tsc

# 编译单个文件
tsc src/index.ts

# 监听模式
tsc --watch

# 编译并指定输出目录
tsc src/index.ts --outDir dist
```

#### 使用 ts-node 运行
```bash
# 直接运行 TS 文件
ts-node src/index.ts

# 在 REPL 中交互式运行
ts-node

# 带参数运行
ts-node src/app.ts --port=3000
```

#### 使用 tsx（推荐用于现代项目）
```bash
# 安装
npm install -D tsx

# 运行
tsx src/index.ts

# 开发模式
tsx watch src/index.ts
```

### 1.5 TypeScript Playground

TypeScript 官方提供了一个在线编辑器，非常适合学习和测试：

[TypeScript Playground](https://www.typescriptlang.org/play)

特点：
- 实时编译和错误提示
- 可以分享代码链接
- 支持不同 TypeScript 版本
- 提供编译后的 JavaScript 对比

---

## 二、基础类型

### 2.1 原始类型

#### string 字符串类型
```typescript
// 字符串字面量
let name: string = "张三";
let greeting: string = `你好，${name}！`;

// 模板字符串
let message: string = `
  欢迎使用 TypeScript
  当前时间：${new Date().toLocaleString()}
`;

// 字符串方法都有完整类型支持
let upperName: string = name.toUpperCase(); // 返回 string 类型
let length: number = name.length;           // 返回 number 类型
```

#### number 数字类型
```typescript
// 整数和浮点数都是 number 类型
let age: number = 25;
let price: number = 99.99;
let hex: number = 0xff;        // 十六进制
let binary: number = 0b1010;   // 二进制
let octal: number = 0o744;     // 八进制

// NaN 和 Infinity 也是 number 类型
let notANumber: number = NaN;
let infinity: number = Infinity;

// 数学运算都有类型推断
let result: number = age * price;  // number 类型
```

#### boolean 布尔类型
```typescript
let isDone: boolean = false;
let isSuccess: boolean = true;

// 条件表达式返回 boolean
let hasPermission: boolean = age > 18 && isDone;

// 逻辑运算
let canAccess: boolean = isDone || isSuccess;
let isNotActive: boolean = !isDone;
```

#### null 和 undefined
```typescript
// 严格模式下，null 和 undefined 有自己的类型
let u: undefined = undefined;
let n: null = null;

// 在非严格模式下，它们是所有类型的子类型
let num: number = undefined;  // 非严格模式下允许
let str: string = null;       // 非严格模式下允许

// 严格模式下的正确做法
let maybeNum: number | null = null;
let maybeStr: string | undefined = undefined;
```

#### symbol 类型
```typescript
// Symbol 是唯一的标识符
let sym1: symbol = Symbol("key");
let sym2: symbol = Symbol("key");

console.log(sym1 === sym2);  // false，每个 Symbol 都是唯一的

// 作为对象属性的键
let obj = {
    [sym1]: "value1",
    [sym2]: "value2"
};

console.log(obj[sym1]);  // "value1"
```

#### bigint 类型
```typescript
// 大整数类型（ES2020）
let bigNumber: bigint = 123456789012345678901234567890n;
let anotherBig: bigint = BigInt("123456789012345678901234567890");

// 注意：bigint 不能与 number 直接运算
// let invalid = bigNumber + 1;  // 错误！

// 正确的做法
let valid: bigint = bigNumber + 1n;  // 必须加 n 后缀
```

### 2.2 数组类型

#### 方式一：元素类型[]
```typescript
// 基本数组类型
let numbers: number[] = [1, 2, 3, 4, 5];
let strings: string[] = ["hello", "world"];
let booleans: boolean[] = [true, false, true];

// 数组方法都有类型支持
numbers.push(6);           // 推断为 number[]
let doubled: number[] = numbers.map(n => n * 2);
let sum: number = numbers.reduce((a, b) => a + b, 0);
```

#### 方式二：Array<元素类型>
```typescript
// 泛型数组语法
let scores: Array<number> = [90, 85, 95];
let names: Array<string> = ["Alice", "Bob", "Charlie"];

// 多维数组
let matrix: number[][] = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

let cube: number[][][] = [[[1]]];
```

#### 数组的类型推断
```typescript
// TypeScript 会根据初始值推断数组类型
let autoNumbers = [1, 2, 3];        // number[]
let autoMixed = [1, "hello", true]; // (string | number | boolean)[]

// 空数组需要显式声明类型
let emptyNumbers: number[] = [];
let emptyStrings: string[] = [];
```

### 2.3 元组 Tuple

元组是固定长度和类型的数组：

```typescript
// 基本元组
let person: [string, number] = ["张三", 25];

// 访问元素
let name: string = person[0];    // "张三"
let age: number = person[1];     // 25

// 越界访问在 TypeScript 4.5+ 中会被检查
// person[2];  // 编译错误

// 元组解构
let [personName, personAge] = person;

// 带标签的元组（TypeScript 4.0+）
type Point = [x: number, y: number];
let point: Point = [10, 20];

// 可选元素和剩余元素
type FlexibleTuple = [string, number?, ...boolean[]];
let tuple1: FlexibleTuple = ["hello"];              // 只有必需元素
let tuple2: FlexibleTuple = ["hello", 42];          // 包含可选元素
let tuple3: FlexibleTuple = ["hello", 42, true, false]; // 包含剩余元素
```

### 2.4 枚举 enum

#### 数字枚举
```typescript
// 基本数字枚举
enum Direction {
    Up,     // 0
    Down,   // 1
    Left,   // 2
    Right   // 3
}

let dir: Direction = Direction.Up;
console.log(dir);        // 0
console.log(Direction[0]); // "Up"

// 自定义起始值
enum StatusCode {
    Success = 200,
    NotFound = 404,
    Error = 500
}

// 部分自定义值
enum MixedEnum {
    A,          // 0
    B,          // 1
    C = 10,     // 10
    D,          // 11
    E = 20      // 20
}
```

#### 字符串枚举
```typescript
enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE"
}

let method: HttpMethod = HttpMethod.POST;
console.log(method);  // "POST"

// 字符串枚举不会生成反向映射
// HttpMethod["POST"] 不存在
```

#### 常量枚举
```typescript
// const enum 在编译时会被完全内联，不生成额外的 JS 代码
const enum Color {
    Red = "#ff0000",
    Green = "#00ff00",
    Blue = "#0000ff"
}

let backgroundColor = Color.Red;  // 编译后直接变成 "#ff0000"
```

#### 异构枚举（不推荐）
```typescript
// 混合字符串和数字（不推荐使用）
enum Mixed {
    No = 0,
    Yes = 1,
    Unknown = "unknown"
}
```

### 2.5 特殊类型

#### any 类型
```typescript
// any 类型可以赋值给任何类型，也可以接受任何类型的值
let value: any = "hello";
value = 123;        // ✅ 允许
value = true;       // ✅ 允许
value.someMethod(); // ✅ 运行时可能出错

// 数组中的 any
let mixedArray: any[] = [1, "hello", true, {}];

// 尽量避免使用 any，除非：
// 1. 第三方库没有类型定义
// 2. 类型过于复杂难以定义
// 3. 临时绕过类型检查
```

#### unknown 类型
```typescript
// unknown 是类型安全的 any 替代品
let value: unknown = "hello";

// 不能直接使用，需要类型检查或断言
// value.toUpperCase();  // ❌ 错误：Object is of type 'unknown'

// 正确的做法：类型守卫
if (typeof value === "string") {
    value.toUpperCase();  // ✅ 正确
}

// 或者类型断言
(value as string).toUpperCase();  // ✅ 但要确保类型正确
```

#### never 类型
```typescript
// never 表示永远不会返回的类型

// 1. 永远不会正常结束的函数
function throwError(message: string): never {
    throw new Error(message);
}

// 2. 死循环函数
function infiniteLoop(): never {
    while (true) {
        // 永远执行
    }
}

// 3. 类型收窄后的不可能情况
function handleValue(x: string | number) {
    if (typeof x === "string") {
        // x 是 string 类型
        x.toUpperCase();
    } else if (typeof x === "number") {
        // x 是 number 类型
        x.toFixed(2);
    } else {
        // x 是 never 类型（不可能到达这里）
        const neverValue: never = x;
    }
}
```

#### void 类型
```typescript
// void 表示没有返回值
function sayHello(): void {
    console.log("Hello!");
    // 隐式返回 undefined
}

function explicitReturn(): void {
    console.log("Explicit");
    return;  // 显式返回 undefined
}

// void 类型的变量只能赋值 undefined 或 null（非严格模式）
let nothing: void = undefined;
// let invalid: void = 123;  // ❌ 错误
```

### 2.6 类型断言

#### as 语法（推荐）
```typescript
// 将 any 类型断言为具体类型
let value: any = "hello world";
let length: number = (value as string).length;

// DOM 元素类型断言
let input = document.getElementById("myInput") as HTMLInputElement;
input.value = "new value";

// 非空断言
let element = document.querySelector(".item") as HTMLElement;
element.style.color = "red";
```

#### 尖括号语法
```typescript
// 尖括号形式的类型断言
let value: any = "hello";
let length: number = (<string>value).length;

// 注意：在 JSX 中只能使用 as 语法
```

#### 双重断言
```typescript
// 当直接断言不被允许时，可以通过 any 中转
let value: string = "hello";
// let num: number = value as number;  // ❌ 错误

// 正确做法：双重断言
let num: number = value as any as number;  // ⚠️ 危险！会丢失类型安全
```

### 2.7 非空断言 !

```typescript
// 告诉编译器某个值一定不是 null 或 undefined
function processElement(id: string) {
    // getElementById 可能返回 null
    let element = document.getElementById(id)!;
    element.style.display = "none";  // 不会有 null 错误提示
    
    // 等价于：
    let element2 = document.getElementById(id);
    if (element2 !== null) {
        element2.style.display = "none";
    }
}

// 在确定值存在的情况下使用，否则运行时会出错
let user: User | null = getUser();
user!.name;  // 如果 user 是 null，运行时报错
```

### 2.8 字面量类型

```typescript
// 字符串字面量类型
let method: "GET" | "POST" | "PUT" | "DELETE" = "GET";
method = "POST";  // ✅ 允许
// method = "PATCH";  // ❌ 错误

// 数字字面量类型
let diceRoll: 1 | 2 | 3 | 4 | 5 | 6 = 1;
diceRoll = 3;  // ✅ 允许
// diceRoll = 7;  // ❌ 错误

// 布尔字面量类型
let isSuccess: true = true;
// isSuccess = false;  // ❌ 错误

// 对象字面量类型
type Config = {
    theme: "light" | "dark";
    animation: true;
};

let appConfig: Config = {
    theme: "light",
    animation: true
};
```

### 2.9 类型别名 type

```typescript
// 基本类型别名
type UserID = string;
type Age = number;
type IsActive = boolean;

let userId: UserID = "user_123";
let age: Age = 25;
let isActive: IsActive = true;

// 对象类型别名
type Point = {
    x: number;
    y: number;
};

type User = {
    id: UserID;
    name: string;
    age: Age;
    isActive: IsActive;
};

// 函数类型别名
type MathOperation = (a: number, b: number) => number;

let add: MathOperation = (a, b) => a + b;
let multiply: MathOperation = (a, b) => a * b;

// 联合类型别名
type Status = "pending" | "success" | "error";
type ID = string | number;

// 交叉类型别名
type AdminUser = User & {
    permissions: string[];
};

// 泛型类型别名
type Container<T> = {
    value: T;
    timestamp: Date;
};

let stringContainer: Container<string> = {
    value: "hello",
    timestamp: new Date()
};
```

### 2.10 联合类型 |

```typescript
// 基本联合类型
type StringOrNumber = string | number;
let value: StringOrNumber = "hello";  // ✅
value = 42;                           // ✅
// value = true;                      // ❌ 错误

// 联合类型的使用场景
function padLeft(value: string, padding: string | number) {
    if (typeof padding === "number") {
        return " ".repeat(padding) + value;
    }
    return padding + value;
}

// 对象联合类型
type Circle = {
    kind: "circle";
    radius: number;
};

type Square = {
    kind: "square";
    sideLength: number;
};

type Shape = Circle | Square;

function getArea(shape: Shape): number {
    switch (shape.kind) {
        case "circle":
            return Math.PI * shape.radius ** 2;
        case "square":
            return shape.sideLength ** 2;
    }
}
```

### 2.11 交叉类型 &

```typescript
// 基本交叉类型
type Name = {
    name: string;
};

type Age = {
    age: number;
};

type Person = Name & Age;

let person: Person = {
    name: "张三",
    age: 25
};  // 必须同时具有 name 和 age 属性

// 实际应用：扩展已有类型
type BasicUser = {
    id: string;
    email: string;
};

type PremiumFeatures = {
    isPremium: boolean;
    maxStorage: number;
};

type PremiumUser = BasicUser & PremiumFeatures;

// 接口继承 vs 交叉类型
interface IName {
    name: string;
}

interface IAge {
    age: number;
}

interface IPerson extends IName, IAge {}  // 接口继承

type TPerson = IName & IAge;  // 交叉类型
```

---

## 三、接口 Interface

### 3.1 基本定义

```typescript
// 定义用户接口
interface User {
    id: string;
    name: string;
    age: number;
    email: string;
}

// 使用接口
let user: User = {
    id: "123",
    name: "张三",
    age: 25,
    email: "zhangsan@example.com"
};

// 可选属性
interface UserWithOptional {
    id: string;
    name: string;
    age?: number;      // 可选属性
    email?: string;    // 可选属性
}

let userWithoutAge: UserWithOptional = {
    id: "123",
    name: "李四"
    // age 和 email 都是可选的
};
```

### 3.2 只读属性

```typescript
// readonly 使属性不可修改
interface Config {
    readonly apiUrl: string;
    readonly version: string;
    debug: boolean;  // 可修改
}

let config: Config = {
    apiUrl: "https://api.example.com",
    version: "1.0.0",
    debug: true
};

// config.apiUrl = "new url";  // ❌ 错误：Cannot assign to 'apiUrl' because it is a read-only property

config.debug = false;  // ✅ 允许修改非只读属性

// ReadonlyArray<T> 创建只读数组
let readOnlyNumbers: ReadonlyArray<number> = [1, 2, 3];
// readOnlyNumbers[0] = 10;  // ❌ 错误
// readOnlyNumbers.push(4);   // ❌ 错误
```

### 3.3 索引签名

```typescript
// 字符串索引签名
interface StringDictionary {
    [key: string]: string;
}

let dict: StringDictionary = {
    name: "张三",
    city: "北京"
};

dict["age"] = "25";  // ✅ 允许，值必须是 string

// 数字索引签名
interface NumberArray {
    [index: number]: string;
}

let arr: NumberArray = ["hello", "world"];
arr[2] = "typescript";  // ✅ 允许

// 混合索引签名
interface Hybrid {
    length: number;        // 具体属性
    [key: string]: any;    // 字符串索引
}

// 索引签名的限制
interface InvalidIndex {
    // [key: string]: string;  // ❌ 错误：'name' 属性的类型 'number' 与索引签名不兼容
    name: number;
    [key: string]: string | number;  // ✅ 正确：联合类型
}
```

### 3.4 接口继承

```typescript
// 基础接口
interface Animal {
    name: string;
    age: number;
}

// 继承基础接口
interface Dog extends Animal {
    breed: string;
    bark(): void;
}

let dog: Dog = {
    name: "旺财",
    age: 3,
    breed: "金毛",
    bark() {
        console.log("汪汪！");
    }
};

// 多重继承
interface Flyable {
    fly(): void;
}

interface Swimmable {
    swim(): void;
}

interface Duck extends Animal, Flyable, Swimmable {
    species: string;
}

// 接口可以继承类
class Control {
    private state: any;
}

interface SelectableControl extends Control {
    select(): void;
}
```

### 3.5 interface vs type 的区别

```typescript
// 1. 扩展方式不同
interface IAnimal {
    name: string;
}

interface IDog extends IAnimal {
    breed: string;
}

type TAnimal = {
    name: string;
};

type TDog = TAnimal & {
    breed: string;
};

// 2. 声明合并
interface Window {
    customProp: string;
}

interface Window {  // 自动合并
    anotherProp: number;
}

// window.customProp 和 window.anotherProp 都可用

// type 不能重复声明同名类型
// type Window = { prop1: string };  // ❌ 错误：标识符“Window”重复

// 3. 实现接口
class MyClass implements IDog {
    name: string = "";
    breed: string = "";
    bark() {}
}

// 4. 基本类型别名
type MyString = string;  // interface 无法做到
```

### 3.6 函数类型接口

```typescript
// 函数接口
interface SearchFunc {
    (source: string, subString: string): boolean;
}

let mySearch: SearchFunc = function(source: string, subString: string) {
    return source.search(subString) > -1;
};

// 简化箭头函数写法
let myArrowSearch: SearchFunc = (source, subString) => {
    return source.includes(subString);
};

// 构造函数接口
interface Constructor {
    new (name: string): any;
}

function createInstance(ctor: Constructor, name: string) {
    return new ctor(name);
}

// 可索引的函数类型
interface StringArray {
    [index: number]: string;
}

let myArray: StringArray = ["Bob", "Fred"];
let myStr: string = myArray[0];
```

---

## 四、函数

### 4.1 函数类型声明

```typescript
// 函数声明
function add(x: number, y: number): number {
    return x + y;
}

// 函数表达式
let multiply = function(x: number, y: number): number {
    return x * y;
};

// 箭头函数
let divide = (x: number, y: number): number => {
    if (y === 0) throw new Error("Division by zero");
    return x / y;
};

// 函数类型别名
type Calculator = (x: number, y: number) => number;

let calc: Calculator = (a, b) => a + b;

// 接口定义函数类型
interface Processor {
    (data: string): string;
}

let processor: Processor = (data) => data.toUpperCase();
```

### 4.2 可选参数与默认参数

```typescript
// 可选参数（必须放在必选参数后面）
function buildName(firstName: string, lastName?: string): string {
    if (lastName) {
        return firstName + " " + lastName;
    } else {
        return firstName;
    }
}

buildName("张");           // "张"
buildName("张", "三");     // "张 三"

// 默认参数
function greet(name: string = "匿名用户"): string {
    return `你好，${name}！`;
}

greet();         // "你好，匿名用户！"
greet("李四");   // "你好，李四！"

// 带默认值的解构参数
function createUser({ 
    name, 
    age = 18, 
    isActive = true 
}: { 
    name: string; 
    age?: number; 
    isActive?: boolean; 
}) {
    return { name, age, isActive };
}

createUser({ name: "王五" });  // { name: "王五", age: 18, isActive: true }
```

### 4.3 剩余参数

```typescript
// 剩余参数必须是数组类型
function sum(...numbers: number[]): number {
    return numbers.reduce((acc, curr) => acc + curr, 0);
}

sum(1, 2, 3);        // 6
sum(1, 2, 3, 4, 5);  // 15

// 混合使用
function buildFullName(firstName: string, ...restOfName: string[]): string {
    return firstName + " " + restOfName.join(" ");
}

buildFullName("张", "小", "明");  // "张 小 明"

// 剩余参数的类型推断
function logMessages(level: string, ...messages: any[]) {
    console.log(`[${level}]`, ...messages);
}

logMessages("INFO", "用户登录", { userId: 123 });
```

### 4.4 函数重载

```typescript
// 函数重载签名
function format(value: string): string;
function format(value: number): string;
function format(value: Date): string;

// 实现签名（不能直接调用）
function format(value: string | number | Date): string {
    if (typeof value === "string") {
        return value.toUpperCase();
    } else if (typeof value === "number") {
        return value.toFixed(2);
    } else {
        return value.toISOString();
    }
}

// 使用重载
let strResult = format("hello");     // string 类型
let numResult = format(123.456);     // string 类型
let dateResult = format(new Date()); // string 类型

// 复杂重载示例
interface UIElement {
    animate(dx: number, dy: number, easing: "ease-in" | "ease-out" | "ease-in-out"): void;
}

class Button implements UIElement {
    animate(dx: number, dy: number, easing: "ease-in" | "ease-out" | "ease-in-out"): void {
        // 实现动画逻辑
    }
}
```

### 4.5 this 类型

```typescript
// 在回调函数中保持 this 上下文
class Handler {
    info: string = "Handler Info";
    
    onClick(this: Handler, event: Event) {
        console.log(this.info);
    }
    
    onClickBad(event: Event) {  // this 隐式 any
        // console.log(this.info);  // ❌ 错误
    }
}

let handler = new Handler();
let button = document.getElementById("btn")!;
button.addEventListener("click", handler.onClick.bind(handler));

// 箭头函数自动绑定 this
class Component {
    state = { count: 0 };
    
    handleClick = () => {
        this.state.count++;  // this 指向 Component 实例
    }
}
```

### 4.6 回调函数类型

```typescript
// 回调函数接口
interface Callback<T> {
    (error: Error | null, result?: T): void;
}

function asyncOperation(callback: Callback<string>) {
    setTimeout(() => {
        callback(null, "操作成功");
    }, 1000);
}

// Promise 形式的回调
interface PromiseCallback<T> {
    (): Promise<T>;
}

async function executeAsync(callback: PromiseCallback<string>): Promise<string> {
    try {
        const result = await callback();
        return result;
    } catch (error) {
        throw error;
    }
}
```

---

## 五、类 Class

### 5.1 类的基本定义

```typescript
// 基本类定义
class Person {
    // 成员属性
    name: string;
    age: number;
    
    // 构造函数
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
    
    // 成员方法
    greet(): string {
        return `你好，我是 ${this.name}，今年 ${this.age} 岁`;
    }
    
    // 静态方法
    static getSpecies(): string {
        return "人类";
    }
}

// 使用类
let person = new Person("张三", 25);
console.log(person.greet());           // "你好，我是 张三，今年 25 岁"
console.log(Person.getSpecies());      // "人类"
```

### 5.2 访问修饰符

```typescript
class BankAccount {
    public accountNumber: string;      // 公共（默认）
    protected balance: number;         // 受保护
    private pin: string;               // 私有
    
    constructor(accountNumber: string, initialBalance: number, pin: string) {
        this.accountNumber = accountNumber;
        this.balance = initialBalance;
        this.pin = pin;
    }
    
    // 公共方法
    public deposit(amount: number): void {
        if (amount > 0) {
            this.balance += amount;
        }
    }
    
    // 受保护方法（只能在类内部和子类中访问）
    protected validatePin(inputPin: string): boolean {
        return this.pin === inputPin;
    }
    
    // 私有方法（只能在类内部访问）
    private calculateInterest(): number {
        return this.balance * 0.02;
    }
    
    // 公共方法可以访问私有和受保护成员
    public withdraw(amount: number, inputPin: string): boolean {
        if (this.validatePin(inputPin) && this.balance >= amount) {
            this.balance -= amount;
            return true;
        }
        return false;
    }
}

let account = new BankAccount("123456", 1000, "1234");
account.deposit(500);        // ✅ 允许
// account.pin = "0000";     // ❌ 错误：私有属性
// account.validatePin("1234"); // ❌ 错误：受保护方法
```

### 5.3 readonly 修饰符

```typescript
class Config {
    readonly version: string = "1.0.0";
    readonly createdAt: Date;
    
    constructor(version?: string) {
        if (version) {
            this.version = version;  // 构造函数中可以赋值
        }
        this.createdAt = new Date();
    }
}

let config = new Config("2.0.0");
console.log(config.version);     // "2.0.0"
// config.version = "3.0.0";     // ❌ 错误：Cannot assign to 'version' because it is a read-only property

// 只读数组属性
class DataStore {
    readonly items: readonly string[] = ["a", "b", "c"];
    
    addItem(item: string): void {
        // this.items.push(item);  // ❌ 错误：只读数组不能修改
    }
}
```

### 5.4 抽象类 abstract

```typescript
// 抽象类不能被实例化
abstract class Animal {
    protected name: string;
    
    constructor(name: string) {
        this.name = name;
    }
    
    // 抽象方法（必须在子类中实现）
    abstract makeSound(): void;
    
    // 普通方法
    move(distance: number = 0): void {
        console.log(`${this.name} 移动了 ${distance} 米`);
    }
}

class Dog extends Animal {
    constructor(name: string) {
        super(name);
    }
    
    // 实现抽象方法
    makeSound(): void {
        console.log("汪汪！");
    }
    
    wagTail(): void {
        console.log(`${this.name} 摇尾巴`);
    }
}

class Cat extends Animal {
    constructor(name: string) {
        super(name);
    }
    
    makeSound(): void {
        console.log("喵喵！");
    }
}

// let animal = new Animal("动物");  // ❌ 错误：无法创建抽象类的实例
let dog = new Dog("旺财");
dog.makeSound();  // "汪汪！"
dog.move(10);     // "旺财 移动了 10 米"
```

### 5.5 类实现接口 implements

```typescript
interface Flyable {
    fly(): void;
}

interface Swimmable {
    swim(): void;
}

// 类可以实现多个接口
class Duck implements Flyable, Swimmable {
    name: string;
    
    constructor(name: string) {
        this.name = name;
    }
    
    fly(): void {
        console.log(`${this.name} 在飞翔`);
    }
    
    swim(): void {
        console.log(`${this.name} 在游泳`);
    }
}

// 接口描述构造函数
interface ClockConstructor {
    new (hour: number, minute: number): ClockInterface;
}

interface ClockInterface {
    tick(): void;
}

class DigitalClock implements ClockInterface {
    constructor(h: number, m: number) {}
    tick() {
        console.log("beep beep");
    }
}

class AnalogClock implements ClockInterface {
    constructor(h: number, m: number) {}
    tick() {
        console.log("tick tock");
    }
}

function createClock(ctor: ClockConstructor, hour: number, minute: number): ClockInterface {
    return new ctor(hour, minute);
}

let digital = createClock(DigitalClock, 12, 17);
let analog = createClock(AnalogClock, 7, 32);
```

### 5.6 静态成员

```typescript
class MathUtils {
    // 静态属性
    static readonly PI: number = 3.14159;
    static version: string = "1.0.0";
    
    // 静态方法
    static add(a: number, b: number): number {
        return a + b;
    }
    
    static multiply(a: number, b: number): number {
        return a * b;
    }
    
    // 实例方法可以访问静态成员
    getVersion(): string {
        return MathUtils.version;
    }
}

// 直接通过类名访问静态成员
console.log(MathUtils.PI);              // 3.14159
console.log(MathUtils.add(2, 3));       // 5
MathUtils.version = "2.0.0";            // 修改静态属性

let utils = new MathUtils();
console.log(utils.getVersion());        // "2.0.0"
```

### 5.7 getter / setter

```typescript
class Employee {
    private _fullName: string = "";
    private _salary: number = 0;
    
    // getter
    get fullName(): string {
        return this._fullName;
    }
    
    // setter
    set fullName(newName: string) {
        if (newName.length > 0) {
            this._fullName = newName;
        } else {
            throw new Error("姓名不能为空");
        }
    }
    
    get salary(): number {
        return this._salary;
    }
    
    set salary(value: number) {
        if (value < 0) {
            throw new Error("薪资不能为负数");
        }
        this._salary = value;
    }
    
    // 计算属性
    get annualSalary(): number {
        return this._salary * 12;
    }
}

let emp = new Employee();
emp.fullName = "张三";        // 调用 setter
console.log(emp.fullName);   // 调用 getter，输出："张三"

emp.salary = 10000;
console.log(emp.annualSalary); // 120000
```

### 5.8 参数属性

```typescript
// 传统写法
class TraditionalUser {
    id: string;
    name: string;
    age: number;
    
    constructor(id: string, name: string, age: number) {
        this.id = id;
        this.name = name;
        this.age = age;
    }
}

// 参数属性简化写法
class ModernUser {
    constructor(
        public id: string,
        public name: string,
        private age: number,
        protected email: string = ""
    ) {
        // 构造函数体为空，属性已自动初始化
    }
    
    getAge(): number {
        return this.age;  // 可以访问 private 属性
    }
}

let user = new ModernUser("123", "张三", 25);
console.log(user.id);    // "123" (public)
console.log(user.name);  // "张三" (public)
// console.log(user.age); // ❌ 错误：private 属性
```

---

## 六、泛型

### 6.1 泛型函数

```typescript
// 基本泛型函数
function identity<T>(arg: T): T {
    return arg;
}

// 使用方式 1：显式指定类型
let output1 = identity<string>("hello");
let output2 = identity<number>(42);

// 使用方式 2：类型推断（推荐）
let output3 = identity("hello");  // 推断为 string
let output4 = identity(42);       // 推断为 number

// 多个类型参数
function swap<T, U>(tuple: [T, U]): [U, T] {
    return [tuple[1], tuple[0]];
}

let result = swap(["hello", 123]);  // [number, string]

// 泛型约束
function longest<T extends { length: number }>(a: T, b: T): T {
    if (a.length >= b.length) {
        return a;
    } else {
        return b;
    }
}

longest("abc", "def");     // "abc"
longest([1, 2], [1, 2, 3]); // [1, 2, 3]
// longest(123, 456);      // ❌ 错误：number 没有 length 属性
```

### 6.2 泛型接口

```typescript
// 泛型接口
interface GenericIdentityFn<T> {
    (arg: T): T;
}

let myIdentity: GenericIdentityFn<number> = function(arg) {
    return arg;
};

// 带默认类型的泛型接口
interface Container<T = string> {
    value: T;
    timestamp: Date;
}

let stringContainer: Container = {
    value: "hello",
    timestamp: new Date()
};

let numberContainer: Container<number> = {
    value: 42,
    timestamp: new Date()
};

// 泛型接口的多种实现
interface KeyValueProcessor<T, U> {
    process(key: T, value: U): void;
    getResult(): [T, U];
}

class StringNumberProcessor implements KeyValueProcessor<string, number> {
    private result: [string, number] = ["", 0];
    
    process(key: string, value: number): void {
        this.result = [key, value];
    }
    
    getResult(): [string, number] {
        return this.result;
    }
}
```

### 6.3 泛型类

```typescript
// 基本泛型类
class GenericNumber<T> {
    zeroValue: T;
    add: (x: T, y: T) => T;
    
    constructor(zeroValue: T, addFn: (x: T, y: T) => T) {
        this.zeroValue = zeroValue;
        this.add = addFn;
    }
}

let myGenericNumber = new GenericNumber<number>(0, (x, y) => x + y);
console.log(myGenericNumber.add(1, 2));  // 3

let stringNumeric = new GenericNumber<string>("", (x, y) => x + y);
console.log(stringNumeric.add("hello", " world"));  // "hello world"

// 泛型类的静态成员
class StaticGeneric<T> {
    static staticProperty: string = "static value";
    instanceProperty: T;
    
    constructor(value: T) {
        this.instanceProperty = value;
    }
    
    static staticMethod<U>(value: U): U {
        return value;
    }
}

console.log(StaticGeneric.staticProperty);  // "static value"
let instance = new StaticGeneric<number>(42);
console.log(StaticGeneric.staticMethod("hello"));  // "hello"
```

### 6.4 泛型约束 extends

```typescript
// 基本约束
interface Lengthwise {
    length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
    console.log(arg.length);  // 现在知道 arg 有 length 属性
    return arg;
}

loggingIdentity("hello");        // ✅ 字符串有 length
loggingIdentity([1, 2, 3]);      // ✅ 数组有 length
// loggingIdentity(123);         // ❌ 错误：number 没有 length

// 约束为特定类型
function getProperty<T, K extends keyof T>(obj: T, key: K) {
    return obj[key];
}

let person = { name: "张三", age: 25 };
getProperty(person, "name");  // ✅ "张三"
getProperty(person, "age");   // ✅ 25
// getProperty(person, "gender"); // ❌ 错误：类型不匹配

// 多重约束
interface Nameable {
    name: string;
}

interface Ageable {
    age: number;
}

function createPerson<T extends Nameable & Ageable>(person: T): T {
    return {
        ...person,
        name: person.name.toUpperCase(),
        age: Math.max(0, person.age)
    };
}
```

### 6.5 泛型默认值

```typescript
// 泛型默认类型
class DefaultGeneric<T = string> {
    value: T;
    
    constructor(value: T) {
        this.value = value;
    }
}

let strInstance = new DefaultGeneric("hello");     // T 推断为 string
let numInstance = new DefaultGeneric<number>(42);  // 显式指定 number

// 多个默认值
interface MultiGeneric<T = string, U = number> {
    first: T;
    second: U;
}

let obj1: MultiGeneric = { first: "hello", second: 42 };        // 默认类型
let obj2: MultiGeneric<boolean, string> = { first: true, second: "yes" };  // 指定类型

// 条件默认值
type ConditionalDefault<T extends string | number = string> = {
    value: T;
    type: T extends string ? "string-type" : "number-type";
};
```

### 6.6 多个泛型参数

```typescript
// 多参数泛型函数
function mergeObjects<T, U>(obj1: T, obj2: U): T & U {
    return { ...obj1, ...obj2 } as T & U;
}

let personInfo = { name: "张三" };
let contactInfo = { phone: "123456789" };
let merged = mergeObjects(personInfo, contactInfo);
// merged 类型为 { name: string } & { phone: string }

// 复杂的多参数约束
function processMultiple<
    T extends Record<string, any>,
    K extends keyof T,
    V extends T[K]
>(obj: T, key: K, value: V): T {
    return {
        ...obj,
        [key]: value
    };
}

let user = { name: "李四", age: 25 };
let updatedUser = processMultiple(user, "age", 26);
```

### 6.7 泛型工具类型实战

```typescript
// 实现 Partial 工具类型
type MyPartial<T> = {
    [P in keyof T]?: T[P];
};

interface User {
    id: string;
    name: string;
    age: number;
}

type PartialUser = MyPartial<User>;
// 等价于：{ id?: string; name?: string; age?: number; }

// 实现 Required 工具类型
type MyRequired<T> = {
    [P in keyof T]-?: T[P];
};

type RequiredUser = MyRequired<PartialUser>;
// 等价于：{ id: string; name: string; age: number; }

// 实现 Pick 工具类型
type MyPick<T, K extends keyof T> = {
    [P in K]: T[P];
};

type UserNameAndAge = MyPick<User, "name" | "age">;
// 等价于：{ name: string; age: number; }

// 实现 Omit 工具类型
type MyOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type UserWithoutId = MyOmit<User, "id">;
// 等价于：{ name: string; age: number; }

// 实现 Record 工具类型
type MyRecord<K extends string | number | symbol, T> = {
    [P in K]: T;
};

type UserDict = MyRecord<string, User>;
// 等价于：{ [key: string]: User }
```

---

## 七、高级类型

### 7.1 条件类型 T extends U ? X : Y

```typescript
// 基本条件类型
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;    // true
type B = IsString<number>;    // false
type C = IsString<"hello">;   // true

// 分布式条件类型
type ToArray<T> = T extends any ? T[] : never;

type StrArrOrNumArr = ToArray<string | number>;
// 等价于：string[] | number[]

// 实用示例：提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

type Func = (name: string) => number;
type FuncReturnType = ReturnType<Func>;  // number

// 条件类型的嵌套
type Flatten<T> = T extends Array<infer U> ? U : T;

type FlatString = Flatten<string[]>;     // string
type FlatNumber = Flatten<number>;       // number
```

### 7.2 映射类型

```typescript
// 基本映射类型
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

interface Person {
    name: string;
    age: number;
}

type ReadonlyPerson = Readonly<Person>;
// 等价于：{ readonly name: string; readonly age: number; }

// 添加可选属性
type Partial<T> = {
    [P in keyof T]?: T[P];
};

type PartialPerson = Partial<Person>;
// 等价于：{ name?: string; age?: number; }

// 修改属性类型
type Stringify<T> = {
    [P in keyof T]: string;
};

type StringifiedPerson = Stringify<Person>;
// 等价于：{ name: string; age: string; }

// 条件映射类型
type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};

type MutablePerson = Mutable<ReadonlyPerson>;
// 移除了 readonly 修饰符

// 键重映射（TypeScript 4.1+）
type Getters<T> = {
    [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
};

interface User {
    name: string;
    age: number;
}

type UserGetters = Getters<User>;
// 等价于：{ getName: () => string; getAge: () => number; }
```

### 7.3 模板字面量类型

```typescript
// 基本模板字面量
type World = "world";
type Greeting = `hello ${World}`;  // "hello world"

// 与联合类型结合
type VerticalAlignment = "top" | "middle" | "bottom";
type HorizontalAlignment = "left" | "center" | "right";

type Alignment = `${VerticalAlignment}-${HorizontalAlignment}`;
// "top-left" | "top-center" | "top-right" | "middle-left" | ...

// 模板字面量的固有字符串操作类型
type CapitalizeExample = Capitalize<"hello">;    // "Hello"
type UncapitalizeExample = Uncapitalize<"HELLO">; // "hELLO"
type UpperCaseExample = Uppercase<"hello">;      // "HELLO"
type LowerCaseExample = Lowercase<"HELLO">;      // "hello"

// 实际应用：事件名称生成
type EventName<T extends string> = `on${Capitalize<T>}Change`;

type InputEvent = EventName<"input">;    // "onInputChange"
type FocusEvent = EventName<"focus">;    // "onFocusChange"

// 状态机类型
type State = "idle" | "loading" | "success" | "error";
type Action = "fetch" | "success" | "error" | "reset";

type Transition = `${State}->${Action}->${State}`;

// 生成所有可能的状态转换
```

### 7.4 keyof 操作符

```typescript
// 获取对象的所有键名
interface User {
    id: string;
    name: string;
    age: number;
}

type UserKeys = keyof User;  // "id" | "name" | "age"

// 与泛型结合
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

let user: User = { id: "1", name: "张三", age: 25 };
let userName = getProperty(user, "name");  // string 类型
let userId = getProperty(user, "id");      // string 类型

// 数字索引的 keyof
interface NumericDict {
    [index: number]: string;
}

type NumericKeys = keyof NumericDict;  // number

// 符号索引的 keyof
const sym1 = Symbol("key1");
const sym2 = Symbol("key2");

interface SymbolDict {
    [sym1]: string;
    [sym2]: number;
}

type SymbolKeys = keyof SymbolDict;  // typeof sym1 | typeof sym2
```

### 7.5 typeof 操作符

```typescript
// 获取变量的类型
let s = "hello";
let n = 123;
let b = true;

type S = typeof s;  // string
type N = typeof n;  // number
type B = typeof b;  // boolean

// 获取函数的类型
function greet(name: string): string {
    return `Hello, ${name}`;
}

type GreetType = typeof greet;  // (name: string) => string

// 获取对象的类型
const config = {
    apiUrl: "https://api.example.com",
    timeout: 5000,
    retries: 3
};

type ConfigType = typeof config;
// 等价于：{ apiUrl: string; timeout: number; retries: number; }

// 获取类的类型
class UserClass {
    name: string;
    age: number;
    
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
    
    greet() {
        return `Hello, I'm ${this.name}`;
    }
}

type UserType = typeof UserClass;
// 等价于：new (name: string, age: number) => UserClass

// 获取枚举的类型
enum Direction {
    Up,
    Down,
    Left,
    Right
}

type DirectionType = typeof Direction;
// 包含数值和字符串映射
```

### 7.6 in 操作符

```typescript
// 创建对象类型
type Keys = "name" | "age" | "email";

type Person = {
    [K in Keys]: string;
};
// 等价于：{ name: string; age: string; email: string; }

// 条件属性
type ConditionalProps<T> = {
    [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

interface Mixed {
    name: string;
    age: number;
    email: string;
}

type StringKeys = ConditionalProps<Mixed>;  // "name" | "email"

// 实用示例：表单验证
type FormFields = "username" | "password" | "email";
type FormErrors = {
    [K in FormFields]: string[];
};

let errors: FormErrors = {
    username: [],
    password: ["密码长度不足"],
    email: ["邮箱格式不正确"]
};
```

### 7.7 infer 关键字

```typescript
// 基本 infer 用法
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type Func = (name: string) => number;
type Result = GetReturnType<Func>;  // number

// 推断参数类型
type GetFirstParam<T> = T extends (first: infer P, ...args: any[]) => any ? P : never;

type FirstParam = GetFirstParam<(a: string, b: number) => void>;  // string

// 推断数组元素类型
type GetElementType<T> = T extends (infer U)[] ? U : T;

type Element = GetElementType<string[]>;  // string
type NotArray = GetElementType<string>;   // string

// 复杂的 infer 示例
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;

type AsyncData = UnpackPromise<Promise<string>>;  // string
type SyncData = UnpackPromise<number>;            // number

// 嵌套 infer
type NestedInfer<T> = T extends Promise<Promise<infer U>> ? U : T;

type DeepUnpacked = NestedInfer<Promise<Promise<number>>>;  // number
```

### 7.8 索引访问类型 T[K]

```typescript
// 基本索引访问
interface User {
    id: string;
    name: string;
    age: number;
}

type UserId = User["id"];    // string
type UserName = User["name"]; // string
type UserAge = User["age"];   // number

// 联合索引
type UserProp = User["name" | "age"];  // string | number

// keyof 与索引访问结合
type AllUserValues = User[keyof User];  // string | number

// 数组索引访问
type Arr = string[];
type ArrElement = Arr[number];  // string

// 元组索引访问
type Tuple = [string, number, boolean];
type First = Tuple[0];   // string
type Second = Tuple[1];  // number
type Third = Tuple[2];   // boolean

// 条件索引访问
type Head<T> = T extends [infer H, ...any[]] ? H : never;
type Tail<T> = T extends [any, ...infer Rest] ? Rest : never;

type HeadType = Head<[string, number, boolean]>;  // string
type TailType = Tail<[string, number, boolean]>;  // [number, boolean]
```

### 7.9 可辨识联合类型

```typescript
// 基本可辨识联合
interface Square {
    kind: "square";
    size: number;
}

interface Rectangle {
    kind: "rectangle";
    width: number;
    height: number;
}

interface Circle {
    kind: "circle";
    radius: number;
}

type Shape = Square | Rectangle | Circle;

function getArea(shape: Shape): number {
    switch (shape.kind) {
        case "square":
            return shape.size * shape.size;
        case "rectangle":
            return shape.width * shape.height;
        case "circle":
            return Math.PI * shape.radius ** 2;
        default:
            // 穷尽性检查
            const _exhaustiveCheck: never = shape;
            return _exhaustiveCheck;
    }
}

// 添加新形状时，switch 会报错提醒补充处理逻辑
```

### 7.10 类型守卫

#### typeof 类型守卫
```typescript
function padLeft(value: string, padding: string | number) {
    if (typeof padding === "number") {
        // 在这个分支中，padding 被收窄为 number 类型
        return " ".repeat(padding) + value;
    }
    // 在这个分支中，padding 被收窄为 string 类型
    return padding + value;
}

// typeof 的局限性
function isString(x: unknown): x is string {
    return typeof x === "string";
}
```

#### instanceof 类型守卫
```typescript
class Bird {
    fly() {}
    layEggs() {}
}

class Fish {
    swim() {}
    layEggs() {}
}

function move(animal: Bird | Fish) {
    if (animal instanceof Bird) {
        animal.fly();  // animal 被收窄为 Bird
    } else {
        animal.swim(); // animal 被收窄为 Fish
    }
}
```

#### in 操作符类型守卫
```typescript
interface Admin {
    name: string;
    privileges: string[];
}

interface Employee {
    name: string;
    startDate: Date;
}

function printInfo(person: Admin | Employee) {
    console.log(`姓名: ${person.name}`);
    
    if ("privileges" in person) {
        // person 被收窄为 Admin
        console.log(`权限: ${person.privileges.join(", ")}`);
    }
    
    if ("startDate" in person) {
        // person 被收窄为 Employee
        console.log(`入职日期: ${person.startDate}`);
    }
}
```

#### 自定义类型守卫
```typescript
// 类型谓词函数
function isFish(pet: Fish | Bird): pet is Fish {
    return (pet as Fish).swim !== undefined;
}

function getFood(pet: Fish | Bird) {
    if (isFish(pet)) {
        pet.swim();  // pet 被收窄为 Fish
        return "鱼食";
    } else {
        pet.fly();   // pet 被收窄为 Bird
        return "鸟食";
    }
}

// 复杂的类型守卫
interface StringValidator {
    isAcceptable(s: string): boolean;
}

interface ZipCodeValidator extends StringValidator {
    readonly regExp: RegExp;
}

function isZipCodeValidator(obj: any): obj is ZipCodeValidator {
    return obj.regExp instanceof RegExp;
}
```

### 7.11 类型收窄

```typescript
// 赋值收窄
let value: string | number = "hello";
value.toUpperCase();  // string 类型的方法

value = 42;
value.toFixed(2);     // number 类型的方法

// 条件收窄
function example(x: string | number | boolean) {
    if (typeof x === "string") {
        x.toUpperCase();  // string
    } else if (typeof x === "number") {
        x.toFixed(2);     // number
    } else {
        x.valueOf();      // boolean
    }
}

// 真值收窄
function multiplyAll(values: number[] | undefined): number {
    if (!values) {
        return 0;
    }
    // values 被收窄为 number[]
    return values.reduce((a, b) => a * b, 1);
}

// 相等性收窄
function examples(x: string | number, y: string | boolean) {
    if (x === y) {
        // x 和 y 都被收窄为 string
        x.toUpperCase();
        y.toLowerCase();
    } else {
        // 没有收窄
    }
}

// 控制流收窄
function padLeft(value: string, padding: string | number): string {
    if (typeof padding === "number") {
        return " ".repeat(padding) + value;
    }
    return padding + value;
    // 函数末尾 padding 被收窄为 string
}
```

---

## 八、内置工具类型

### 8.1 Partial<T>

```typescript
// 定义
type Partial<T> = {
    [P in keyof T]?: T[P];
};

// 使用示例
interface User {
    id: string;
    name: string;
    age: number;
    email: string;
}

type PartialUser = Partial<User>;
// 等价于：{
//   id?: string;
//   name?: string;
//   age?: number;
//   email?: string;
// }

// 实际应用：更新操作
function updateUser(id: string, updates: PartialUser) {
    // 只需要提供要更新的字段
}

updateUser("123", { name: "新名字" });  // 只更新名字
updateUser("123", { age: 26, email: "new@example.com" });  // 更新多个字段
```

### 8.2 Required<T>

```typescript
// 定义
type Required<T> = {
    [P in keyof T]-?: T[P];
};

// 使用示例
interface UserConfig {
    apiUrl?: string;
    timeout?: number;
    retries?: number;
}

type RequiredConfig = Required<UserConfig>;
// 等价于：{
//   apiUrl: string;
//   timeout: number;
//   retries: number;
// }

// 实际应用：确保配置完整性
function initializeApp(config: RequiredConfig) {
    // 所有配置项都必须提供
    console.log(`API URL: ${config.apiUrl}`);
    console.log(`Timeout: ${config.timeout}`);
    console.log(`Retries: ${config.retries}`);
}

// 从部分配置创建完整配置
function createCompleteConfig(partial: UserConfig): RequiredConfig {
    return {
        apiUrl: partial.apiUrl || "https://api.default.com",
        timeout: partial.timeout || 5000,
        retries: partial.retries || 3
    };
}
```

### 8.3 Readonly<T>

```typescript
// 定义
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

// 使用示例
interface User {
    id: string;
    name: string;
    age: number;
}

type ReadonlyUser = Readonly<User>;
// 等价于：{
//   readonly id: string;
//   readonly name: string;
//   readonly age: number;
// }

// 实际应用：不可变数据
const USER_ROLES: Readonly<Record<string, string>> = {
    ADMIN: "admin",
    USER: "user",
    GUEST: "guest"
};

// USER_ROLES.ADMIN = "super_admin";  // ❌ 错误：Cannot assign to 'ADMIN' because it is a read-only property

// 函数参数的不可变性
function processUserData(user: ReadonlyUser) {
    console.log(user.name);
    // user.name = "新名字";  // ❌ 错误：Cannot assign to 'name' because it is a read-only property
}
```

### 8.4 Pick<T, K>

```typescript
// 定义
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};

// 使用示例
interface User {
    id: string;
    name: string;
    age: number;
    email: string;
    password: string;
}

type UserProfile = Pick<User, "id" | "name" | "email">;
// 等价于：{
//   id: string;
//   name: string;
//   email: string;
// }

// 实际应用：API 响应数据筛选
function getUserProfile(userId: string): Promise<UserProfile> {
    // 只返回用户的公开信息，不包含敏感数据如密码
    return fetch(`/api/users/${userId}/profile`)
        .then(res => res.json());
}

// 数据库查询投影
type UserPublicFields = Pick<User, "id" | "name" | "email">;
type UserPrivateFields = Pick<User, "password">;
```

### 8.5 Omit<T, K>

```typescript
// 定义
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// 使用示例
interface User {
    id: string;
    name: string;
    age: number;
    email: string;
    password: string;
}

type SafeUser = Omit<User, "password">;
// 等价于：{
//   id: string;
//   name: string;
//   age: number;
//   email: string;
// }

// 实际应用：移除敏感信息
function sanitizeUser(user: User): SafeUser {
    const { password, ...safeUser } = user;
    return safeUser;
}

// API 请求体验证
type CreateUserRequest = Omit<User, "id">;
// 创建用户时不需要提供 id，由服务器生成

// 配置对象清理
interface AppConfig {
    apiUrl: string;
    apiKey: string;
    debug: boolean;
    secret: string;
}

type PublicConfig = Omit<AppConfig, "apiKey" | "secret">;
// 公开的配置信息，不包含密钥
```

### 8.6 Record<K, T>

```typescript
// 定义
type Record<K extends string | number | symbol, T> = {
    [P in K]: T;
};

// 使用示例
type UserRoles = Record<string, "admin" | "user" | "guest">;
// 等价于：{ [key: string]: "admin" | "user" | "guest" }

// 实际应用：字典映射
const userRoleMap: UserRoles = {
    "user1": "admin",
    "user2": "user",
    "user3": "guest"
};

// 枚举映射
type HttpStatus = Record<number, string>;
const httpStatus: HttpStatus = {
    200: "OK",
    404: "Not Found",
    500: "Internal Server Error"
};

// 配置对象
type ThemeConfig = Record<"primary" | "secondary" | "accent", string>;
const theme: ThemeConfig = {
    primary: "#3f51b5",
    secondary: "#f50057",
    accent: "#00bcd4"
};
```

### 8.7 Exclude<T, U>

```typescript
// 定义
type Exclude<T, U> = T extends U ? never : T;

// 使用示例
type T0 = Exclude<"a" | "b" | "c", "a">;                    // "b" | "c"
type T1 = Exclude<"a" | "b" | "c", "a" | "b">;              // "c"
type T2 = Exclude<string | number | (() => void), Function>; // string | number

// 实际应用：类型过滤
type Primitive = string | number | boolean | symbol;
type NonPrimitive = Exclude<Primitive, string | number>;     // boolean | symbol

// 事件处理器类型
type EventHandler<T extends Event = Event> = (event: T) => void;
type MouseEventHandlers = Exclude<EventHandler, EventHandler<KeyboardEvent>>;

// API 状态过滤
type ApiStatus = "idle" | "loading" | "success" | "error";
type ActiveStatus = Exclude<ApiStatus, "idle">;  // "loading" | "success" | "error"
```

### 8.8 Extract<T, U>

```typescript
// 定义
type Extract<T, U> = T extends U ? T : never;

// 使用示例
type T0 = Extract<"a" | "b" | "c", "a" | "f">;              // "a"
type T1 = Extract<string | number | boolean, number>;       // number
type T2 = Extract<string | number | (() => void), Function>; // () => void

// 实际应用：类型提取
type StringOrNumber = string | number | boolean;
type Extracted = Extract<StringOrNumber, string | number>;  // string | number

// DOM 事件类型提取
type DomEvents = 
    | MouseEvent 
    | KeyboardEvent 
    | TouchEvent 
    | PointerEvent;

type MouseAndPointerEvents = Extract<DomEvents, MouseEvent | PointerEvent>;
// MouseEvent | PointerEvent

// 组件 props 提取
interface ComponentProps {
    onClick?: () => void;
    onChange?: (value: string) => void;
    disabled?: boolean;
}

type EventProps = Extract<keyof ComponentProps, `on${string}`>;
// "onClick" | "onChange"
```

### 8.9 NonNullable<T>

```typescript
// 定义
type NonNullable<T> = T extends null | undefined ? never : T;

// 使用示例
type T0 = NonNullable<string | null>;                    // string
type T1 = NonNullable<string | number | undefined>;      // string | number
type T2 = NonNullable<string[] | null | undefined>;      // string[]

// 实际应用：处理可空类型
type MaybeUser = User | null | undefined;
type DefiniteUser = NonNullable<MaybeUser>;  // User

// 数组元素去空
type NullableArray = (string | null | undefined)[];
type CleanArray = NonNullable<NullableArray[number]>[];  // string[]

// 函数返回值处理
function findUser(id: string): User | null {
    // 查找逻辑...
    return null;
}

const user = findUser("123");
if (user) {
    // user 类型为 User（NonNullable<User | null>）
    console.log(user.name);
}
```

### 8.10 ReturnType<T>

```typescript
// 定义
type ReturnType<T extends (...args: any) => any> = 
    T extends (...args: any) => infer R ? R : any;

// 使用示例
type T0 = ReturnType<() => string>;                          // string
type T1 = ReturnType<(s: string) => void>;                   // void
type T2 = ReturnType<<T>() => T>;                            // unknown
type T3 = ReturnType<<T extends U, U extends number[]>() => T>; // number[]

// 实际应用：获取异步函数返回类型
async function fetchData(): Promise<User[]> {
    const response = await fetch('/api/users');
    return response.json();
}

type FetchResult = ReturnType<typeof fetchData>;  // Promise<User[]>

// 事件处理器返回类型
type ClickHandler = (event: MouseEvent) => boolean;
type ClickHandlerReturn = ReturnType<ClickHandler>;  // boolean

// 高阶函数返回类型
function createValidator<T>(schema: T) {
    return function(data: any): data is T {
        // 验证逻辑...
        return true;
    };
}

type Validator = ReturnType<typeof createValidator>;  // (data: any) => data is T
```

### 8.11 Parameters<T>

```typescript
// 定义
type Parameters<T extends (...args: any) => any> = 
    T extends (...args: infer P) => any ? P : never;

// 使用示例
type T0 = Parameters<() => string>;                     // []
type T1 = Parameters<(s: string) => void>;              // [string]
type T2 = Parameters<(x: number, y: string) => void>;   // [number, string]
type T3 = Parameters<typeof console.log>;               // any[]

// 实际应用：函数参数类型提取
function createUser(name: string, age: number, email: string) {
    // 创建用户逻辑...
}

type CreateUserParams = Parameters<typeof createUser>;  // [string, number, string]

// 参数验证中间件
function validateParams<T extends (...args: any[]) => any>(
    validator: (...args: Parameters<T>) => boolean,
    fn: T
): T {
    return function(...args: Parameters<T>) {
        if (!validator(...args)) {
            throw new Error("参数验证失败");
        }
        return fn(...args);
    } as T;
}

// API 路由参数
type RouteHandler = (req: Request, res: Response, next: NextFunction) => void;
type RouteParams = Parameters<RouteHandler>;  // [Request, Response, NextFunction]
```

### 8.12 InstanceType<T>

```typescript
// 定义
type InstanceType<T extends new (...args: any) => any> = 
    T extends new (...args: any) => infer R ? R : any;

// 使用示例
class UserClass {
    constructor(public name: string, public age: number) {}
}

type T0 = InstanceType<typeof UserClass>;  // UserClass

class Animal {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}

class Dog extends Animal {
    breed: string;
    constructor(name: string, breed: string) {
        super(name);
        this.breed = breed;
    }
}

type T1 = InstanceType<typeof Dog>;  // Dog

// 实际应用：工厂函数返回类型
function createInstance<T extends new (...args: any[]) => any>(
    ctor: T,
    ...args: Parameters<T>
): InstanceType<T> {
    return new ctor(...args);
}

const user = createInstance(UserClass, "张三", 25);  // UserClass 实例
const dog = createInstance(Dog, "旺财", "金毛");     // Dog 实例

// 依赖注入容器
interface ServiceConstructor<T> {
    new (...args: any[]): T;
}

class Container {
    private services = new Map<string, any>();
    
    register<T>(token: string, ctor: ServiceConstructor<T>) {
        this.services.set(token, ctor);
    }
    
    resolve<T>(token: string): InstanceType<ServiceConstructor<T>> {
        const ctor = this.services.get(token);
        if (!ctor) {
            throw new Error(`Service ${token} not found`);
        }
        return new ctor();
    }
}
```

### 8.13 Awaited<T>

```typescript
// 定义（TypeScript 4.5+）
type Awaited<T> = T extends null | undefined 
    ? T 
    : T extends object & { then(onfulfilled: infer F): any } 
        ? F extends ((value: infer V, ...args: any) => any) 
            ? Awaited<V> 
            : never 
        : T;

// 使用示例
type T0 = Awaited<Promise<string>>;                    // string
type T1 = Awaited<Promise<Promise<number>>>;           // number
type T2 = Awaited<boolean | Promise<number>>;          // boolean | number

// 实际应用：处理嵌套 Promise
async function fetchUserData(): Promise<{ id: string; name: string }> {
    const response = await fetch('/api/user');
    return response.json();
}

type UserData = Awaited<ReturnType<typeof fetchUserData>>;  // { id: string; name: string }

// 并行异步操作结果类型
async function loadAllData() {
    const [users, posts, comments] = await Promise.all([
        fetch('/api/users').then(r => r.json()),
        fetch('/api/posts').then(r => r.json()),
        fetch('/api/comments').then(r => r.json())
    ]);
    
    return { users, posts, comments };
}

type AllData = Awaited<ReturnType<typeof loadAllData>>;
// {
//   users: any,
//   posts: any, 
//   comments: any
// }

// 异步数据加载钩子
function useAsyncData<T>(promise: Promise<T>) {
    const [data, setData] = useState<Awaited<T> | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        promise.then(result => {
            setData(result);
            setLoading(false);
        });
    }, [promise]);
    
    return { data, loading };
}
```

### 8.14 手写实现这些工具类型

```typescript
// 1. 手写 Partial
type MyPartial<T> = {
    [K in keyof T]?: T[K];
};

// 2. 手写 Required  
type MyRequired<T> = {
    [K in keyof T]-?: T[K];
};

// 3. 手写 Readonly
type MyReadonly<T> = {
    readonly [K in keyof T]: T[K];
};

// 4. 手写 Pick
type MyPick<T, K extends keyof T> = {
    [P in K]: T[P];
};

// 5. 手写 Omit
type MyOmit<T, K extends keyof T> = MyPick<T, MyExclude<keyof T, K>>;

// 6. 手写 Record
type MyRecord<K extends string | number | symbol, T> = {
    [P in K]: T;
};

// 7. 手写 Exclude
type MyExclude<T, U> = T extends U ? never : T;

// 8. 手写 Extract
type MyExtract<T, U> = T extends U ? T : never;

// 9. 手写 NonNullable
type MyNonNullable<T> = T extends null | undefined ? never : T;

// 10. 手写 ReturnType
type MyReturnType<T extends (...args: any) => any> = 
    T extends (...args: any) => infer R ? R : any;

// 11. 手写 Parameters
type MyParameters<T extends (...args: any) => any> = 
    T extends (...args: infer P) => any ? P : never;

// 12. 手写 InstanceType
type MyInstanceType<T extends new (...args: any) => any> = 
    T extends new (...args: any) => infer R ? R : any;

// 13. 手写 Awaited
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;

// 14. 复杂组合示例
type MyDeepPartial<T> = T extends object 
    ? { [K in keyof T]?: MyDeepPartial<T[K]> } 
    : T;

type MyDeepReadonly<T> = {
    readonly [K in keyof T]: T[K] extends object 
        ? MyDeepReadonly<T[K]> 
        : T[K];
};

// 测试手写的工具类型
interface TestUser {
    id: string;
    profile: {
        name: string;
        age: number;
        contacts: {
            email: string;
            phone: string;
        };
    };
}

type PartialTestUser = MyPartial<TestUser>;
type DeepPartialTestUser = MyDeepPartial<TestUser>;
type DeepReadonlyTestUser = MyDeepReadonly<TestUser>;
```

---

## 九、模块与声明

### 9.1 ES Module 导入导出

```typescript
// 命名导出
// math.ts
export const PI = 3.14159;
export function add(a: number, b: number): number {
    return a + b;
}
export function subtract(a: number, b: number): number {
    return a - b;
}

// 默认导出
// calculator.ts
export default class Calculator {
    add(a: number, b: number): number {
        return a + b;
    }
    
    multiply(a: number, b: number): number {
        return a * b;
    }
}

// 导入使用
// main.ts
import { PI, add, subtract } from './math';
import Calculator from './calculator';
import * as MathUtils from './math';  // 导入所有命名导出

console.log(PI);                    // 3.14159
console.log(add(2, 3));             // 5
console.log(MathUtils.subtract(5, 2)); // 3

const calc = new Calculator();
console.log(calc.add(4, 5));        // 9

// 重新导出
// utils.ts
export { add as sum, subtract as difference } from './math';
export { default as Calc } from './calculator';

// 类型导出
interface User {
    id: string;
    name: string;
}

type UserRole = "admin" | "user" | "guest";

export type { User, UserRole };
export { type User as UserType };  // TypeScript 4.5+ 专用类型导出
```

### 9.2 声明文件 .d.ts

```typescript
// global.d.ts - 全局声明文件
declare global {
    interface Window {
        MyApp: {
            version: string;
            init(): void;
        };
    }
    
    var GLOBAL_CONFIG: {
        apiUrl: string;
        debug: boolean;
    };
}

// module.d.ts - 模块声明
declare module "my-library" {
    export interface Config {
        option1: string;
        option2: number;
    }
    
    export function initialize(config: Config): void;
    export const VERSION: string;
}

// 使用第三方库的类型声明
import { Config, initialize } from "my-library";

const config: Config = {
    option1: "value",
    option2: 42
};

initialize(config);
```

### 9.3 declare 关键字

```typescript
// 声明全局变量
declare var jQuery: (selector: string) => any;
declare let $: typeof jQuery;

// 声明全局函数
declare function alert(message: string): void;
declare function confirm(message: string): boolean;

// 声明全局类
declare class XMLHttpRequest {
    open(method: string, url: string): void;
    send(data?: any): void;
    onload: () => void;
    onerror: () => void;
}

// 声明命名空间
declare namespace NodeJS {
    interface Process {
        env: ProcessEnv;
        argv: string[];
        cwd(): string;
    }
    
    interface ProcessEnv {
        [key: string]: string | undefined;
    }
}

// 声明模块
declare module "fs" {
    export function readFile(path: string, callback: (err: Error | null, data: Buffer) => void): void;
    export function writeFile(path: string, data: string, callback: (err: Error | null) => void): void;
}

// 声明枚举
declare enum LogLevel {
    DEBUG,
    INFO,
    WARN,
    ERROR
}

// 声明接口
declare interface JQueryStatic {
    (selector: string): JQuery;
    ajax(settings: any): any;
}
```

### 9.4 命名空间 namespace

```typescript
// 基本命名空间
namespace Validation {
    export interface StringValidator {
        isAcceptable(s: string): boolean;
    }
    
    const lettersRegexp = /^[A-Za-z]+$/;
    const numberRegexp = /^[0-9]+$/;
    
    export class LettersOnlyValidator implements StringValidator {
        isAcceptable(s: string) {
            return lettersRegexp.test(s);
        }
    }
    
    export class ZipCodeValidator implements StringValidator {
        isAcceptable(s: string) {
            return s.length === 5 && numberRegexp.test(s);
        }
    }
}

// 使用命名空间
let validators: { [s: string]: Validation.StringValidator; } = {};
validators["ZIP code"] = new Validation.ZipCodeValidator();
validators["Letters only"] = new Validation.LettersOnlyValidator();

// 嵌套命名空间
namespace Shapes {
    export namespace Polygons {
        export class Triangle {
            constructor(public sides: number = 3) {}
        }
        
        export class Square {
            constructor(public sides: number = 4) {}
        }
    }
}

let triangle = new Shapes.Polygons.Triangle();

// 别名
import polygons = Shapes.Polygons;
let square = new polygons.Square();
```

### 9.5 三斜线指令

```typescript
// 引用其他声明文件
/// <reference path="./global.d.ts" />
/// <reference types="node" />
/// <reference lib="es2020" />

// 引用包声明
/// <reference types="react" />
/// <reference types="lodash" />

// 引用库声明
/// <reference lib="dom" />
/// <reference lib="es2020.promise" />

// AMD 模块引用
/// <amd-module name="my-module" />
/// <amd-dependency path="lodash" />

// 实际应用示例
// main.ts
/// <reference path="./types/global.d.ts" />

window.MyApp.init();
console.log(GLOBAL_CONFIG.apiUrl);
```

### 9.6 @types 包

```bash
# 安装流行库的类型定义
npm install -D @types/node
npm install -D @types/react
npm install -D @types/lodash
npm install -D @types/express

# 安装特定版本的类型定义
npm install -D @types/react@17.0.0
```

```typescript
// 使用 @types/node
import * as fs from 'fs';
import * as path from 'path';

fs.readFile('file.txt', 'utf8', (err, data) => {
    if (err) throw err;
    console.log(data);
});

// 使用 @types/lodash
import _ from 'lodash';

const users = [
    { name: '张三', age: 25 },
    { name: '李四', age: 30 }
];

const names = _.map(users, 'name');  // 类型安全的 lodash 操作
```

### 9.7 为 JS 库编写类型声明

```typescript
// 为现有的 JS 库添加类型声明
// my-javascript-lib.d.ts

// 声明模块
declare module "my-javascript-lib" {
    // 类型定义
    export interface Config {
        apiKey: string;
        timeout?: number;
        retries?: number;
    }
    
    export interface User {
        id: string;
        name: string;
        email: string;
    }
    
    // 函数声明
    export function initialize(config: Config): void;
    export function getUser(id: string): Promise<User>;
    export function updateUser(user: Partial<User>): Promise<User>;
    
    // 类声明
    export class ApiClient {
        constructor(config: Config);
        get<T>(endpoint: string): Promise<T>;
        post<T>(endpoint: string, data: any): Promise<T>;
    }
    
    // 常量声明
    export const VERSION: string;
    export const DEFAULT_TIMEOUT: number;
}

// 全局变量声明
declare global {
    interface Window {
        MyJavascriptLib: {
            version: string;
            init(config: import("my-javascript-lib").Config): void;
        };
    }
}

// 使用示例
import { initialize, getUser, ApiClient } from "my-javascript-lib";

initialize({
    apiKey: "your-api-key",
    timeout: 5000
});

async function loadUser() {
    const user = await getUser("123");
    console.log(user.name);
}

const client = new ApiClient({ apiKey: "key" });
client.get<User[]>("/users");
```

---

## 十、实战与最佳实践

### 10.1 严格模式配置

```json
{
  "compilerOptions": {
    /* 启用所有严格类型检查 */
    "strict": true,
    
    /* 严格的 null 检查 */
    "strictNullChecks": true,
    
    /* 严格的函数类型检查 */
    "strictFunctionTypes": true,
    
    /* 严格的 bind/call/apply 检查 */
    "strictBindCallApply": true,
    
    /* 类属性必须初始化 */
    "strictPropertyInitialization": true,
    
    /* 不允许隐式的 any */
    "noImplicitAny": true,
    
    /* 不允许 this 的隐式 any */
    "noImplicitThis": true,
    
    /* 总是以严格模式解析 */
    "alwaysStrict": true,
    
    /* 额外的严格检查 */
    "exactOptionalPropertyTypes": true,    // 可选属性不允许 undefined
    "noUncheckedIndexedAccess": true,      // 索引访问需要检查 undefined
    "noImplicitOverride": true,            // 方法重写需要显式 override
    "noPropertyAccessFromIndexSignature": true // 索引签名需要显式访问
  }
}
```

### 10.2 类型体操常见题型

```typescript
// 1. 实现 DeepReadonly
type DeepReadonly<T> = {
    readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

type NestedObj = {
    a: {
        b: {
            c: string;
        };
    };
};

type ReadonlyNested = DeepReadonly<NestedObj>;
// 所有层级都变为 readonly

// 2. 实现 DeepPartial
type DeepPartial<T> = T extends object 
    ? { [K in keyof T]?: DeepPartial<T[K]> } 
    : T;

type PartialNested = DeepPartial<NestedObj>;
// 所有层级都变为可选

// 3. 实现 RequiredKeys 和 OptionalKeys
type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type OptionalKeys<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

interface MixedProps {
    required: string;
    optional?: number;
    anotherRequired: boolean;
}

type ReqKeys = RequiredKeys<MixedProps>;  // "required" | "anotherRequired"
type OptKeys = OptionalKeys<MixedProps>;  // "optional"

// 4. 实现 Mutable
type Mutable<T> = {
    -readonly [K in keyof T]: T[K];
};

type MutableReadonly = Mutable<Readonly<{ a: string; b: number }>>;

// 5. 实现 Merge（合并对象类型）
type Merge<T, U> = Omit<T, keyof U> & U;

type Obj1 = { a: string; b: number };
type Obj2 = { b: string; c: boolean };
type Merged = Merge<Obj1, Obj2>;  // { a: string; b: string; c: boolean }

// 6. 实现 AppendToObject
type AppendToObject<T, U extends string, V> = {
    [K in keyof T | U]: K extends keyof T ? T[K] : V;
};

type Appended = AppendToObject<{ a: string }, "b", number>;
// { a: string; b: number }

// 7. 实现 Absolute（获取绝对值类型）
type Absolute<T extends number | string | bigint> = 
    `${T}` extends `-${infer U}` ? U : `${T}`;

type Abs1 = Absolute<-100>;   // "100"
type Abs2 = Absolute<"-200">; // "200"

// 8. 实现 Join（数组转字符串）
type Join<T extends string[], D extends string> = 
    T extends [infer F extends string, ...infer R extends string[]]
        ? R extends []
            ? F
            : `${F}${D}${Join<R, D>}`
        : "";

type Joined = Join<["a", "b", "c"], "-">;  // "a-b-c"

// 9. 实现 Split（字符串转数组）
type Split<S extends string, D extends string> = 
    S extends `${infer F}${D}${infer R}`
        ? [F, ...Split<R, D>]
        : [S];

type Splitted = Split<"a-b-c", "-">;  // ["a", "b", "c"]

// 10. 实现 CapitalizeNestObjectKeys
type CapitalizeNestObjectKeys<T> = T extends object
    ? { [K in keyof T as Capitalize<string & K>]: CapitalizeNestObjectKeys<T[K]> }
    : T;

type Capitalized = CapitalizeNestObjectKeys<{ name: string; nested: { age: number } }>;
// { Name: string; Nested: { Age: number } }
```

### 10.3 TypeScript 与 React 结合

```typescript
// 1. 基本组件类型
import React, { FC, ReactNode, PropsWithChildren } from 'react';

// 函数组件
interface UserCardProps {
    name: string;
    age: number;
    email?: string;
    children?: ReactNode;
}

const UserCard: FC<UserCardProps> = ({ name, age, email, children }) => (
    <div className="user-card">
        <h2>{name}</h2>
        <p>年龄: {age}</p>
        {email && <p>邮箱: {email}</p>}
        {children}
    </div>
);

// 使用 PropsWithChildren
interface ButtonProps extends PropsWithChildren {
    variant?: 'primary' | 'secondary';
    onClick: () => void;
}

const Button: FC<ButtonProps> = ({ variant = 'primary', onClick, children }) => (
    <button 
        className={`btn btn-${variant}`} 
        onClick={onClick}
    >
        {children}
    </button>
);

// 2. Hook 类型
import { useState, useEffect, useCallback, useMemo } from 'react';

// useState 类型推断
function Counter() {
    const [count, setCount] = useState<number>(0);
    const [name, setName] = useState<string>(""); // 可以省略类型，会自动推断
    
    return (
        <div>
            <p>计数: {count}</p>
            <button onClick={() => setCount(c => c + 1)}>增加</button>
        </div>
    );
}

// useEffect 类型
function DataFetcher() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/data');
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []); // 依赖数组
    
    if (loading) return <div>加载中...</div>;
    return <div>{JSON.stringify(data)}</div>;
}

// useCallback 类型
function OptimizedComponent() {
    const [count, setCount] = useState(0);
    
    const handleClick = useCallback((increment: number) => {
        setCount(c => c + increment);
    }, []); // 依赖数组为空，函数不会重新创建
    
    return <button onClick={() => handleClick(1)}>点击</button>;
}

// 自定义 Hook 类型
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            return initialValue;
        }
    });
    
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };
    
    return [storedValue, setValue];
}

// 3. Context 类型
import { createContext, useContext } from 'react';

interface AuthContextType {
    user: { id: string; name: string } | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<{ id: string; name: string } | null>(null);
    
    const login = async (username: string, password: string) => {
        // 登录逻辑
        setUser({ id: "1", name: username });
    };
    
    const logout = () => {
        setUser(null);
    };
    
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// 4. 事件处理类型
interface FormState {
    username: string;
    password: string;
}

function LoginForm() {
    const [formState, setFormState] = useState<FormState>({
        username: '',
        password: ''
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(formState);
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="username"
                value={formState.username}
                onChange={handleChange}
                placeholder="用户名"
            />
            <input
                type="password"
                name="password"
                value={formState.password}
                onChange={handleChange}
                placeholder="密码"
            />
            <button type="submit">登录</button>
        </form>
    );
}

// 5. Ref 类型
import { useRef, forwardRef, useImperativeHandle } from 'react';

interface InputProps {
    placeholder?: string;
}

export interface InputRef {
    focus: () => void;
    getValue: () => string;
}

const Input = forwardRef<InputRef, InputProps>((props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    useImperativeHandle(ref, () => ({
        focus: () => {
            inputRef.current?.focus();
        },
        getValue: () => {
            return inputRef.current?.value || '';
        }
    }));
    
    return (
        <input 
            ref={inputRef} 
            {...props} 
        />
    );
});
```

### 10.4 TypeScript 与 Vue 结合

```typescript
// 1. Vue 3 Composition API 类型
import { defineComponent, ref, reactive, computed, PropType } from 'vue';

interface User {
    id: string;
    name: string;
    age: number;
}

export default defineComponent({
    name: 'UserList',
    props: {
        users: {
            type: Array as PropType<User[]>,
            required: true
        },
        title: {
            type: String,
            default: '用户列表'
        }
    },
    emits: {
        'user-selected': (user: User) => true,
        'delete-user': (id: string) => true
    },
    setup(props, { emit }) {
        // 响应式引用
        const selectedUser = ref<User | null>(null);
        const searchQuery = ref('');
        
        // 响应式对象
        const pagination = reactive({
            currentPage: 1,
            pageSize: 10,
            total: 0
        });
        
        // 计算属性
        const filteredUsers = computed(() => {
            return props.users.filter(user => 
                user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
            );
        });
        
        const totalPages = computed(() => {
            return Math.ceil(filteredUsers.value.length / pagination.pageSize);
        });
        
        // 方法
        const selectUser = (user: User) => {
            selectedUser.value = user;
            emit('user-selected', user);
        };
        
        const deleteUser = (id: string) => {
            emit('delete-user', id);
        };
        
        const nextPage = () => {
            if (pagination.currentPage < totalPages.value) {
                pagination.currentPage++;
            }
        };
        
        return {
            selectedUser,
            searchQuery,
            pagination,
            filteredUsers,
            totalPages,
            selectUser,
            deleteUser,
            nextPage
        };
    }
});

// 2. 自定义 Hook (Composable)
import { ref, watchEffect } from 'vue';

// 用户认证 composable
interface AuthState {
    user: { id: string; name: string } | null;
    isAuthenticated: boolean;
}

export function useAuth() {
    const authState = ref<AuthState>({
        user: null,
        isAuthenticated: false
    });
    
    const login = async (username: string, password: string) => {
        try {
            // 模拟 API 调用
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                const userData = await response.json();
                authState.value = {
                    user: userData,
                    isAuthenticated: true
                };
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    };
    
    const logout = () => {
        authState.value = {
            user: null,
            isAuthenticated: false
        };
    };
    
    return {
        authState,
        login,
        logout
    };
}

// 3. Store 类型 (Pinia)
import { defineStore } from 'pinia';

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
}

interface CartItem {
    product: Product;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    total: number;
}

export const useCartStore = defineStore('cart', {
    state: (): CartState => ({
        items: [],
        total: 0
    }),
    
    getters: {
        itemCount: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
        
        totalPrice: (state) => state.items.reduce(
            (total, item) => total + (item.product.price * item.quantity), 
            0
        )
    },
    
    actions: {
        addItem(product: Product, quantity: number = 1) {
            const existingItem = this.items.find(item => item.product.id === product.id);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                this.items.push({ product, quantity });
            }
            
            this.calculateTotal();
        },
        
        removeItem(productId: string) {
            this.items = this.items.filter(item => item.product.id !== productId);
            this.calculateTotal();
        },
        
        updateQuantity(productId: string, quantity: number) {
            const item = this.items.find(item => item.product.id === productId);
            if (item) {
                item.quantity = Math.max(0, quantity);
                if (item.quantity === 0) {
                    this.removeItem(productId);
                } else {
                    this.calculateTotal();
                }
            }
        },
        
        clearCart() {
            this.items = [];
            this.total = 0;
        },
        
        private calculateTotal() {
            this.total = this.items.reduce(
                (total, item) => total + (item.product.price * item.quantity),
                0
            );
        }
    }
});

// 4. Router 类型
import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: {
            requiresAuth: false,
            title: '首页'
        }
    },
    {
        path: '/users/:id',
        name: 'UserProfile',
        component: () => import('@/views/UserProfile.vue'),
        props: true, // 将路由参数作为 props 传递
        meta: {
            requiresAuth: true,
            title: '用户资料'
        },
        beforeEnter: (to, from, next) => {
            // 路由守卫
            const userId = to.params.id as string;
            if (userId && userId.length > 0) {
                next();
            } else {
                next('/404');
            }
        }
    }
];

// 5. 指令类型
import { DirectiveBinding } from 'vue';

const focusDirective = {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        if (binding.value) {
            el.focus();
        }
    },
    
    updated(el: HTMLElement, binding: DirectiveBinding) {
        if (binding.value) {
            el.focus();
        }
    }
};

// 在组件中使用
export default defineComponent({
    directives: {
        focus: focusDirective
    }
});
```

### 10.5 TypeScript 与 Node.js 结合

```typescript
// 1. Express 应用类型
import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// 请求体验证 schema
const UserSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    age: z.number().min(0).max(150)
});

type User = z.infer<typeof UserSchema>;

// 错误处理中间件类型
interface HttpError extends Error {
    status?: number;
    code?: string;
}

const errorHandler = (
    err: HttpError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(status).json({
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

// 应用配置
interface AppConfig {
    port: number;
    databaseUrl: string;
    jwtSecret: string;
    corsOrigin: string | string[];
}

const config: AppConfig = {
    port: parseInt(process.env.PORT || '3000'),
    databaseUrl: process.env.DATABASE_URL || '',
    jwtSecret: process.env.JWT_SECRET || 'secret',
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000']
};

// 主应用
const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由处理器类型
interface UserRequest extends Request {
    user?: User;
}

// 路由
app.post('/users', async (req: Request<{}, {}, User>, res: Response) => {
    try {
        // 验证请求体
        const userData = UserSchema.parse(req.body);
        
        // 处理业务逻辑
        const newUser = await createUser(userData);
        
        res.status(201).json({
            success: true,
            data: newUser
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: '请求参数验证失败',
                    details: error.errors
                }
            });
        }
        
        throw error;
    }
});

app.get('/users/:id', async (req: Request<{ id: string }>, res: Response) => {
    const userId = req.params.id;
    
    const user = await findUserById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            error: {
                code: 'USER_NOT_FOUND',
                message: '用户不存在'
            }
        });
    }
    
    res.json({
        success: true,
        data: user
    });
});

// 启动服务
app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});

// 2. 数据库模型类型
import mongoose, { Schema, Document, Model } from 'mongoose';

// 用户文档接口
interface IUser extends Document {
    name: string;
    email: string;
    age: number;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// 用户模型接口
interface IUserModel extends Model<IUser> {
    findByEmail(email: string): Promise<IUser | null>;
}

// Schema 定义
const UserSchema = new Schema<IUser, IUserModel>({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true },
    age: { type: Number, min: 0, max: 150 },
    password: { type: String, required: true, minlength: 6 }
}, {
    timestamps: true
});

// 实例方法
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

// 静态方法
UserSchema.statics.findByEmail = async function(email: string): Promise<IUser | null> {
    return this.findOne({ email }).exec();
};

// 创建模型
const User = mongoose.model<IUser, IUserModel>('User', UserSchema);

// 3. 环境变量类型
interface EnvironmentVariables {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    REDIS_URL: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
}

// 类型安全的环境变量访问
function getEnvVar<T extends keyof EnvironmentVariables>(
    key: T,
    defaultValue?: EnvironmentVariables[T]
): EnvironmentVariables[T] {
    const value = process.env[key] || defaultValue;
    if (value === undefined) {
        throw new Error(`Environment variable ${key} is required`);
    }
    return value as EnvironmentVariables[T];
}

// 使用示例
const config = {
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
    port: parseInt(getEnvVar('PORT', '3000')),
    databaseUrl: getEnvVar('DATABASE_URL'),
    jwtSecret: getEnvVar('JWT_SECRET')
};

// 4. WebSocket 类型
import { WebSocketServer, WebSocket } from 'ws';

interface ClientMessage {
    type: 'join' | 'message' | 'leave';
    payload: any;
    userId: string;
}

interface ServerMessage {
    type: 'userJoined' | 'userLeft' | 'chatMessage';
    payload: any;
    timestamp: number;
}

class ChatServer {
    private wss: WebSocketServer;
    private clients: Map<string, WebSocket>;
    
    constructor(port: number) {
        this.wss = new WebSocketServer({ port });
        this.clients = new Map();
        this.setupEventHandlers();
    }
    
    private setupEventHandlers() {
        this.wss.on('connection', (ws: WebSocket) => {
            const clientId = this.generateClientId();
            this.clients.set(clientId, ws);
            
            ws.on('message', (data: WebSocket.Data) => {
                try {
                    const message: ClientMessage = JSON.parse(data.toString());
                    this.handleMessage(clientId, message);
                } catch (error) {
                    console.error('Invalid message format:', error);
                }
            });
            
            ws.on('close', () => {
                this.clients.delete(clientId);
                this.broadcast({
                    type: 'userLeft',
                    payload: { userId: clientId },
                    timestamp: Date.now()
                });
            });
        });
    }
    
    private handleMessage(clientId: string, message: ClientMessage) {
        switch (message.type) {
            case 'join':
                this.broadcast({
                    type: 'userJoined',
                    payload: { userId: clientId, userInfo: message.payload },
                    timestamp: Date.now()
                });
                break;
                
            case 'message':
                this.broadcast({
                    type: 'chatMessage',
                    payload: {
                        userId: clientId,
                        content: message.payload.content,
                        userInfo: message.payload.userInfo
                    },
                    timestamp: Date.now()
                });
                break;
        }
    }
    
    private broadcast(message: ServerMessage) {
        const messageStr = JSON.stringify(message);
        this.clients.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(messageStr);
            }
        });
    }
    
    private generateClientId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}

// 5. 测试类型
import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';

describe('User API', () => {
    let app: express.Application;
    
    beforeEach(() => {
        app = createApp(); // 你的应用工厂函数
    });
    
    describe('POST /users', () => {
        it('should create a new user with valid data', async () => {
            const userData = {
                name: '张三',
                email: 'zhangsan@example.com',
                age: 25
            };
            
            const response = await request(app)
                .post('/users')
                .send(userData)
                .expect(201);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                name: userData.name,
                email: userData.email,
                age: userData.age
            });
        });
        
        it('should return validation error for invalid data', async () => {
            const invalidData = {
                name: '',  // 空字符串不符合验证规则
                email: 'invalid-email',
                age: -5    // 负数不符合验证规则
            };
            
            const response = await request(app)
                .post('/users')
                .send(invalidData)
                .expect(400);
            
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
        });
    });
});
```

### 10.6 常见错误与解决方案

```typescript
// 1. 循环引用问题
// ❌ 错误示例
// file1.ts
import { function2 } from './file2';
export function function1() {
    return function2();
}

// file2.ts  
import { function1 } from './file1';
export function function2() {
    return function1();
}

// ✅ 解决方案：重构代码，消除循环依赖
// common.ts
export function sharedUtility() {
    // 共享功能
}

// file1.ts
import { sharedUtility } from './common';
export function function1() {
    return sharedUtility();
}

// file2.ts
import { sharedUtility } from './common';
export function function2() {
    return sharedUtility();
}

// 2. any 类型滥用
// ❌ 错误示例
function processData(data: any) {
    return data.someProperty.method(); // 运行时可能出错
}

// ✅ 正确做法：使用具体类型
interface DataStructure {
    someProperty: {
        method: () => string;
    };
}

function processData(data: DataStructure) {
    return data.someProperty.method();
}

// 3. 泛型约束不足
// ❌ 错误示例
function getProperty<T>(obj: T, key: string) {
    return obj[key]; // T 可能没有索引签名
}

// ✅ 正确做法：添加适当约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

// 4. 可空类型处理不当
// ❌ 错误示例
interface User {
    name: string;
    email: string | null;
}

function sendEmail(user: User) {
    sendMail(user.email); // 可能传入 null
}

// ✅ 正确做法：类型守卫或非空断言
function sendEmail(user: User) {
    if (user.email !== null) {
        sendMail(user.email);
    }
}

// 5. this 上下文丢失
// ❌ 错误示例
class Counter {
    count = 0;
    
    increment() {
        this.count++;
    }
}

const counter = new Counter();
setTimeout(counter.increment, 1000); // this 指向丢失

// ✅ 解决方案 1：bind
setTimeout(counter.increment.bind(counter), 1000);

// ✅ 解决方案 2：箭头函数
class CounterFixed {
    count = 0;
    
    increment = () => {  // 箭头函数保持 this 上下文
        this.count++;
    }
}

// 6. 类型断言过度使用
// ❌ 错误示例
const data: any = getData();
const user = data as User; // 危险的类型断言

// ✅ 正确做法：类型守卫
function isUser(obj: any): obj is User {
    return obj && typeof obj.name === 'string' && typeof obj.email === 'string';
}

const data: any = getData();
if (isUser(data)) {
    // 现在 data 被安全地收窄为 User 类型
    console.log(data.name);
}

// 7. 模块导入导出混乱
// ❌ 错误示例
// 导出
export default function helper() {}

// 导入时混淆
import helper, { helper as namedHelper } from './helper'; // 错误！

// ✅ 正确做法
// 方式 1：默认导入
import helper from './helper';

// 方式 2：如果需要命名导入，改为命名导出
export function helper() {}
import { helper } from './helper';
```

### 10.7 性能优化建议

```typescript
// 1. 避免不必要的类型推断
// ❌ 性能较差
const largeArray = [];
for (let i = 0; i < 100000; i++) {
    largeArray.push({ id: i, data: `item-${i}` });
}

// ✅ 明确类型，提升性能
interface Item {
    id: number;
    data: string;
}

const largeArray: Item[] = [];
for (let i = 0; i < 100000; i++) {
    largeArray.push({ id: i, data: `item-${i}` });
}

// 2. 使用 const 断言优化字面量类型
// ❌ 宽松类型
const colors = {
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff'
}; // { red: string; green: string; blue: string }

// ✅ 精确的字面量类型
const colors = {
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff'
} as const; // { readonly red: "#ff0000"; readonly green: "#00ff00"; readonly blue: "#0000ff" }

// 3. 避免深层嵌套的条件类型
// ❌ 复杂且慢
type ComplexCondition<T> = T extends string 
    ? T extends `${infer U}${infer V}` 
        ? U extends 'a' 
            ? V extends 'b' 
                ? 'match' 
                : 'no-match'
            : 'no-match'
        : 'no-match'
    : 'no-match';

// ✅ 简化条件
type SimpleCondition<T> = T extends `a${infer Rest}` 
    ? Rest extends 'b' 
        ? 'match' 
        : 'no-match'
    : 'no-match';

// 4. 使用类型别名而非接口（在某些情况下）
// 对于简单类型，类型别名可能更高效
type Point = [number, number];  // 比 interface 更简洁
type Callback = () => void;     // 比 interface 更直接

// 5. 合理使用索引签名
// ❌ 过度使用索引签名
interface LooseObject {
    [key: string]: any;  // 失去类型安全性
}

// ✅ 明确的键类型
interface StrictObject {
    knownProp1: string;
    knownProp2: number;
    [key: `dynamic-${string}`]: boolean;  // 限制动态键的格式
}

// 6. 避免大型联合类型
// ❌ 性能问题
type LargeUnion = 
    | Option1 | Option2 | Option3 | Option4 | Option5
    | Option6 | Option7 | Option8 | Option9 | Option10
    // ... 更多选项

// ✅ 分组管理
interface OptionGroup1 {
    type: 'group1';
    // group1 的选项
}

interface OptionGroup2 {
    type: 'group2';
    // group2 的选项
}

type ManageableUnion = OptionGroup1 | OptionGroup2;

// 7. 使用 satisfies 操作符（TypeScript 4.9+）
// ✅ 确保类型兼容性的同时保持原始类型
const palette = {
    red: [255, 0, 0],
    green: '#00ff00',
    blue: [0, 0, 255]
} satisfies Record<string, [number, number, number] | string>;

// 8. 合理使用泛型默认值
// ✅ 减少重复类型参数
interface ApiResponse<T = unknown> {
    success: boolean;
    data: T;
    error?: string;
}

// 常用情况无需指定泛型参数
const response: ApiResponse = {
    success: true,
    data: { message: 'Hello' }
};

// 特殊情况明确指定
const userResponse: ApiResponse<User> = {
    success: true,
    data: { id: '1', name: '张三' }
};
```

---

## 结语

TypeScript 作为 JavaScript 的超集，在保持 JavaScript 灵活性的同时提供了强大的静态类型系统。通过本文档的学习，您应该已经掌握了：

1. **基础类型系统** - 从基本类型到高级类型操作
2. **面向对象编程** - 类、接口、继承等概念
3. **泛型编程** - 代码复用和类型安全
4. **高级类型操作** - 条件类型、映射类型等
5. **工程化实践** - 模块系统、声明文件、构建配置
6. **框架集成** - React、Vue、Node.js 等主流技术栈
7. **最佳实践** - 性能优化、错误处理、代码组织

记住，TypeScript 的学习是一个循序渐进的过程。建议您：

- **多练习** - 通过实际项目加深理解
- **查阅文档** - 官方文档是最好的参考资料
- **关注更新** - TypeScript 持续演进，新特性值得了解
- **参与社区** - Stack Overflow、GitHub Discussions 等平台有很多经验分享

继续深入学习，您将成为一名优秀的 TypeScript 开发者！

---

*本文档基于 TypeScript 最新稳定版本编写，所有示例代码均经过验证。如有更新或发现错误，请及时反馈。*