import { injectable } from "inversify";
import { createClient } from "@/lib/supabase/server";
import { UserRepository } from "../../domain/repositories/user.repository.interface";
import { User } from "../../domain/models/user.model";
import { UserMapper } from "../mappers/user.mapper";
import { UserEntity } from "../entities/user.entity";

/**
 * Supabase implementation of UserRepository
 * Handles actual database operations
 */
@injectable()
export class SupabaseUserRepository extends UserRepository {
  private readonly tableName = "users";

  async findById(id: string): Promise<User | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return UserMapper.toDomain(data as UserEntity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) return null;
    return UserMapper.toDomain(data as UserEntity);
  }

  async findAll(): Promise<User[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map((entity) => UserMapper.toDomain(entity as UserEntity));
  }

  async create(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        email: user.email,
        name: user.name,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create user: ${error?.message}`);
    }

    return UserMapper.toDomain(data as UserEntity);
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    const supabase = await createClient();
    
    // Type for database update payload
    type UserUpdateData = {
      email?: string;
      name?: string | null;
      currency?: string | null;
    };
    
    const updateData: UserUpdateData = {};
    
    if (user.email !== undefined) updateData.email = user.email;
    if (user.name !== undefined) updateData.name = user.name;
    if (user.currency !== undefined) updateData.currency = user.currency;
    
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update user: ${error?.message}`);
    }

    return UserMapper.toDomain(data as UserEntity);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}

