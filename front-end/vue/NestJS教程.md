# NestJS 完整教程：从入门到进阶

---

## 一、NestJS 概述与环境搭建

### 1.1 NestJS 是什么

NestJS 是一个基于 TypeScript 的渐进式 Node.js 框架，用于构建高效、可扩展的服务端应用。核心理念：

- **TypeScript 优先**：完整的类型支持
- **模块化架构**：借鉴 Angular 的模块设计
- **装饰器驱动**：使用装饰器声明路由、依赖注入等
- **依赖注入（DI）**：内置 IoC 容器
- **面向切面编程（AOP）**：中间件、守卫、拦截器、管道、过滤器
- **底层灵活**：默认 Express，可切换为 Fastify

### 1.2 创建项目

```bash
# 安装 Nest CLI
npm install -g @nestjs/cli

# 创建项目
nest new my-nest-app

# 选择包管理器（推荐 pnpm）
# 启动开发服务器
cd my-nest-app
npm run start:dev
```

### 1.3 项目目录结构

```
my-nest-app/
├── src/
│   ├── app.controller.ts       # 根控制器
│   ├── app.controller.spec.ts  # 控制器测试
│   ├── app.module.ts           # 根模块
│   ├── app.service.ts          # 根服务
│   └── main.ts                 # 入口文件
├── test/
│   ├── app.e2e-spec.ts         # E2E 测试
│   └── jest-e2e.json           # E2E 测试配置
├── nest-cli.json               # Nest CLI 配置
├── tsconfig.json
└── package.json
```

### 1.4 入口文件

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 全局前缀
  app.setGlobalPrefix('api')

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,          // 自动剥离 DTO 中未定义的属性
    forbidNonWhitelisted: true, // 存在额外属性时抛出错误
    transform: true,          // 自动类型转换
  }))

  // CORS
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })

  await app.listen(3000)
  console.log(`Application is running on: http://localhost:3000`)
}

bootstrap()
```

---

## 二、核心概念

### 2.1 控制器 Controller

```typescript
// 使用 CLI 生成
// nest g controller users
// nest g resource users  （生成完整的 CRUD 模块）

import {
  Controller, Get, Post, Put, Delete, Patch,
  Param, Query, Body, Headers, Ip,
  HttpCode, HttpStatus, Header, Redirect,
  ParseIntPipe, DefaultValuePipe
} from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto, UpdateUserDto } from './dto'

@Controller('users') // 路由前缀 /api/users
export class UsersController {

  // 依赖注入：NestJS 自动实例化并注入 UsersService
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users?page=1&limit=10
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.usersService.findAll(page, limit)
  }

  // GET /api/users/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id)
  }

  // POST /api/users
  @Post()
  @HttpCode(HttpStatus.CREATED) // 自定义状态码
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  // PUT /api/users/:id
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto)
  }

  // DELETE /api/users/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id)
  }

  // 获取请求头
  @Get('me')
  getMe(@Headers('authorization') auth: string) {
    return { auth }
  }
}
```

### 2.2 服务 Provider / Service

```typescript
// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateUserDto, UpdateUserDto } from './dto'

interface User {
  id: number
  name: string
  email: string
}

@Injectable() // 标记为可注入的 Provider
export class UsersService {
  private users: User[] = [
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', email: 'lisi@example.com' },
  ]
  private nextId = 3

  findAll(page: number, limit: number) {
    const start = (page - 1) * limit
    return {
      data: this.users.slice(start, start + limit),
      total: this.users.length,
      page,
      limit,
    }
  }

  findOne(id: number): User {
    const user = this.users.find(u => u.id === id)
    if (!user) {
      // NestJS 内置异常类，自动返回对应的 HTTP 状态码
      throw new NotFoundException(`用户 #${id} 不存在`)
    }
    return user
  }

  create(dto: CreateUserDto): User {
    const user: User = { id: this.nextId++, ...dto }
    this.users.push(user)
    return user
  }

  update(id: number, dto: UpdateUserDto): User {
    const index = this.users.findIndex(u => u.id === id)
    if (index === -1) {
      throw new NotFoundException(`用户 #${id} 不存在`)
    }
    this.users[index] = { ...this.users[index], ...dto }
    return this.users[index]
  }

  remove(id: number): void {
    const index = this.users.findIndex(u => u.id === id)
    if (index === -1) {
      throw new NotFoundException(`用户 #${id} 不存在`)
    }
    this.users.splice(index, 1)
  }
}
```

### 2.3 模块 Module

```typescript
// src/users/users.module.ts
import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  controllers: [UsersController],   // 该模块的控制器
  providers: [UsersService],        // 该模块的服务提供者
  exports: [UsersService],          // 导出给其他模块使用
})
export class UsersModule {}

// src/app.module.ts - 根模块
import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // 全局配置模块
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
```

### 2.4 DTO 数据传输对象

```bash
npm install class-validator class-transformer
```

```typescript
// src/users/dto/create-user.dto.ts
import {
  IsString, IsEmail, IsOptional, IsInt,
  MinLength, MaxLength, Min, Max,
  IsEnum, IsArray, ValidateNested, IsNotEmpty
} from 'class-validator'
import { Type, Transform } from 'class-transformer'

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export class CreateUserDto {
  @IsString({ message: '姓名必须是字符串' })
  @IsNotEmpty({ message: '姓名不能为空' })
  @MinLength(2, { message: '姓名至少2个字符' })
  @MaxLength(50, { message: '姓名最多50个字符' })
  name: string

  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @Transform(({ value }) => value?.toLowerCase()?.trim()) // 自动转小写去空格
  email: string

  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  password: string

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole
}

// src/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'

// PartialType 将所有字段变为可选
export class UpdateUserDto extends PartialType(CreateUserDto) {}

// 嵌套 DTO 验证
class AddressDto {
  @IsString()
  city: string

  @IsString()
  street: string
}

class CreateOrderDto {
  @IsString()
  productName: string

  @ValidateNested() // 嵌套验证
  @Type(() => AddressDto) // 转换类型
  address: AddressDto
}
```

---

## 三、中间件、管道、守卫、拦截器、过滤器

### 3.1 请求生命周期

```
请求 → 中间件(Middleware) → 守卫(Guard) → 拦截器(前)(Interceptor)
     → 管道(Pipe) → 控制器方法 → 拦截器(后) → 异常过滤器(Filter) → 响应
```

### 3.2 中间件

```typescript
// src/common/middleware/logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now()
    console.log(`→ ${req.method} ${req.url}`)

    res.on('finish', () => {
      const duration = Date.now() - start
      console.log(`← ${req.method} ${req.url} ${res.statusCode} ${duration}ms`)
    })

    next()
  }
}

// 在模块中注册中间件
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common'

@Module({ /* ... */ })
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*') // 应用到所有路由
      // .forRoutes({ path: 'users', method: RequestMethod.ALL })
      // .exclude({ path: 'health', method: RequestMethod.GET })
  }
}
```

### 3.3 异常过滤器

```typescript
// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch() // 捕获所有异常
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = '服务器内部错误'

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}

// 注册：全局使用
// main.ts 中：app.useGlobalFilters(new AllExceptionsFilter())
// 或在 Controller/方法上使用装饰器：@UseFilters(AllExceptionsFilter)
```

### 3.4 管道 Pipe

```typescript
// 内置管道
import {
  ParseIntPipe,      // 将字符串转为整数
  ParseBoolPipe,     // 将字符串转为布尔值
  ParseUUIDPipe,     // 验证 UUID 格式
  ParseArrayPipe,    // 将字符串转为数组
  DefaultValuePipe,  // 提供默认值
  ValidationPipe,    // 使用 class-validator 验证 DTO
} from '@nestjs/common'

// 自定义管道
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common'

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10)
    if (isNaN(val) || val <= 0) {
      throw new BadRequestException(`${metadata.data} 必须是正整数`)
    }
    return val
  }
}

// 使用
@Get(':id')
findOne(@Param('id', ParsePositiveIntPipe) id: number) {
  return this.service.findOne(id)
}
```

### 3.5 守卫 Guard

```typescript
// src/common/guards/auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractToken(request)

    if (!token) {
      throw new UnauthorizedException('缺少认证令牌')
    }

    try {
      const payload = await this.jwtService.verifyAsync(token)
      request.user = payload // 将用户信息附加到请求对象
    } catch {
      throw new UnauthorizedException('令牌无效或已过期')
    }

    return true
  }

  private extractToken(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}

// 角色守卫
import { SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

// 自定义装饰器
export const ROLES_KEY = 'roles'
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles)

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) return true // 没有角色要求，放行

    const { user } = context.switchToHttp().getRequest()
    return requiredRoles.some(role => user.roles?.includes(role))
  }
}

// 使用
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  @Get('dashboard')
  @Roles('admin')
  getDashboard() {
    return { message: '管理员面板' }
  }
}
```

### 3.6 拦截器 Interceptor

```typescript
// src/common/interceptors/transform.interceptor.ts
import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler
} from '@nestjs/common'
import { Observable, map, tap } from 'rxjs'

// 统一响应格式拦截器
interface Response<T> {
  code: number
  message: string
  data: T
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        code: 200,
        message: 'success',
        data,
      })),
    )
  }
}

// 日志拦截器
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const method = request.method
    const url = request.url
    const now = Date.now()

    console.log(`→ ${method} ${url}`)

    return next.handle().pipe(
      tap(() => {
        console.log(`← ${method} ${url} ${Date.now() - now}ms`)
      }),
    )
  }
}

// 缓存拦截器
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, any>()

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const key = request.url

    if (this.cache.has(key)) {
      return new Observable(subscriber => {
        subscriber.next(this.cache.get(key))
        subscriber.complete()
      })
    }

    return next.handle().pipe(
      tap(data => this.cache.set(key, data)),
    )
  }
}

// 全局注册
// main.ts: app.useGlobalInterceptors(new TransformInterceptor())
```

---

## 四、自定义装饰器

```typescript
// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

// 参数装饰器：获取当前登录用户
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user

    // 如果指定了 data，返回用户的某个字段
    return data ? user?.[data] : user
  },
)

// 使用
@Get('profile')
@UseGuards(AuthGuard)
getProfile(@CurrentUser() user: any) {
  return user
}

@Get('name')
@UseGuards(AuthGuard)
getName(@CurrentUser('name') name: string) {
  return { name }
}
```

```typescript
// 组合装饰器：将多个装饰器合并为一个
import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common'

export function Auth(...roles: string[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
  )
}

// 使用：一个装饰器代替多个
@Get('admin')
@Auth('admin')
adminOnly() {
  return { message: '仅管理员' }
}
```

---

## 五、数据库集成

### 5.1 TypeORM 集成

```bash
npm install @nestjs/typeorm typeorm mysql2
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 3306),
        username: config.get('DB_USERNAME', 'root'),
        password: config.get('DB_PASSWORD', 'password'),
        database: config.get('DB_NAME', 'myapp'),
        autoLoadEntities: true,  // 自动加载实体
        synchronize: config.get('NODE_ENV') !== 'production', // 生产环境禁用
      }),
    }),
  ],
})
export class AppModule {}
```

```typescript
// src/users/entities/user.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany
} from 'typeorm'
import { Post } from '../../posts/entities/post.entity'

@Entity('users') // 表名
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 50 })
  name: string

  @Column({ unique: true })
  email: string

  @Column({ select: false }) // 查询时默认不返回
  password: string

  @Column({ default: true })
  isActive: boolean

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role: string

  @OneToMany(() => Post, post => post.author)
  posts: Post[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
```

```typescript
// src/users/users.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'

@Module({
  imports: [TypeOrmModule.forFeature([User])], // 注册实体
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

```typescript
// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { CreateUserDto, UpdateUserDto } from './dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(page: number, limit: number) {
    const [data, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['posts'], // 加载关联数据
    })
    return { data, total, page, limit }
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['posts'],
    })
    if (!user) {
      throw new NotFoundException(`用户 #${id} 不存在`)
    }
    return user
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(dto) // 创建实体实例
    return this.userRepository.save(user)         // 保存到数据库
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id)
    Object.assign(user, dto)
    return this.userRepository.save(user)
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundException(`用户 #${id} 不存在`)
    }
  }

  // QueryBuilder 复杂查询
  async search(keyword: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'post')
      .where('user.name LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('user.email LIKE :keyword', { keyword: `%${keyword}%` })
      .orderBy('user.createdAt', 'DESC')
      .getMany()
  }
}
```

### 5.2 Prisma 集成

```bash
npm install prisma @prisma/client
npx prisma init
```

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(50)
  email     String   @unique
  password  String
  role      Role     @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String   @db.Text
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())

  @@map("posts")
}

enum Role {
  USER
  ADMIN
}
```

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}

// 使用 Prisma Service
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number, limit: number) {
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { posts: true },
        select: { id: true, name: true, email: true, role: true, createdAt: true, posts: true },
      }),
      this.prisma.user.count(),
    ])
    return { data, total, page, limit }
  }

  async create(dto: CreateUserDto) {
    return this.prisma.user.create({ data: dto })
  }
}
```

---

## 六、认证与授权

### 6.1 JWT 认证

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local bcryptjs
npm install -D @types/passport-jwt @types/passport-local @types/bcryptjs
```

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

```typescript
// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { UsersService } from '../users/users.service'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email)
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role }
    return {
      user,
      accessToken: this.jwtService.sign(payload),
    }
  }

  async register(dto: any) {
    const hashedPassword = await bcrypt.hash(dto.password, 10)
    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    })
    return this.login(user)
  }
}
```

```typescript
// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    })
  }

  // 验证通过后，返回值会被挂载到 request.user
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, role: payload.role }
  }
}
```

```typescript
// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: any) {
    return this.authService.register(dto)
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req) {
    return this.authService.login(req.user)
  }
}

// 在其他控制器中保护路由
@Controller('users')
export class UsersController {
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }
}
```

---

## 七、高级特性

### 7.1 配置管理

```bash
npm install @nestjs/config
```

```typescript
// config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
})

// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
  ],
})
export class AppModule {}

// 使用
@Injectable()
export class SomeService {
  constructor(private config: ConfigService) {}

  getDbHost() {
    return this.config.get<string>('database.host')
  }
}
```

### 7.2 文件上传

```typescript
// src/upload/upload.controller.ts
import {
  Controller, Post, UseInterceptors,
  UploadedFile, UploadedFiles, ParseFilePipe,
  MaxFileSizeValidator, FileTypeValidator
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'

@Controller('upload')
export class UploadController {
  // 单文件上传
  @Post('single')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + extname(file.originalname))
      }
    }),
  }))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return { filename: file.filename, size: file.size }
  }

  // 多文件上传
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // 最多 10 个文件
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return files.map(f => ({ filename: f.filename, size: f.size }))
  }
}
```

### 7.3 定时任务

```bash
npm install @nestjs/schedule
```

```typescript
import { Injectable } from '@nestjs/common'
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule'

@Injectable()
export class TasksService {
  // Cron 表达式
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleDailyCleanup() {
    console.log('每天凌晨清理过期数据')
  }

  @Cron('0 */5 * * * *') // 每 5 分钟
  handleHealthCheck() {
    console.log('健康检查')
  }

  // 固定间隔（毫秒）
  @Interval(60000) // 每分钟
  handleInterval() {
    console.log('定期同步数据')
  }

  // 延迟执行（只执行一次）
  @Timeout(5000)
  handleTimeout() {
    console.log('启动 5 秒后执行一次')
  }
}
```

### 7.4 WebSocket 网关

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

```typescript
import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, MessageBody,
  ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  handleConnection(client: Socket) {
    console.log(`客户端连接: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    console.log(`客户端断开: ${client.id}`)
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(room)
    this.server.to(room).emit('notification', `${client.id} 加入了 ${room}`)
    return { event: 'joined', data: room }
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { room: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.room).emit('message', {
      sender: client.id,
      content: data.content,
      timestamp: new Date(),
    })
  }

  // 服务端主动推送
  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data)
  }
}
```

---

## 八、Swagger 文档

```bash
npm install @nestjs/swagger
```

```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API 文档')
    .setVersion('1.0')
    .addBearerAuth() // JWT 认证
    .addTag('users', '用户管理')
    .addTag('auth', '认证')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api-docs', app, document) // 访问 /api-docs

  await app.listen(3000)
}
```

```typescript
// 在 DTO 中添加 Swagger 装饰器
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: '张三', minLength: 2 })
  @IsString()
  name: string

  @ApiProperty({ description: '邮箱', example: 'zhangsan@example.com' })
  @IsEmail()
  email: string

  @ApiPropertyOptional({ description: '年龄', example: 25 })
  @IsOptional()
  @IsInt()
  age?: number
}

// 在 Controller 中添加文档装饰器
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ status: 200, description: '成功返回用户列表' })
  findAll() {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  create(@Body() dto: CreateUserDto) {}
}
```

---

## 九、测试

### 9.1 单元测试

```typescript
// src/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { NotFoundException } from '@nestjs/common'

describe('UsersService', () => {
  let service: UsersService

  // 模拟 Repository
  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    findAndCount: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findOne', () => {
    it('应该返回指定用户', async () => {
      const user = { id: 1, name: '张三', email: 'zhangsan@test.com' }
      mockRepository.findOne.mockResolvedValue(user)

      const result = await service.findOne(1)
      expect(result).toEqual(user)
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['posts'],
      })
    })

    it('用户不存在时应抛出 NotFoundException', async () => {
      mockRepository.findOne.mockResolvedValue(null)
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('应该创建并返回新用户', async () => {
      const dto = { name: '王五', email: 'wangwu@test.com', password: '123456' }
      const user = { id: 3, ...dto }

      mockRepository.create.mockReturnValue(user)
      mockRepository.save.mockResolvedValue(user)

      const result = await service.create(dto as any)
      expect(result).toEqual(user)
    })
  })
})
```

### 9.2 E2E 测试

```typescript
// test/users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'

describe('UsersController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('/api/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/users')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array)
        expect(res.body).toHaveProperty('total')
      })
  })

  it('/api/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/users')
      .send({ name: '测试用户', email: 'test@test.com', password: '123456' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id')
        expect(res.body.name).toBe('测试用户')
      })
  })

  it('/api/users (POST) - 验证失败', () => {
    return request(app.getHttpServer())
      .post('/api/users')
      .send({ name: '' }) // 缺少必填字段
      .expect(400)
  })
})
```

---

## 十、项目结构最佳实践

```
src/
├── common/                      # 公共模块
│   ├── decorators/              # 自定义装饰器
│   ├── dto/                     # 公共 DTO
│   ├── entities/                # 公共实体
│   ├── enums/                   # 枚举
│   ├── exceptions/              # 自定义异常
│   ├── filters/                 # 异常过滤器
│   ├── guards/                  # 守卫
│   ├── interceptors/            # 拦截器
│   ├── middleware/               # 中间件
│   ├── pipes/                   # 管道
│   └── utils/                   # 工具函数
├── config/                      # 配置文件
├── modules/                     # 业务模块
│   ├── auth/                    # 认证模块
│   │   ├── dto/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── users/                   # 用户模块
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── users.service.spec.ts
│   └── posts/                   # 文章模块
├── prisma/                      # Prisma 相关
│   └── prisma.service.ts
├── app.module.ts                # 根模块
└── main.ts                      # 入口
```

---

> **总结**：NestJS 的核心优势在于其完善的架构设计（模块化 + DI + AOP），非常适合构建大型企业级应用。建议先理解 Controller、Service、Module 三大核心概念和依赖注入机制，然后学习管道、守卫、拦截器等 AOP 特性，再深入数据库集成和认证授权。NestJS 的"约定优于配置"理念可以让团队保持一致的代码风格。
