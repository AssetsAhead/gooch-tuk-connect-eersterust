-- Create fleet_vehicles table to track vehicles in the Driver Licence Initiative
CREATE TABLE public.fleet_vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  e_number TEXT NOT NULL,
  registration TEXT NOT NULL,
  province TEXT DEFAULT 'GP',
  owner_name TEXT NOT NULL,
  driver_name TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  whatsapp_group_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comment for context
COMMENT ON TABLE public.fleet_vehicles IS 'Driver Licence Initiative fleet vehicles - WhatsApp group: https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z';

-- Enable RLS
ALTER TABLE public.fleet_vehicles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view fleet vehicles
CREATE POLICY "Authenticated users can view fleet vehicles"
ON public.fleet_vehicles
FOR SELECT
TO authenticated
USING (true);

-- Allow admins and owners to manage fleet vehicles
CREATE POLICY "Admins can manage fleet vehicles"
ON public.fleet_vehicles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

-- Add updated_at trigger
CREATE TRIGGER update_fleet_vehicles_updated_at
BEFORE UPDATE ON public.fleet_vehicles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert all fleet vehicles with owner and driver data
-- Owner: Roechdeen Adams
INSERT INTO public.fleet_vehicles (e_number, registration, province, owner_name, driver_name, whatsapp_group_link) VALUES
('E11', 'KN66CH', 'GP', 'Roechdeen Adams', 'Ruwane Keppler', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E12', 'LX68MS', 'GP', 'Roechdeen Adams', 'Elrico Olifant', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E106', 'MD05LM', 'GP', 'Roechdeen Adams', 'Marlon Davids', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E55', 'MJ26CX', 'GP', 'Roechdeen Adams', 'Rezaak Daniels', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E53', 'MK86MC', 'GP', 'Roechdeen Adams', 'Damien De Boer', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E105', 'MD05LB', 'GP', 'Roechdeen Adams', 'Jonathan Prinsloo', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z');

-- Owner: Lloyd Pieters
INSERT INTO public.fleet_vehicles (e_number, registration, province, owner_name, driver_name, whatsapp_group_link) VALUES
('E153', 'LC97TZ', 'GP', 'Lloyd Pieters', 'Jayvandrey Vyfers', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E154', 'LC97TY', 'GP', 'Lloyd Pieters', 'David Makhwanya', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E142', 'KS05VS', 'GP', 'Lloyd Pieters', NULL, 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z');

-- Owner: Dillan
INSERT INTO public.fleet_vehicles (e_number, registration, province, owner_name, driver_name, whatsapp_group_link) VALUES
('E51', 'LT48CW', 'GP', 'Dillan', 'Mathew Drywer', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E50', 'LC70JM', 'GP', 'Dillan', 'Francois Kekana', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z');

-- Owner: MK Nkale
INSERT INTO public.fleet_vehicles (e_number, registration, province, owner_name, driver_name, whatsapp_group_link) VALUES
('E240', 'KP17RZ', 'GP', 'MK Nkale', 'Tainos Ndhlela', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z');

-- Owner/Driver: Gershom Mac Pherson
INSERT INTO public.fleet_vehicles (e_number, registration, province, owner_name, driver_name, notes, whatsapp_group_link) VALUES
('E221', 'KN83MY', 'GP', 'Gershom Mac Pherson', 'Gershom Mac Pherson', 'Owner-driver', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z');

-- Owner: Maligan Jeftha
INSERT INTO public.fleet_vehicles (e_number, registration, province, owner_name, driver_name, whatsapp_group_link) VALUES
('E88', 'JF64XB', 'GP', 'Maligan Jeftha', 'Rodney', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E87', 'HP00DJ', 'GP', 'Maligan Jeftha', 'Jeffrey', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E85', 'JL78MZ', 'GP', 'Maligan Jeftha', 'Neheimia', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z');

-- Owner: NS Mabusha
INSERT INTO public.fleet_vehicles (e_number, registration, province, owner_name, driver_name, whatsapp_group_link) VALUES
('E123', 'KJ99NV', 'GP', 'NS Mabusha', 'Temba', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E135', 'KM13RH', 'GP', 'NS Mabusha', 'Owen', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E267', 'KW47LW', 'GP', 'NS Mabusha', 'Challas', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E81', 'LH16BM', 'GP', 'NS Mabusha', 'Mathew', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E299', 'LP40YP', 'GP', 'NS Mabusha', NULL, 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E261', 'MR86MH', 'GP', 'NS Mabusha', NULL, 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z');

-- Owner: Izile
INSERT INTO public.fleet_vehicles (e_number, registration, province, owner_name, driver_name, whatsapp_group_link) VALUES
('E74', 'JP05NS', 'GP', 'Izile', 'Rory Herrings', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E75', 'JP82YR', 'GP', 'Izile', 'Hasima Nkadimeng', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E76', 'KB56VV', 'GP', 'Izile', NULL, 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z');

-- Owner: Avian Holworthy
INSERT INTO public.fleet_vehicles (e_number, registration, province, owner_name, driver_name, whatsapp_group_link) VALUES
('E63', 'FW66XT', 'GP', 'Avian Holworthy', 'Enoch', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E168', 'JP69ZD', 'GP', 'Avian Holworthy', 'Promise', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E169', 'JV53NN', 'GP', 'Avian Holworthy', 'Micheal', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E201', 'HV27NW', 'GP', 'Avian Holworthy', 'Lee', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E61', 'JB16ZJ', 'GP', 'Avian Holworthy', 'Marko', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z'),
('E126', 'HZ09DB', 'GP', 'Avian Holworthy', 'Naylin', 'https://chat.whatsapp.com/K7wd5KdrGL1BpiazhGfy3Z');