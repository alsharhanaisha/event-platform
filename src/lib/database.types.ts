// Generated from the live Supabase schema (project "event-platform").
// Regenerate after schema changes: npx supabase gen types typescript --project-id kkhwtpcjxyfwseeddjsw > src/lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type EventRow = {
  accessibility_info: string | null;
  address: string | null;
  capacity: number | null;
  category: string | null;
  city: string | null;
  cover_image_url: string | null;
  created_at: string;
  currency: string;
  description: string | null;
  duration: string | null;
  end_at: string;
  event_format: string;
  gender_restriction: string;
  id: string;
  is_free: boolean;
  language: string | null;
  latitude: number | null;
  longitude: number | null;
  map_url: string | null;
  max_age: number | null;
  min_age: number | null;
  name: string;
  organizer_name: string | null;
  price: number | null;
  recurrence: string;
  recurrence_end_date: string | null;
  registration_deadline: string | null;
  registration_url: string | null;
  requirements: string | null;
  start_at: string;
  status: string;
  tags: string[] | null;
  timezone: string;
  updated_at: string;
  venue_name: string | null;
};

type TicketTypeRow = {
  created_at: string;
  currency: string;
  event_id: string;
  id: string;
  name: string;
  price: number;
  quantity: number | null;
  sales_end_at: string | null;
};

type EventPrivateDetailsRow = {
  created_at: string;
  event_id: string;
  online_meeting_url: string | null;
  organizer_email: string | null;
  organizer_phone: string | null;
  updated_at: string;
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      events: {
        Row: EventRow;
        Insert: Partial<EventRow> & Pick<EventRow, "name" | "start_at" | "end_at">;
        Update: Partial<EventRow>;
        Relationships: [];
      };
      ticket_types: {
        Row: TicketTypeRow;
        Insert: Partial<TicketTypeRow> & Pick<TicketTypeRow, "event_id" | "name">;
        Update: Partial<TicketTypeRow>;
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      event_private_details: {
        Row: EventPrivateDetailsRow;
        Insert: Partial<EventPrivateDetailsRow> & Pick<EventPrivateDetailsRow, "event_id">;
        Update: Partial<EventPrivateDetailsRow>;
        Relationships: [
          {
            foreignKeyName: "event_private_details_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: true;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Event = EventRow;
export type TicketType = TicketTypeRow;
