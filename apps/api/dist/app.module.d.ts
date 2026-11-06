import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Strategy } from 'passport-jwt';
export declare enum Role {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    STAFF = "STAFF"
}
export declare enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PREPARING = "PREPARING",
    READY = "READY",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
type Data = Record<string, unknown> & {
    id?: string;
};
export declare class SupabaseService {
    private url;
    private key;
    constructor(c: ConfigService);
    query<T = Data>(table: string, o?: {
        method?: string;
        query?: Record<string, string>;
        body?: unknown;
    }): Promise<T[]>;
    list<T = Data>(t: string, q?: Record<string, string>): Promise<T[]>;
    one<T = Data>(t: string, q: Record<string, string>): Promise<NonNullable<T>>;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class ProductDto {
    name: string;
    description?: string;
    price: number;
    category: string;
    available?: boolean;
}
export declare class CategoryDto {
    name: string;
    description?: string;
    order?: number;
}
export declare class StatusDto {
    status: OrderStatus;
}
export declare class OrderDto {
    productId: string;
    quantity: number;
}
export declare const Roles: (...r: Role[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
export declare class RolesGuard implements CanActivate {
    canActivate(c: ExecutionContext): boolean;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private db;
    constructor(c: ConfigService, db: SupabaseService);
    validate(p: {
        sub: string;
    }): Promise<NonNullable<Data>>;
}
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    canActivate(c: ExecutionContext): boolean | Promise<boolean>;
}
export declare class AuthController {
    private db;
    private jwt;
    constructor(db: SupabaseService, jwt: JwtService);
    login(d: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string | undefined;
            name: unknown;
            email: unknown;
            role: unknown;
        };
    }>;
    me(r: {
        user: Data;
    }): {
        [x: string]: unknown;
        id?: string;
    };
}
export declare class ProductsController {
    private db;
    constructor(db: SupabaseService);
    list(): Promise<Data[]>;
    create(d: ProductDto): Promise<Data[]>;
    update(id: string, d: ProductDto): Promise<Data[]>;
    remove(id: string): Promise<Data[]>;
}
export declare class CategoriesController {
    private db;
    constructor(db: SupabaseService);
    list(): Promise<Data[]>;
    create(d: CategoryDto): Promise<Data[]>;
    update(id: string, d: CategoryDto): Promise<Data[]>;
    remove(id: string): Promise<Data[]>;
}
export declare class OrdersController {
    private db;
    constructor(db: SupabaseService);
    list(): Promise<Data[]>;
    get(id: string): Promise<NonNullable<Data>>;
    status(id: string, d: StatusDto): Promise<Data[]>;
    create(d: OrderDto[], r: {
        user: Data;
    }): Promise<Data[]>;
}
export declare class AnalyticsController {
    private db;
    constructor(db: SupabaseService);
    dashboard(): Promise<{
        orders: number;
        revenue: number;
        activeOrders: number;
        byStatus: {
            _id: string;
            count: number;
        }[];
    }>;
}
export declare class HealthController {
    health(): {
        status: string;
        service: string;
        database: string;
    };
    health2(): {
        status: string;
        service: string;
        database: string;
    };
}
export declare class AppModule {
}
export {};
