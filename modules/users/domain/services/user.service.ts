import { injectable, inject } from "inversify";
import { UserRepository } from "../repositories/user.repository.interface";
import { User } from "../models/user.model";

/**
 * User Service
 * Contains business logic for user operations
 * Uses repository through dependency injection
 */
@injectable()
export class UserService {
  constructor(
    @inject(UserRepository) private readonly userRepository: UserRepository
  ) {}

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    // Add business logic here (validation, etc.)
    return await this.userRepository.create(userData);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    // Add business logic here
    return await this.userRepository.update(id, userData);
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}

