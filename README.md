# Next.js Clean Architecture Template

A production-ready template for building scalable Next.js 15+ applications using clean architecture principles, dependency injection, and the repository pattern.

## 🏗️ Architecture Overview

This template follows **Clean Architecture** principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                      │
│  (Components, Pages, Hooks, Server Actions)             │
├─────────────────────────────────────────────────────────┤
│                    Domain Layer                          │
│  (Business Logic, Entities, Services, Interfaces)       │
├─────────────────────────────────────────────────────────┤
│                     Data Layer                           │
│  (Repository Implementations, Mappers, Entities)        │
├─────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                    │
│  (Database, External APIs, Third-party Services)        │
└─────────────────────────────────────────────────────────┘
```

### Key Principles

- **Clean Architecture**: Separation of domain, data, and presentation layers
- **Dependency Injection**: Using Inversify for service and repository management
- **Repository Pattern**: Abstract data access with clear interfaces
- **Single Responsibility**: Each component, service, and function has one clear purpose
- **Type Safety**: Full TypeScript with strict mode enabled

## 📁 Project Structure

```
nextjs-clean-architecture-template/
├── actions/              # Next.js server actions
│   └── users.ts         # Example user actions
├── app/                 # Next.js 15 App Router
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   ├── globals.css      # Global styles
│   └── users/           # Example users page
├── components/          # React components
│   └── users/           # User-related components
├── hooks/               # Custom React hooks
│   └── users/           # User-related hooks
├── lib/                 # Core utilities and configuration
│   ├── constants.ts     # App constants (routes, SWR keys)
│   ├── symbols.ts       # DI symbols
│   ├── container-config.ts  # Inversify container setup
│   ├── utils.ts         # Utility functions
│   └── supabase/        # Supabase client configuration
├── mappers/             # Model mappers (domain ↔ UI)
│   └── user-ui.mapper.ts
├── modules/             # Domain modules (clean architecture)
│   └── users/           # Example user module
│       ├── domain/      # Business logic layer
│       │   ├── models/
│       │   ├── repositories/
│       │   ├── services/
│       │   └── value-objects/
│       ├── data/        # Data access layer
│       │   ├── entities/
│       │   ├── mappers/
│       │   └── repositories/
│       ├── user.module.ts
│       └── index.ts
├── providers/           # React context providers
│   └── theme-provider.tsx
├── types/               # TypeScript type definitions
│   └── common.types.ts
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended package manager)

### Installation

1. **Clone or download this template**

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Supabase (optional)**
   
   ```bash
   # Start local Supabase (requires Docker)
   pnpm supabase:start
   
   # Get credentials
   pnpm supabase:status
   ```
   
   Create a `.env.local` file with the credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-local-anon-key
   ```
   
   See **[supabase/README.md](supabase/README.md)** and **[docs/SUPABASE.md](docs/SUPABASE.md)** for complete setup.

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🏛️ Clean Architecture Layers

### 1. Domain Layer (`modules/*/domain/`)

The **innermost layer** containing business logic and rules.

**Components:**
- **Models**: Core business entities
- **Value Objects**: Immutable objects with validation logic
- **Repository Interfaces**: Contracts for data access
- **Services**: Business logic and use cases

**Rules:**
- ✅ No dependencies on external frameworks
- ✅ Pure TypeScript only
- ❌ No imports from data or presentation layers

**Example:**
```typescript
// modules/users/domain/models/user.model.ts
export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// modules/users/domain/services/user.service.ts
@injectable()
export class UserService {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository
  ) {}

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }
}
```

### 2. Data Layer (`modules/*/data/`)

Implements data access and external communication.

**Components:**
- **Entities**: Database table structures
- **Mappers**: Convert between domain models and database entities
- **Repository Implementations**: Actual data access code

**Rules:**
- ✅ Depends only on domain layer
- ✅ Implements domain repository interfaces
- ✅ Handles database operations

**Example:**
```typescript
// modules/users/data/repositories/supabase-user.repository.ts
@injectable()
export class SupabaseUserRepository extends UserRepository {
  async findById(id: string): Promise<User | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return UserMapper.toDomain(data);
  }
}
```

### 3. Presentation Layer (`components/`, `hooks/`, `actions/`, `providers/`)

UI components, pages, and client-side logic.

**Components:**
- **React Components**: UI elements
- **Custom Hooks**: Data fetching with SWR
- **Server Actions**: Server-side operations
- **Context Providers**: Global state management (see [docs/PROVIDERS.md](docs/PROVIDERS.md))
- **Mappers**: Convert domain models to UI models

**Rules:**
- ✅ Can import from any layer
- ✅ Maps domain models to UI-friendly formats
- ✅ Uses hooks for data fetching
- ✅ Manages global state via context providers

**Example:**
```typescript
// hooks/users/use-users.ts
export function useUsers() {
  const { data, error, isLoading } = useSWR(
    SWR_KEYS.CURRENT_USER,
    getAllUsers,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return { users: data || [], isLoading, error };
}

// components/users/user-list.tsx
export function UserList() {
  const { users, isLoading, error } = useUsers();
  
  if (isLoading) return <div>Loading...</div>;
  return <div>{users.map(user => <UserCard key={user.id} user={user} />)}</div>;
}
```

## 🔄 Data Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Component   │─────>│ Custom Hook  │─────>│Server Action │─────>│   Service    │
│  (UI Layer)  │      │   (SWR)      │      │  (Mapper)    │      │  (Business)  │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
                                                                           │
                                                                           ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Component   │<─────│ Custom Hook  │<─────│Server Action │<─────│  Repository  │
│   (Update)   │      │  (Mutate)    │      │   (Return)   │      │   (Data)     │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
                                                                           ▲
                                                                           │
                                                                    ┌──────────────┐
                                                                    │   Database   │
                                                                    │  (Supabase)  │
                                                                    └──────────────┘
```

## 🎯 Usage Examples

### Creating a New Module

1. **Create the module structure:**
   ```
   modules/
   └── products/
       ├── domain/
       │   ├── models/product.model.ts
       │   ├── repositories/product.repository.interface.ts
       │   ├── services/product.service.ts
       │   └── value-objects/product-id.ts
       ├── data/
       │   ├── entities/product.entity.ts
       │   ├── mappers/product.mapper.ts
       │   └── repositories/supabase-product.repository.ts
       ├── product.module.ts
       └── index.ts
   ```

2. **Define the domain model:**
   ```typescript
   // modules/products/domain/models/product.model.ts
   export interface Product {
     id: string;
     name: string;
     price: number;
     createdAt: Date;
   }
   ```

3. **Create repository interface:**
   ```typescript
   // modules/products/domain/repositories/product.repository.interface.ts
   export abstract class ProductRepository {
     abstract findAll(): Promise<Product[]>;
     abstract findById(id: string): Promise<Product | null>;
     abstract create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product>;
   }
   ```

4. **Implement the service:**
   ```typescript
   // modules/products/domain/services/product.service.ts
   @injectable()
   export class ProductService {
     constructor(
       @inject(ProductRepository) private productRepository: ProductRepository
     ) {}

     async getProducts(): Promise<Product[]> {
       return await this.productRepository.findAll();
     }
   }
   ```

5. **Implement the repository:**
   ```typescript
   // modules/products/data/repositories/supabase-product.repository.ts
   @injectable()
   export class SupabaseProductRepository extends ProductRepository {
     async findAll(): Promise<Product[]> {
       const supabase = await createClient();
       const { data } = await supabase.from('products').select('*');
       return data ? data.map(ProductMapper.toDomain) : [];
     }
   }
   ```

6. **Register in the module:**
   ```typescript
   // modules/products/product.module.ts
   export class ProductModule {
     static register(container: Container): void {
       container.bind(ProductRepository).to(SupabaseProductRepository);
       container.bind(ProductService).toSelf().inSingletonScope();
     }
   }
   ```

7. **Register in container:**
   ```typescript
   // lib/container-config.ts
   import { ProductModule } from '@/modules/products/product.module';
   
   ProductModule.register(container);
   ```

### Creating Server Actions

```typescript
// actions/products.ts
"use server";

import { container } from "@/lib/container-config";
import { ProductService } from "@/modules/products";

export async function getProducts() {
  const service = container.get(ProductService);
  const products = await service.getProducts();
  return products.map(ProductUIMapper.fromDomain);
}
```

### Creating Custom Hooks

```typescript
// hooks/products/use-products.ts
import useSWR from "swr";
import { SWR_KEYS } from "@/lib/constants";
import { getProducts } from "@/actions/products";

export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR(
    SWR_KEYS.PRODUCTS,
    getProducts,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    products: data || [],
    isLoading,
    error,
    mutate,
  };
}
```

### Creating Components

```typescript
// components/products/product-list.tsx
"use client";

import { useProducts } from "@/hooks/products/use-products";

export function ProductList() {
  const { products, isLoading } = useProducts();

  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Using Context Providers

```typescript
// Using the UserProvider
import { useUser, useIsAuthenticated } from "@/providers";

function ProfilePage() {
  const { currentUser, updateCurrentUser, clearUser } = useUser();
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div>
      <h1>Welcome, {currentUser.displayName}!</h1>
      <button onClick={() => updateCurrentUser({ displayName: "New Name" })}>
        Update Name
      </button>
      <button onClick={clearUser}>Logout</button>
    </div>
  );
}
```

See **[docs/PROVIDERS.md](docs/PROVIDERS.md)** for complete provider documentation.

## 📦 Technology Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (ready to add)
- **State Management**: [SWR](https://swr.vercel.app/) for data fetching
- **Dependency Injection**: [Inversify](https://inversify.io/)
- **Database**: [Supabase](https://supabase.com/) (ready to configure)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 🎨 Best Practices

### Component Architecture

- ✅ **One component per file** with kebab-case naming
- ✅ **Single responsibility** for each component
- ✅ **TypeScript interfaces** for all props
- ✅ **Reusable components** that accept `className` prop

### State Management

- ✅ **SWR for data fetching** with consistent configuration
- ✅ **Context providers** for global state
- ✅ **Local state** when possible

### Code Organization

- ✅ **Constants in `lib/constants.ts`** for routes and SWR keys
- ✅ **Utility functions in `lib/utils.ts`**
- ✅ **Clear separation of concerns** across layers

### TypeScript

- ✅ **Strict mode enabled**
- ✅ **Explicit types** for functions and variables
- ✅ **Interfaces for object shapes**
- ❌ **Avoid `any` type**

## 🧪 Scripts

```bash
# Development
pnpm dev              # Start dev server

# Build
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm check            # TypeScript type check
pnpm prettier:check   # Check formatting
pnpm prettier:write   # Format code

# Supabase (Local Development)
pnpm supabase:start           # Start local Supabase
pnpm supabase:stop            # Stop local Supabase
pnpm supabase:status          # View service status
pnpm supabase:reset           # Reset database (rerun migrations + seeds)
pnpm supabase:migration:new   # Create new migration
pnpm supabase:types           # Generate TypeScript types from schema
pnpm generate:entities        # Generate clean entity types
pnpm generate:types           # Generate both database and entity types
```

## 📚 Documentation

### Template Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Step-by-step guide to create your first feature
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Deep dive into clean architecture patterns
- **[docs/AUTHENTICATION.md](docs/AUTHENTICATION.md)** - Complete authentication guide
- **[docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md)** - Environment variables configuration guide
- **[docs/PROVIDERS.md](docs/PROVIDERS.md)** - Complete guide to context providers and state management
- **[docs/SUPABASE.md](docs/SUPABASE.md)** - Supabase integration and best practices
- **[docs/TYPE_GENERATION.md](docs/TYPE_GENERATION.md)** - Auto-generate types from database schema
- **[supabase/README.md](supabase/README.md)** - Local Supabase development guide
- **[CURSOR_RULES.md](CURSOR_RULES.md)** - AI assistant guidelines
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Inversify Documentation](https://inversify.io/)
- [SWR Documentation](https://swr.vercel.app/)
- [Supabase Documentation](https://supabase.com/docs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This template is open source and available under the MIT License.

---

**Built with ❤️ using Clean Architecture principles**

