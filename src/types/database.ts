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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      booking_addons: {
        Row: {
          booking_id: string
          category: Database["public"]["Enums"]["vendor_category"]
          client_price_kes: number
          created_at: string
          fulfillment_type: Database["public"]["Enums"]["fulfillment_type"]
          id: string
          partner_cost_kes: number
          vendor_id: string | null
        }
        Insert: {
          booking_id: string
          category: Database["public"]["Enums"]["vendor_category"]
          client_price_kes?: number
          created_at?: string
          fulfillment_type: Database["public"]["Enums"]["fulfillment_type"]
          id?: string
          partner_cost_kes?: number
          vendor_id?: string | null
        }
        Update: {
          booking_id?: string
          category?: Database["public"]["Enums"]["vendor_category"]
          client_price_kes?: number
          created_at?: string
          fulfillment_type?: Database["public"]["Enums"]["fulfillment_type"]
          id?: string
          partner_cost_kes?: number
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_addons_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_addons_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          client_name: string
          client_phone: string
          created_at: string
          estimated_margin_kes: number | null
          event_date: string
          event_type: string
          guest_count: number
          id: string
          reference_code: string
          status: Database["public"]["Enums"]["booking_status"]
          total_client_kes: number
          total_internal_cost_kes: number
          updated_at: string
          venue_id: string
        }
        Insert: {
          client_name: string
          client_phone: string
          created_at?: string
          estimated_margin_kes?: number | null
          event_date: string
          event_type: string
          guest_count: number
          id?: string
          reference_code?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_client_kes?: number
          total_internal_cost_kes?: number
          updated_at?: string
          venue_id: string
        }
        Update: {
          client_name?: string
          client_phone?: string
          created_at?: string
          estimated_margin_kes?: number | null
          event_date?: string
          event_type?: string
          guest_count?: number
          id?: string
          reference_code?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_client_kes?: number
          total_internal_cost_kes?: number
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_logs: {
        Row: {
          booking_id: string
          channel: Database["public"]["Enums"]["dispatch_channel"]
          created_at: string
          id: string
          message_payload: Json
          recipient_type: Database["public"]["Enums"]["recipient_type"]
        }
        Insert: {
          booking_id: string
          channel: Database["public"]["Enums"]["dispatch_channel"]
          created_at?: string
          id?: string
          message_payload: Json
          recipient_type: Database["public"]["Enums"]["recipient_type"]
        }
        Update: {
          booking_id?: string
          channel?: Database["public"]["Enums"]["dispatch_channel"]
          created_at?: string
          id?: string
          message_payload?: Json
          recipient_type?: Database["public"]["Enums"]["recipient_type"]
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          area_coverage: string[]
          category: Database["public"]["Enums"]["vendor_category"]
          client_price_kes: number
          created_at: string
          description: string
          id: string
          is_simulated: boolean
          name: string
          partner_cost_kes: number
          portfolio_images: string[]
          private_phone: string | null
          status: Database["public"]["Enums"]["listing_status"]
          updated_at: string
        }
        Insert: {
          area_coverage?: string[]
          category: Database["public"]["Enums"]["vendor_category"]
          client_price_kes: number
          created_at?: string
          description?: string
          id?: string
          is_simulated?: boolean
          name: string
          partner_cost_kes: number
          portfolio_images?: string[]
          private_phone?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string
        }
        Update: {
          area_coverage?: string[]
          category?: Database["public"]["Enums"]["vendor_category"]
          client_price_kes?: number
          created_at?: string
          description?: string
          id?: string
          is_simulated?: boolean
          name?: string
          partner_cost_kes?: number
          portfolio_images?: string[]
          private_phone?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          allows_outside_vendors: boolean
          area: string
          base_price_kes: number
          capacity_max: number
          created_at: string
          description: string
          id: string
          images: string[]
          in_house_catering: Database["public"]["Enums"]["catering_mode"]
          includes_chairs: boolean
          includes_tents: boolean
          is_simulated: boolean
          owner_private_phone: string | null
          slug: string
          space_type: Database["public"]["Enums"]["space_type"]
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
        }
        Insert: {
          allows_outside_vendors?: boolean
          area: string
          base_price_kes: number
          capacity_max: number
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          in_house_catering?: Database["public"]["Enums"]["catering_mode"]
          includes_chairs?: boolean
          includes_tents?: boolean
          is_simulated?: boolean
          owner_private_phone?: string | null
          slug: string
          space_type: Database["public"]["Enums"]["space_type"]
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at?: string
        }
        Update: {
          allows_outside_vendors?: boolean
          area?: string
          base_price_kes?: number
          capacity_max?: number
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          in_house_catering?: Database["public"]["Enums"]["catering_mode"]
          includes_chairs?: boolean
          includes_tents?: boolean
          is_simulated?: boolean
          owner_private_phone?: string | null
          slug?: string
          space_type?: Database["public"]["Enums"]["space_type"]
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status:
        | "inquiry"
        | "quoting"
        | "deposit_paid"
        | "confirmed"
        | "cancelled"
      catering_mode: "none" | "optional" | "required"
      dispatch_channel: "simulated_whatsapp" | "simulated_sms"
      fulfillment_type: "venue_included" | "platform_vendor" | "bring_your_own"
      listing_status: "draft" | "active" | "archived"
      recipient_type: "venue_owner" | "vendor" | "client"
      space_type: "garden" | "backyard" | "lawn" | "courtyard"
      vendor_category: "sound" | "catering" | "photo" | "tents"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      booking_status: [
        "inquiry",
        "quoting",
        "deposit_paid",
        "confirmed",
        "cancelled",
      ],
      catering_mode: ["none", "optional", "required"],
      dispatch_channel: ["simulated_whatsapp", "simulated_sms"],
      fulfillment_type: ["venue_included", "platform_vendor", "bring_your_own"],
      listing_status: ["draft", "active", "archived"],
      recipient_type: ["venue_owner", "vendor", "client"],
      space_type: ["garden", "backyard", "lawn", "courtyard"],
      vendor_category: ["sound", "catering", "photo", "tents"],
    },
  },
} as const
