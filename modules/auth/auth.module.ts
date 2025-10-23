import { Container } from "inversify";
import { AuthRepository } from "./domain/repositories/auth.repository.interface";
import { SupabaseAuthRepository } from "./data/repositories/supabase-auth.repository";
import { AuthService } from "./domain/services/auth.service";

/**
 * Auth Module
 * 
 * Registers auth-related dependencies in the Inversify container
 */
export class AuthModule {
  static register(container: Container): void {
    // Bind repository
    container.bind(AuthRepository).to(SupabaseAuthRepository);

    // Bind service
    container.bind(AuthService).toSelf().inSingletonScope();
  }
}

