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
      ad_views: {
        Row: {
          ad_id: string
          id: string
          reward_amount: number
          user_id: string
          viewed_at: string
        }
        Insert: {
          ad_id: string
          id?: string
          reward_amount?: number
          user_id: string
          viewed_at?: string
        }
        Update: {
          ad_id?: string
          id?: string
          reward_amount?: number
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_views_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          cost_per_view: number
          created_at: string
          description: string
          id: string
          is_active: boolean
          remaining_views: number
          reward_per_view: number
          title: string
          total_views: number
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          cost_per_view?: number
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          remaining_views?: number
          reward_per_view?: number
          title: string
          total_views?: number
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          cost_per_view?: number
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          remaining_views?: number
          reward_per_view?: number
          title?: string
          total_views?: number
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      device_fingerprints: {
        Row: {
          created_at: string | null
          fingerprint: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fingerprint: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          fingerprint?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_fingerprints_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lottery_pools: {
        Row: {
          character_id: string
          character_name: string
          character_rarity: string
          completed_at: string | null
          created_at: string
          id: string
          sold_tickets: number
          status: string
          ticket_price: number
          total_tickets: number
          winner_user_id: string | null
        }
        Insert: {
          character_id: string
          character_name: string
          character_rarity: string
          completed_at?: string | null
          created_at?: string
          id?: string
          sold_tickets?: number
          status?: string
          ticket_price: number
          total_tickets?: number
          winner_user_id?: string | null
        }
        Update: {
          character_id?: string
          character_name?: string
          character_rarity?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          sold_tickets?: number
          status?: string
          ticket_price?: number
          total_tickets?: number
          winner_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lottery_pools_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lottery_tickets: {
        Row: {
          id: string
          pool_id: string
          purchased_at: string
          ticket_count: number
          user_id: string
        }
        Insert: {
          id?: string
          pool_id: string
          purchased_at?: string
          ticket_count?: number
          user_id: string
        }
        Update: {
          id?: string
          pool_id?: string
          purchased_at?: string
          ticket_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lottery_tickets_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "lottery_pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lottery_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          balance: number | null
          ban_reason: string | null
          banned_at: string | null
          created_at: string | null
          email: string | null
          id: string
          is_banned: boolean | null
          referral_code: string | null
          referred_by: string | null
          total_earned: number | null
          total_withdrawn: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          balance?: number | null
          ban_reason?: string | null
          banned_at?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          is_banned?: boolean | null
          referral_code?: string | null
          referred_by?: string | null
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          balance?: number | null
          ban_reason?: string | null
          banned_at?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_banned?: boolean | null
          referral_code?: string | null
          referred_by?: string | null
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          faucetpay_address: string | null
          id: string
          notes: string | null
          status: string | null
          tx_hash: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          faucetpay_address?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          tx_hash?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          faucetpay_address?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          tx_hash?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      buy_lottery_tickets: {
        Args: { p_pool_id: string; p_ticket_count: number }
        Returns: Json
      }
      check_fingerprint_banned: { Args: { fp: string }; Returns: boolean }
      draw_lottery_winner: { Args: { p_pool_id: string }; Returns: Json }
      get_users_by_fingerprint: {
        Args: { fp: string }
        Returns: {
          email: string
          is_banned: boolean
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
