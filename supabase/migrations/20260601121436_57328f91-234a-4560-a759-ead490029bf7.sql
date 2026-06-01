
DROP POLICY IF EXISTS "Anyone can create a ticket" ON public.support_tickets;

CREATE POLICY "Anyone can create a non-empty ticket"
ON public.support_tickets FOR INSERT
TO anon, authenticated
WITH CHECK (
  jsonb_typeof(transcript) = 'array'
  AND (
    jsonb_array_length(transcript) > 0
    OR length(coalesce(trim(subject), '')) > 0
  )
);
