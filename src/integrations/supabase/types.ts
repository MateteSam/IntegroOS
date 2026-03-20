export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_brand_generations: {
        Row: {
          brand_asset_id: string | null
          created_at: string | null
          generation_time: unknown
          id: string
          model_used: string
          prompt_data: Json
          user_feedback: string | null
          user_rating: number | null
        }
        Insert: {
          brand_asset_id?: string | null
          created_at?: string | null
          generation_time?: unknown
          id?: string
          model_used: string
          prompt_data: Json
          user_feedback?: string | null
          user_rating?: number | null
        }
        Update: {
          brand_asset_id?: string | null
          created_at?: string | null
          generation_time?: unknown
          id?: string
          model_used?: string
          prompt_data?: Json
          user_feedback?: string | null
          user_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_brand_generations_brand_asset_id_fkey"
            columns: ["brand_asset_id"]
            isOneToOne: false
            referencedRelation: "brand_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_cache: {
        Row: {
          cache_key: string
          created_at: string | null
          id: string
          result: Json
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          id?: string
          result: Json
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          id?: string
          result?: Json
        }
        Relationships: []
      }
      ai_generations: {
        Row: {
          created_at: string | null
          generation_type: string
          id: string
          model: string
          prompt: string
          result: Json
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          generation_type: string
          id?: string
          model: string
          prompt: string
          result: Json
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          generation_type?: string
          id?: string
          model?: string
          prompt?: string
          result?: Json
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      analytics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
          recorded_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value: number
          recorded_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          recorded_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      asset_collections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          share_token: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          share_token?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          share_token?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      asset_comments: {
        Row: {
          asset_id: string
          comment: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          x_position: number | null
          y_position: number | null
        }
        Insert: {
          asset_id: string
          comment: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          x_position?: number | null
          y_position?: number | null
        }
        Update: {
          asset_id?: string
          comment?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          x_position?: number | null
          y_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_comments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "user_designs"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_asset_files: {
        Row: {
          brand_asset_id: string | null
          created_at: string | null
          file_metadata: Json | null
          file_name: string
          file_type: string
          file_url: string
          id: string
        }
        Insert: {
          brand_asset_id?: string | null
          created_at?: string | null
          file_metadata?: Json | null
          file_name: string
          file_type: string
          file_url: string
          id?: string
        }
        Update: {
          brand_asset_id?: string | null
          created_at?: string | null
          file_metadata?: Json | null
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_asset_files_brand_asset_id_fkey"
            columns: ["brand_asset_id"]
            isOneToOne: false
            referencedRelation: "brand_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_assets: {
        Row: {
          ai_insights: Json | null
          assets: Json
          brand_data: Json
          brand_dna: Json | null
          business_name: string
          competitive_analysis: Json | null
          created_at: string | null
          export_history: Json | null
          generation_iterations: number | null
          id: string
          industry: string
          questionnaire_data: Json | null
          team_collaborators: string[] | null
          updated_at: string | null
          user_id: string
          version_number: number | null
        }
        Insert: {
          ai_insights?: Json | null
          assets: Json
          brand_data: Json
          brand_dna?: Json | null
          business_name: string
          competitive_analysis?: Json | null
          created_at?: string | null
          export_history?: Json | null
          generation_iterations?: number | null
          id?: string
          industry: string
          questionnaire_data?: Json | null
          team_collaborators?: string[] | null
          updated_at?: string | null
          user_id: string
          version_number?: number | null
        }
        Update: {
          ai_insights?: Json | null
          assets?: Json
          brand_data?: Json
          brand_dna?: Json | null
          business_name?: string
          competitive_analysis?: Json | null
          created_at?: string | null
          export_history?: Json | null
          generation_iterations?: number | null
          id?: string
          industry?: string
          questionnaire_data?: Json | null
          team_collaborators?: string[] | null
          updated_at?: string | null
          user_id?: string
          version_number?: number | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          created_at: string | null
          id: string
          metrics: Json | null
          name: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metrics?: Json | null
          name: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      collection_items: {
        Row: {
          asset_id: string
          collection_id: string
          created_at: string | null
          id: string
          position: number | null
        }
        Insert: {
          asset_id: string
          collection_id: string
          created_at?: string | null
          id?: string
          position?: number | null
        }
        Update: {
          asset_id?: string
          collection_id?: string
          created_at?: string | null
          id?: string
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "user_designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "asset_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          body: string
          content_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body: string
          content_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string
          content_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_type: string
          recorded_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_type: string
          recorded_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_type?: string
          recorded_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_name: string | null
          company_name: string | null
          created_at: string | null
          id: string
          industry: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          business_name?: string | null
          company_name?: string | null
          created_at?: string | null
          id: string
          industry?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          business_name?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_designs: {
        Row: {
          asset_type: string
          created_at: string | null
          data: Json
          id: string
          is_favorite: boolean | null
          parent_asset_id: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
          version_number: number | null
        }
        Insert: {
          asset_type: string
          created_at?: string | null
          data: Json
          id?: string
          is_favorite?: boolean | null
          parent_asset_id?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          version_number?: number | null
        }
        Update: {
          asset_type?: string
          created_at?: string | null
          data?: Json
          id?: string
          is_favorite?: boolean | null
          parent_asset_id?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          version_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_designs_parent_asset_id_fkey"
            columns: ["parent_asset_id"]
            isOneToOne: false
            referencedRelation: "user_designs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
