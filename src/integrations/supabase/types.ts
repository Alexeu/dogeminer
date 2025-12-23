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
      ad_view_sessions: {
        Row: {
          ad_id: string
          completed_at: string | null
          id: string
          started_at: string
          user_id: string
        }
        Insert: {
          ad_id: string
          completed_at?: string | null
          id?: string
          started_at?: string
          user_id: string
        }
        Update: {
          ad_id?: string
          completed_at?: string | null
          id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      deposits: {
        Row: {
          amount: number
          created_at: string
          expires_at: string
          faucetpay_email: string
          id: string
          status: string
          user_id: string
          verification_code: string
          verified_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at?: string
          faucetpay_email: string
          id?: string
          status?: string
          user_id: string
          verification_code: string
          verified_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string
          faucetpay_email?: string
          id?: string
          status?: string
          user_id?: string
          verification_code?: string
          verified_at?: string | null
        }
        Relationships: []
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
            foreignKeyName: "lottery_tickets_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "lottery_pools_public"
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
      mining_investments: {
        Row: {
          created_at: string
          daily_rate: number
          id: string
          invested_amount: number
          is_active: boolean
          last_claim_at: string
          plan_type: string
          total_earned: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_rate: number
          id?: string
          invested_amount: number
          is_active?: boolean
          last_claim_at?: string
          plan_type: string
          total_earned?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          daily_rate?: number
          id?: string
          invested_amount?: number
          is_active?: boolean
          last_claim_at?: string
          plan_type?: string
          total_earned?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mining_investments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mining_sessions: {
        Row: {
          actual_reward: number | null
          claimed_at: string | null
          expected_reward: number
          id: string
          mining_duration_ms: number
          started_at: string
          user_character_id: string
          user_id: string
        }
        Insert: {
          actual_reward?: number | null
          claimed_at?: string | null
          expected_reward: number
          id?: string
          mining_duration_ms?: number
          started_at?: string
          user_character_id: string
          user_id: string
        }
        Update: {
          actual_reward?: number | null
          claimed_at?: string | null
          expected_reward?: number
          id?: string
          mining_duration_ms?: number
          started_at?: string
          user_character_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mining_sessions_user_character_id_fkey"
            columns: ["user_character_id"]
            isOneToOne: false
            referencedRelation: "user_characters"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
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
          collection_reward_claimed_at: string | null
          created_at: string | null
          deposit_balance: number | null
          email: string | null
          faucetpay_linked_at: string | null
          id: string
          is_banned: boolean | null
          mining_balance: number | null
          referral_code: string | null
          referred_by: string | null
          starter_gift_received_at: string | null
          total_deposited: number | null
          total_earned: number | null
          total_withdrawn: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          balance?: number | null
          ban_reason?: string | null
          banned_at?: string | null
          collection_reward_claimed_at?: string | null
          created_at?: string | null
          deposit_balance?: number | null
          email?: string | null
          faucetpay_linked_at?: string | null
          id: string
          is_banned?: boolean | null
          mining_balance?: number | null
          referral_code?: string | null
          referred_by?: string | null
          starter_gift_received_at?: string | null
          total_deposited?: number | null
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          balance?: number | null
          ban_reason?: string | null
          banned_at?: string | null
          collection_reward_claimed_at?: string | null
          created_at?: string | null
          deposit_balance?: number | null
          email?: string | null
          faucetpay_linked_at?: string | null
          id?: string
          is_banned?: boolean | null
          mining_balance?: number | null
          referral_code?: string | null
          referred_by?: string | null
          starter_gift_received_at?: string | null
          total_deposited?: number | null
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_address: string
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_address: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      shortlink_completions: {
        Row: {
          completed_at: string
          id: string
          provider: string
          reward_amount: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          provider: string
          reward_amount?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          provider?: string
          reward_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shortlink_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      user_characters: {
        Row: {
          character_id: string
          character_name: string
          character_rarity: string
          created_at: string
          id: string
          level: number
          mining_rate: number
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          character_id: string
          character_name: string
          character_rarity: string
          created_at?: string
          id?: string
          level?: number
          mining_rate: number
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          character_id?: string
          character_name?: string
          character_rarity?: string
          created_at?: string
          id?: string
          level?: number
          mining_rate?: number
          quantity?: number
          updated_at?: string
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
      web_mining_sessions: {
        Row: {
          created_at: string
          hashes_pending: number
          id: string
          is_active: boolean
          last_hash_at: string | null
          total_hashes: number
          total_rewards: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hashes_pending?: number
          id?: string
          is_active?: boolean
          last_hash_at?: string | null
          total_hashes?: number
          total_rewards?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hashes_pending?: number
          id?: string
          is_active?: boolean
          last_hash_at?: string | null
          total_hashes?: number
          total_rewards?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      lottery_pools_public: {
        Row: {
          character_id: string | null
          character_name: string | null
          character_rarity: string | null
          completed_at: string | null
          created_at: string | null
          id: string | null
          sold_tickets: number | null
          status: string | null
          ticket_price: number | null
          total_tickets: number | null
        }
        Insert: {
          character_id?: string | null
          character_name?: string | null
          character_rarity?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string | null
          sold_tickets?: number | null
          status?: string | null
          ticket_price?: number | null
          total_tickets?: number | null
        }
        Update: {
          character_id?: string | null
          character_name?: string | null
          character_rarity?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string | null
          sold_tickets?: number | null
          status?: string | null
          ticket_price?: number | null
          total_tickets?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_user_character: {
        Args: {
          p_character_id: string
          p_character_name: string
          p_character_rarity: string
          p_mining_rate: number
        }
        Returns: Json
      }
      admin_add_balance: {
        Args: { p_amount: number; p_user_id: string }
        Returns: Json
      }
      apply_referral_code: { Args: { p_code: string }; Returns: Json }
      buy_lottery_tickets: {
        Args: { p_pool_id: string; p_ticket_count: number }
        Returns: Json
      }
      check_fingerprint_banned: { Args: { fp: string }; Returns: boolean }
      claim_ad_view_reward: { Args: { p_ad_id: string }; Returns: Json }
      claim_collection_reward: { Args: never; Returns: Json }
      claim_faucetpay_bonus: { Args: never; Returns: Json }
      claim_mining_investment_reward: {
        Args: { p_investment_id: string }
        Returns: Json
      }
      claim_mining_reward: {
        Args: { p_amount: number; p_character_id: string }
        Returns: Json
      }
      claim_starter_gift: {
        Args: {
          p_character_id: string
          p_character_name: string
          p_mining_rate: number
        }
        Returns: Json
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      complete_deposit: {
        Args: { p_deposit_id: string; p_tx_hash?: string }
        Returns: Json
      }
      complete_shortlink: {
        Args: { p_provider: string; p_reward?: number }
        Returns: Json
      }
      create_deposit_request: {
        Args: { p_amount: number; p_faucetpay_email: string }
        Returns: Json
      }
      create_mining_investment: {
        Args: { p_amount: number; p_plan_type: string }
        Returns: Json
      }
      draw_lottery_winner: { Args: { p_pool_id: string }; Returns: Json }
      get_balance: { Args: never; Returns: Json }
      get_users_by_fingerprint: {
        Args: { fp: string }
        Returns: {
          email: string
          is_banned: boolean
          user_id: string
        }[]
      }
      get_web_mining_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      internal_add_balance: {
        Args: { p_amount: number; p_user_id: string }
        Returns: boolean
      }
      level_up_character: { Args: { p_character_id: string }; Returns: Json }
      open_mystery_box: { Args: { p_box_id: string }; Returns: Json }
      start_ad_view: { Args: { p_ad_id: string }; Returns: Json }
      start_mining: { Args: { p_character_id: string }; Returns: Json }
      submit_web_mining_hashes: { Args: { p_hashes: number }; Returns: Json }
      subtract_balance: { Args: { p_amount: number }; Returns: Json }
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
