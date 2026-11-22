import os
import sys
import base64
import subprocess
import fitz

def get_base64_file(path, mime):
    if not os.path.exists(path):
        print(f"Warning: file {path} not found")
        return ""
    with open(path, 'rb') as f:
        return f"data:{mime};base64,{base64.b64encode(f.read()).decode('utf-8')}"

print("Encoding fonts...")
font_orbitron_400 = get_base64_file('scratch/fonts/orbitron_0.ttf', 'font/ttf')
font_orbitron_700 = get_base64_file('scratch/fonts/orbitron_1.ttf', 'font/ttf')
font_orbitron_900 = get_base64_file('scratch/fonts/orbitron_2.ttf', 'font/ttf')
font_inter_400 = get_base64_file('scratch/fonts/inter_0.ttf', 'font/ttf')
font_inter_600 = get_base64_file('scratch/fonts/inter_1.ttf', 'font/ttf')
font_inter_700 = get_base64_file('scratch/fonts/inter_2.ttf', 'font/ttf')
font_mono = get_base64_file('scratch/fonts/jetbrains_0.ttf', 'font/ttf')

print("Encoding images...")
img_logo = get_base64_file("public/assets/valnex-logo.webp", "image/webp")
img_make_in_india = get_base64_file("public/catalog/brand/make-in-india.jpg", "image/jpeg")
img_qr = get_base64_file("scratch/valnex-qr.png", "image/png")
img_cover_bg = get_base64_file("scratch/pure_cover_bg.png", "image/png")
img_map_bg = get_base64_file("scratch/pure_map_only.png", "image/png")

# 3D Studio Product Renders
img_chillers = get_base64_file("public/assets/product-chillers.webp", "image/webp")
img_hot_air_dryer = get_base64_file("public/assets/product-hot-air-hopper-loader.webp", "image/webp")
img_hopper_loader = get_base64_file("public/assets/product-vacuum-hopper-loader.webp", "image/webp")
img_tcu = get_base64_file("public/assets/product-temperature-control-unit.webp", "image/webp")
img_feeder = get_base64_file("public/assets/product-volumetric-feeder.webp", "image/webp")
img_cutter = get_base64_file("public/assets/product-flake-cutter.webp", "image/webp")
img_dehumidifier = get_base64_file("public/assets/product-dehumidifier.webp", "image/webp")
img_laser = get_base64_file("public/assets/product-laser-marking.webp", "image/webp")

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Valnex Industries - Product Catalogue 2026</title>
<style>
@font-face {{
  font-family: 'Orbitron';
  font-weight: 400;
  src: url('{font_orbitron_400}') format('truetype');
}}
@font-face {{
  font-family: 'Orbitron';
  font-weight: 700;
  src: url('{font_orbitron_700}') format('truetype');
}}
@font-face {{
  font-family: 'Orbitron';
  font-weight: 900;
  src: url('{font_orbitron_900}') format('truetype');
}}
@font-face {{
  font-family: 'Inter';
  font-weight: 400;
  src: url('{font_inter_400}') format('truetype');
}}
@font-face {{
  font-family: 'Inter';
  font-weight: 600;
  src: url('{font_inter_600}') format('truetype');
}}
@font-face {{
  font-family: 'Inter';
  font-weight: 700;
  src: url('{font_inter_700}') format('truetype');
}}
@font-face {{
  font-family: 'JetBrains Mono';
  font-weight: 500;
  src: url('{font_mono}') format('truetype');
}}

@page {{
  size: 210mm 297mm;
  margin: 0;
}}

* {{
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}}

body {{
  width: 210mm;
  background-color: #020b18;
  color: #ffffff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}}

.page {{
  width: 210mm;
  height: 297mm;
  max-height: 297mm;
  position: relative;
  page-break-after: always;
  page-break-inside: avoid;
  overflow: hidden;
  background-color: #020b18;
}}

/* Blueprint background grid matching website */
.blueprint-grid {{
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(to right, rgba(0, 229, 255, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 229, 255, 0.05) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
}}

/* Header styles for product pages */
.page-header {{
  position: relative;
  height: 44px;
  background: linear-gradient(90deg, #02102e 0%, #0047e1 60%, #0077ff 100%);
  border-bottom: 2px solid #00e5ff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}}
.page-header h2 {{
  font-family: 'Orbitron', sans-serif;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #ffffff;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 10px;
}}
.page-header h2 .badge {{
  font-size: 9px;
  padding: 2px 7px;
  background: rgba(0, 229, 255, 0.2);
  border: 1px solid #00e5ff;
  border-radius: 3px;
  color: #00e5ff;
  font-weight: 700;
}}
.page-header .brand-stamp {{
  display: flex;
  align-items: center;
  gap: 8px;
}}
.page-header .brand-stamp img {{
  height: 24px;
}}
.page-header .brand-stamp span {{
  font-family: 'Orbitron', sans-serif;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #ffffff;
}}

/* Footer for inner pages */
.page-footer {{
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: #010814;
  border-top: 1px solid rgba(0, 229, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-size: 8.5px;
  color: #7b93b8;
  letter-spacing: 0.5px;
}}
.page-footer .tagline {{
  font-family: 'Orbitron', sans-serif;
  color: #00e5ff;
  font-weight: 700;
  font-size: 8.5px;
  letter-spacing: 1px;
}}
.page-footer .page-num {{
  font-family: 'Orbitron', sans-serif;
  color: #ffffff;
  font-size: 8.5px;
}}

/* Tables */
table.spec-table {{
  width: 100%;
  border-collapse: collapse;
  font-size: 7.5px;
  line-height: 1.15;
  table-layout: fixed;
}}
table.spec-table th {{
  background: linear-gradient(180deg, #09275e 0%, #061c45 100%);
  color: #00e5ff;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: 7px;
  text-transform: uppercase;
  padding: 4px 2px;
  border: 1px solid rgba(0, 229, 255, 0.25);
  text-align: center;
  word-wrap: break-word;
}}
table.spec-table th.param-col {{
  text-align: left;
  padding-left: 5px;
  width: 110px;
}}
table.spec-table td {{
  padding: 3px 2px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
  color: #e2eaf5;
  font-family: 'Inter', sans-serif;
  word-wrap: break-word;
}}
table.spec-table td.param-col {{
  text-align: left;
  padding-left: 5px;
  font-weight: 600;
  color: #9cb5db;
}}
table.spec-table td.model-code {{
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  color: #00e5ff;
}}
table.spec-table tr:nth-child(even) td {{
  background: rgba(255, 255, 255, 0.02);
}}
table.spec-table tr:nth-child(odd) td {{
  background: rgba(0, 30, 80, 0.15);
}}
table.spec-table td.highlight {{
  color: #ff9d00;
  font-weight: 700;
}}

/* Section Card Container */
.product-section {{
  background: rgba(6, 23, 56, 0.7);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 4px;
  margin: 8px 14px;
  padding: 8px 12px;
}}
.section-title-bar {{
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 229, 255, 0.2);
  padding-bottom: 5px;
  margin-bottom: 7px;
}}
.section-title-bar h3 {{
  font-family: 'Orbitron', sans-serif;
  font-size: 11.5px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.8px;
}}
.section-title-bar .model-range {{
  font-family: 'Orbitron', sans-serif;
  font-size: 8.5px;
  color: #00e5ff;
  font-weight: 700;
}}

/* Feature pills */
.feature-pill {{
  display: inline-block;
  padding: 2px 5px;
  font-size: 7.5px;
  background: rgba(0, 71, 225, 0.25);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 3px;
  color: #b8dcff;
  margin: 1px 2px;
}}

/* Taste Scale Card */
.scale-card {{
  display: flex;
  align-items: center;
  background: rgba(5, 20, 50, 0.85);
  border: 1px solid rgba(0, 229, 255, 0.25);
  border-left: 3px solid #00e5ff;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 8px;
}}
.scale-grade {{
  font-family: 'Orbitron', sans-serif;
  font-weight: 800;
  font-size: 10.5px;
  color: #00e5ff;
  width: 85px;
  letter-spacing: 0.5px;
}}
.scale-label {{
  flex: 1;
  font-size: 10px;
  font-weight: 600;
  color: #ffffff;
  padding: 0 10px;
}}
.scale-label small {{
  display: block;
  font-size: 7.8px;
  color: #8daed8;
  font-weight: 400;
  margin-top: 1px;
}}
.scale-val {{
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  color: #ff9d00;
  background: rgba(255, 157, 0, 0.1);
  border: 1px solid rgba(255, 157, 0, 0.3);
  padding: 3px 7px;
  border-radius: 3px;
  white-space: nowrap;
}}
</style>
</head>
<body>

<!-- =========================================================================
     PAGE 1: COVER
     ========================================================================= -->
<div class="page" id="page-1" style="background-image: url('{img_cover_bg}'); background-size: cover; background-position: center;">
  <div class="blueprint-grid" style="opacity: 0.08;"></div>
  
  <!-- Top Right Header: Logo Lockup & Mandatory Taglines -->
  <div style="position: absolute; top: 36px; right: 40px; text-align: right; z-index: 10;">
    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px;">
      <img src="{img_logo}" alt="Valnex Logo" style="height: 48px; object-fit: contain; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));">
      <span style="font-family: 'Orbitron', sans-serif; font-size: 32px; font-weight: 900; letter-spacing: 4px; color: #ffffff;">VALNEX</span>
    </div>
    <div style="font-family: 'Orbitron', sans-serif; font-size: 10.5px; font-weight: 800; color: #00e5ff; letter-spacing: 2.8px; margin-top: 6px; text-transform: uppercase;">
      QUALITY &bull; EXCELLENCE &bull; COMMITMENT
    </div>
    <div style="font-size: 8.5px; color: #8daed8; letter-spacing: 1px; margin-top: 3px; font-weight: 600;">
      VALNEX INDUSTRIES PRIVATE LIMITED
    </div>
  </div>

  <!-- Center Showcase Title -->
  <div style="position: absolute; top: 380px; left: 45px; right: 45px; z-index: 10;">
    <div style="display: inline-block; background: rgba(0, 71, 225, 0.3); border: 1px solid #00e5ff; border-radius: 3px; padding: 4px 12px; margin-bottom: 14px;">
      <span style="font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 700; color: #00e5ff; letter-spacing: 2px;">
        INDUSTRIAL PROCESS AUXILIARY AUTOMATION &amp; COOLING
      </span>
    </div>
    <h1 style="font-family: 'Orbitron', sans-serif; font-size: 34px; font-weight: 900; line-height: 1.15; color: #ffffff; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">
      PRODUCT CATALOGUE
    </h1>
    <p style="font-size: 11.5px; line-height: 1.6; color: #a4c4ed; max-width: 580px; font-weight: 400; margin-bottom: 18px;">
      Comprehensive Engineering Specifications &amp; Process Machinery Architecture for Plastics, Thermal Dynamics, Chemical Synthesis &amp; Automotive Extrusion.
    </p>
    
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <span class="feature-pill" style="font-size: 8.5px; padding: 4px 9px;">WATER CHILLERS</span>
      <span class="feature-pill" style="font-size: 8.5px; padding: 4px 9px;">HOT AIR DRYERS</span>
      <span class="feature-pill" style="font-size: 8.5px; padding: 4px 9px;">HOPPER LOADERS</span>
      <span class="feature-pill" style="font-size: 8.5px; padding: 4px 9px;">MOULD TEMP UNITS</span>
      <span class="feature-pill" style="font-size: 8.5px; padding: 4px 9px;">VOLUMETRIC FEEDERS</span>
      <span class="feature-pill" style="font-size: 8.5px; padding: 4px 9px;">FLAKE CUTTERS</span>
      <span class="feature-pill" style="font-size: 8.5px; padding: 4px 9px;">DEHUMIDIFIERS</span>
      <span class="feature-pill" style="font-size: 8.5px; padding: 4px 9px;">ONLINE LASER MARKING</span>
    </div>
  </div>

  <!-- Bottom Hero Motto & Corporate ID -->
  <div style="position: absolute; bottom: 42px; left: 45px; right: 45px; z-index: 10;">
    <div style="font-family: 'Orbitron', sans-serif; font-size: 32px; font-weight: 900; line-height: 1.1; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase;">
      QUALITY,<br>
      <span style="color: #00e5ff;">EXCELLENCE</span> &amp;<br>
      COMMITMENT
    </div>
    
    <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid rgba(0, 229, 255, 0.3); display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <div style="font-family: 'Orbitron', sans-serif; font-size: 11px; font-weight: 800; color: #ffffff; letter-spacing: 1.2px;">
          VALNEX INDUSTRIES PRIVATE LIMITED
        </div>
        <div style="font-size: 9px; color: #7f9ec7; margin-top: 3px; letter-spacing: 0.5px;">
          3, MARUTI INDUSTRIAL PARK-2, DHAMATVAN, AHMEDABAD - 382435, GUJARAT, INDIA
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 700; color: #00e5ff;">
          WWW.VALNEXINDUSTRIES.COM
        </div>
        <div style="font-size: 8.5px; color: #ff9d00; font-weight: 600; margin-top: 3px;">
          OFFICIAL 2026 EDITION
        </div>
      </div>
    </div>
  </div>
</div>

<!-- =========================================================================
     PAGE 2: COMPANY PROFILE & TASTE SCALE
     ========================================================================= -->
<div class="page" id="page-2" style="display: flex;">
  <div class="blueprint-grid" style="opacity: 0.05;"></div>
  
  <!-- Left Vertical Stripe -->
  <div style="width: 70mm; height: 100%; background: linear-gradient(180deg, #0047e1 0%, #001f66 100%); border-right: 2px solid #00e5ff; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 36px 18px;">
    <!-- Large Vertical Rotated Wordmark centered perfectly -->
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-90deg); transform-origin: center center; white-space: nowrap; pointer-events: none;">
      <span style="font-family: 'Orbitron', sans-serif; font-size: 68px; font-weight: 900; letter-spacing: 14px; color: rgba(255, 255, 255, 0.95); text-shadow: 0 0 30px rgba(0, 229, 255, 0.4);">
        VALNEX
      </span>
    </div>
    
    <!-- Top left badges -->
    <div style="position: relative; z-index: 5;">
      <div style="font-family: 'Orbitron', sans-serif; font-size: 11px; font-weight: 800; color: #00e5ff; letter-spacing: 1.5px;">
        EST. 2021
      </div>
      <div style="font-size: 8.5px; color: #d0e2ff; margin-top: 4px; line-height: 1.4;">
        AHMEDABAD, GUJARAT<br>
        MANUFACTURING HUB
      </div>
    </div>
    
    <!-- Bottom left certification -->
    <div style="position: relative; z-index: 5; background: rgba(0, 15, 50, 0.7); border: 1px solid rgba(0, 229, 255, 0.4); border-radius: 4px; padding: 9px;">
      <div style="font-family: 'Orbitron', sans-serif; font-size: 8.5px; font-weight: 700; color: #00e5ff;">
        GLOBAL PRECISION
      </div>
      <div style="font-size: 7.8px; color: #b8dcff; margin-top: 3px; line-height: 1.35;">
        Engineering auxiliary automation for zero-downtime manufacturing plants across India.
      </div>
    </div>
  </div>

  <!-- Right Content Pane -->
  <div style="flex: 1; height: 100%; padding: 32px 28px 40px 28px; display: flex; flex-direction: column; justify-content: space-between; position: relative; z-index: 5;">
    <div>
      <!-- Company Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; border-bottom: 2px solid #0047e1; padding-bottom: 10px;">
        <div>
          <span style="font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 700; color: #00e5ff; letter-spacing: 2px; text-transform: uppercase;">
            CORPORATE OVERVIEW
          </span>
          <h2 style="font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: 1px; margin-top: 2px;">
            COMPANY PROFILE
          </h2>
        </div>
        <div style="background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(0, 229, 255, 0.3); border-radius: 4px; padding: 4px 8px; display: inline-flex; align-items: center;">
          <img src="{img_make_in_india}" alt="Make in India" style="height: 26px; object-fit: contain;">
        </div>
      </div>

      <!-- Narrative Copy -->
      <div style="font-size: 9.2px; line-height: 1.55; color: #cadbf5; margin-bottom: 16px;">
        <p style="margin-bottom: 8px;">
          <strong style="color: #ffffff; font-family: 'Orbitron', sans-serif; font-size: 9.5px;">Valnex Industries Private Limited</strong> is a premier Indian manufacturer of advanced process cooling and auxiliary automation equipment. Based in Ahmedabad, Gujarat, we fabricate robust, energy-efficient machinery designed for continuous 24/7 industrial service across plastics processing, rubber moulding, pharmaceuticals, chemicals, food, packaging, and defense sectors.
        </p>
        <p style="margin-bottom: 8px;">
          With a dedicated team of thermal engineers, mechanical designers, and precision fabricators, our facility integrates high-precision CNC tooling, certified refrigeration testing bays, and rigorous quality inspection protocols. Every machine incorporates world-class hermetic compressors, stainless steel fluid paths, and intuitive microcomputer controls compliant with international safety and performance standards.
        </p>
        <p>
          Beyond standard equipment configurations, Valnex offers tailored custom engineering to match exact plant layouts, heat dissipation dynamics, and throughput targets. Our products are recognized across India for supreme structural rigidity, thermal accuracy, and minimal total lifecycle cost.
        </p>
      </div>

      <!-- Taste Scale Section -->
      <div style="margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <h3 style="font-family: 'Orbitron', sans-serif; font-size: 11.5px; font-weight: 800; color: #ffffff; letter-spacing: 0.8px;">
              THE VALNEX QUALITY &amp; PRECISION TASTE SCALE
            </h3>
            <div style="font-size: 7.8px; color: #00e5ff; letter-spacing: 0.5px; margin-top: 1px;">
              Standardized 5-tier engineering benchmarks enforced across every factory assembly:
            </div>
          </div>
          <span style="font-family: 'Orbitron', sans-serif; font-size: 7.5px; background: rgba(0, 229, 255, 0.15); border: 1px solid #00e5ff; padding: 2px 6px; border-radius: 3px; color: #00e5ff;">
            100% FAT VERIFIED
          </span>
        </div>

        <div class="scale-card">
          <div class="scale-grade">GRADE 01</div>
          <div class="scale-label">
            MICRO-TOLERANCE PRECISION
            <small>High-precision laser beam alignment, dynamic rotor balancing &amp; runout control</small>
          </div>
          <div class="scale-val">&plusmn;0.0001 mm REPEATABILITY</div>
        </div>

        <div class="scale-card">
          <div class="scale-grade">GRADE 02</div>
          <div class="scale-label">
            THERMAL EQUILIBRIUM STABILITY
            <small>Microcomputer PID temperature regulation for chillers and mould controllers</small>
          </div>
          <div class="scale-val">&Delta;T &plusmn;0.5 &deg;C PID STABILITY</div>
        </div>

        <div class="scale-card">
          <div class="scale-grade">GRADE 03</div>
          <div class="scale-label">
            HYGIENIC METALLURGY
            <small>Food &amp; pharmaceutical grade corrosion-resistant stainless steel fluid paths</small>
          </div>
          <div class="scale-val">SS 304 / SS 316 SANITARY</div>
        </div>

        <div class="scale-card">
          <div class="scale-grade">GRADE 04</div>
          <div class="scale-label">
            FLUID &amp; ACOUSTIC EFFICIENCY
            <small>Aerodynamically balanced axial fans, internal sound dampening &amp; vibration isolation</small>
          </div>
          <div class="scale-val">&lt; 83 dB(A) LOW NOISE</div>
        </div>

        <div class="scale-card" style="margin-bottom: 0;">
          <div class="scale-grade">GRADE 05</div>
          <div class="scale-label">
            100% PREDEFINED UNIT TESTING
            <small>Comprehensive factory acceptance testing (FAT) under full operational heat loads</small>
          </div>
          <div class="scale-val">100% RUN-IN FACTORY INSPECTION</div>
        </div>
      </div>
    </div>

    <!-- Bottom Mission Motto -->
    <div style="background: rgba(0, 71, 225, 0.15); border: 1px solid rgba(0, 229, 255, 0.3); border-radius: 4px; padding: 10px 14px;">
      <div style="font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 800; line-height: 1.5; color: #ffffff; letter-spacing: 0.5px;">
        VALNEX'S UTMOST PRIORITY IS CUSTOMER SATISFACTION THROUGH <span style="color: #00e5ff;">QUALITY, EXCELLENCE &amp; COMMITMENT</span> IN MANUFACTURING &amp; SUPERIOR CUSTOMER SERVICE THROUGH PRINCIPLES, PEOPLE, PASSION &amp; PROGRESS.
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 8px; color: #7f9ec7; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 5px;">
        <span>VALNEX INDUSTRIES PRIVATE LIMITED</span>
        <span style="color: #00e5ff; font-weight: 600;">PAGE 02 OF 08</span>
      </div>
    </div>
  </div>
</div>

<!-- =========================================================================
     PAGE 3: WATER CHILLERS (AIR COOLED & WATER COOLED)
     ========================================================================= -->
<div class="page" id="page-3">
  <div class="blueprint-grid" style="opacity: 0.05;"></div>
  
  <div class="page-header">
    <h2>
      <span>AIR COOLED WATER CHILLER &amp; WATER COOLED CHILLER</span>
      <span class="badge">VI SERIES // 2 TO 65.5 TR</span>
    </h2>
    <div class="brand-stamp">
      <img src="{img_logo}" alt="Valnex Logo">
      <span>VALNEX</span>
    </div>
  </div>

  <div style="padding: 10px 14px 38px 14px; height: calc(297mm - 44px); display: flex; flex-direction: column; justify-content: space-between;">
    <div>
      <!-- Product Dual Showcase Cards -->
      <div style="display: flex; gap: 12px; margin-bottom: 8px;">
        <!-- Card 1: Air Cooled -->
        <div style="flex: 1; background: rgba(6, 23, 56, 0.85); border: 1px solid rgba(0, 229, 255, 0.25); border-radius: 4px; padding: 6px 10px; display: flex; gap: 10px; align-items: center;">
          <img src="{img_chillers}" alt="Air Cooled Chiller" style="height: 66px; width: 66px; object-fit: contain; border-radius: 4px; background: rgba(0, 10, 30, 0.5);">
          <div>
            <div style="font-family: 'Orbitron', sans-serif; font-size: 10.5px; font-weight: 800; color: #ffffff;">
              AIR COOLED WATER CHILLER
            </div>
            <div style="font-size: 7.8px; color: #00e5ff; font-family: 'Orbitron', sans-serif; margin-top: 1px;">
              MODEL RANGE: VI 02A TO VI 060A (2.0 - 59.0 TR)
            </div>
            <div style="font-size: 7.2px; color: #a4c4ed; margin-top: 2px; line-height: 1.3;">
              Independent refrigeration circuits, Danfoss/Copeland hermetic scroll compressors, high-efficiency aluminum-finned copper condenser, stainless steel water reservoir.
            </div>
          </div>
        </div>

        <!-- Card 2: Water Cooled -->
        <div style="flex: 1; background: rgba(6, 23, 56, 0.85); border: 1px solid rgba(0, 229, 255, 0.25); border-radius: 4px; padding: 6px 10px; display: flex; gap: 10px; align-items: center;">
          <img src="{img_chillers}" alt="Water Cooled Chiller" style="height: 66px; width: 66px; object-fit: contain; border-radius: 4px; background: rgba(0, 10, 30, 0.5); transform: scaleX(-1);">
          <div>
            <div style="font-family: 'Orbitron', sans-serif; font-size: 10.5px; font-weight: 800; color: #ffffff;">
              WATER COOLED WATER CHILLER
            </div>
            <div style="font-size: 7.8px; color: #00e5ff; font-family: 'Orbitron', sans-serif; margin-top: 1px;">
              MODEL RANGE: VI 02W TO VI 060W (2.7 - 65.5 TR)
            </div>
            <div style="font-size: 7.2px; color: #a4c4ed; margin-top: 2px; line-height: 1.3;">
              High-efficiency shell-and-tube condenser engineered for external cooling tower loops. Zero ambient heat load rejection into production spaces, ultra-compact skidded profile.
            </div>
          </div>
        </div>
      </div>

      <!-- Table 1: Air Cooled Chiller -->
      <div style="margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
          <span style="font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 800; color: #00e5ff; letter-spacing: 0.8px;">
            TECHNICAL SPECIFICATIONS: AIR COOLED WATER CHILLER
          </span>
          <span style="font-size: 7.2px; color: #7f9ec7;">
            Refrigerant: R-22 / R-407C / R-410A &bull; Power: 415V &plusmn;10%, 50Hz, 3-Phase
          </span>
        </div>
        <table class="spec-table" style="font-size: 6.8px;">
          <thead>
            <tr>
              <th class="param-col" style="width: 105px;">Model Code</th>
              <th>VI 02A</th><th>VI 03A</th><th>VI 05A</th><th>VI 06A</th><th>VI 07A</th><th>VI 08A</th><th>VI 010A</th><th>VI 015A</th><th>VI 017A</th><th>VI 024A</th><th>VI 030A</th><th>VI 040A</th><th>VI 050A</th><th>VI 060A</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="param-col">Cooling Capacity (TR)</td>
              <td class="model-code">2.0</td><td class="model-code">3.15</td><td class="model-code">5.0</td><td class="model-code">5.53</td><td class="model-code">7.2</td><td class="model-code">9.4</td><td class="model-code">11.3</td><td class="model-code">14.2</td><td class="model-code">19.1</td><td class="model-code">24.4</td><td class="model-code">29.5</td><td class="model-code">38.3</td><td class="model-code">49.2</td><td class="model-code">59.0</td>
            </tr>
            <tr>
              <td class="param-col">Compressor (kW)</td>
              <td>2.5</td><td>3.17</td><td>5.2</td><td>5.37</td><td>6.69</td><td>9.06</td><td>10.76</td><td>13.65</td><td>18.36</td><td>23.1</td><td>27.6</td><td>18.3&times;2</td><td>23.1&times;2</td><td>27.6&times;2</td>
            </tr>
            <tr>
              <td class="param-col">Process Pump (kW)</td>
              <td>0.46</td><td>0.96</td><td>1.1</td><td>1.1</td><td>1.1</td><td>1.5</td><td>1.5</td><td>2.0</td><td>2.2</td><td>2.2</td><td>3.0</td><td>4.0</td><td>5.5</td><td>7.5</td>
            </tr>
            <tr>
              <td class="param-col">Pump Flow (LPM)</td>
              <td>55</td><td>105</td><td>150</td><td>150</td><td>230</td><td>230</td><td>230</td><td>230</td><td>230</td><td>230</td><td>380</td><td>480</td><td>480</td><td>880</td>
            </tr>
            <tr>
              <td class="param-col">Max Pressure (Bar)</td>
              <td>2.4</td><td>3.0</td><td>4.6</td><td>4.8</td><td>4.8</td><td>4.8</td><td>4.8</td><td>4.8</td><td>4.8</td><td>4.8</td><td>4.8</td><td>4.8</td><td>5.6</td><td>4.4</td>
            </tr>
            <tr>
              <td class="param-col">Water Tank (Ltr)</td>
              <td>40</td><td>100</td><td>100</td><td>100</td><td>150</td><td>150</td><td>150</td><td>200</td><td>200</td><td>200</td><td>300</td><td>500</td><td>500</td><td>1000</td>
            </tr>
            <tr>
              <td class="param-col">Fan Qty / kW</td>
              <td>1/0.25</td><td>1/0.8</td><td>2/0.5</td><td>2/0.5</td><td>2/1.2</td><td>2/1.2</td><td>2/1.2</td><td>&mdash;</td><td>&mdash;</td><td>4/3.2</td><td>4/3.2</td><td>6/4.8</td><td>8/6.4</td><td>8/6.4</td>
            </tr>
            <tr>
              <td class="param-col">Conn. BSP (In/Out)</td>
              <td>1"</td><td>1"</td><td>1"</td><td>1"</td><td>1&frac12;"</td><td>1&frac12;"</td><td>1&frac12;"</td><td>1&frac12;"</td><td>1&frac12;"</td><td>1&frac12;"</td><td>2"</td><td>2"</td><td>2"</td><td>2&frac12;"</td>
            </tr>
            <tr>
              <td class="param-col">Dimensions (L&times;W&times;H)</td>
              <td style="font-size:6px;">1100&times;775<br>&times;1300</td>
              <td style="font-size:6px;">1600&times;1025<br>&times;1700</td>
              <td style="font-size:6px;">1700&times;1025<br>&times;1700</td>
              <td style="font-size:6px;">1700&times;1025<br>&times;1700</td>
              <td style="font-size:6px;">1850&times;1125<br>&times;1750</td>
              <td style="font-size:6px;">1850&times;1125<br>&times;1750</td>
              <td style="font-size:6px;">1850&times;1125<br>&times;1750</td>
              <td style="font-size:6px;">2100&times;1475<br>&times;1950</td>
              <td style="font-size:6px;">2300&times;1475<br>&times;2100</td>
              <td style="font-size:6px;">2750&times;1705<br>&times;2200</td>
              <td style="font-size:6px;">2750&times;1705<br>&times;2200</td>
              <td style="font-size:6px;">3350&times;1705<br>&times;2200</td>
              <td style="font-size:6px;">3900&times;2000<br>&times;2350</td>
              <td style="font-size:6px;">3900&times;2000<br>&times;2600</td>
            </tr>
            <tr>
              <td class="param-col">Weight (kg)</td>
              <td>150</td><td>500</td><td>500</td><td>500</td><td>700</td><td>700</td><td>700</td><td>900</td><td>1000</td><td>1100</td><td>1500</td><td>1600</td><td>2000</td><td>2200</td>
            </tr>
            <tr>
              <td class="param-col">Connected Load (kW)</td>
              <td class="highlight">3.21</td><td class="highlight">4.93</td><td class="highlight">6.80</td><td class="highlight">6.97</td><td class="highlight">8.99</td><td class="highlight">11.76</td><td class="highlight">13.46</td><td class="highlight">18.05</td><td class="highlight">23.68</td><td class="highlight">28.50</td><td class="highlight">33.80</td><td class="highlight">45.40</td><td class="highlight">58.20</td><td class="highlight">69.10</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table 2: Water Cooled Chiller -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
          <span style="font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 800; color: #00e5ff; letter-spacing: 0.8px;">
            TECHNICAL SPECIFICATIONS: WATER COOLED WATER CHILLER
          </span>
          <span style="font-size: 7.2px; color: #7f9ec7;">
            Shell &amp; Tube Condenser &bull; Cooling Tower Linked &bull; Heavy-Duty Hermetic Scroll
          </span>
        </div>
        <table class="spec-table" style="font-size: 6.8px;">
          <thead>
            <tr>
              <th class="param-col" style="width: 105px;">Model Code</th>
              <th>VI 02W</th><th>VI 03W</th><th>VI 05W</th><th>VI 06W</th><th>VI 07W</th><th>VI 08W</th><th>VI 010W</th><th>VI 015W</th><th>VI 017W</th><th>VI 024W</th><th>VI 030W</th><th>VI 040W</th><th>VI 050W</th><th>VI 060W</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="param-col">Cooling Capacity (TR)</td>
              <td class="model-code">2.7</td><td class="model-code">3.47</td><td class="model-code">5.82</td><td class="model-code">6.44</td><td class="model-code">8.0</td><td class="model-code">10.43</td><td class="model-code">12.4</td><td class="model-code">15.67</td><td class="model-code">21.3</td><td class="model-code">27.5</td><td class="model-code">32.7</td><td class="model-code">&mdash;</td><td class="model-code">55.0</td><td class="model-code">65.5</td>
            </tr>
            <tr>
              <td class="param-col">Compressor (kW)</td>
              <td>2.35</td><td>2.20</td><td>3.80</td><td>3.98</td><td>5.17</td><td>6.56</td><td>8.05</td><td>10.20</td><td>14.15</td><td>18.0</td><td>21.5</td><td>43.0</td><td>18.1&times;2</td><td>21.5&times;2</td>
            </tr>
            <tr>
              <td class="param-col">Process Pump (kW/LPM)</td>
              <td>0.46/55</td><td>0.96/105</td><td>1.1/150</td><td>1.1/150</td><td>1.1/230</td><td>1.5/230</td><td>1.5/230</td><td>2.0/230</td><td>2.2/230</td><td>2.2/230</td><td>3.0/380</td><td>4.0/480</td><td>5.5/480</td><td>7.5/880</td>
            </tr>
            <tr>
              <td class="param-col">Max Pressure (Bar)</td>
              <td>2.4</td><td>3.0</td><td>4.6</td><td>4.8</td><td>4.8</td><td>4.8</td><td>4.8</td><td>4.8</td><td>4.8</td><td>4.8</td><td>4.8</td><td>4.8</td><td>5.6</td><td>4.4</td>
            </tr>
            <tr>
              <td class="param-col">Water Tank (Ltr)</td>
              <td>40</td><td>100</td><td>100</td><td>100</td><td>100</td><td>150</td><td>150</td><td>200</td><td>200</td><td>200</td><td>300</td><td>480</td><td>500</td><td>1000</td>
            </tr>
            <tr>
              <td class="param-col">Condenser Tower (TR)</td>
              <td>5</td><td>5</td><td>8</td><td>10</td><td>10</td><td>15</td><td>20</td><td>30</td><td>32</td><td>35</td><td>40</td><td>500</td><td>70</td><td>85</td>
            </tr>
            <tr>
              <td class="param-col">Condenser Flow (LPM)</td>
              <td>50</td><td>70</td><td>130</td><td>150</td><td>180</td><td>220</td><td>240</td><td>300</td><td>320</td><td>350</td><td>400</td><td>600</td><td>800</td><td>900</td>
            </tr>
            <tr>
              <td class="param-col">Condenser Conn. BSP</td>
              <td>1"</td><td>1"</td><td>1"</td><td>1"</td><td>1&frac12;"</td><td>1&frac12;"</td><td>1&frac12;"</td><td>1&frac12;"</td><td>1&frac12;"</td><td>1&frac12;"</td><td>2"</td><td>2"</td><td>2"</td><td>2"</td>
            </tr>
            <tr>
              <td class="param-col">Process Conn. BSP</td>
              <td>1"</td><td>1"</td><td>1"</td><td>1"</td><td>1&frac12;"</td><td>1&frac12;"</td><td>1&frac12;"</td><td>1&frac12;"</td><td>1&frac12;"</td><td>1&frac12;"</td><td>2"</td><td>2"</td><td>2"</td><td>2&frac12;"</td>
            </tr>
            <tr>
              <td class="param-col">Weight (kg)</td>
              <td>150</td><td>150</td><td>400</td><td>400</td><td>800</td><td>800</td><td>800</td><td>850</td><td>850</td><td>900</td><td>1300</td><td>2000</td><td>2000</td><td>2000</td>
            </tr>
            <tr>
              <td class="param-col">Connected Load (kW)</td>
              <td class="highlight">2.35</td><td class="highlight">3.16</td><td class="highlight">4.90</td><td class="highlight">5.08</td><td class="highlight">6.27</td><td class="highlight">8.06</td><td class="highlight">9.55</td><td class="highlight">12.20</td><td class="highlight">16.35</td><td class="highlight">20.20</td><td class="highlight">24.50</td><td class="highlight">&mdash;</td><td class="highlight">41.70</td><td class="highlight">48.50</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Page Footer -->
    <div class="page-footer">
      <div class="tagline">QUALITY &bull; EXCELLENCE &bull; COMMITMENT</div>
      <div>VALNEX INDUSTRIES PRIVATE LIMITED &bull; PROCESS COOLING DIVISION</div>
      <div class="page-num">PAGE 03 OF 08</div>
    </div>
  </div>
</div>

<!-- =========================================================================
     PAGE 4: HOT AIR DRYER & VACUUM HOPPER LOADER
     ========================================================================= -->
<div class="page" id="page-4">
  <div class="blueprint-grid" style="opacity: 0.05;"></div>
  
  <div class="page-header">
    <h2>
      <span>HOT AIR DRYER &amp; VACUUM HOPPER LOADER</span>
      <span class="badge">RESIN TREATMENT &amp; CONVEYING</span>
    </h2>
    <div class="brand-stamp">
      <img src="{img_logo}" alt="Valnex Logo">
      <span>VALNEX</span>
    </div>
  </div>

  <div style="padding: 10px 14px 38px 14px; height: calc(297mm - 44px); display: flex; flex-direction: column; justify-content: space-between;">
    <div>
      <!-- TOP SECTION: HOT AIR DRYER -->
      <div class="product-section" style="margin: 0 0 10px 0;">
        <div class="section-title-bar">
          <h3>HOT AIR DRYER // VAL-50 TO VAL-800</h3>
          <span class="model-range">CAPACITY: 60 TO 800 LITERS</span>
        </div>

        <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 7px;">
          <img src="{img_hot_air_dryer}" alt="Hot Air Dryer" style="height: 95px; width: 95px; object-fit: contain; background: rgba(0, 10, 30, 0.5); border-radius: 4px; padding: 4px; border: 1px solid rgba(0, 229, 255, 0.2);">
          <div style="flex: 1;">
            <div style="font-size: 8.5px; color: #cadbf5; line-height: 1.45;">
              Valnex Hot Air Dryers provide high-efficiency moisture extraction for non-hygroscopic raw plastic polymers (PP, PE, PS, ABS). Features double-layer stainless steel (SS 304) internal hopper insulation, hot air down-blowing dispersion cone preventing localized hot spots, and precise microcomputer PID temperature control.
            </div>
            <div style="margin-top: 5px;">
              <span class="feature-pill">SS 304 Contact Parts</span>
              <span class="feature-pill">PID &plusmn;1&deg;C Controller</span>
              <span class="feature-pill">Overheat Protection</span>
              <span class="feature-pill">Uniform Thermal Down-Blowing</span>
            </div>
          </div>
        </div>

        <!-- Table: Hot Air Dryer -->
        <table class="spec-table">
          <thead>
            <tr>
              <th class="param-col">Model Code</th>
              <th>Capacity (L)</th>
              <th>Height (mm)</th>
              <th>Width (mm)</th>
              <th>Depth (mm)</th>
              <th>Heater (kW)</th>
              <th>Blowing Power (W)</th>
              <th>Supply Voltage</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="model-code param-col">VAL - 50</td><td>60</td><td>1040</td><td>730</td><td>430</td><td>2.7</td><td>90</td><td>415V, 3-Phase</td></tr>
            <tr><td class="model-code param-col">VAL - 100</td><td>100</td><td>1200</td><td>680</td><td>620</td><td>3.9</td><td>200</td><td>415V, 3-Phase</td></tr>
            <tr><td class="model-code param-col">VAL - 150</td><td>150</td><td>1234</td><td>1020</td><td>660</td><td>6.0</td><td>250</td><td>415V, 3-Phase</td></tr>
            <tr><td class="model-code param-col">VAL - 200</td><td>200</td><td>1390</td><td>1250</td><td>660</td><td>6.0</td><td>250</td><td>415V, 3-Phase</td></tr>
            <tr><td class="model-code param-col">VAL - 300</td><td>300</td><td>1640</td><td>1250</td><td>840</td><td>10.0</td><td>400</td><td>415V, 3-Phase</td></tr>
            <tr><td class="model-code param-col">VAL - 400</td><td>400</td><td>1840</td><td>1250</td><td>840</td><td>12.0</td><td>400</td><td>415V, 3-Phase</td></tr>
            <tr><td class="model-code param-col">VAL - 600</td><td>600</td><td>1910</td><td>1360</td><td>990</td><td>18.0</td><td>750</td><td>415V, 3-Phase</td></tr>
            <tr><td class="model-code param-col">VAL - 800</td><td>800</td><td>2260</td><td>1370</td><td>980</td><td>18.0</td><td>750</td><td>415V, 3-Phase</td></tr>
          </tbody>
        </table>
      </div>

      <!-- BOTTOM SECTION: VACUUM HOPPER LOADER -->
      <div class="product-section" style="margin: 0;">
        <div class="section-title-bar">
          <h3>VACUUM HOPPER LOADER // VAL-02 TO VAL-32</h3>
          <span class="model-range">CONVEYING: UP TO 1200 KG/HR</span>
        </div>

        <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 7px;">
          <img src="{img_hopper_loader}" alt="Vacuum Hopper Loader" style="height: 95px; width: 95px; object-fit: contain; background: rgba(0, 10, 30, 0.5); border-radius: 4px; padding: 4px; border: 1px solid rgba(0, 229, 255, 0.2);">
          <div style="flex: 1;">
            <div style="font-size: 8.5px; color: #cadbf5; line-height: 1.45;">
              Automated raw granule vacuum transport system directly to processing machine hoppers. Equipped with high-velocity blowers, stainless steel receivers, audible material-shortage alarm, and automatic reverse pulse-jet dust clearing for filter longevity.
            </div>
            <div style="margin-top: 5px;">
              <span class="feature-pill">Microprocessor Control</span>
              <span class="feature-pill">Auto Dust Reverse Jet</span>
              <span class="feature-pill">Proportional Mixing Option</span>
              <span class="feature-pill">SS Filter Screen</span>
            </div>
          </div>
        </div>

        <!-- Table: Hopper Loader -->
        <table class="spec-table" style="margin-bottom: 6px;">
          <thead>
            <tr>
              <th class="param-col">Specification Parameter</th>
              <th>VAL-02</th>
              <th>VAL-07</th>
              <th>VAL-14</th>
              <th>VAL-85</th>
              <th>VAL-12</th>
              <th>VAL-32</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="param-col">Receiver Volume (Liters)</td><td class="model-code">6</td><td class="model-code">6</td><td class="model-code">14</td><td class="model-code">85</td><td class="model-code">12</td><td class="model-code">32</td></tr>
            <tr><td class="param-col">Receiver Body Diameter (mm)</td><td>203</td><td>203</td><td>304</td><td>635</td><td>254</td><td>381</td></tr>
            <tr><td class="param-col">Loader Height (mm)</td><td>640</td><td>470</td><td>475</td><td>1155</td><td>690</td><td>900</td></tr>
            <tr><td class="param-col">Material / Vacuum Line Size</td><td>40 mm (1.5")</td><td>40-50 mm (1.5"-2")</td><td>40-50-60 mm</td><td>2.5", 3", 4"</td><td>50-60-75 mm</td><td>50-60-75 mm</td></tr>
            <tr><td class="param-col">Vacuum Blower Motor (kW)</td><td>0.9 kW</td><td>0.9 / 1.5 / 2.2 kW</td><td>4.0 / 5.5 / 7.5 kW</td><td>7.5 kW</td><td>4.0 kW</td><td>7.5 kW</td></tr>
            <tr><td class="param-col">Nominal Conveying (kg/hr)</td><td class="highlight">30</td><td class="highlight">150 - 200</td><td class="highlight">600 - 750</td><td class="highlight">1200</td><td class="highlight">250</td><td class="highlight">500</td></tr>
            <tr><td class="param-col">Operating Supply Voltage</td><td>230V 1&oslash;</td><td>415V 3&oslash;</td><td>415V 3&oslash;</td><td>415V 3&oslash;</td><td>415V 3&oslash;</td><td>415V 3&oslash;</td></tr>
          </tbody>
        </table>

        <!-- Model Nomenclature Callout -->
        <div style="background: rgba(0, 30, 80, 0.35); border: 1px solid rgba(0, 229, 255, 0.15); border-radius: 3px; padding: 4px 8px; font-size: 7.2px; color: #a4c4ed; display: flex; justify-content: space-between; align-items: center;">
          <div><strong style="color: #00e5ff;">MODEL NOMENCLATURE:</strong> <strong>VAL-02:</strong> Single-Phase &bull; <strong>VAL 2 AB:</strong> Ratio Valve &bull; <strong>VAL-07 MC:</strong> Manual Clean &bull; <strong>VAL-07 AC:</strong> Auto Pulse Clean &bull; <strong>VAL-07 AB:</strong> Ratio Valve</div>
          <div style="color: #ff9d00;">Air Req: 28.3 L/min @ 5.51 bar</div>
        </div>
      </div>
    </div>

    <!-- Page Footer -->
    <div class="page-footer">
      <div class="tagline">QUALITY &bull; EXCELLENCE &bull; COMMITMENT</div>
      <div>VALNEX INDUSTRIES PRIVATE LIMITED &bull; MATERIAL CONVEYING &amp; DRYING</div>
      <div class="page-num">PAGE 04 OF 08</div>
    </div>
  </div>
</div>

<!-- =========================================================================
     PAGE 5: MOULD TEMPERATURE CONTROLLER & VOLUMETRIC FEEDER
     ========================================================================= -->
<div class="page" id="page-5">
  <div class="blueprint-grid" style="opacity: 0.05;"></div>
  
  <div class="page-header">
    <h2>
      <span>MOULD TEMPERATURE CONTROLLER &amp; VOLUMETRIC FEEDER</span>
      <span class="badge">THERMAL REGULATION &amp; DOSING</span>
    </h2>
    <div class="brand-stamp">
      <img src="{img_logo}" alt="Valnex Logo">
      <span>VALNEX</span>
    </div>
  </div>

  <div style="padding: 10px 14px 38px 14px; height: calc(297mm - 44px); display: flex; flex-direction: column; justify-content: space-between;">
    <div>
      <!-- TOP SECTION: TCU -->
      <div class="product-section" style="margin: 0 0 10px 0;">
        <div class="section-title-bar">
          <h3>MOULD TEMPERATURE CONTROLLER // OIL &amp; WATER UNITS</h3>
          <span class="model-range">VAL-O-3 TO VAL-W-18 // UP TO 180&deg;C</span>
        </div>

        <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 7px;">
          <img src="{img_tcu}" alt="Mould Temperature Controller" style="height: 95px; width: 95px; object-fit: contain; background: rgba(0, 10, 30, 0.5); border-radius: 4px; padding: 4px; border: 1px solid rgba(0, 229, 255, 0.2);">
          <div style="flex: 1;">
            <div style="font-size: 8.5px; color: #cadbf5; line-height: 1.45;">
              Valnex TCU series delivers precise tool temperature regulation for injection moulding, blow moulding, and extrusion dies. Featuring high-pressure multistage pumps, dual digital PID microcomputer controller (&plusmn;0.5&deg;C), automatic phase-reversal protection, and dual oil/water media options.
            </div>
            <div style="margin-top: 5px;">
              <span class="feature-pill">Oil Type: Up to 180&deg;C</span>
              <span class="feature-pill">Water Type: Up to 95&deg;C</span>
              <span class="feature-pill">Multistage High-Pressure Pump</span>
              <span class="feature-pill">Safety Diagnostic Alarms</span>
            </div>
          </div>
        </div>

        <!-- Table: TCU -->
        <table class="spec-table">
          <thead>
            <tr>
              <th class="param-col">Model Code</th>
              <th>Circulating Media</th>
              <th>Heating (kW)</th>
              <th>Max Temp (&deg;C)</th>
              <th>Cooling (kW)</th>
              <th>Pump Bar</th>
              <th>Pump Motor (kW)</th>
              <th>Flow Rate (LPM)</th>
              <th>Tank (Ltr)</th>
              <th>Weight (kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="model-code param-col">VAL-O-3</td><td>Thermal Oil</td><td>3 kW</td><td>180&deg;C</td><td>20 kW</td><td>3.8 Bar</td><td>0.5 kW</td><td>65 LPM</td><td>16 L</td><td>60 kg</td></tr>
            <tr><td class="model-code param-col">VAL-O-6</td><td>Thermal Oil</td><td>6 kW</td><td>180&deg;C</td><td>20 kW</td><td>3.8 Bar</td><td>0.5 kW</td><td>65 LPM</td><td>16 L</td><td>60 kg</td></tr>
            <tr><td class="model-code param-col">VAL-O-9</td><td>Thermal Oil</td><td>9 kW</td><td>180&deg;C</td><td>20 kW</td><td>3.8 Bar</td><td>0.5 kW</td><td>65 LPM</td><td>16 L</td><td>60 kg</td></tr>
            <tr><td class="model-code param-col">VAL-O-12</td><td>Thermal Oil</td><td>12 kW</td><td>180&deg;C</td><td>28 kW</td><td>5.0 Bar</td><td>2.2 kW</td><td>100 LPM</td><td>45 L</td><td>100 kg</td></tr>
            <tr><td class="model-code param-col">VAL-O-18</td><td>Thermal Oil</td><td>18 kW</td><td>180&deg;C</td><td>28 kW</td><td>5.0 Bar</td><td>2.2 kW</td><td>150 LPM</td><td>45 L</td><td>120 kg</td></tr>
            <tr><td class="model-code param-col">VAL-W-3</td><td>Water</td><td>3 kW</td><td>95&deg;C</td><td>20 kW</td><td>3.8 Bar</td><td>0.5 kW</td><td>65 LPM</td><td>16 L</td><td>60 kg</td></tr>
            <tr><td class="model-code param-col">VAL-W-6</td><td>Water</td><td>6 kW</td><td>95&deg;C</td><td>20 kW</td><td>3.8 Bar</td><td>0.5 kW</td><td>65 LPM</td><td>16 L</td><td>60 kg</td></tr>
            <tr><td class="model-code param-col">VAL-W-9</td><td>Water</td><td>9 kW</td><td>95&deg;C</td><td>20 kW</td><td>3.8 Bar</td><td>0.5 kW</td><td>65 LPM</td><td>16 L</td><td>60 kg</td></tr>
            <tr><td class="model-code param-col">VAL-W-18</td><td>Water</td><td>18 kW</td><td>95&deg;C</td><td>28 kW</td><td>5.0 Bar</td><td>2.2 kW</td><td>150 LPM</td><td>45 L</td><td>120 kg</td></tr>
          </tbody>
        </table>
        <div style="font-size: 7px; color: #7f9ec7; margin-top: 3px; text-align: right;">
          Supply Voltage: 415V, 50Hz, 3-Phase with Neutral &amp; Earthing &bull; Control Voltage: 230V AC
        </div>
      </div>

      <!-- BOTTOM SECTION: VOLUMETRIC FEEDER -->
      <div class="product-section" style="margin: 0;">
        <div class="section-title-bar">
          <h3>VOLUMETRIC FEEDER // MASTER BATCH DOSING SYSTEM</h3>
          <span class="model-range">VAL 1 TO VAL 5 // 0.004 TO 73.0 KG/HR</span>
        </div>

        <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 7px;">
          <img src="{img_feeder}" alt="Volumetric Feeder" style="height: 90px; width: 90px; object-fit: contain; background: rgba(0, 10, 30, 0.5); border-radius: 4px; padding: 4px; border: 1px solid rgba(0, 229, 255, 0.2);">
          <div style="flex: 1;">
            <div style="font-size: 8.5px; color: #cadbf5; line-height: 1.45;">
              Engineered for precise proportional addition of masterbatches, additives, and virgin regrinds. Driven by a high-torque brushless DC motor with chrome-plated micro-extrusion screw preventing material adhesion and ensuring repeatable additive accuracy.
            </div>
            <div style="margin-top: 5px;">
              <span class="feature-pill">Brushless DC Motor</span>
              <span class="feature-pill">Hard-Chrome Extrusion Screw</span>
              <span class="feature-pill">Quick-Release Color Change</span>
              <span class="feature-pill">20L SS Hopper</span>
            </div>
          </div>
        </div>

        <!-- Tables: Volumetric Feeder Specs -->
        <div style="display: flex; gap: 10px;">
          <!-- Left: Capacity table -->
          <div style="flex: 1.1;">
            <table class="spec-table">
              <thead>
                <tr>
                  <th class="param-col">Code</th>
                  <th>Screw Description</th>
                  <th>Dosing Rate (kg/hr)</th>
                  <th>Dosing Rate (g/sec)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td class="model-code param-col">VAL 1</td><td>3/8 &times; 1/4" Micro-Screw</td><td class="highlight">0.004 to 3.6 kg/hr</td><td>0.011 to 1.0 g/s</td></tr>
                <tr><td class="model-code param-col">VAL 2</td><td>3/8 &times; 3/8" Fine-Screw</td><td class="highlight">0.07 to 7.0 kg/hr</td><td>0.019 to 1.94 g/s</td></tr>
                <tr><td class="model-code param-col">VAL 3</td><td>1/2 &times; 1/2" Standard-Screw</td><td class="highlight">0.20 to 10.9 kg/hr</td><td>0.058 to 3.028 g/s</td></tr>
                <tr><td class="model-code param-col">VAL 4</td><td>3/4 &times; 3/4" Medium-Screw</td><td class="highlight">0.50 to 33.0 kg/hr</td><td>0.138 to 9.166 g/s</td></tr>
                <tr><td class="model-code param-col">VAL 5</td><td>1 &times; 1" High-Volume Screw</td><td class="highlight">0.50 to 73.0 kg/hr</td><td>1.10 to 20.0 g/s</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Right: Dimensions table -->
          <div style="flex: 0.9;">
            <table class="spec-table">
              <thead>
                <tr>
                  <th class="param-col">Dimensional Parameter</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr><td class="param-col">Hopper Capacity</td><td class="model-code">20 Liters (SS 304)</td></tr>
                <tr><td class="param-col">Dimension A / B</td><td>475 / 150 mm</td></tr>
                <tr><td class="param-col">Dimension C / D</td><td>455 / 220 mm</td></tr>
                <tr><td class="param-col">Dimension E / F</td><td>165 / 540 mm</td></tr>
                <tr><td class="param-col">Control Panel (H&times;W&times;D)</td><td>300 &times; 230 &times; 160 mm</td></tr>
                <tr><td class="param-col">Supply &bull; Running Current</td><td>230V AC (50/60 Hz) &bull; 1.0 A</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Page Footer -->
    <div class="page-footer">
      <div class="tagline">QUALITY &bull; EXCELLENCE &bull; COMMITMENT</div>
      <div>VALNEX INDUSTRIES PRIVATE LIMITED &bull; TEMPERATURE CONTROL &amp; DOSING</div>
      <div class="page-num">PAGE 05 OF 08</div>
    </div>
  </div>
</div>

<!-- =========================================================================
     PAGE 6: GRANULATOR FLAKE CUTTER & INDUSTRIAL DEHUMIDIFIER
     ========================================================================= -->
<div class="page" id="page-6">
  <div class="blueprint-grid" style="opacity: 0.05;"></div>
  
  <div class="page-header">
    <h2>
      <span>GRANULATOR FLAKE CUTTER &amp; DEHUMIDIFIER</span>
      <span class="badge">RECYCLING &amp; DRYING</span>
    </h2>
    <div class="brand-stamp">
      <img src="{img_logo}" alt="Valnex Logo">
      <span>VALNEX</span>
    </div>
  </div>

  <div style="padding: 10px 14px 38px 14px; height: calc(297mm - 44px); display: flex; flex-direction: column; justify-content: space-between;">
    <div>
      <!-- TOP SECTION: FLAKE CUTTER -->
      <div class="product-section" style="margin: 0 0 10px 0;">
        <div class="section-title-bar">
          <h3>GRANULATOR FLAKE CUTTER // VAL-230 TO VAL-20 HP</h3>
          <span class="model-range">OUTPUT: 100 TO 1000 KG/HR</span>
        </div>

        <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 7px;">
          <img src="{img_cutter}" alt="Granulator Flake Cutter" style="height: 90px; width: 90px; object-fit: contain; background: rgba(0, 10, 30, 0.5); border-radius: 4px; padding: 4px; border: 1px solid rgba(0, 229, 255, 0.2);">
          <div style="flex: 1;">
            <div style="font-size: 8.5px; color: #cadbf5; line-height: 1.45;">
              High-efficiency plastic granulators designed for sprues, runners, edge trims, and purgings. Engineered with stepped claw/paddle blades of premium SKD-11 tool steel, sound-insulated cutting chamber, and rapid-exchange screen sizing.
            </div>
            <div style="margin-top: 5px;">
              <span class="feature-pill">SKD-11 High-Carbon Blades</span>
              <span class="feature-pill">Acoustic Double-Wall Chamber</span>
              <span class="feature-pill">Safety Interlock Sensor</span>
              <span class="feature-pill">Stepped Rotor Geometry</span>
            </div>
          </div>
        </div>

        <!-- Table: Flake Cutter -->
        <table class="spec-table">
          <thead>
            <tr>
              <th class="param-col" style="width: 105px;">Model Code</th>
              <th>VAL-230</th><th>VAL-300</th><th>VAL-400</th><th>VAL-500</th><th>VAL-600</th><th>VAL-800</th><th>VAL-960</th><th>VAL-10 HP</th><th>VAL-15 HP</th><th>VAL-20 HP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="param-col">Chamber Size (mm)</td>
              <td>230&times;200</td><td>310&times;200</td><td>410&times;240</td><td>510&times;300</td><td>610&times;330</td><td>815&times;470</td><td>960&times;610</td><td>360&times;260</td><td>420&times;280</td><td>480&times;330</td>
            </tr>
            <tr>
              <td class="param-col">Throughput (kg/hr)</td>
              <td class="highlight">100-150</td><td class="highlight">150-200</td><td class="highlight">200-250</td><td class="highlight">300-350</td><td class="highlight">350-450</td><td class="highlight">450-600</td><td class="highlight">800-1000</td><td class="highlight">150-250</td><td class="highlight">200-300</td><td class="highlight">250-350</td>
            </tr>
            <tr>
              <td class="param-col">Stationary Cutters</td>
              <td>2</td><td>2</td><td>2</td><td>2</td><td>4</td><td>4</td><td>4</td><td>2</td><td>2</td><td>2</td>
            </tr>
            <tr>
              <td class="param-col">Rotary Cutters</td>
              <td>6</td><td>9</td><td>12</td><td>15</td><td>18</td><td>24</td><td>30</td><td>18</td><td>21</td><td>24</td>
            </tr>
            <tr>
              <td class="param-col">Mesh Size (mm)</td>
              <td>8</td><td>8</td><td>8</td><td>10</td><td>10</td><td>10</td><td>12</td><td>10</td><td>10</td><td>10</td>
            </tr>
            <tr>
              <td class="param-col">Power (kW / HP)</td>
              <td class="model-code">4 / 5</td><td class="model-code">5.5 / 7.5</td><td class="model-code">7.5 / 10</td><td class="model-code">11 / 15</td><td class="model-code">15 / 20</td><td class="model-code">22-30/30-40</td><td class="model-code">37-57/50-75</td><td class="model-code">7.5 / 10</td><td class="model-code">10 / 15</td><td class="model-code">15 / 20</td>
            </tr>
            <tr>
              <td class="param-col">Dimensions (LxWxH mm)</td>
              <td style="font-size:6px;">890&times;640<br>&times;1145</td>
              <td style="font-size:6px;">1010&times;715<br>&times;1300</td>
              <td style="font-size:6px;">1010&times;815<br>&times;1330</td>
              <td style="font-size:6px;">1290&times;975<br>&times;1670</td>
              <td style="font-size:6px;">1290&times;1075<br>&times;1740</td>
              <td style="font-size:6px;">1735&times;1525<br>&times;2180</td>
              <td style="font-size:6px;">1950&times;1760<br>&times;2740</td>
              <td style="font-size:6px;">1090&times;870<br>&times;1340</td>
              <td style="font-size:6px;">1290&times;995<br>&times;1580</td>
              <td style="font-size:6px;">1435&times;1075<br>&times;1775</td>
            </tr>
            <tr>
              <td class="param-col">Approx N.W. (kg)</td>
              <td>290</td><td>435</td><td>500</td><td>900</td><td>970</td><td>2000</td><td>3000</td><td>540</td><td>795</td><td>1040</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- BOTTOM SECTION: DEHUMIDIFIER -->
      <div class="product-section" style="margin: 0;">
        <div class="section-title-bar">
          <h3>SS 304 INDUSTRIAL DEHUMIDIFIER // VI 2DH TO VI 5DH</h3>
          <span class="model-range">EXTRACTION: UP TO 500 LITERS/DAY</span>
        </div>

        <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 7px;">
          <img src="{img_dehumidifier}" alt="Industrial Dehumidifier" style="height: 90px; width: 90px; object-fit: contain; background: rgba(0, 10, 30, 0.5); border-radius: 4px; padding: 4px; border: 1px solid rgba(0, 229, 255, 0.2);">
          <div style="flex: 1;">
            <div style="font-size: 8.5px; color: #cadbf5; line-height: 1.45;">
              Heavy-duty stainless steel (SS 304) industrial dehumidification system for cleanrooms, injection moulding zones, and pharmaceutical packaging. Eliminates mould sweat and condensation, regulating ambient relative humidity down to 40% RH digital accuracy.
            </div>
            <div style="margin-top: 5px;">
              <span class="feature-pill">Full SS 304 Construction</span>
              <span class="feature-pill">Digital RH &plusmn;2% Control</span>
              <span class="feature-pill">Reciprocating 3-Phase Compressor</span>
              <span class="feature-pill">20-Micron Pre-Filter</span>
            </div>
          </div>
        </div>

        <!-- Table: Dehumidifier -->
        <table class="spec-table">
          <thead>
            <tr>
              <th class="param-col" style="width: 140px;">Technical Specification</th>
              <th>VI 2DH</th>
              <th>VI 3DH</th>
              <th>VI 5DH</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="param-col">Extraction (30&deg;C &bull; 80% RH)</td>
              <td class="model-code">200 LITERS / DAY</td>
              <td class="model-code">300 LITERS / DAY</td>
              <td class="model-code highlight">500 LITERS / DAY</td>
            </tr>
            <tr>
              <td class="param-col">Coverage Area (Non-AC Space)</td>
              <td>1600 SQ FT / 450 m&sup3;</td>
              <td>2400 SQ FT / 679 m&sup3;</td>
              <td>3000 SQ FT / 845 m&sup3;</td>
            </tr>
            <tr>
              <td class="param-col">Extraction (23&deg;C &bull; 60% RH)</td>
              <td>100 LITERS / DAY</td>
              <td>150 LITERS / DAY</td>
              <td>250 LITERS / DAY</td>
            </tr>
            <tr>
              <td class="param-col">Coverage Area (With AC / AHU)</td>
              <td>800 SQ FT / 220 m&sup3;</td>
              <td>1200 SQ FT / 399 m&sup3;</td>
              <td>1500 SQ FT / 424 m&sup3;</td>
            </tr>
            <tr>
              <td class="param-col">Airflow (Axial Fan) &bull; Noise</td>
              <td>2500 m&sup3;/hr &bull; 83 dB(A)</td>
              <td>4000 m&sup3;/hr &bull; 87 dB(A)</td>
              <td>5400 m&sup3;/hr &bull; 90 dB(A)</td>
            </tr>
            <tr>
              <td class="param-col">Refrigerant &bull; Power Supply</td>
              <td>R22 / R407C &bull; 440V AC, 50Hz, 3-Phase</td>
              <td>R22 / R407C &bull; 440V AC, 50Hz, 3-Phase</td>
              <td>R22 / R407C &bull; 440V AC, 50Hz, 3-Phase</td>
            </tr>
            <tr>
              <td class="param-col">Drain Tank &bull; Body Structure</td>
              <td>SS 304 (22 L) &bull; SS 304 Sanitary</td>
              <td>SS 304 (25 L) &bull; SS 304 Sanitary</td>
              <td>SS 304 (30 L) &bull; SS 304 Sanitary</td>
            </tr>
            <tr>
              <td class="param-col">Dimensions (W&times;D&times;H)</td>
              <td>21.5" &times; 20.5" &times; 38.5"</td>
              <td>24.0" &times; 21.0" &times; 40.0"</td>
              <td>33.0" &times; 20.5" &times; 57.0"</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Page Footer -->
    <div class="page-footer">
      <div class="tagline">QUALITY &bull; EXCELLENCE &bull; COMMITMENT</div>
      <div>VALNEX INDUSTRIES PRIVATE LIMITED &bull; RECYCLING &amp; DEHUMIDIFICATION</div>
      <div class="page-num">PAGE 06 OF 08</div>
    </div>
  </div>
</div>

<!-- =========================================================================
     PAGE 7: ONLINE LASER MARKING MACHINE
     ========================================================================= -->
<div class="page" id="page-7">
  <div class="blueprint-grid" style="opacity: 0.05;"></div>
  
  <div class="page-header">
    <h2>
      <span>ONLINE HIGH-SPEED LASER MARKING MACHINE</span>
      <span class="badge">FLYING FIBER OPTIC CODING</span>
    </h2>
    <div class="brand-stamp">
      <img src="{img_logo}" alt="Valnex Logo">
      <span>VALNEX</span>
    </div>
  </div>

  <div style="padding: 10px 14px 38px 14px; height: calc(297mm - 44px); display: flex; flex-direction: column; justify-content: space-between;">
    <div>
      <div style="margin-bottom: 7px;">
        <div style="font-family: 'Orbitron', sans-serif; font-size: 11px; font-weight: 800; color: #00e5ff; letter-spacing: 1px;">
          CONTINUOUS ON-THE-FLY INDUSTRIAL LASER CODING
        </div>
        <div style="font-size: 8.2px; color: #a4c4ed; margin-top: 2px;">
          Engineered for continuous extrusion lines: HDPE/PVC pipes, drip irrigation tubing, automotive wiring, cables, profiles &amp; pharmaceutical packaging.
        </div>
      </div>

      <div style="display: flex; gap: 14px; align-items: flex-start;">
        <!-- Left Side: Product Image & Highlights -->
        <div style="width: 195px; display: flex; flex-direction: column; gap: 8px;">
          <div style="background: rgba(6, 23, 56, 0.85); border: 1px solid rgba(0, 229, 255, 0.25); border-radius: 4px; padding: 10px; text-align: center;">
            <img src="{img_laser}" alt="Laser Marking Machine" style="height: 175px; width: 100%; object-fit: contain; filter: drop-shadow(0 4px 16px rgba(0,0,0,0.6));">
            <div style="margin-top: 6px; font-family: 'Orbitron', sans-serif; font-size: 11px; font-weight: 800; color: #ffffff;">
              VAL-30 // VAL-50
            </div>
            <div style="font-size: 8px; color: #00e5ff; font-weight: 600;">
              30W &bull; 50W FIBER LASER
            </div>
          </div>

          <div style="background: rgba(6, 23, 56, 0.7); border: 1px solid rgba(0, 229, 255, 0.2); border-radius: 4px; padding: 9px;">
            <div style="font-family: 'Orbitron', sans-serif; font-size: 8.5px; font-weight: 800; color: #00e5ff; margin-bottom: 5px;">
              SYSTEM CAPABILITIES
            </div>
            <ul style="font-size: 7.5px; color: #cadbf5; line-height: 1.45; padding-left: 11px;">
              <li><strong>Speed:</strong> Up to 180 m/min flying synchronization via rotary encoder.</li>
              <li><strong>Accuracy:</strong> &plusmn;0.0001 mm repeat precision.</li>
              <li><strong>Interface:</strong> 10" industrial touch screen with LaserMark software.</li>
              <li><strong>Lifespan:</strong> 70,000 to 100,000 hrs laser diode endurance.</li>
              <li><strong>Exhaust:</strong> Built-in centrifugal fume extraction unit.</li>
              <li><strong>Substrates:</strong> LLDPE, HDPE, PVC, PP, conduit, drip lateral, wire &amp; medical tubes.</li>
            </ul>
          </div>
        </div>

        <!-- Right Side: Complete 28-parameter technical comparison table -->
        <div style="flex: 1;">
          <table class="spec-table" style="font-size: 7px;">
            <thead>
              <tr>
                <th class="param-col" style="width: 135px;">Engineering Specification</th>
                <th style="width: 115px;">VAL-30 (30 WATT)</th>
                <th style="width: 115px;">VAL-50 (50 WATT)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="param-col">Laser Source Type</td><td class="model-code">Pulsed Fiber Laser</td><td class="model-code">Pulsed Fiber Laser</td></tr>
              <tr><td class="param-col">Rated Laser Power</td><td class="highlight">30 Watt</td><td class="highlight">50 Watt</td></tr>
              <tr><td class="param-col">Cooling System</td><td>Air-Cooled (Zero Liquid)</td><td>Air-Cooled (Zero Liquid)</td></tr>
              <tr><td class="param-col">Emission Wavelength</td><td>1064 nm</td><td>1064 nm</td></tr>
              <tr><td class="param-col">Beam Quality (M&sup2;)</td><td>&lt; 1.5</td><td>&lt; 1.5</td></tr>
              <tr><td class="param-col">Repetition Frequency</td><td>0 - 200 kHz</td><td>0 - 200 kHz</td></tr>
              <tr><td class="param-col">Pulse Width / Duration</td><td>80-100 ns / 200 ns</td><td>80-100 ns / 200 ns</td></tr>
              <tr><td class="param-col">Beam Diameter / Polar.</td><td>7 mm / Random</td><td>7 mm / Random</td></tr>
              <tr><td class="param-col">Pulse Energy Output</td><td>0.5 - 1.0 mJ</td><td>0.5 - 1.0 mJ</td></tr>
              <tr><td class="param-col">Marking Mode</td><td class="highlight">On-The-Fly / Static</td><td class="highlight">On-The-Fly / Static</td></tr>
              <tr><td class="param-col">Material Compatibility</td><td>LLDPE, HDPE, PVC, PP, Conduit</td><td>LLDPE, HDPE, PVC, PP, Conduit</td></tr>
              <tr><td class="param-col">Max Line Speed</td><td>Up to 180 m/min*</td><td>Up to 180 m/min*</td></tr>
              <tr><td class="param-col">Standard Marking Area</td><td>150 &times; 150 mm</td><td>150 &times; 150 mm</td></tr>
              <tr><td class="param-col">Focal Distance</td><td>210 mm</td><td>210 mm</td></tr>
              <tr><td class="param-col">Z-Axis Column Travel</td><td>500 mm</td><td>500 mm</td></tr>
              <tr><td class="param-col">Operating Temp Range</td><td>0&deg;C - 40&deg;C</td><td>0&deg;C - 40&deg;C</td></tr>
              <tr><td class="param-col">Fume Extraction Unit</td><td>Centrifugal Suction Unit</td><td>Centrifugal Suction Unit</td></tr>
              <tr><td class="param-col">Operator Interface</td><td>10" Industrial Touchscreen</td><td>10" Industrial Touchscreen</td></tr>
              <tr><td class="param-col">Min Character Height</td><td>0.1 mm (font dependent)</td><td>0.1 mm (font dependent)</td></tr>
              <tr><td class="param-col">Cabinet Air Conditioner</td><td>AC Unit (Optional)</td><td>AC Unit (Optional)</td></tr>
              <tr><td class="param-col">Power Consumption</td><td>750 Watt</td><td>750 Watt</td></tr>
              <tr><td class="param-col">Main Electrical Supply</td><td>220V AC, 50-60 Hz</td><td>220V AC, 50-60 Hz</td></tr>
              <tr><td class="param-col">Operating Software</td><td>Valnex LaserMark Suite</td><td>Valnex LaserMark Suite</td></tr>
              <tr><td class="param-col">Line Synchronization</td><td>Rotary Encoder Tracking</td><td>Rotary Encoder Tracking</td></tr>
              <tr><td class="param-col">Laser Diode Lifespan</td><td>70,000 - 100,000 Hours</td><td>70,000 - 100,000 Hours</td></tr>
              <tr><td class="param-col">Power Protection</td><td>UPS Protected Skidded</td><td>UPS Protected Skidded</td></tr>
              <tr><td class="param-col">Repeat Precision</td><td class="highlight">&plusmn;0.0001 mm</td><td class="highlight">&plusmn;0.0001 mm</td></tr>
              <tr><td class="param-col">Pilot Aiming Beam</td><td>Red Diode Laser Guide</td><td>Red Diode Laser Guide</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Page Footer -->
    <div class="page-footer">
      <div class="tagline">QUALITY &bull; EXCELLENCE &bull; COMMITMENT</div>
      <div>VALNEX INDUSTRIES PRIVATE LIMITED &bull; HIGH-SPEED FIBER LASER DIVISION</div>
      <div class="page-num">PAGE 07 OF 08</div>
    </div>
  </div>
</div>

<!-- =========================================================================
     PAGE 8: BACK COVER & NATIONWIDE NETWORK
     ========================================================================= -->
<div class="page" id="page-8" style="background-image: url('{img_map_bg}'); background-size: cover; background-position: center; display: flex; flex-direction: column; justify-content: space-between; padding: 36px 42px;">
  <div class="blueprint-grid" style="opacity: 0.05;"></div>

  <!-- Top Title Banner -->
  <div style="position: relative; z-index: 10;">
    <div style="display: inline-block; background: rgba(0, 71, 225, 0.3); border: 1px solid #00e5ff; border-radius: 3px; padding: 3px 10px; margin-bottom: 8px;">
      <span style="font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 700; color: #00e5ff; letter-spacing: 1.5px;">
        PAN-INDIA PRESENCE &bull; PROCESS COOLING &bull; AUXILIARY AUTOMATION
      </span>
    </div>
    <h2 style="font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">
      PAN-INDIA SERVICE &amp; DISTRIBUTION NETWORK
    </h2>
    <p style="font-size: 9.5px; color: #9bbbe6; margin-top: 4px; max-width: 550px;">
      Supporting over 500+ manufacturing installations across Gujarat, Maharashtra, NCR, Tamil Nadu, Karnataka, Telangana, and nationwide industrial corridors.
    </p>
  </div>

  <!-- Bottom Corporate & Contact Cards -->
  <div style="position: relative; z-index: 10; margin-top: auto;">
    <div style="display: flex; gap: 14px; align-items: stretch; margin-bottom: 20px;">
      <!-- Plant & Head Office Card -->
      <div style="flex: 1.4; background: rgba(6, 23, 56, 0.92); border: 1px solid rgba(0, 229, 255, 0.35); border-radius: 4px; padding: 16px 18px;">
        <div style="font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 900; color: #ffffff; letter-spacing: 1px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          <span style="color: #00e5ff;">&#9654;</span> VALNEX INDUSTRIES PRIVATE LIMITED
        </div>
        
        <div style="font-size: 9px; color: #c4d7f2; line-height: 1.55; margin-bottom: 12px;">
          <strong style="color: #ffffff;">Manufacturing Facility &amp; Head Office:</strong><br>
          3, Maruti Industrial Park-2, Dhamatvan Bakrol Road,<br>
          Dhamatvan, Ahmedabad &ndash; 382435, Gujarat, INDIA.
        </div>

        <div style="display: flex; flex-direction: column; gap: 5px; font-size: 9px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 9px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-family: 'Orbitron', sans-serif; font-size: 8px; background: rgba(0, 229, 255, 0.2); border: 1px solid #00e5ff; color: #00e5ff; padding: 1px 5px; border-radius: 2px;">TEL</span>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 10.5px; font-weight: 700; color: #ffffff;">+91 75748 48748</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-family: 'Orbitron', sans-serif; font-size: 8px; background: rgba(0, 229, 255, 0.2); border: 1px solid #00e5ff; color: #00e5ff; padding: 1px 5px; border-radius: 2px;">MAIL</span>
            <span style="color: #ffffff; font-weight: 500;">info@valnexindustries.com &bull; sales@valnexindustries.com</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-family: 'Orbitron', sans-serif; font-size: 8px; background: rgba(0, 229, 255, 0.2); border: 1px solid #00e5ff; color: #00e5ff; padding: 1px 5px; border-radius: 2px;">WEB</span>
            <span style="color: #00e5ff; font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 700;">www.valnexindustries.com</span>
          </div>
        </div>
      </div>

      <!-- QR Code & Quick Action Card -->
      <div style="flex: 0.8; background: rgba(6, 23, 56, 0.92); border: 1px solid rgba(0, 229, 255, 0.35); border-radius: 4px; padding: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
        <div style="background: #ffffff; padding: 5px; border-radius: 4px; margin-bottom: 7px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
          <img src="{img_qr}" alt="Valnex QR Portal" style="height: 68px; width: 68px; display: block;">
        </div>
        <div style="font-family: 'Orbitron', sans-serif; font-size: 8px; font-weight: 800; color: #00e5ff; letter-spacing: 0.5px;">
          SCAN FOR INSTANT QUOTE
        </div>
        <div style="font-size: 7.2px; color: #9bbbe6; margin-top: 2px;">
          Direct Access to 3D CADs &amp; Technical Drawings
        </div>
      </div>
    </div>

    <!-- Bottom Brand Bar with Logo & Taglines -->
    <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(0, 229, 255, 0.3); padding-top: 12px;">
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="{img_logo}" alt="Valnex Logo" style="height: 34px; object-fit: contain;">
          <span style="font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 900; letter-spacing: 3px; color: #ffffff;">VALNEX</span>
        </div>
        <div style="font-family: 'Orbitron', sans-serif; font-size: 9.5px; font-weight: 800; color: #00e5ff; letter-spacing: 2px; margin-top: 4px; text-transform: uppercase;">
          QUALITY &bull; EXCELLENCE &bull; COMMITMENT
        </div>
      </div>
      <div style="text-align: right; display: flex; align-items: center; gap: 12px;">
        <div style="background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(0, 229, 255, 0.3); border-radius: 4px; padding: 4px 8px; display: inline-flex; align-items: center;">
          <img src="{img_make_in_india}" alt="Make In India" style="height: 24px; object-fit: contain;">
        </div>
        <div>
          <div style="font-family: 'Orbitron', sans-serif; font-size: 8.5px; font-weight: 700; color: #ffffff;">
            VALNEX INDUSTRIES PRIVATE LIMITED
          </div>
          <div style="font-size: 7.2px; color: #7f9ec7; margin-top: 2px;">
            &copy; 2026 VALNEX INDUSTRIES PVT. LTD. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

</body>
</html>
"""

output_html_path = os.path.abspath("scratch/catalog_v3.html")
with open(output_html_path, "w", encoding="utf-8") as f:
    f.write(html_content)
print(f"HTML written to {output_html_path} ({len(html_content)} bytes)")

# Compile to PDF using Chrome Headless
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
output_pdf_path = os.path.abspath("public/catalog.pdf")

cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    f"--print-to-pdf={output_pdf_path}",
    "--no-pdf-header-footer",
    output_html_path
]

print("Executing Chrome headless PDF render...")
subprocess.run(cmd, check=True)
print(f"PDF generated successfully at: {output_pdf_path} ({os.path.getsize(output_pdf_path)} bytes)")

# Also copy to root catalog.pdf
import shutil
shutil.copyfile(output_pdf_path, os.path.abspath("catalog.pdf"))
print("Copied to ./catalog.pdf")

# Verify PDF with PyMuPDF and export high-res PNGs for review
doc = fitz.open(output_pdf_path)
print(f"Verified PDF: {len(doc)} pages")
os.makedirs("scratch/catalog_v3_pages", exist_ok=True)
art_dir = r"C:\Users\PRIYANSH\.gemini\antigravity\brain\5d31c227-b810-4094-a655-ef3ef72ca721"

for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    img_out = f"scratch/catalog_v3_pages/page_{i+1}.png"
    pix.save(img_out)
    art_img = os.path.join(art_dir, f"catalog_v3_page_{i+1}.png")
    pix.save(art_img)
    print(f"Page {i+1} saved: {img_out} (width={page.rect.width}, height={page.rect.height})")

print("All pages rendered and copied to artifacts!")
