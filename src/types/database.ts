export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      foods: {
        Row: {
          category: string;
          expiry_date: string;
          id: string;
          latitude: number;
          longitude: number;
          name: string;
          quantity: number;
          status: "available" | "reserved" | "completed" | null;
          supplier_id: string | null;
        };
        Insert: {
          category: string;
          expiry_date: string;
          id?: string;
          latitude: number;
          longitude: number;
          name: string;
          quantity: number;
          status?: "available" | "reserved" | "completed" | null;
          supplier_id?: string | null;
        };
        Update: {
          category?: string;
          expiry_date?: string;
          id?: string;
          latitude?: number;
          longitude?: number;
          name?: string;
          quantity?: number;
          status?: "available" | "reserved" | "completed" | null;
          supplier_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "foods_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: {
          food_id: string | null;
          id: string;
          match_score: number;
          receiver_id: string | null;
          status: "pending" | "accepted" | "completed" | null;
        };
        Insert: {
          food_id?: string | null;
          id?: string;
          match_score: number;
          receiver_id?: string | null;
          status?: "pending" | "accepted" | "completed" | null;
        };
        Update: {
          food_id?: string | null;
          id?: string;
          match_score?: number;
          receiver_id?: string | null;
          status?: "pending" | "accepted" | "completed" | null;
        };
        Relationships: [
          {
            foreignKeyName: "matches_food_id_fkey";
            columns: ["food_id"];
            isOneToOne: false;
            referencedRelation: "foods";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_receiver_id_fkey";
            columns: ["receiver_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          id: string;
          latitude: number;
          longitude: number;
          name: string;
          preferred_category: string | null;
          role: "supplier" | "receiver";
        };
        Insert: {
          id?: string;
          latitude: number;
          longitude: number;
          name: string;
          preferred_category?: string | null;
          role: "supplier" | "receiver";
        };
        Update: {
          id?: string;
          latitude?: number;
          longitude?: number;
          name?: string;
          preferred_category?: string | null;
          role?: "supplier" | "receiver";
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type PublicSchema = Database["public"];

export type Tables<
  TableName extends keyof PublicSchema["Tables"],
> = PublicSchema["Tables"][TableName]["Row"];

export type TablesInsert<
  TableName extends keyof PublicSchema["Tables"],
> = PublicSchema["Tables"][TableName]["Insert"];

export type TablesUpdate<
  TableName extends keyof PublicSchema["Tables"],
> = PublicSchema["Tables"][TableName]["Update"];
