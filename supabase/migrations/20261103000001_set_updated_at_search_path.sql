-- Pin search_path so the trigger function can't resolve objects from other schemas
alter function public.set_updated_at() set search_path = '';
