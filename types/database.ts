export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          plan: string
          lang: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      signals: {
        Row: {
          id: string
          user_id: string
          created_at: string
          type: string
          confidence: number
          timeframe: string
          session: string | null
          entry: number | null
          stop_loss: number | null
          tp1: number | null
          tp2: number | null
          risk_reward: string | null
          price_at: number | null
          bias_m1: string | null
          bias_m5: string | null
          bias_m15: string | null
          bias_h1: string | null
          bias_h4: string | null
          bias_d1: string | null
          rsi_m15: number | null
          atr_m15: number | null
          outcome: string | null
          pips_result: number | null
          notes: string | null
          ai_analysis: string | null
        }
        Insert: Omit<Database['public']['Tables']['signals']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['signals']['Insert']>
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          created_at: string
          role: string
          content: string
          signal_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['chat_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['chat_messages']['Insert']>
      }
      market_cache: {
        Row: {
          id: string
          cache_key: string
          data: unknown
          fetched_at: string
          expires_at: string
        }
        Insert: Omit<Database['public']['Tables']['market_cache']['Row'], 'id' | 'fetched_at'>
        Update: Partial<Database['public']['Tables']['market_cache']['Insert']>
      }
    }
  }
}
