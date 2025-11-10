import { ExpenseUI } from "@/models/expense-ui.model";

/**
 * Database entity type for Expense
 */
interface ExpenseEntity {
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
 * Mapper for converting between database entities and UI models for Expense
 */
export class ExpenseUIMapper {
  /**
   * Maps a database expense entity to a UI expense model
   */
  static fromDatabase(entity: ExpenseEntity): ExpenseUI {
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
   * Maps an array of database expense entities to UI expense models
   */
  static fromDatabaseArray(entities: ExpenseEntity[]): ExpenseUI[] {
    return entities.map((entity) => this.fromDatabase(entity));
  }
}


