-- Remove client-side INSERT on order_items so prices cannot be forged.
-- Order creation goes through the createOrder server function using supabaseAdmin,
-- which sets unit_price from the products table.
DROP POLICY IF EXISTS "Insert own order items" ON public.order_items;

-- Make admin visibility on support_tickets explicit (covers anonymous tickets where user_id IS NULL).
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
CREATE POLICY "Users can view their own tickets"
ON public.support_tickets
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);