-- 0001 constrained `division` to ('robotics', 'materials', 'energy', 'unsure'),
-- which were the original three business divisions. The site now sells seven
-- named products and the form submits their slugs -- 'chillers',
-- 'flake-cutter', 'hopper-loader', 'laser-marking', 'volumetric-feeder',
-- 'mould-temp', 'dehumidifier' -- so every insert except 'unsure' would fail
-- that CHECK.
--
-- The constraint is dropped rather than rewritten. The allowed set is derived
-- from the product catalogue in src/lib/products.ts and validated server-side
-- by parseInquiry() before any insert; a database constraint that needs a
-- migration every time a product is added would drift again, and losing a real
-- customer inquiry is a worse failure than storing an unexpected string.

alter table public.inquiries
  drop constraint if exists inquiries_division_check;
