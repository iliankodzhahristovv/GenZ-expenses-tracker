# Architecture Documentation

## Overview

This template implements Clean Architecture principles to create a scalable, maintainable, and testable Next.js application.

## Core Principles

### 1. Dependency Rule

Dependencies only point inward. Inner layers should not know about outer layers.

```
Presentation → Domain ← Data
     ↓           ↑        ↓
     └──────────────────────→ Infrastructure
```

### 2. Separation of Concerns

Each layer has a specific responsibility:

- **Domain**: Business logic and rules
- **Data**: Data access and external services
- **Presentation**: UI and user interactions
- **Infrastructure**: Framework and external dependencies

## Layer Details

### Domain Layer

**Location**: `modules/*/domain/`

**Responsibilities**:
- Define business entities (models)
- Define repository interfaces
- Implement business logic (services)
- Define value objects for complex types

**Rules**:
- ✅ No framework dependencies
- ✅ Pure TypeScript/JavaScript
- ✅ No imports from outer layers
- ❌ No database code
- ❌ No HTTP code
- ❌ No UI code

**Example Structure**:
```
modules/users/domain/
├── models/
│   └── user.model.ts          # Business entity
├── repositories/
│   └── user.repository.interface.ts  # Contract
├── services/
│   └── user.service.ts        # Business logic
└── value-objects/
    └── user-id.ts             # Complex type
```

### Data Layer

**Location**: `modules/*/data/`

**Responsibilities**:
- Implement repository interfaces
- Handle database operations
- Map between domain models and database entities
- Manage external API calls

**Rules**:
- ✅ Implements domain interfaces
- ✅ Knows about database structure
- ✅ Handles data transformation
- ❌ No business logic
- ❌ No UI code

**Example Structure**:
```
modules/users/data/
├── entities/
│   └── user.entity.ts         # Database structure
├── mappers/
│   └── user.mapper.ts         # Domain ↔ Entity
└── repositories/
    └── supabase-user.repository.ts  # Implementation
```

### Presentation Layer

**Location**: `components/`, `hooks/`, `actions/`, `app/`

**Responsibilities**:
- Handle user interactions
- Display data
- Manage UI state
- Coordinate between domain and UI

**Rules**:
- ✅ Can import from any layer
- ✅ Transforms data for display
- ✅ Handles user input
- ❌ No business logic
- ❌ No direct database access

**Example Structure**:
```
components/users/
├── user-list.tsx         # Display component
└── user-card.tsx         # Presentation component

hooks/users/
├── use-users.ts          # Data fetching
└── use-user.ts           # Single user fetch

actions/
└── users.ts              # Server actions

mappers/
└── user-ui.mapper.ts     # Domain → UI
```

## Data Flow

### Read Operation Flow

```
1. User interacts with Component
2. Component uses Custom Hook
3. Hook calls Server Action
4. Server Action gets Service from Container
5. Service calls Repository
6. Repository queries Database
7. Repository maps Entity to Domain Model
8. Service returns Domain Model
9. Server Action maps Domain Model to UI Model
10. Hook receives UI Model
11. Component displays data
```

### Write Operation Flow

```
1. User submits form in Component
2. Component calls Server Action
3. Server Action gets Service from Container
4. Service validates business rules
5. Service calls Repository
6. Repository maps Domain Model to Entity
7. Repository saves to Database
8. Repository returns new Domain Model
9. Server Action maps to UI Model
10. Hook mutates cache (SWR)
11. Component updates
```

## Dependency Injection

### Why Inversify?

- **Loose Coupling**: Components depend on interfaces, not implementations
- **Testability**: Easy to mock dependencies
- **Flexibility**: Swap implementations without changing consumers
- **Single Responsibility**: Each class has one reason to change

### Container Setup

```typescript
// lib/container-config.ts
import "reflect-metadata";
import { Container } from "inversify";

const container = new Container();

// Register modules
UserModule.register(container);
ProductModule.register(container);

export { container };
```

### Module Registration

```typescript
// modules/users/user.module.ts
export class UserModule {
  static register(container: Container): void {
    // Bind interface to implementation
    container.bind(UserRepository).to(SupabaseUserRepository);
    
    // Bind service as singleton
    container.bind(UserService).toSelf().inSingletonScope();
  }
}
```

### Service with Injection

```typescript
@injectable()
export class UserService {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository
  ) {}

  async getUser(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }
}
```

## Repository Pattern

### Why Repository Pattern?

- **Abstraction**: Hide data access details
- **Testability**: Easy to mock data access
- **Flexibility**: Switch databases without changing business logic
- **Single Source of Truth**: Centralized data access

### Repository Interface

```typescript
// domain/repositories/user.repository.interface.ts
export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findAll(): Promise<User[]>;
  abstract create(user: CreateUserDTO): Promise<User>;
  abstract update(id: string, user: UpdateUserDTO): Promise<User>;
  abstract delete(id: string): Promise<void>;
}
```

### Repository Implementation

```typescript
// data/repositories/supabase-user.repository.ts
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

## Model Mappers

### Why Mappers?

- **Separation**: Domain models ≠ Database entities ≠ UI models
- **Flexibility**: Change one without affecting others
- **Type Safety**: Explicit transformations
- **Single Responsibility**: Each mapper does one thing

### Domain ↔ Entity Mapper

```typescript
export class UserMapper {
  static toDomain(entity: UserEntity): User {
    return {
      id: entity.id,
      email: entity.email,
      createdAt: new Date(entity.created_at),
    };
  }

  static toEntity(domain: User): UserEntity {
    return {
      id: domain.id,
      email: domain.email,
      created_at: domain.createdAt.toISOString(),
    };
  }
}
```

### Domain ↔ UI Mapper

```typescript
export class UserUIMapper {
  static fromDomain(user: User): UserUI {
    return {
      id: user.id,
      email: user.email,
      displayName: user.name || "Anonymous",
      createdAt: user.createdAt.toLocaleDateString(),
    };
  }
}
```

## State Management

### SWR for Data Fetching

- **Automatic Caching**: No manual cache management
- **Revalidation**: Keep data fresh automatically
- **Optimistic Updates**: Instant UI updates
- **Error Handling**: Built-in error states

### Custom Hook Pattern

```typescript
export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR(
    SWR_KEYS.USERS,
    getAllUsers,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    users: data || [],
    isLoading,
    error,
    mutate, // For manual revalidation
  };
}
```

### Context for Global State

```typescript
const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within UserProvider");
  }
  return context;
}
```

## Testing Strategy

### Unit Tests

Test business logic in isolation:

```typescript
describe('UserService', () => {
  let service: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
    } as any;
    
    service = new UserService(mockRepository);
  });

  it('should get user by id', async () => {
    const user = { id: '1', email: 'test@example.com' };
    mockRepository.findById.mockResolvedValue(user);

    const result = await service.getUserById('1');

    expect(result).toEqual(user);
    expect(mockRepository.findById).toHaveBeenCalledWith('1');
  });
});
```

### Integration Tests

Test layer interactions:

```typescript
describe('User Flow', () => {
  it('should create and retrieve user', async () => {
    // Test server action → service → repository → database
    const created = await createUser('test@example.com', 'Test User');
    expect(created).toBeDefined();

    const retrieved = await getUserById(created!.id);
    expect(retrieved?.email).toBe('test@example.com');
  });
});
```

## Best Practices

### 1. Keep Layers Independent

❌ **Bad**: Service depends on HTTP library
```typescript
@injectable()
export class UserService {
  async getUser(req: Request) { // ❌ HTTP dependency
    const id = req.params.id;
    // ...
  }
}
```

✅ **Good**: Service depends on domain types only
```typescript
@injectable()
export class UserService {
  async getUser(id: string) { // ✅ Pure domain type
    return await this.userRepository.findById(id);
  }
}
```

### 2. Use Value Objects

❌ **Bad**: Primitive obsession
```typescript
function getUser(id: string) { // What if id is invalid?
  return repository.findById(id);
}
```

✅ **Good**: Value object with validation
```typescript
class UserId {
  constructor(private value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid user ID');
    }
  }
  
  getValue(): string {
    return this.value;
  }
}

function getUser(id: UserId) {
  return repository.findById(id.getValue());
}
```

### 3. Keep Services Focused

❌ **Bad**: God service
```typescript
@injectable()
export class UserService {
  async getUser(id: string) { }
  async sendEmail(userId: string) { }
  async processPayment(userId: string) { }
  async generateReport(userId: string) { }
}
```

✅ **Good**: Focused services
```typescript
@injectable()
export class UserService {
  async getUser(id: string) { }
  async updateUser(id: string, data: UpdateUserDTO) { }
}

@injectable()
export class EmailService {
  async sendEmail(to: string, subject: string) { }
}
```

### 4. Explicit Dependencies

❌ **Bad**: Hidden dependencies
```typescript
export class UserService {
  async getUser(id: string) {
    const supabase = createClient(); // ❌ Hidden dependency
    // ...
  }
}
```

✅ **Good**: Injected dependencies
```typescript
@injectable()
export class UserService {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository // ✅ Explicit
  ) {}
}
```

## Summary

This architecture provides:

- ✅ **Scalability**: Easy to add new features
- ✅ **Maintainability**: Clear structure and separation
- ✅ **Testability**: Easy to test in isolation
- ✅ **Flexibility**: Easy to change implementations
- ✅ **Type Safety**: Full TypeScript support

Follow these principles and your codebase will remain clean and maintainable as it grows!

