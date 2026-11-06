var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Module, Injectable, SetMetadata, UnauthorizedException, ForbiddenException, NotFoundException, Controller, Get, Post, Patch, Delete, Body, Param, Request } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule, AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as bcrypt from 'bcrypt';
import { IsEmail, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
export var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["MANAGER"] = "MANAGER";
    Role["STAFF"] = "STAFF";
})(Role || (Role = {}));
export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PREPARING"] = "PREPARING";
    OrderStatus["READY"] = "READY";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (OrderStatus = {}));
let SupabaseService = class SupabaseService {
    url;
    key;
    constructor(c) { this.url = c.getOrThrow('SUPABASE_URL').replace(/\/$/, ''); this.key = c.get('SUPABASE_SERVICE_ROLE_KEY') ?? c.getOrThrow('SUPABASE_SECRET_KEY'); }
    async query(table, o = {}) { const p = new URLSearchParams(o.query); const r = await fetch(this.url + '/rest/v1/' + table + (p.size ? '?' + p : ''), { method: o.method ?? 'GET', headers: { apikey: this.key, Authorization: 'Bearer ' + this.key, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: o.body === undefined ? undefined : JSON.stringify(o.body) }); if (!r.ok)
        throw new Error('Supabase ' + r.status + ': ' + await r.text()); if (r.status === 204)
        return []; return await r.json(); }
    async list(t, q = {}) { return this.query(t, { query: q }); }
    async one(t, q) { const rows = await this.list(t, { ...q, limit: '1' }); if (!rows[0])
        throw new NotFoundException('Ressource introuvable'); return rows[0]; }
};
SupabaseService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], SupabaseService);
export { SupabaseService };
export class LoginDto {
    email;
    password;
}
__decorate([
    IsEmail(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
export class ProductDto {
    name;
    description;
    price;
    category;
    available;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], ProductDto.prototype, "name", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], ProductDto.prototype, "description", void 0);
__decorate([
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], ProductDto.prototype, "price", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], ProductDto.prototype, "category", void 0);
__decorate([
    IsOptional(),
    __metadata("design:type", Boolean)
], ProductDto.prototype, "available", void 0);
export class CategoryDto {
    name;
    description;
    order;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], CategoryDto.prototype, "name", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CategoryDto.prototype, "description", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], CategoryDto.prototype, "order", void 0);
export class StatusDto {
    status;
}
__decorate([
    IsEnum(OrderStatus),
    __metadata("design:type", String)
], StatusDto.prototype, "status", void 0);
export class OrderDto {
    productId;
    quantity;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], OrderDto.prototype, "productId", void 0);
__decorate([
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], OrderDto.prototype, "quantity", void 0);
export const Roles = (...r) => SetMetadata('roles', r);
export const Public = () => SetMetadata('public', true);
let RolesGuard = class RolesGuard {
    canActivate(c) { const roles = Reflect.getMetadata('roles', c.getHandler()); if (!roles)
        return true; const u = c.switchToHttp().getRequest().user; if (!u || !roles.includes(u.role))
        throw new ForbiddenException('Action non autorisée'); return true; }
};
RolesGuard = __decorate([
    Injectable()
], RolesGuard);
export { RolesGuard };
let JwtStrategy = class JwtStrategy extends PassportStrategy(Strategy) {
    db;
    constructor(c, db) {
        super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: c.getOrThrow('JWT_SECRET') });
        this.db = db;
    }
    async validate(p) { return this.db.one('users', { id: 'eq.' + p.sub, active: 'eq.true' }); }
};
JwtStrategy = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService, SupabaseService])
], JwtStrategy);
export { JwtStrategy };
let JwtAuthGuard = class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(c) { if (Reflect.getMetadata('public', c.getHandler()))
        return true; return super.canActivate(c); }
};
JwtAuthGuard = __decorate([
    Injectable()
], JwtAuthGuard);
export { JwtAuthGuard };
let AuthController = class AuthController {
    db;
    jwt;
    constructor(db, jwt) {
        this.db = db;
        this.jwt = jwt;
    }
    async login(d) { const u = await this.db.one('users', { email: 'eq.' + d.email, active: 'eq.true' }); const passwordHash = typeof u.password_hash === 'string' ? u.password_hash : ''; if (!passwordHash || !(await bcrypt.compare(d.password, passwordHash)))
        throw new UnauthorizedException('Identifiants invalides'); return { accessToken: await this.jwt.signAsync({ sub: u.id, role: u.role }), user: { id: u.id, name: u.name, email: u.email, role: u.role } }; }
    me(r) { const { password_hash: _, ...safe } = r.user; return safe; }
};
__decorate([
    Public(),
    Post('login'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    Get('me'),
    __param(0, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
AuthController = __decorate([
    Controller('auth'),
    __metadata("design:paramtypes", [SupabaseService, JwtService])
], AuthController);
export { AuthController };
let ProductsController = class ProductsController {
    db;
    constructor(db) {
        this.db = db;
    }
    list() { return this.db.list('products', { select: '*,category:categories(id,name)', order: 'name.asc' }); }
    create(d) { return this.db.query('products', { method: 'POST', body: { name: d.name, description: d.description, price: d.price, category_id: d.category, available: d.available ?? true } }); }
    update(id, d) { return this.db.query('products', { method: 'PATCH', query: { id: 'eq.' + id }, body: { name: d.name, description: d.description, price: d.price, category_id: d.category, available: d.available } }); }
    remove(id) { return this.db.query('products', { method: 'PATCH', query: { id: 'eq.' + id }, body: { available: false } }); }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "list", null);
__decorate([
    Post(),
    Roles(Role.ADMIN, Role.MANAGER),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "create", null);
__decorate([
    Patch(':id'),
    Roles(Role.ADMIN, Role.MANAGER),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    Roles(Role.ADMIN, Role.MANAGER),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
ProductsController = __decorate([
    Controller('products'),
    __metadata("design:paramtypes", [SupabaseService])
], ProductsController);
export { ProductsController };
let CategoriesController = class CategoriesController {
    db;
    constructor(db) {
        this.db = db;
    }
    list() { return this.db.list('categories', { active: 'eq.true', order: 'display_order.asc,name.asc' }); }
    create(d) { return this.db.query('categories', { method: 'POST', body: { name: d.name, description: d.description, display_order: d.order ?? 0, active: true } }); }
    update(id, d) { return this.db.query('categories', { method: 'PATCH', query: { id: 'eq.' + id }, body: { name: d.name, description: d.description, display_order: d.order } }); }
    remove(id) { return this.db.query('categories', { method: 'PATCH', query: { id: 'eq.' + id }, body: { active: false } }); }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "list", null);
__decorate([
    Post(),
    Roles(Role.ADMIN, Role.MANAGER),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CategoryDto]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "create", null);
__decorate([
    Patch(':id'),
    Roles(Role.ADMIN, Role.MANAGER),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CategoryDto]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "update", null);
__decorate([
    Delete(':id'),
    Roles(Role.ADMIN, Role.MANAGER),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "remove", null);
CategoriesController = __decorate([
    Controller('categories'),
    __metadata("design:paramtypes", [SupabaseService])
], CategoriesController);
export { CategoriesController };
let OrdersController = class OrdersController {
    db;
    constructor(db) {
        this.db = db;
    }
    list() { return this.db.list('orders', { select: '*,created_by:users(id,name,email)', order: 'created_at.desc' }); }
    get(id) { return this.db.one('orders', { id: 'eq.' + id }); }
    async status(id, d) { const o = await this.db.one('orders', { id: 'eq.' + id }); const a = { PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED], CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED], PREPARING: [OrderStatus.READY], READY: [OrderStatus.COMPLETED], COMPLETED: [], CANCELLED: [] }; if (!a[o.status].includes(d.status))
        throw new ForbiddenException('Transition de statut impossible'); return this.db.query('orders', { method: 'PATCH', query: { id: 'eq.' + id }, body: { status: d.status } }); }
    async create(d, r) { const lines = []; for (const i of d) {
        const p = await this.db.one('products', { id: 'eq.' + i.productId, available: 'eq.true' });
        lines.push({ productId: String(p.id), name: String(p.name), unitPrice: Number(p.price), quantity: i.quantity });
    } return this.db.query('orders', { method: 'POST', body: { number: 'CMD-' + Date.now(), lines, total: lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0), status: OrderStatus.PENDING, created_by: r.user.id } }); }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "list", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "get", null);
__decorate([
    Patch(':id/status'),
    Roles(Role.ADMIN, Role.MANAGER, Role.STAFF),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, StatusDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "status", null);
__decorate([
    Post(),
    __param(0, Body()),
    __param(1, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
OrdersController = __decorate([
    Controller('orders'),
    __metadata("design:paramtypes", [SupabaseService])
], OrdersController);
export { OrdersController };
let AnalyticsController = class AnalyticsController {
    db;
    constructor(db) {
        this.db = db;
    }
    async dashboard() { const o = await this.db.list('orders'); const valid = o.filter(x => x.status !== OrderStatus.CANCELLED); const by = o.reduce((a, x) => { const s = String(x.status); a[s] = (a[s] ?? 0) + 1; return a; }, {}); return { orders: o.length, revenue: valid.reduce((s, x) => s + Number(x.total), 0), activeOrders: o.filter(x => [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY].includes(x.status)).length, byStatus: Object.entries(by).map(([_id, count]) => ({ _id, count })) }; }
};
__decorate([
    Get('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "dashboard", null);
AnalyticsController = __decorate([
    Controller('analytics'),
    __metadata("design:paramtypes", [SupabaseService])
], AnalyticsController);
export { AnalyticsController };
let HealthController = class HealthController {
    health() { return { status: 'ok', service: 'gestion-staff-api', database: 'supabase' }; }
    health2() { return this.health(); }
};
__decorate([
    Public(),
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "health", null);
__decorate([
    Public(),
    Get('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "health2", null);
HealthController = __decorate([
    Controller()
], HealthController);
export { HealthController };
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({ imports: [ConfigModule.forRoot({ isGlobal: true }), PassportModule, JwtModule.registerAsync({ imports: [ConfigModule], useFactory: (c) => ({ secret: c.getOrThrow('JWT_SECRET'), signOptions: { expiresIn: c.get('JWT_EXPIRES_IN', '1d') } }), inject: [ConfigService] })], controllers: [AuthController, ProductsController, CategoriesController, OrdersController, AnalyticsController, HealthController], providers: [SupabaseService, JwtStrategy, RolesGuard, { provide: APP_GUARD, useClass: JwtAuthGuard }, { provide: APP_GUARD, useClass: RolesGuard }] })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map