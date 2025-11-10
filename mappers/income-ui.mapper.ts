import { IncomeUI } from "@/models/income-ui.model";

/**
 * Database entity type for Income
 */
interface IncomeEntity {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Mapper for converting between database entities and UI models for Income
 */
export class IncomeUIMapper {
  /**
   * Maps a database income entity to a UI income model
   */
  static fromDatabase(entity: IncomeEntity): IncomeUI {
    return {
      id: entity.id,
      date: entity.date,
      amount: entity.amount,
      description: entity.description,
      category: entity.category,
      createdAt: entity.created_at ? new Date(entity.created_at) : undefined,
      updatedAt: entity.updated_at ? new Date(entity.updated_at) : undefined,
    };
  }

  /**
   * Maps an array of database income entities to UI income models
   */
  static fromDatabaseArray(entities: IncomeEntity[]): IncomeUI[] {
    return entities.map((entity) => this.fromDatabase(entity));
  }
}


