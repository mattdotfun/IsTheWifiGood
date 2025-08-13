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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      cities: {
        Row: {
          country: string
          country_code: string
          created_at: string | null
          description: string | null
          flag_emoji: string
          id: string
          name: string
          timezone: string
          updated_at: string | null
        }
        Insert: {
          country: string
          country_code: string
          created_at?: string | null
          description?: string | null
          flag_emoji: string
          id?: string
          name: string
          timezone: string
          updated_at?: string | null
        }
        Update: {
          country?: string
          country_code?: string
          created_at?: string | null
          description?: string | null
          flag_emoji?: string
          id?: string
          name?: string
          timezone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hotels: {
        Row: {
          address: string | null
          business_center: boolean | null
          city_id: string
          created_at: string | null
          hotel_chain: string | null
          id: string
          meeting_rooms: boolean | null
          name: string
          neighborhood_id: string
          phone: string | null
          star_rating: number | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          business_center?: boolean | null
          city_id: string
          created_at?: string | null
          hotel_chain?: string | null
          id?: string
          meeting_rooms?: boolean | null
          name: string
          neighborhood_id: string
          phone?: string | null
          star_rating?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          business_center?: boolean | null
          city_id?: string
          created_at?: string | null
          hotel_chain?: string | null
          id?: string
          meeting_rooms?: boolean | null
          name?: string
          neighborhood_id?: string
          phone?: string | null
          star_rating?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotels_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotels_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
        ]
      }
      neighborhoods: {
        Row: {
          business_district: boolean | null
          city_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          business_district?: boolean | null
          city_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          business_district?: boolean | null
          city_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "neighborhoods_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      wifi_reviews: {
        Row: {
          created_at: string | null
          hotel_id: string
          id: string
          raw_data: Json | null
          review_date: string | null
          review_rating: number | null
          review_text: string
          reviewer_name: string | null
          scraped_at: string | null
          source: string
          speed_mentioned: string | null
          wifi_mentioned: boolean | null
        }
        Insert: {
          created_at?: string | null
          hotel_id: string
          id?: string
          raw_data?: Json | null
          review_date?: string | null
          review_rating?: number | null
          review_text: string
          reviewer_name?: string | null
          scraped_at?: string | null
          source: string
          speed_mentioned?: string | null
          wifi_mentioned?: boolean | null
        }
        Update: {
          created_at?: string | null
          hotel_id?: string
          id?: string
          raw_data?: Json | null
          review_date?: string | null
          review_rating?: number | null
          review_text?: string
          reviewer_name?: string | null
          scraped_at?: string | null
          source?: string
          speed_mentioned?: string | null
          wifi_mentioned?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "wifi_reviews_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      wifi_summaries: {
        Row: {
          ai_model: string | null
          business_suitable: boolean | null
          confidence_level: string | null
          created_at: string | null
          estimated_speed_mbps: number | null
          generated_at: string | null
          highlights: Json | null
          hotel_id: string
          id: string
          overall_score: number
          reliability_score: number | null
          reviews_analyzed: number | null
          speed_tier: string
          summary_text: string
          updated_at: string | null
          use_case_scores: Json | null
          warnings: Json | null
        }
        Insert: {
          ai_model?: string | null
          business_suitable?: boolean | null
          confidence_level?: string | null
          created_at?: string | null
          estimated_speed_mbps?: number | null
          generated_at?: string | null
          highlights?: Json | null
          hotel_id: string
          id?: string
          overall_score: number
          reliability_score?: number | null
          reviews_analyzed?: number | null
          speed_tier: string
          summary_text: string
          updated_at?: string | null
          use_case_scores?: Json | null
          warnings?: Json | null
        }
        Update: {
          ai_model?: string | null
          business_suitable?: boolean | null
          confidence_level?: string | null
          created_at?: string | null
          estimated_speed_mbps?: number | null
          generated_at?: string | null
          highlights?: Json | null
          hotel_id?: string
          id?: string
          overall_score?: number
          reliability_score?: number | null
          reviews_analyzed?: number | null
          speed_tier?: string
          summary_text?: string
          updated_at?: string | null
          use_case_scores?: Json | null
          warnings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "wifi_summaries_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
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