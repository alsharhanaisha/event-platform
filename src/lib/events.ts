import { cacheLife } from "next/cache";
import { supabase } from "./supabase";
import type { Event, TicketType } from "./database.types";

export type EventWithTickets = Event & { ticket_types: TicketType[] };

export async function getEvents(): Promise<Event[]> {
  "use cache";
  cacheLife("minutes");

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("start_at", { ascending: true });

  if (error) throw new Error(`Could not load events: ${error.message}`);
  return data;
}

export async function getEvent(id: string): Promise<EventWithTickets | null> {
  "use cache";
  cacheLife("minutes");

  const { data, error } = await supabase
    .from("events")
    .select("*, ticket_types(*)")
    .eq("id", id)
    .order("price", { referencedTable: "ticket_types", ascending: true })
    .maybeSingle();

  // 22P02 = invalid uuid syntax: treat a malformed id as "not found".
  if (error?.code === "22P02") return null;
  if (error) throw new Error(`Could not load event: ${error.message}`);
  return data;
}
