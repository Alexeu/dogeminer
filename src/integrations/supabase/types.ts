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
          expires_at: string
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
          expires_at?: string
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
          expires_at?: string
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
      online_presence: {
        Row: {
          created_at: string
          fingerprint: string | null
          id: string
          last_seen: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          fingerprint?: string | null
          id?: string
          last_seen?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          fingerprint?: string | null
          id?: string
          last_seen?: string
          user_id?: string | null
        }
        Relationships: []
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
      rdoge_purchase_requests: {
        Row: {
          admin_notes: string | null
          bonus_percent: number
          created_at: string
          doge_amount: number
          faucetpay_email: string | null
          id: string
          processed_at: string | null
          rdoge_amount: number
          status: string
          tx_hash: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          bonus_percent?: number
          created_at?: string
          doge_amount: number
          faucetpay_email?: string | null
          id?: string
          processed_at?: string | null
          rdoge_amount: number
          status?: string
          tx_hash?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          bonus_percent?: number
          created_at?: string
          doge_amount?: number
          faucetpay_email?: string | null
          id?: string
          processed_at?: string | null
          rdoge_amount?: number
          status?: string
          tx_hash?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referral_contests: {
        Row: {
          completed_at: string | null
          created_at: string
          end_date: string
          first_prize: number
          id: string
          min_referrals: number
          second_prize: number
          start_date: string
          status: string
          third_prize: number
          winner_first_id: string | null
          winner_second_id: string | null
          winner_third_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          end_date: string
          first_prize?: number
          id?: string
          min_referrals?: number
          second_prize?: number
          start_date?: string
          status?: string
          third_prize?: number
          winner_first_id?: string | null
          winner_second_id?: string | null
          winner_third_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          end_date?: string
          first_prize?: number
          id?: string
          min_referrals?: number
          second_prize?: number
          start_date?: string
          status?: string
          third_prize?: number
          winner_first_id?: string | null
          winner_second_id?: string | null
          winner_third_id?: string | null
        }
        Relationships: []
      }
      referral_entries: {
        Row: {
          contest_id: string | null
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          contest_id?: string | null
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          contest_id?: string | null
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_entries_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "referral_contests"
            referencedColumns: ["id"]
          },
        ]
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
      social_tasks: {
        Row: {
          completed_at: string
          id: string
          reward_amount: number
          task_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          reward_amount?: number
          task_type: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          reward_amount?: number
          task_type?: string
          user_id?: string
        }
        Relationships: []
      }
      staking: {
        Row: {
          amount: number
          bonus_rate: number
          completed_at: string | null
          created_at: string
          duration_days: number
          ends_at: string
          id: string
          reward_amount: number | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bonus_rate: number
          completed_at?: string | null
          created_at?: string
          duration_days: number
          ends_at: string
          id?: string
          reward_amount?: number | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bonus_rate?: number
          completed_at?: string | null
          created_at?: string
          duration_days?: number
          ends_at?: string
          id?: string
          reward_amount?: number | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
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
      user_barn: {
        Row: {
          created_at: string
          eggs: number
          id: string
          last_collected_at: string
          level: number
          user_id: string
        }
        Insert: {
          created_at?: string
          eggs?: number
          id?: string
          last_collected_at?: string
          level?: number
          user_id: string
        }
        Update: {
          created_at?: string
          eggs?: number
          id?: string
          last_collected_at?: string
          level?: number
          user_id?: string
        }
        Relationships: []
      }
      user_birds: {
        Row: {
          bird_type: string
          id: string
          purchased_at: string
          quantity: number
          user_id: string
        }
        Insert: {
          bird_type: string
          id?: string
          purchased_at?: string
          quantity?: number
          user_id: string
        }
        Update: {
          bird_type?: string
          id?: string
          purchased_at?: string
          quantity?: number
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
          mining_expires_at: string | null
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
          mining_expires_at?: string | null
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
          mining_expires_at?: string | null
          mining_rate?: number
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_rdoge_tokens: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_purchased: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_purchased?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_purchased?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rdoge_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      admin_approve_rdoge_purchase: {
        Args: { p_request_id: string }
        Returns: Json
      }
      admin_modify_balance: {
        Args: {
          p_amount: number
          p_balance_type: string
          p_operation: string
          p_user_id: string
        }
        Returns: Json
      }
      admin_modify_rdoge_tokens: {
        Args: { p_amount: number; p_operation: string; p_user_id: string }
        Returns: Json
      }
      admin_modify_referrals: {
        Args: { p_amount: number; p_operation: string; p_user_id: string }
        Returns: Json
      }
      admin_reject_rdoge_purchase: {
        Args: { p_reason?: string; p_request_id: string }
        Returns: Json
      }
      apply_referral_code: { Args: { p_code: string }; Returns: Json }
      buy_bird: { Args: { bird_type_param: string }; Returns: Json }
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
      claim_mining_reward:
        | { Args: { p_amount: number; p_character_id: string }; Returns: Json }
        | { Args: { p_investment_id: string }; Returns: Json }
      claim_stake: { Args: { p_stake_id: string }; Returns: Json }
      claim_starter_gift: {
        Args: {
          p_character_id: string
          p_character_name: string
          p_mining_rate: number
        }
        Returns: Json
      }
      cleanup_old_presence: { Args: never; Returns: undefined }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      collect_eggs: { Args: never; Returns: Json }
      complete_deposit: {
        Args: { p_deposit_id: string; p_tx_hash?: string }
        Returns: Json
      }
      complete_shortlink: {
        Args: { p_provider: string; p_reward?: number }
        Returns: Json
      }
      complete_social_task: { Args: { p_task_type: string }; Returns: Json }
      convert_eggs_to_doge: { Args: { eggs_amount: number }; Returns: Json }
      create_deposit_request: {
        Args: { p_amount: number; p_faucetpay_email: string }
        Returns: Json
      }
      create_mining_investment: {
        Args: { p_amount: number; p_plan_type: string }
        Returns: Json
      }
      create_stake: {
        Args: { p_amount: number; p_duration_days: number }
        Returns: Json
      }
      deactivate_ad: { Args: { p_ad_id: string }; Returns: Json }
      draw_lottery_winner: { Args: { p_pool_id: string }; Returns: Json }
      expire_mining_investments: { Args: never; Returns: undefined }
      get_active_contest: {
        Args: never
        Returns: {
          days_remaining: number
          end_date: string
          first_prize: number
          id: string
          min_referrals: number
          second_prize: number
          start_date: string
          third_prize: number
        }[]
      }
      get_all_referral_stats: {
        Args: never
        Returns: {
          contest_referrals: number
          email: string
          referral_code: string
          total_referrals: number
          user_id: string
          username: string
        }[]
      }
      get_balance: { Args: never; Returns: Json }
      get_barn_capacity: { Args: { barn_level: number }; Returns: number }
      get_rdoge_balance: { Args: never; Returns: number }
      get_referral_leaderboard: {
        Args: never
        Returns: {
          rank: number
          referral_count: number
          user_id: string
          username: string
        }[]
      }
      get_total_staked: { Args: never; Returns: number }
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
      renew_character_mining: {
        Args: { p_character_id: string }
        Returns: Json
      }
      start_ad_view: { Args: { p_ad_id: string }; Returns: Json }
      start_mining: { Args: { p_character_id: string }; Returns: Json }
      submit_web_mining_hashes: { Args: { p_hashes: number }; Returns: Json }
      subtract_balance: { Args: { p_amount: number }; Returns: Json }
      upgrade_barn: { Args: never; Returns: Json }
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
