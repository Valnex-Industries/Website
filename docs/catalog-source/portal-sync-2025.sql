-- Bring the portal's product rows up to the New Catalogue 2025.
--
-- NOT A MIGRATION, AND NOT YET APPLIED. Product migrations live in
-- Analytics-Portal/supabase/migrations; this is a one-off data fix, kept here
-- beside the catalogue it comes from.
--
-- Why: the site renders the `products` table first and src/lib/products.ts
-- only as a fallback. Commit 9fef088 filled products.ts from the 2025
-- catalogue but never reached the table, so the live site still shows the old
-- partial cutouts, empty specifications for the hopper loader, volumetric
-- feeder and dehumidifier, and (until it was deleted) abstract artwork for
-- those three.
--
-- Generated from src/lib/products.ts against the rows as read on 2026-10-26.
-- Each statement sets only the columns that differed then; titles and tags
-- already matched and are untouched. If a row has been edited in the portal
-- since, that edit is overwritten for the columns listed — check first.
--
-- Apply in the Supabase SQL editor. The set_updated_at trigger stamps each row.
-- A raw update does not purge the site's cache the way a portal save does, so
-- the change shows within the 5-minute revalidate window, or at once after a
-- call to /api/revalidate.

begin;

-- Air/Water Cooled Chillers
update public.products set
  image = '/assets/product-chillers.webp',
  gallery = array['/catalog/photos/2025/air-cooled-chiller.webp', '/catalog/photos/2025/water-cooled-chiller.webp']::text[],
  description = 'Two fourteen-model series on one integral skidded design: air-cooled from 2 to 59 TR and water-cooled from 2.7 to 65.5 TR. Every unit pairs its compressor with an integrated process pump and water tank, so the machine arrives as one skid rather than as a chiller plus a pump set to be matched on site. Both series run on R-22, R-407C or R-410; the water-cooled models reject heat to a cooling tower of 5 to 85 TR.',
  specs = '[{"label":"Air-cooled models","value":"VI 02A – VI060A (14)"},{"label":"Water-cooled models","value":"VI02W – VI060W (14)"},{"label":"Cooling capacity","value":"2 – 59 TR air / 2.7 – 65.5 TR water"},{"label":"Refrigerant","value":"R-22 / R-407C / R-410"},{"label":"Process pump","value":"0.46 – 7.5 kW"},{"label":"Process pump flow","value":"55 – 880 LPM"},{"label":"Max. pressure","value":"2.4 – 5.6 bar"},{"label":"Water tank","value":"40 – 1000 L"},{"label":"Condenser cooling tower","value":"5 – 85 TR (water-cooled)"}]'::jsonb
where slug = 'chillers';

-- Flake Cutter
update public.products set
  image = '/assets/product-flake-cutter.webp',
  gallery = array['/catalog/photos/2025/flake-cutter.webp']::text[]
where slug = 'flake-cutter';

-- Hopper Loader
update public.products set
  image = '/catalog/photos/2025/hopper-loader.webp',
  summary = 'Vacuum hopper loaders from 30 to 1200 kg/h for conveying granules straight to the machine.',
  description = 'Six vacuum loaders, from a 6-litre single-phase unit conveying 30 kg/h to an 85-litre receiver conveying 1200 kg/h. The VAL-02 runs on 230 V single phase; every other model runs on 415 V three phase, with the vacuum blower sized from 0.9 to 7.5 kW. Automatic filter cleaning, a ratio valve, positive discharge, a common line valve, a photo-electric material sensor and an intermediate hopper are available as options.',
  specs = '[{"label":"Models","value":"VAL-02 – VAL-32 (6)"},{"label":"Nominal throughput","value":"30 – 1200 kg/h"},{"label":"Receiver volume","value":"6 – 85 L"},{"label":"Vacuum blower","value":"0.9 – 7.5 kW"},{"label":"Material / vacuum line","value":"1.5\" – 4\""},{"label":"Supply","value":"230 V 1-phase (VAL-02) / 415 V 3-phase"},{"label":"Compressed air","value":"28.3 L/min at 5.51 bar"}]'::jsonb,
  applications = array['Conveying granules to the machine hopper', 'Feeding injection moulding and extrusion machines', 'Proportional loading of virgin and regrind (ratio valve)']::text[]
where slug = 'hopper-loader';

-- Laser Marking Machine
update public.products set
  image = '/catalog/photos/2025/laser-marking-machine.webp'
where slug = 'laser-marking';

-- Volumetric Feeder
update public.products set
  image = '/catalog/photos/2025/volumetric-feeder-single.webp',
  gallery = array['/catalog/photos/2025/volumetric-feeder.webp']::text[],
  summary = 'Volumetric masterbatch dosing from 0.004 to 73 kg/h, in five screw sizes.',
  description = 'A screw-driven volumetric doser for masterbatch and additives. Five screw sizes cover 0.004 to 73 kg/h, from a 3/8 × 1/4 screw for the lightest additions to a 1 × 1 screw at the top of the range, all fed from a 20-litre hopper. The feeder weighs 19 kg, and its separate control panel runs on 230 V AC at 1 A.',
  specs = '[{"label":"Models","value":"VAL 1 – VAL 5 (5)"},{"label":"Dosing capacity","value":"0.004 – 73 kg/h"},{"label":"Screw size","value":"3/8 × 1/4 – 1 × 1"},{"label":"Hopper capacity","value":"20 L"},{"label":"Feeder weight","value":"19 kg"},{"label":"Control panel (H × W × D)","value":"300 × 230 × 160 mm"},{"label":"Supply","value":"230 V AC, 50/60 Hz, 1 A"}]'::jsonb,
  applications = array['Masterbatch dosing', 'Additive dosing']::text[]
where slug = 'volumetric-feeder';

-- Mould Temp Controller
update public.products set
  image = '/catalog/photos/2025/mould-temperature-controller.webp',
  specs = '[{"label":"Models","value":"VAL-O-3 – VAL-O-18, VAL-W-3 – VAL-W-18 (9)"},{"label":"Circulating media","value":"Oil / Water"},{"label":"Max. temperature","value":"180 °C oil / 95 °C water"},{"label":"Heating capacity","value":"3 – 18 kW"},{"label":"Nominal cooling capacity","value":"20 – 28 kW"},{"label":"Pump motor","value":"0.5 – 2.2 kW at 3.8 – 5 bar"},{"label":"Flow rate","value":"65 – 150 LPM"},{"label":"Tank volume","value":"16 – 45 L"},{"label":"Supply","value":"415 V, 50 Hz, 3-phase"}]'::jsonb
where slug = 'mould-temp';

-- Dehumidifier
update public.products set
  image = '/catalog/photos/2025/dehumidifier.webp',
  gallery = array['/catalog/photos/2025/dehumidifier-front.webp']::text[],
  summary = 'SS 304 industrial dehumidifiers extracting 200 to 500 litres of moisture a day.',
  description = 'Three floor-standing models on an SS 304 structure, rated at 200, 300 and 500 litres a day at 30 °C and 80 % RH, and sized for 1600 to 3000 sq ft of non-air-conditioned floor. Each runs a reciprocating three-phase compressor on R22 or R407, moves 2500 to 5400 m³/h of air through a 20-micron filter, and collects condensate in its own stainless tank with a drain connection.',
  specs = '[{"label":"Models","value":"VI 2DH / VI 3DH / VI 5DH"},{"label":"Moisture extraction","value":"200 – 500 L/day at 30 °C, 80 % RH"},{"label":"Coverage (non-AC)","value":"1600 – 3000 sq ft"},{"label":"Air flow","value":"2500 – 5400 m³/h"},{"label":"Compressor","value":"Reciprocating, 3-phase"},{"label":"Refrigerant","value":"R22 / R407"},{"label":"Filter","value":"20 micron"},{"label":"Structure","value":"SS 304"},{"label":"Supply","value":"440 V AC, 50 Hz"}]'::jsonb,
  applications = array['Humidity control on production floors', 'Moisture protection in material storage']::text[]
where slug = 'dehumidifier';

-- Hot Air Dryer
update public.products set
  image = '/catalog/photos/2025/hot-air-dryer.webp',
  summary = 'Hopper dryers from 60 to 800 litres for consistent pre-drying ahead of the press.',
  description = 'Eight insulated hopper dryers, 60 to 800 litres, each with its own heater bank and blower sized to the hopper. They drive surface moisture off granules before processing, which is what keeps splay and voids out of the part. All models run on a 415 V three-phase supply.',
  specs = '[{"label":"Models","value":"VAL-50 – VAL-800 (8)"},{"label":"Hopper capacity","value":"60 – 800 L"},{"label":"Heater capacity","value":"2.7 – 18 kW"},{"label":"Blowing power","value":"90 – 750 W"},{"label":"Height","value":"1040 – 2260 mm"},{"label":"Supply","value":"415 V, 3-phase"}]'::jsonb
where slug = 'hot-air-dryer';

commit;
