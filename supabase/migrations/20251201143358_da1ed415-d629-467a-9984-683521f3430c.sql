-- Create parts suppliers table
CREATE TABLE public.parts_suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create parts inventory table
CREATE TABLE public.parts_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES public.parts_suppliers(id) ON DELETE SET NULL,
  part_name text NOT NULL,
  part_number text,
  category text,
  price_rands numeric NOT NULL,
  stock_quantity integer DEFAULT 0,
  minimum_stock integer DEFAULT 1,
  vehicle_type text DEFAULT 'tuk_tuk',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parts_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parts_suppliers
CREATE POLICY "Authenticated users can view suppliers"
  ON public.parts_suppliers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and owners can manage suppliers"
  ON public.parts_suppliers FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- RLS Policies for parts_inventory
CREATE POLICY "Authenticated users can view parts"
  ON public.parts_inventory FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and owners can manage parts"
  ON public.parts_inventory FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- Add updated_at triggers
CREATE TRIGGER update_parts_suppliers_updated_at
  BEFORE UPDATE ON public.parts_suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parts_inventory_updated_at
  BEFORE UPDATE ON public.parts_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();