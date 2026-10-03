-- Locations: store council_id as a UUID with a foreign key to councils
--
-- What it does:
--   - Converts locations.council_id from text to uuid
--   - Adds a foreign key, so a location can only reference a council that exists
--
-- Why: council_id was text while councils.id is a uuid, so joins between the
-- two tables failed with "operator does not exist: uuid = text".
--
-- Before running: every existing council_id must be a valid UUID that exists in
-- councils. If not, this migration fails and changes nothing.

alter table public.locations
  alter column council_id type uuid using council_id::uuid;

alter table public.locations
  add constraint locations_council_id_fkey
  foreign key (council_id) references public.councils(id);
