-- ==============================================================================
-- CampusFix — Initial Seed Data
-- ==============================================================================

-- Seed Buildings
INSERT INTO public.buildings (name, code)
VALUES
  ('Main Academic Building', 'MAB'),
  ('Science & Research Complex', 'SRC'),
  ('Engineering Hall', 'ENG'),
  ('University Central Library', 'LIB'),
  ('Student Center & Union', 'SCU'),
  ('Campus Sports & Recreation Complex', 'REC'),
  ('Dining Hall & Cafeteria', 'DIN'),
  ('Administration & Admissions Block', 'ADM'),
  ('North Residence Hall', 'NRH'),
  ('South Residence Hall', 'SRH'),
  ('Lecture Hall Complex', 'LHC'),
  ('Advanced Computing Laboratory', 'ACL')
ON CONFLICT (name) DO NOTHING;

-- Seed Maintenance Teams
INSERT INTO public.maintenance_teams (name, description)
VALUES
  ('IT & Network Support', 'Responsible for campus Wi-Fi infrastructure, routers, and workstation equipment.'),
  ('Electrical Maintenance', 'Handles wiring, lighting fixtures, circuit breakers, and power generators.'),
  ('Plumbing & Water Services', 'Addresses leaks, pipe repairs, restrooms, and water supply stations.'),
  ('Laboratory Technical Support', 'Maintains research instruments, fume hoods, and specialty lab equipment.'),
  ('Carpentry & Furniture Repairs', 'Fixes classroom desks, chairs, doors, and facility furnishings.')
ON CONFLICT (name) DO NOTHING;
