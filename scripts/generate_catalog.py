import os
import sys
import base64
import subprocess
import fitz

def get_base64_img(rel_path):
    path = os.path.abspath(rel_path)
    if not os.path.exists(path):
        print(f"Warning: image {path} not found")
        return ""
    ext = os.path.splitext(path)[1].lower().replace('.', '')
    if ext == 'webp':
        mime = 'image/webp'
    elif ext in ['jpg', 'jpeg']:
        mime = 'image/jpeg'
    elif ext == 'png':
        mime = 'image/png'
    elif ext == 'svg':
        mime = 'image/svg+xml'
    else:
        mime = 'application/octet-stream'
    with open(path, 'rb') as f:
        data = base64.b64encode(f.read()).decode('utf-8')
    return f"data:{mime};base64,{data}"

print("Encoding assets...")
img_logo = get_base64_img("public/assets/valnex-logo.webp")
img_make_in_india = get_base64_img("public/catalog/brand/make-in-india.jpg")
img_chillers = get_base64_img("public/assets/product-chillers.webp")
img_chiller_water = get_base64_img("public/catalog/photos/2025/water-cooled-chiller.webp")
img_flake_cutter = get_base64_img("public/assets/product-flake-cutter.webp")
img_hopper_loader = get_base64_img("public/assets/product-vacuum-hopper-loader.webp")
img_laser_marking = get_base64_img("public/assets/product-laser-marking.webp")
img_volumetric = get_base64_img("public/assets/product-volumetric-feeder.webp")
img_mould_temp = get_base64_img("public/assets/product-temperature-control-unit.webp")
img_dehumidifier = get_base64_img("public/assets/product-dehumidifier.webp")
img_hot_air_dryer = get_base64_img("public/assets/product-hot-air-hopper-loader.webp")

img_str1 = get_base64_img("public/assets/strength-1.webp")
img_str2 = get_base64_img("public/assets/strength-2.webp")
img_str3 = get_base64_img("public/assets/strength-3.webp")
img_str4 = get_base64_img("public/assets/strength-4.webp")

img_sketch_chiller = get_base64_img("public/assets/sketch-chiller.webp")
img_sketch_hopper = get_base64_img("public/assets/sketch-hopper-loader.webp")
img_qr = get_base64_img("scratch/valnex-qr.png")

print("Building HTML catalog...")

# We will generate 13 A4 pages:
# 1: Cover Page
# 2: Executive Profile & Valnex Taste/Quality Scale
# 3: Industrial Portfolio & Application Spectrum
# 4: Air & Water Cooled Chillers
# 5: Granulator Flake Cutters
# 6: Vacuum Hopper Loaders
# 7: Online Laser Marking Machines
# 8: Volumetric Dosing Feeders
# 9: Mould Temperature Controllers (TCUs)
# 10: SS 304 Industrial Dehumidifiers
# 11: Hot Air Hopper Dryers
# 12: Manufacturing Infrastructure & Engineering Rigor
# 13: Back Cover (Contact & Corporate Info)

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Valnex Industries - Product Showcase & Technical Catalog 2026</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Orbitron:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">

<style>
  @page {{
    size: 210mm 297mm;
    margin: 0;
  }}

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }}

  body {{
    font-family: 'Exo 2', sans-serif;
    background-color: #020B1E;
    color: #F8FAFC;
    line-height: 1.4;
    font-size: 11px;
    -webkit-font-smoothing: antialiased;
  }}

  .page {{
    width: 210mm;
    height: 297mm;
    position: relative;
    page-break-after: always;
    break-after: page;
    background-color: #020B1E;
    background-image: 
      radial-gradient(circle at 85% 15%, rgba(0, 71, 225, 0.18) 0%, transparent 45%),
      radial-gradient(circle at 15% 85%, rgba(249, 115, 22, 0.08) 0%, transparent 40%),
      linear-gradient(rgba(0, 71, 225, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 71, 225, 0.05) 1px, transparent 1px);
    background-size: 100% 100%, 100% 100%, 15mm 15mm, 15mm 15mm;
    overflow: hidden;
    padding: 12mm 14mm 10mm 14mm;
    display: flex;
    flex-direction: column;
  }}

  /* Typography */
  .font-orbitron {{
    font-family: 'Orbitron', sans-serif;
  }}

  .font-mono {{
    font-family: 'JetBrains Mono', monospace;
  }}

  /* Brand Accents */
  .text-brand-blue {{ color: #0047E1; }}
  .text-brand-cyan {{ color: #00D2FF; }}
  .text-brand-orange {{ color: #F97316; }}
  .text-muted {{ color: #94A3B8; }}
  .text-slate-light {{ color: #CBD5E1; }}
  
  .bg-glass {{
    background: rgba(4, 19, 56, 0.72);
    border: 1px solid rgba(0, 71, 225, 0.25);
    backdrop-filter: blur(10px);
  }}

  .bg-glass-card {{
    background: rgba(6, 26, 75, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 4px;
  }}

  .border-orange {{
    border-color: #F97316 !important;
  }}

  .border-blue {{
    border-color: #0047E1 !important;
  }}

  /* Header & Footer Rules */
  .page-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(0, 71, 225, 0.35);
    padding-bottom: 3mm;
    margin-bottom: 5mm;
    position: relative;
  }}

  .page-header::after {{
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 35mm;
    height: 2px;
    background: #F97316;
  }}

  .header-brand {{
    display: flex;
    align-items: center;
    gap: 8px;
  }}

  .header-logo-img {{
    height: 24px;
    width: auto;
    object-fit: contain;
  }}

  .header-titles {{
    display: flex;
    flex-direction: column;
  }}

  .header-company {{
    font-family: 'Orbitron', sans-serif;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.1em;
    color: #FFFFFF;
  }}

  .header-tagline {{
    font-family: 'Orbitron', sans-serif;
    font-size: 6.5px;
    letter-spacing: 0.2em;
    color: #F97316;
    font-weight: 600;
  }}

  .header-meta {{
    text-align: right;
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    color: #64748B;
  }}

  .header-meta span {{
    color: #00D2FF;
    font-weight: 600;
  }}

  .page-footer {{
    margin-top: auto;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 3mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.5px;
    color: #64748B;
  }}

  .footer-taglines {{
    font-family: 'Orbitron', sans-serif;
    font-size: 7.5px;
    letter-spacing: 0.15em;
    color: #F8FAFC;
    font-weight: 600;
  }}

  .footer-taglines span {{
    color: #F97316;
    margin: 0 4px;
  }}

  .page-num {{
    background: rgba(0, 71, 225, 0.25);
    border: 1px solid rgba(0, 71, 225, 0.5);
    color: #00D2FF;
    padding: 1px 6px;
    border-radius: 2px;
    font-weight: 700;
  }}

  /* Technical Spec Tables */
  .spec-table-container {{
    width: 100%;
    margin-top: 3mm;
    border: 1px solid rgba(0, 71, 225, 0.3);
    border-radius: 4px;
    overflow: hidden;
    background: rgba(3, 16, 48, 0.85);
  }}

  .spec-table {{
    width: 100%;
    border-collapse: collapse;
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.2px;
  }}

  .spec-table th {{
    background: linear-gradient(180deg, rgba(0, 71, 225, 0.45) 0%, rgba(2, 22, 68, 0.7) 100%);
    color: #FFFFFF;
    font-weight: 700;
    text-align: center;
    padding: 3.5px 3px;
    border: 1px solid rgba(0, 71, 225, 0.35);
    letter-spacing: 0.05em;
    font-family: 'Orbitron', sans-serif;
    font-size: 7px;
  }}

  .spec-table th.label-col {{
    text-align: left;
    width: 25%;
    padding-left: 6px;
    font-family: 'Exo 2', sans-serif;
    font-size: 7.5px;
  }}

  .spec-table td {{
    padding: 3px 2px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: #CBD5E1;
  }}

  .spec-table td.label-col {{
    text-align: left;
    padding-left: 6px;
    color: #94A3B8;
    font-weight: 600;
    background: rgba(0, 71, 225, 0.08);
    font-family: 'Exo 2', sans-serif;
  }}

  .spec-table tr:nth-child(even) td:not(.label-col) {{
    background: rgba(255, 255, 255, 0.02);
  }}

  .spec-table tr:hover td {{
    background: rgba(0, 71, 225, 0.15);
  }}

  /* High-Tech Badges & Reticles */
  .tech-badge {{
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(0, 71, 225, 0.2);
    border: 1px solid #0047E1;
    color: #00D2FF;
    font-family: 'Orbitron', sans-serif;
    font-size: 7.5px;
    padding: 2px 7px;
    border-radius: 2px;
    letter-spacing: 0.1em;
    font-weight: 700;
  }}

  .tech-badge-orange {{
    background: rgba(249, 115, 22, 0.18);
    border-color: #F97316;
    color: #FB923C;
  }}

  .corner-reticle {{
    position: absolute;
    width: 6px;
    height: 6px;
    border-color: rgba(0, 210, 255, 0.6);
  }}
  .reticle-tl {{ top: 4px; left: 4px; border-top: 1.5px solid; border-left: 1.5px solid; }}
  .reticle-tr {{ top: 4px; right: 4px; border-top: 1.5px solid; border-right: 1.5px solid; }}
  .reticle-bl {{ bottom: 4px; left: 4px; border-bottom: 1.5px solid; border-left: 1.5px solid; }}
  .reticle-br {{ bottom: 4px; right: 4px; border-bottom: 1.5px solid; border-right: 1.5px solid; }}

  /* Cover Page Specific */
  .cover-grid {{
    position: absolute;
    inset: 0;
    pointer-events: none;
    border: 1px solid rgba(0, 71, 225, 0.3);
    margin: 8mm;
  }}

  .cover-content {{
    position: relative;
    z-index: 10;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10mm 6mm;
  }}

  .taste-scale-card {{
    background: linear-gradient(135deg, rgba(6, 26, 75, 0.8) 0%, rgba(2, 11, 30, 0.95) 100%);
    border: 1px solid rgba(0, 71, 225, 0.35);
    border-left: 3px solid #F97316;
    border-radius: 4px;
    padding: 4mm 5mm;
    margin-bottom: 3mm;
  }}

  .scale-bar-track {{
    height: 5px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    position: relative;
    margin: 3px 0 6px 0;
  }}

  .scale-bar-fill {{
    height: 100%;
    background: linear-gradient(90deg, #0047E1 0%, #00D2FF 60%, #F97316 100%);
    border-radius: 3px;
  }}

  .product-image-container {{
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at center, rgba(0, 71, 225, 0.22) 0%, rgba(2, 11, 30, 0.6) 70%);
    border: 1px solid rgba(0, 71, 225, 0.25);
    border-radius: 6px;
    padding: 5mm;
  }}

  .product-image-container img {{
    max-height: 52mm;
    width: auto;
    max-width: 90%;
    object-fit: contain;
    filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.8));
  }}

  .feature-pill {{
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: 8.8px;
    color: #E2E8F0;
    line-height: 1.35;
    margin-bottom: 2mm;
  }}

  .feature-bullet {{
    width: 5px;
    height: 5px;
    background: #F97316;
    border-radius: 1px;
    margin-top: 3.5px;
    flex-shrink: 0;
  }}
</style>
</head>
<body>
"""

# ================= PAGE 1: COVER =================
html += f"""
<div class="page" style="padding: 0;">
  <div class="cover-grid">
    <div class="corner-reticle reticle-tl" style="top: -3px; left: -3px; width: 15px; height: 15px; border-width: 2px;"></div>
    <div class="corner-reticle reticle-tr" style="top: -3px; right: -3px; width: 15px; height: 15px; border-width: 2px;"></div>
    <div class="corner-reticle reticle-bl" style="bottom: -3px; left: -3px; width: 15px; height: 15px; border-width: 2px;"></div>
    <div class="corner-reticle reticle-br" style="bottom: -3px; right: -3px; width: 15px; height: 15px; border-width: 2px;"></div>
  </div>

  <div class="cover-content" style="margin: 8mm;">
    <!-- Top Bar -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(0, 71, 225, 0.35); padding-bottom: 4mm;">
      <div>
        <span class="tech-badge tech-badge-orange">OFFICIAL TECHNICAL SPECIFICATION CATALOG</span>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 7.5px; color: #64748B; margin-top: 3px;">
          REF: VAL-CAT-2026 // INDUSTRIAL PROCESS AUXILIARIES
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <img src="{img_make_in_india}" style="height: 22px; width: auto; border-radius: 2px;" alt="Make in India">
        <div style="text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 7px; color: #94A3B8;">
          ISO 9001:2015<br><span style="color: #00D2FF;">CERTIFIED FACILITY</span>
        </div>
      </div>
    </div>

    <!-- Center Hero Block -->
    <div style="margin: auto 0; text-align: center; padding: 0 5mm;">
      <!-- Logo Container -->
      <div style="margin-bottom: 6mm;">
        <img src="{img_logo}" style="height: 80px; width: auto; object-fit: contain; filter: drop-shadow(0 0 35px rgba(0, 71, 225, 0.55));" alt="Valnex Logo">
      </div>

      <!-- Legal Company Name -->
      <h1 class="font-orbitron" style="font-size: 26px; font-weight: 900; letter-spacing: 0.12em; color: #FFFFFF; line-height: 1.1; margin-bottom: 2mm; text-transform: uppercase;">
        VALNEX INDUSTRIES
      </h1>
      <div class="font-orbitron" style="font-size: 13px; font-weight: 700; letter-spacing: 0.25em; color: #00D2FF; margin-bottom: 4mm;">
        PRIVATE LIMITED
      </div>

      <!-- The 3 Taglines from prior PDF located beneath logo -->
      <div style="display: inline-flex; align-items: center; gap: 10px; background: rgba(0, 71, 225, 0.15); border: 1px solid rgba(0, 71, 225, 0.4); padding: 4px 18px; border-radius: 20px; margin-bottom: 12mm;">
        <span class="font-orbitron" style="font-size: 10.5px; font-weight: 700; letter-spacing: 0.2em; color: #FFFFFF;">QUALITY</span>
        <span style="color: #F97316; font-size: 10px;">•</span>
        <span class="font-orbitron" style="font-size: 10.5px; font-weight: 700; letter-spacing: 0.2em; color: #FFFFFF;">EXCELLENCE</span>
        <span style="color: #F97316; font-size: 10px;">•</span>
        <span class="font-orbitron" style="font-size: 10.5px; font-weight: 700; letter-spacing: 0.2em; color: #FFFFFF;">COMMITMENT</span>
      </div>

      <!-- Main Showcase Title -->
      <div style="position: relative; padding: 8mm 6mm; background: rgba(4, 19, 56, 0.65); border: 1px solid rgba(0, 71, 225, 0.35); border-radius: 6px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);">
        <div class="corner-reticle reticle-tl"></div>
        <div class="corner-reticle reticle-tr"></div>
        <div class="corner-reticle reticle-bl"></div>
        <div class="corner-reticle reticle-br"></div>
        
        <div class="font-orbitron" style="font-size: 15px; font-weight: 800; color: #F97316; letter-spacing: 0.15em; margin-bottom: 2mm;">
          PRODUCT SHOWCASE & COMPREHENSIVE SPECIFICATION GUIDE
        </div>
        <div style="font-size: 11px; color: #CBD5E1; font-weight: 400; max-width: 140mm; margin: 0 auto; line-height: 1.5;">
          High-Performance Auxiliary Machinery, Process Thermal Dynamics & Automation Systems Engineered for Continuous Industrial Duty.
        </div>
      </div>

      <!-- 3 Key Metrics Pills -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin-top: 8mm;">
        <div class="bg-glass-card" style="padding: 3mm; text-align: center;">
          <div class="font-orbitron" style="font-size: 13px; font-weight: 800; color: #00D2FF;">2 – 65.5 TR</div>
          <div style="font-size: 7.5px; color: #94A3B8; font-weight: 500;">THERMAL CHILLING RANGE</div>
        </div>
        <div class="bg-glass-card" style="padding: 3mm; text-align: center;">
          <div class="font-orbitron" style="font-size: 13px; font-weight: 800; color: #F97316;">±0.0001 MM</div>
          <div style="font-size: 7.5px; color: #94A3B8; font-weight: 500;">PRECISION REPEATABILITY</div>
        </div>
        <div class="bg-glass-card" style="padding: 3mm; text-align: center;">
          <div class="font-orbitron" style="font-size: 13px; font-weight: 800; color: #00D2FF;">24/7/365</div>
          <div style="font-size: 7.5px; color: #94A3B8; font-weight: 500;">CONTINUOUS INDUSTRIAL DUTY</div>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(0, 71, 225, 0.35); padding-top: 4mm;">
      <div>
        <div style="font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 700; color: #FFFFFF;">
          VALNEX INDUSTRIES PRIVATE LIMITED
        </div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 7.2px; color: #64748B; margin-top: 2px;">
          Plant: 3, Maruti Ind. Park-2, Dhamatvan, Ahmedabad - 382435, Gujarat, INDIA
        </div>
      </div>
      <div style="text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 7.5px; color: #94A3B8;">
        COORDINATES: <span style="color: #F97316;">23.0225° N, 72.5714° E</span><br>
        WWW.VALNEXINDUSTRIES.COM
      </div>
    </div>
  </div>
</div>
"""

# Helper function to generate clean headers and footers for inner pages
def get_page_chrome(page_num, section_title, active_slug=""):
    return f"""
    <div class="page-header">
      <div class="header-brand">
        <img src="{img_logo}" class="header-logo-img" alt="Valnex">
        <div class="header-titles">
          <div class="header-company">VALNEX INDUSTRIES PRIVATE LIMITED</div>
          <div class="header-tagline">QUALITY • EXCELLENCE • COMMITMENT</div>
        </div>
      </div>
      <div class="header-meta">
        <div>{section_title}</div>
        <div>STANDARDS: <span>MAKE IN INDIA // CE // ISO 9001</span></div>
      </div>
    </div>
    """, f"""
    <div class="page-footer">
      <div class="footer-taglines">
        QUALITY <span>•</span> EXCELLENCE <span>•</span> COMMITMENT
      </div>
      <div style="text-align: center; color: #475569;">
        VALNEX INDUSTRIES PVT. LTD. // AHMEDABAD, GUJARAT, INDIA
      </div>
      <div>
        PAGE <span class="page-num">{page_num:02d}</span> OF 13
      </div>
    </div>
    """

# ================= PAGE 2: CORPORATE PROFILE & TASTE / PRECISION SCALE =================
header, footer = get_page_chrome(2, "CORPORATE IDENTITY & QUALITY BENCHMARK")
html += f"""
<div class="page">
  {header}

  <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 5mm; flex: 1;">
    <!-- Left Column: Company Profile & Principles -->
    <div style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div class="tech-badge tech-badge-orange" style="margin-bottom: 2mm;">MANUFACTURING EXCELLENCE SINCE INCEPTION</div>
        <h2 class="font-orbitron" style="font-size: 16px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em; margin-bottom: 3mm; line-height: 1.2;">
          PRECISION ENGINEERING THAT <span style="color: #00D2FF;">POWERS PROGRESS</span>
        </h2>
        
        <div class="bg-glass" style="padding: 4mm; border-radius: 4px; margin-bottom: 3mm; line-height: 1.45; color: #CBD5E1; font-size: 8.8px;">
          <p style="margin-bottom: 2.5mm;">
            <strong style="color: #FFFFFF;">Valnex Industries Private Limited</strong> is an advanced Indian manufacturer specializing in industrial auxiliary equipment, high-efficiency refrigeration systems, and automated plastics process machinery. Engineered and fabricated at our state-of-the-art facility in Ahmedabad, Gujarat, each unit is built for demanding 24/7 duty cycles.
          </p>
          <p style="margin-bottom: 2.5mm;">
            With an integrated team of engineering professionals and creative designers, our manufacturing facility is equipped with high-precision fabrication tooling, CNC laser cutting, specialized coil bending, and automated assembly rigs to deliver machinery that complies with rigorous global engineering benchmarks.
          </p>
          <p>
            Every product is rigorously examined at our internal testing unit across predefined operational parameters prior to dispatch, guaranteeing seamless plant integration, zero initial failure rates, and prolonged mechanical longevity.
          </p>
        </div>

        <!-- Corporate Mission Card -->
        <div style="background: rgba(0, 71, 225, 0.12); border: 1px solid rgba(0, 71, 225, 0.35); border-left: 3px solid #00D2FF; padding: 3.5mm; border-radius: 3px; margin-bottom: 3mm;">
          <div class="font-orbitron" style="font-size: 9px; font-weight: 700; color: #00D2FF; margin-bottom: 1.5mm;">
            VALNEX CORE PHILOSOPHY
          </div>
          <p style="font-size: 8.5px; color: #E2E8F0; font-style: italic; line-height: 1.4;">
            “Valnex’s utmost priority is customer satisfaction through excellence & commitment in manufacturing and superior customer service through Principles, People, Passion & Progress.”
          </p>
        </div>

        <!-- 4 Key Sectors -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2.5mm;">
          <div class="bg-glass-card" style="padding: 2.5mm;">
            <div class="font-orbitron" style="font-size: 8px; font-weight: 700; color: #F97316;">PROCESS COOLING</div>
            <div style="font-size: 7.5px; color: #94A3B8; margin-top: 1px;">Chillers & TCUs for plastics, pharma, chemical, rubber & defence.</div>
          </div>
          <div class="bg-glass-card" style="padding: 2.5mm;">
            <div class="font-orbitron" style="font-size: 8px; font-weight: 700; color: #00D2FF;">MATERIAL AUTOMATION</div>
            <div style="font-size: 7.5px; color: #94A3B8; margin-top: 1px;">Vacuum loaders, volumetric masterbatch dosing & hot air dryers.</div>
          </div>
          <div class="bg-glass-card" style="padding: 2.5mm;">
            <div class="font-orbitron" style="font-size: 8px; font-weight: 700; color: #00D2FF;">SIZE REDUCTION</div>
            <div style="font-size: 7.5px; color: #94A3B8; margin-top: 1px;">Heavy-duty granulator flake cutters with staggered scissor rotors.</div>
          </div>
          <div class="bg-glass-card" style="padding: 2.5mm;">
            <div class="font-orbitron" style="font-size: 8px; font-weight: 700; color: #F97316;">ONLINE TRACEABILITY</div>
            <div style="font-size: 7.5px; color: #94A3B8; margin-top: 1px;">High-speed 180 m/min pulsed fiber laser on-the-fly pipe & cable marking.</div>
          </div>
        </div>
      </div>

      <!-- Make in India statement -->
      <div style="display: flex; align-items: center; gap: 8px; padding-top: 2mm; border-top: 1px solid rgba(255, 255, 255, 0.08);">
        <img src="{img_make_in_india}" style="height: 24px; width: auto;" alt="Make in India">
        <div style="font-size: 7.5px; color: #94A3B8;">
          Proudly engineered and manufactured under the <strong style="color: #FFFFFF;">Make in India</strong> initiative with 100% indigenous technical sovereignty and global export compliance.
        </div>
      </div>
    </div>

    <!-- Right Column: The "Taste Scale" & Quality Benchmark -->
    <div style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div class="tech-badge" style="margin-bottom: 2mm;">ENGINEERING CALIBER EVALUATION</div>
        <h3 class="font-orbitron" style="font-size: 13px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em; margin-bottom: 2mm;">
          THE VALNEX <span style="color: #F97316;">TASTE & QUALITY SCALE</span>
        </h3>
        <p style="font-size: 8px; color: #94A3B8; margin-bottom: 3.5mm; line-height: 1.35;">
          Our proprietary five-tier design & engineering metric ensures every Valnex system achieves award-winning aesthetic polish, mechanical tolerance, and thermal consistency:
        </p>

        <!-- Tier 1 -->
        <div class="taste-scale-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="font-orbitron" style="font-size: 8.5px; font-weight: 700; color: #00D2FF;">GRADE 01: MICRO-TOLERANCE PRECISION</span>
            <span class="font-mono" style="font-size: 8px; color: #F97316; font-weight: 700;">±0.0001 MM</span>
          </div>
          <div class="scale-bar-track"><div class="scale-bar-fill" style="width: 98%;"></div></div>
          <div style="font-size: 7.5px; color: #94A3B8;">
            Sub-millimetre repeated accuracy on optical fiber laser scanning, knife gap alignment, and volumetric additive micro-dosing (0.004 kg/h).
          </div>
        </div>

        <!-- Tier 2 -->
        <div class="taste-scale-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="font-orbitron" style="font-size: 8.5px; font-weight: 700; color: #00D2FF;">GRADE 02: THERMAL STABILITY SPECTRUM</span>
            <span class="font-mono" style="font-size: 8px; color: #F97316; font-weight: 700;">ΔT ±0.5 °C</span>
          </div>
          <div class="scale-bar-track"><div class="scale-bar-fill" style="width: 95%;"></div></div>
          <div style="font-size: 7.5px; color: #94A3B8;">
            PID-governed thermal loops across chillers (2 to 65.5 TR) and temperature control units delivering stable oil circulation up to 180 °C.
          </div>
        </div>

        <!-- Tier 3 -->
        <div class="taste-scale-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="font-orbitron" style="font-size: 8.5px; font-weight: 700; color: #00D2FF;">GRADE 03: HYGIENIC METALLURGY</span>
            <span class="font-mono" style="font-size: 8px; color: #F97316; font-weight: 700;">SS 304 / 316</span>
          </div>
          <div class="scale-bar-track"><div class="scale-bar-fill" style="width: 92%;"></div></div>
          <div style="font-size: 7.5px; color: #94A3B8;">
            Food- and pharmaceutical-grade stainless steel fabrication across water reservoirs, hopper bodies, dehumidifier skins, and dosing screws.
          </div>
        </div>

        <!-- Tier 4 -->
        <div class="taste-scale-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="font-orbitron" style="font-size: 8.5px; font-weight: 700; color: #00D2FF;">GRADE 04: FLUID DYNAMICS & ACOUSTICS</span>
            <span class="font-mono" style="font-size: 8px; color: #F97316; font-weight: 700;">&lt; 83 dB(A)</span>
          </div>
          <div class="scale-bar-track"><div class="scale-bar-fill" style="width: 88%;"></div></div>
          <div style="font-size: 7.5px; color: #94A3B8;">
            Optimized aerodynamic scroll fans, multi-chamber acoustic baffling on flake granulators, and low-vibration 3-phase hermetic compressors.
          </div>
        </div>

        <!-- Tier 5 -->
        <div class="taste-scale-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="font-orbitron" style="font-size: 8.5px; font-weight: 700; color: #00D2FF;">GRADE 05: PREDEFINED FACTORY TESTING</span>
            <span class="font-mono" style="font-size: 8px; color: #F97316; font-weight: 700;">100% FAT</span>
          </div>
          <div class="scale-bar-track"><div class="scale-bar-fill" style="width: 100%;"></div></div>
          <div style="font-size: 7.5px; color: #94A3B8;">
            Pressure burst testing, hydraulic leak checks, full-load electrical draw analysis, and thermal run-in verification before shipping.
          </div>
        </div>
      </div>

      <!-- Testing Rig Certification Box -->
      <div class="bg-glass-card" style="padding: 3mm; border: 1px dashed rgba(0, 210, 255, 0.4); text-align: center;">
        <span class="font-orbitron" style="font-size: 8px; color: #00D2FF; font-weight: 700; letter-spacing: 0.1em;">
          FACTORY ACCEPTANCE GUARANTEE
        </span>
        <div style="font-size: 7.2px; color: #94A3B8; margin-top: 1px;">
          All machines are calibrated under Indian ambient conditions (up to 45°C ambient) ensuring uncompromised duty in extreme tropical climates.
        </div>
      </div>
    </div>
  </div>

  {footer}
</div>
"""

# ================= PAGE 3: PORTFOLIO SPECTRUM & APPLICATION MATRIX =================
header, footer = get_page_chrome(3, "INDUSTRIAL PORTFOLIO & SECTOR COMPATIBILITY")
html += f"""
<div class="page">
  {header}

  <div style="margin-bottom: 4mm;">
    <span class="tech-badge tech-badge-orange">EIGHT SPECIALIZED MACHINERY FAMILIES</span>
    <h2 class="font-orbitron" style="font-size: 16px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em; margin: 1mm 0 2mm 0;">
      COMPLETE AUXILIARY AUTOMATION & PROCESS CONTROL
    </h2>
    <p style="font-size: 8.5px; color: #94A3B8; max-width: 170mm;">
      Valnex Industries Private Limited designs comprehensive plant integration suites tailored for injection moulding, blow moulding, pipe & profile extrusion, pharmaceutical packaging, and chemical compounding.
    </p>
  </div>

  <!-- 8 Product Matrix Cards -->
  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin-bottom: 5mm;">
    <!-- 01 -->
    <div class="bg-glass-card" style="padding: 2.5mm; border-top: 2px solid #0047E1;">
      <div class="font-mono" style="font-size: 7px; color: #F97316; font-weight: 700;">DIV 01 // THERMAL</div>
      <div class="font-orbitron" style="font-size: 8.5px; font-weight: 700; color: #FFFFFF; margin: 1mm 0;">Air & Water Chillers</div>
      <div style="font-size: 7.5px; color: #94A3B8;">2 to 65.5 TR cooling capacity; integrated process pump and SS tank.</div>
    </div>
    <!-- 02 -->
    <div class="bg-glass-card" style="padding: 2.5mm; border-top: 2px solid #0047E1;">
      <div class="font-mono" style="font-size: 7px; color: #F97316; font-weight: 700;">DIV 02 // RECYCLING</div>
      <div class="font-orbitron" style="font-size: 8.5px; font-weight: 700; color: #FFFFFF; margin: 1mm 0;">Granulator Cutters</div>
      <div style="font-size: 7.5px; color: #94A3B8;">10 models, 100 – 1000 kg/h throughput; staggered scissor-cut rotors.</div>
    </div>
    <!-- 03 -->
    <div class="bg-glass-card" style="padding: 2.5mm; border-top: 2px solid #0047E1;">
      <div class="font-mono" style="font-size: 7px; color: #F97316; font-weight: 700;">DIV 03 // CONVEYING</div>
      <div class="font-orbitron" style="font-size: 8.5px; font-weight: 700; color: #FFFFFF; margin: 1mm 0;">Vacuum Loaders</div>
      <div style="font-size: 7.5px; color: #94A3B8;">30 to 1200 kg/h convey rates; reverse-pulse auto-cleaning filters.</div>
    </div>
    <!-- 04 -->
    <div class="bg-glass-card" style="padding: 2.5mm; border-top: 2px solid #0047E1;">
      <div class="font-mono" style="font-size: 7px; color: #F97316; font-weight: 700;">DIV 04 // OPTICS</div>
      <div class="font-orbitron" style="font-size: 8.5px; font-weight: 700; color: #FFFFFF; margin: 1mm 0;">Laser Markers</div>
      <div style="font-size: 7.5px; color: #94A3B8;">30W & 50W pulsed fiber; 180 m/min continuous extrusion line marking.</div>
    </div>
    <!-- 05 -->
    <div class="bg-glass-card" style="padding: 2.5mm; border-top: 2px solid #F97316;">
      <div class="font-mono" style="font-size: 7px; color: #00D2FF; font-weight: 700;">DIV 05 // DOSING</div>
      <div class="font-orbitron" style="font-size: 8.5px; font-weight: 700; color: #FFFFFF; margin: 1mm 0;">Volumetric Feeders</div>
      <div style="font-size: 7.5px; color: #94A3B8;">0.004 – 73 kg/h micro-dosing across 5 precision screw diameters.</div>
    </div>
    <!-- 06 -->
    <div class="bg-glass-card" style="padding: 2.5mm; border-top: 2px solid #F97316;">
      <div class="font-mono" style="font-size: 7px; color: #00D2FF; font-weight: 700;">DIV 06 // MOULD TEMP</div>
      <div class="font-orbitron" style="font-size: 8.5px; font-weight: 700; color: #FFFFFF; margin: 1mm 0;">Temperature Units</div>
      <div style="font-size: 7.5px; color: #94A3B8;">Oil up to 180°C and water to 95°C; PID touch screen control.</div>
    </div>
    <!-- 07 -->
    <div class="bg-glass-card" style="padding: 2.5mm; border-top: 2px solid #F97316;">
      <div class="font-mono" style="font-size: 7px; color: #00D2FF; font-weight: 700;">DIV 07 // AIR TREATMENT</div>
      <div class="font-orbitron" style="font-size: 8.5px; font-weight: 700; color: #FFFFFF; margin: 1mm 0;">SS Dehumidifiers</div>
      <div style="font-size: 7.5px; color: #94A3B8;">200 to 500 L/day extraction; 100% SS 304 hygienic construction.</div>
    </div>
    <!-- 08 -->
    <div class="bg-glass-card" style="padding: 2.5mm; border-top: 2px solid #F97316;">
      <div class="font-mono" style="font-size: 7px; color: #00D2FF; font-weight: 700;">DIV 08 // DRYING</div>
      <div class="font-orbitron" style="font-size: 8.5px; font-weight: 700; color: #FFFFFF; margin: 1mm 0;">Hot Air Dryers</div>
      <div style="font-size: 7.5px; color: #94A3B8;">60 to 800 L volume; uniform hot air diffusion for resin moisture removal.</div>
    </div>
  </div>

  <!-- Sector Compatibility Table -->
  <div style="margin-top: 2mm; flex: 1;">
    <div class="font-orbitron" style="font-size: 11px; font-weight: 700; color: #FFFFFF; margin-bottom: 2mm;">
      INDUSTRY APPLICATION & PROCESS COMPATIBILITY MATRIX
    </div>
    <div class="spec-table-container">
      <table class="spec-table">
        <thead>
          <tr>
            <th class="label-col">INDUSTRY SECTOR</th>
            <th>CHILLERS</th>
            <th>FLAKE CUTTER</th>
            <th>HOPPER LOADER</th>
            <th>LASER MARKER</th>
            <th>FEEDER</th>
            <th>TCU</th>
            <th>DEHUMIDIFIER</th>
            <th>DRYER</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-col">Plastics Injection Moulding</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #94A3B8;">○ OPT</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
          </tr>
          <tr>
            <td class="label-col">Pipe, Cable & Tube Extrusion</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #F97316;">★ CRITICAL</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #94A3B8;">○ OPT</td>
            <td style="color: #94A3B8;">○ OPT</td>
            <td style="color: #00D2FF;">● HIGH</td>
          </tr>
          <tr>
            <td class="label-col">Blow Moulding & Packaging</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
          </tr>
          <tr>
            <td class="label-col">Pharmaceutical Cleanrooms</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #475569;">—</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #94A3B8;">○ OPT</td>
            <td style="color: #F97316;">★ CRITICAL</td>
            <td style="color: #00D2FF;">● HIGH</td>
          </tr>
          <tr>
            <td class="label-col">Food & Confectionery Processing</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #475569;">—</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #94A3B8;">○ OPT</td>
            <td style="color: #F97316;">★ CRITICAL</td>
            <td style="color: #94A3B8;">○ OPT</td>
          </tr>
          <tr>
            <td class="label-col">Rubber & Elastomer Curing</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #94A3B8;">○ OPT</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #94A3B8;">○ OPT</td>
            <td style="color: #F97316;">★ CRITICAL</td>
            <td style="color: #475569;">—</td>
            <td style="color: #94A3B8;">○ OPT</td>
          </tr>
          <tr>
            <td class="label-col">Chemical & Specialty Polymers</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
          </tr>
          <tr>
            <td class="label-col">Defense & Aerospace Components</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #94A3B8;">○ OPT</td>
            <td style="color: #94A3B8;">○ OPT</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
            <td style="color: #00D2FF;">● HIGH</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Schematic Sketch Callout -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin-top: 3mm;">
    <div style="background: rgba(0, 71, 225, 0.08); border: 1px solid rgba(0, 71, 225, 0.25); border-radius: 4px; padding: 2.5mm; display: flex; align-items: center; gap: 4mm;">
      <img src="{img_sketch_chiller}" style="height: 25mm; width: auto; object-fit: contain; filter: invert(1) brightness(1.2) hue-rotate(180deg);" alt="Chiller Schematic">
      <div>
        <div class="font-orbitron" style="font-size: 8px; color: #00D2FF; font-weight: 700;">CLOSED-LOOP CHILLING SCHEMATIC</div>
        <div style="font-size: 7.2px; color: #94A3B8; margin-top: 1px;">
          Direct evaporative heat exchange with integral bypass valve, isolating hydraulic shocks from tool channels.
        </div>
      </div>
    </div>
    <div style="background: rgba(0, 71, 225, 0.08); border: 1px solid rgba(0, 71, 225, 0.25); border-radius: 4px; padding: 2.5mm; display: flex; align-items: center; gap: 4mm;">
      <img src="{img_sketch_hopper}" style="height: 25mm; width: auto; object-fit: contain; filter: invert(1) brightness(1.2) hue-rotate(180deg);" alt="Hopper Schematic">
      <div>
        <div class="font-orbitron" style="font-size: 8px; color: #F97316; font-weight: 700;">CENTRALIZED MATERIAL FEED LOOP</div>
        <div style="font-size: 7.2px; color: #94A3B8; margin-top: 1px;">
          Synchronized vacuum transfer preventing resin degradation, airborne dust contamination and manual handling.
        </div>
      </div>
    </div>
  </div>

  {footer}
</div>
"""

# ================= PAGE 4: PRODUCT 01 - CHILLERS =================
header, footer = get_page_chrome(4, "PRODUCT SHOWCASE // DIVISION 01", "chillers")
html += f"""
<div class="page">
  {header}

  <!-- Top Hero Block -->
  <div style="display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 4mm; margin-bottom: 2.5mm;">
    <div>
      <div style="display: flex; gap: 5px; align-items: center; margin-bottom: 1.5mm;">
        <span class="tech-badge">MODEL SERIES VI 02A - VI 060A // VI 02W - VI 060W</span>
        <span class="tech-badge tech-badge-orange">28 MODELS</span>
      </div>
      <h2 class="font-orbitron" style="font-size: 16px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em; line-height: 1.15; margin-bottom: 1.5mm;">
        AIR & WATER COOLED <span style="color: #00D2FF;">CHILLERS</span>
      </h2>
      <p style="font-size: 8.5px; color: #CBD5E1; line-height: 1.35; margin-bottom: 2.5mm;">
        Engineered, designed, and manufactured by Valnex Industries Private Limited in an integral skidded configuration featuring evaporator, high-efficiency compressor, condenser, process pump, and stainless water reservoir in one rigid self-contained package.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2mm;">
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Skidded Package:</strong> Arrives fully pre-plumbed, charged, and tested. Zero on-site pump matching required.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Dual Heat Rejection:</strong> Air-cooled ambient fan rejection or water-cooled shell-and-tube for cooling tower hookup.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Triple Refrigerant:</strong> Compatible with R-22, zero-ODP R-407C, or high-efficiency R-410A refrigerants.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Integrated Hydronics:</strong> Multi-stage process pump (up to 880 LPM) with insulated SS 304 water tank (up to 1000 L).</div>
        </div>
      </div>
    </div>

    <!-- Product Render -->
    <div class="product-image-container">
      <div class="corner-reticle reticle-tl"></div>
      <div class="corner-reticle reticle-tr"></div>
      <div class="corner-reticle reticle-bl"></div>
      <div class="corner-reticle reticle-br"></div>
      <img src="{img_chillers}" style="max-height: 48mm;" alt="Air and Water Cooled Chiller Skid">
    </div>
  </div>

  <!-- AIR COOLED SPECIFICATION TABLE -->
  <div style="margin-top: 1mm;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1mm;">
      <div class="font-orbitron" style="font-size: 8.5px; font-weight: 700; color: #FFFFFF;">
        AIR-COOLED CHILLER SPECIFICATION MATRIX (14 MODELS)
      </div>
      <div class="font-mono" style="font-size: 7px; color: #94A3B8;">REFRIGERANT: R-22 / R-407C / R-410A // SUPPLY: 415 V 3Φ 50 HZ</div>
    </div>
    <div class="spec-table-container">
      <table class="spec-table">
        <thead>
          <tr>
            <th class="label-col">MODEL CODE</th>
            <th>VI02A</th>
            <th>VI03A</th>
            <th>VI05A</th>
            <th>VI06A</th>
            <th>VI07A</th>
            <th>VI08A</th>
            <th>VI010A</th>
            <th>VI015A</th>
            <th>VI017A</th>
            <th>VI024A</th>
            <th>VI030A</th>
            <th>VI040A</th>
            <th>VI050A</th>
            <th>VI060A</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-col">Cooling Capacity (TR)</td>
            <td style="color:#00D2FF; font-weight:700;">2</td>
            <td style="color:#00D2FF; font-weight:700;">3.15</td>
            <td style="color:#00D2FF; font-weight:700;">5</td>
            <td style="color:#00D2FF; font-weight:700;">5.53</td>
            <td style="color:#00D2FF; font-weight:700;">7.2</td>
            <td style="color:#00D2FF; font-weight:700;">9.4</td>
            <td style="color:#00D2FF; font-weight:700;">11.3</td>
            <td style="color:#00D2FF; font-weight:700;">14.2</td>
            <td style="color:#00D2FF; font-weight:700;">19.1</td>
            <td style="color:#00D2FF; font-weight:700;">24.4</td>
            <td style="color:#00D2FF; font-weight:700;">29.5</td>
            <td style="color:#00D2FF; font-weight:700;">38.3</td>
            <td style="color:#00D2FF; font-weight:700;">49.2</td>
            <td style="color:#00D2FF; font-weight:700;">59</td>
          </tr>
          <tr>
            <td class="label-col">Compressor (kW)</td>
            <td>2.5</td>
            <td>3.17</td>
            <td>5.2</td>
            <td>5.37</td>
            <td>6.69</td>
            <td>9.06</td>
            <td>10.76</td>
            <td>13.65</td>
            <td>18.36</td>
            <td>23.1</td>
            <td>27.6</td>
            <td>18.3/2</td>
            <td>23.1/2</td>
            <td>27.6/2</td>
          </tr>
          <tr>
            <td class="label-col">Process Pump (kW / LPM)</td>
            <td>0.46/55</td>
            <td>0.96/105</td>
            <td>1.1/150</td>
            <td>1.1/150</td>
            <td>1.1/230</td>
            <td>1.5/230</td>
            <td>1.5/230</td>
            <td>2.0/230</td>
            <td>2.2/230</td>
            <td>2.2/230</td>
            <td>3.0/380</td>
            <td>4.0/480</td>
            <td>5.5/480</td>
            <td>7.5/880</td>
          </tr>
          <tr>
            <td class="label-col">Max Pressure (Bar)</td>
            <td>2.4</td>
            <td>3.0</td>
            <td>4.6</td>
            <td>4.8</td>
            <td>4.8</td>
            <td>4.8</td>
            <td>4.8</td>
            <td>4.8</td>
            <td>4.8</td>
            <td>4.8</td>
            <td>4.8</td>
            <td>4.8</td>
            <td>5.6</td>
            <td>4.4</td>
          </tr>
          <tr>
            <td class="label-col">Water Tank Volume (L)</td>
            <td>40</td>
            <td>100</td>
            <td>100</td>
            <td>100</td>
            <td>150</td>
            <td>150</td>
            <td>150</td>
            <td>200</td>
            <td>200</td>
            <td>200</td>
            <td>300</td>
            <td>500</td>
            <td>500</td>
            <td>1000</td>
          </tr>
          <tr>
            <td class="label-col">Axial Fans (Qty / kW)</td>
            <td>1/0.25</td>
            <td>1/0.8</td>
            <td>2/0.5</td>
            <td>2/0.5</td>
            <td>2/1.2</td>
            <td>2/1.2</td>
            <td>2/1.2</td>
            <td>—</td>
            <td>—</td>
            <td>4/3.2</td>
            <td>4/3.2</td>
            <td>6/4.8</td>
            <td>8/6.4</td>
            <td>8/6.4</td>
          </tr>
          <tr>
            <td class="label-col">In/Out Conn. (BSP)</td>
            <td>1"</td>
            <td>1"</td>
            <td>1"</td>
            <td>1"</td>
            <td>1½"</td>
            <td>1½"</td>
            <td>1½"</td>
            <td>1½"</td>
            <td>1½"</td>
            <td>1½"</td>
            <td>2"</td>
            <td>2"</td>
            <td>2"</td>
            <td>2½"</td>
          </tr>
          <tr>
            <td class="label-col">Net Weight (kg)</td>
            <td>150</td>
            <td>300</td>
            <td>500</td>
            <td>500</td>
            <td>700</td>
            <td>700</td>
            <td>700</td>
            <td>900</td>
            <td>1000</td>
            <td>1100</td>
            <td>1500</td>
            <td>1600</td>
            <td>2000</td>
            <td>2200</td>
          </tr>
          <tr>
            <td class="label-col">Connected Load (kW)</td>
            <td style="color:#F97316;">3.21</td>
            <td style="color:#F97316;">4.93</td>
            <td style="color:#F97316;">6.80</td>
            <td style="color:#F97316;">6.97</td>
            <td style="color:#F97316;">8.99</td>
            <td style="color:#F97316;">11.76</td>
            <td style="color:#F97316;">13.46</td>
            <td style="color:#F97316;">18.05</td>
            <td style="color:#F97316;">23.68</td>
            <td style="color:#F97316;">28.50</td>
            <td style="color:#F97316;">33.80</td>
            <td style="color:#F97316;">45.40</td>
            <td style="color:#F97316;">58.20</td>
            <td style="color:#F97316;">69.10</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- WATER COOLED SPECIFICATION TABLE -->
  <div style="margin-top: 2.5mm;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1mm;">
      <div class="font-orbitron" style="font-size: 8.5px; font-weight: 700; color: #FFFFFF;">
        WATER-COOLED CHILLER SPECIFICATION MATRIX (14 MODELS)
      </div>
      <div class="font-mono" style="font-size: 7px; color: #94A3B8;">CONDENSER WATER SUPPLY: 32°C TO 37°C COOLING TOWER</div>
    </div>
    <div class="spec-table-container">
      <table class="spec-table">
        <thead>
          <tr>
            <th class="label-col">MODEL CODE</th>
            <th>VI02W</th>
            <th>VI03W</th>
            <th>VI05W</th>
            <th>VI06W</th>
            <th>VI07W</th>
            <th>VI08W</th>
            <th>VI010W</th>
            <th>VI015W</th>
            <th>VI017W</th>
            <th>VI024W</th>
            <th>VI030W</th>
            <th>VI040W</th>
            <th>VI050W</th>
            <th>VI060W</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-col">Cooling Capacity (TR)</td>
            <td style="color:#00D2FF; font-weight:700;">2.7</td>
            <td style="color:#00D2FF; font-weight:700;">3.47</td>
            <td style="color:#00D2FF; font-weight:700;">5.82</td>
            <td style="color:#00D2FF; font-weight:700;">6.44</td>
            <td style="color:#00D2FF; font-weight:700;">8.0</td>
            <td style="color:#00D2FF; font-weight:700;">10.43</td>
            <td style="color:#00D2FF; font-weight:700;">12.4</td>
            <td style="color:#00D2FF; font-weight:700;">15.67</td>
            <td style="color:#00D2FF; font-weight:700;">21.3</td>
            <td style="color:#00D2FF; font-weight:700;">27.5</td>
            <td style="color:#00D2FF; font-weight:700;">32.7</td>
            <td style="color:#00D2FF; font-weight:700;">—</td>
            <td style="color:#00D2FF; font-weight:700;">55.0</td>
            <td style="color:#00D2FF; font-weight:700;">65.5</td>
          </tr>
          <tr>
            <td class="label-col">Cooling Tower (TR)</td>
            <td>5</td>
            <td>5</td>
            <td>8</td>
            <td>10</td>
            <td>10</td>
            <td>15</td>
            <td>20</td>
            <td>30</td>
            <td>32</td>
            <td>35</td>
            <td>40</td>
            <td>55</td>
            <td>70</td>
            <td>85</td>
          </tr>
          <tr>
            <td class="label-col">Condenser Water (LPM)</td>
            <td>50</td>
            <td>70</td>
            <td>130</td>
            <td>150</td>
            <td>180</td>
            <td>220</td>
            <td>240</td>
            <td>300</td>
            <td>320</td>
            <td>350</td>
            <td>400</td>
            <td>600</td>
            <td>800</td>
            <td>900</td>
          </tr>
          <tr>
            <td class="label-col">Condenser In/Out (BSP)</td>
            <td>1"</td>
            <td>1"</td>
            <td>1"</td>
            <td>1"</td>
            <td>1½"</td>
            <td>1½"</td>
            <td>1½"</td>
            <td>1½"</td>
            <td>1½"</td>
            <td>1½"</td>
            <td>2"</td>
            <td>2"</td>
            <td>2"</td>
            <td>2"</td>
          </tr>
          <tr>
            <td class="label-col">Net Weight (kg)</td>
            <td>150</td>
            <td>150</td>
            <td>400</td>
            <td>400</td>
            <td>800</td>
            <td>800</td>
            <td>800</td>
            <td>850</td>
            <td>850</td>
            <td>900</td>
            <td>1300</td>
            <td>2000</td>
            <td>2000</td>
            <td>2000</td>
          </tr>
          <tr>
            <td class="label-col">Connected Load (kW)</td>
            <td style="color:#F97316;">2.35</td>
            <td style="color:#F97316;">3.16</td>
            <td style="color:#F97316;">4.90</td>
            <td style="color:#F97316;">5.08</td>
            <td style="color:#F97316;">6.27</td>
            <td style="color:#F97316;">8.06</td>
            <td style="color:#F97316;">9.55</td>
            <td style="color:#F97316;">12.20</td>
            <td style="color:#F97316;">16.35</td>
            <td style="color:#F97316;">20.20</td>
            <td style="color:#F97316;">24.50</td>
            <td style="color:#F97316;">—</td>
            <td style="color:#F97316;">41.70</td>
            <td style="color:#F97316;">48.50</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  {footer}
</div>
"""

# ================= PAGE 5: PRODUCT 02 - FLAKE CUTTER =================
header, footer = get_page_chrome(5, "PRODUCT SHOWCASE // DIVISION 02", "flake-cutter")
html += f"""
<div class="page">
  {header}

  <div style="display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 4mm; margin-bottom: 3mm;">
    <div>
      <div style="display: flex; gap: 5px; align-items: center; margin-bottom: 1.5mm;">
        <span class="tech-badge">SERIES VAL-230 TO VAL-960 & HP SERIES</span>
        <span class="tech-badge tech-badge-orange">10 MODELS</span>
      </div>
      <h2 class="font-orbitron" style="font-size: 16px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em; line-height: 1.15; margin-bottom: 1.5mm;">
        GRANULATOR <span style="color: #00D2FF;">FLAKE CUTTER</span>
      </h2>
      <p style="font-size: 8.5px; color: #CBD5E1; line-height: 1.35; margin-bottom: 2.5mm;">
        Engineered for rapid, high-yield size reduction of runners, sprues, blow-moulded bottles, sheets, and thick injection-moulded scrap. Equipped with high-torque motors up to 57 kW (75 HP) and hardened D2 alloy rotor blades.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2mm;">
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Scissor Cut Geometry:</strong> Staggered rotary blades shear scrap progressively, reducing motor peak torque and dust.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Heavy Inertia Flywheel:</strong> Counterbalanced flywheel absorbs instantaneous cutting shocks on solid lumps.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Sound-Dampened Hopper:</strong> Multi-layer acoustically insulated feeding hopper keeps noise below industrial limits.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Tool Steel Knives:</strong> High-carbon D2 / SKD-11 cutters hardened to 58-60 HRC for prolonged edge retention.</div>
        </div>
      </div>
    </div>

    <!-- Product Render -->
    <div class="product-image-container">
      <div class="corner-reticle reticle-tl"></div>
      <div class="corner-reticle reticle-tr"></div>
      <div class="corner-reticle reticle-bl"></div>
      <div class="corner-reticle reticle-br"></div>
      <img src="{img_flake_cutter}" style="max-height: 48mm;" alt="Flake Cutter">
    </div>
  </div>

  <!-- FLAKE CUTTER SPECIFICATION TABLE -->
  <div style="margin-top: 2mm; flex: 1;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5mm;">
      <div class="font-orbitron" style="font-size: 9px; font-weight: 700; color: #FFFFFF;">
        FLAKE CUTTER TECHNICAL SPECIFICATION MATRIX (10 MODELS)
      </div>
      <div class="font-mono" style="font-size: 7.2px; color: #94A3B8;">THROUGHPUT: 100 TO 1000 KG/H // SCREEN MESH: 8 TO 12 MM</div>
    </div>
    <div class="spec-table-container">
      <table class="spec-table">
        <thead>
          <tr>
            <th class="label-col">MODEL DESIGNATION</th>
            <th>VAL-230</th>
            <th>VAL-300</th>
            <th>VAL-400</th>
            <th>VAL-500</th>
            <th>VAL-600</th>
            <th>VAL-800</th>
            <th>VAL-960</th>
            <th>VAL-10 HP</th>
            <th>VAL-15 HP</th>
            <th>VAL-20 HP</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-col">Grinding Chamber (mm)</td>
            <td style="color:#00D2FF;">230×200</td>
            <td style="color:#00D2FF;">310×200</td>
            <td style="color:#00D2FF;">410×240</td>
            <td style="color:#00D2FF;">510×300</td>
            <td style="color:#00D2FF;">610×330</td>
            <td style="color:#00D2FF;">815×470</td>
            <td style="color:#00D2FF;">960×610</td>
            <td style="color:#00D2FF;">360×260</td>
            <td style="color:#00D2FF;">420×280</td>
            <td style="color:#00D2FF;">480×330</td>
          </tr>
          <tr>
            <td class="label-col">Throughput Capacity (kg/h)</td>
            <td style="color:#F97316; font-weight:700;">100–150</td>
            <td style="color:#F97316; font-weight:700;">150–200</td>
            <td style="color:#F97316; font-weight:700;">200–250</td>
            <td style="color:#F97316; font-weight:700;">300–350</td>
            <td style="color:#F97316; font-weight:700;">350–450</td>
            <td style="color:#F97316; font-weight:700;">450–600</td>
            <td style="color:#F97316; font-weight:700;">800–1000</td>
            <td style="color:#F97316; font-weight:700;">150–250</td>
            <td style="color:#F97316; font-weight:700;">200–300</td>
            <td style="color:#F97316; font-weight:700;">250–350</td>
          </tr>
          <tr>
            <td class="label-col">Stationary Cutters (Bed Knives)</td>
            <td>2</td>
            <td>2</td>
            <td>2</td>
            <td>2</td>
            <td>4</td>
            <td>4</td>
            <td>4</td>
            <td>2</td>
            <td>2</td>
            <td>2</td>
          </tr>
          <tr>
            <td class="label-col">Rotary Cutters (Rotor Blades)</td>
            <td>6</td>
            <td>9</td>
            <td>12</td>
            <td>15</td>
            <td>18</td>
            <td>24</td>
            <td>30</td>
            <td>18</td>
            <td>21</td>
            <td>24</td>
          </tr>
          <tr>
            <td class="label-col">Screen Mesh Hole Size (mm)</td>
            <td>8</td>
            <td>8</td>
            <td>8</td>
            <td>10</td>
            <td>10</td>
            <td>10</td>
            <td>12</td>
            <td>10</td>
            <td>10</td>
            <td>10</td>
          </tr>
          <tr>
            <td class="label-col">Motor Power (kW)</td>
            <td>4</td>
            <td>5.5</td>
            <td>7.5</td>
            <td>11</td>
            <td>15</td>
            <td>22 / 30</td>
            <td>37/45/57</td>
            <td>7.5</td>
            <td>10</td>
            <td>15</td>
          </tr>
          <tr>
            <td class="label-col">Motor Power (HP)</td>
            <td>5</td>
            <td>7.5</td>
            <td>10</td>
            <td>15</td>
            <td>20</td>
            <td>30 / 40</td>
            <td>50/60/75</td>
            <td>10</td>
            <td>15</td>
            <td>20</td>
          </tr>
          <tr>
            <td class="label-col">Max Cutting Wall Thickness (mm)</td>
            <td>4</td>
            <td>5</td>
            <td>6</td>
            <td>7</td>
            <td>8</td>
            <td>10</td>
            <td>14</td>
            <td>1.5</td>
            <td>2.0</td>
            <td>2.2</td>
          </tr>
          <tr>
            <td class="label-col">Standard Dimension L×W×H (mm)</td>
            <td>890×640<br>×1145</td>
            <td>1010×715<br>×1300</td>
            <td>1010×815<br>×1330</td>
            <td>1290×975<br>×1670</td>
            <td>1290×1075<br>×1740</td>
            <td>1735×1525<br>×2180</td>
            <td>1950×1760<br>×2740</td>
            <td>1090×870<br>×1340</td>
            <td>1290×995<br>×1580</td>
            <td>1435×1075<br>×1775</td>
          </tr>
          <tr>
            <td class="label-col">Net Weight (kg)</td>
            <td>290</td>
            <td>435</td>
            <td>500</td>
            <td>900</td>
            <td>970</td>
            <td>2000</td>
            <td>3000</td>
            <td>540</td>
            <td>795</td>
            <td>1040</td>
          </tr>
          <tr>
            <td class="label-col">SP Model Dimensions (mm)</td>
            <td>1200×870<br>×1510</td>
            <td>1320×840<br>×1580</td>
            <td>1320×940<br>×1640</td>
            <td>1640×1080<br>×1980</td>
            <td>1940×1180<br>×2050</td>
            <td>1850×1540<br>×2680</td>
            <td>2050×1850<br>×2860</td>
            <td>1350×880<br>×1550</td>
            <td>1540×1020<br>×1800</td>
            <td>1600×1140<br>×1960</td>
          </tr>
          <tr>
            <td class="label-col">SP Model Net Weight (kg)</td>
            <td>400</td>
            <td>435</td>
            <td>604</td>
            <td>900</td>
            <td>1180</td>
            <td>2380</td>
            <td>3500</td>
            <td>750</td>
            <td>1180</td>
            <td>1400</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="font-size: 7.2px; color: #64748B; margin-top: 1.5mm; font-style: italic;">
      * Note: VAL-10 HP to VAL-20 HP represent a dedicated heavy-duty motor series. "SP" denotes soundproofed insulated acoustic enclosure model variant.
    </div>
  </div>

  {footer}
</div>
"""

# ================= PAGE 6: PRODUCT 03 - HOPPER LOADER =================
header, footer = get_page_chrome(6, "PRODUCT SHOWCASE // DIVISION 03", "hopper-loader")
html += f"""
<div class="page">
  {header}

  <div style="display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 4mm; margin-bottom: 3mm;">
    <div>
      <div style="display: flex; gap: 5px; align-items: center; margin-bottom: 1.5mm;">
        <span class="tech-badge">SERIES VAL-02 TO VAL-85</span>
        <span class="tech-badge tech-badge-orange">6 MODELS</span>
      </div>
      <h2 class="font-orbitron" style="font-size: 16px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em; line-height: 1.15; margin-bottom: 1.5mm;">
        VACUUM <span style="color: #00D2FF;">HOPPER LOADER</span>
      </h2>
      <p style="font-size: 8.5px; color: #CBD5E1; line-height: 1.35; margin-bottom: 2.5mm;">
        Engineered for automated dust-free pneumatic conveying of plastic granules, virgin pellets, and regrind from gaylords, silos, or drying hoppers directly to the processing machine hopper.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2mm;">
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Side-Channel Vacuum Blower:</strong> High-vacuum suction (0.9 to 7.5 kW) delivers rates from 30 up to 1200 kg/h.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Automatic Filter Cleaning:</strong> Reverse air-pulse purge automatically ejects fine dust from the filter mesh every cycle.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>SS 304 Receiver Hopper:</strong> Polished stainless steel material contact receiver with counterweighted dump flap.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Proportional Ratio Valve (Opt):</strong> Auto-mixes regrind and virgin material in programmable percentage ratios.</div>
        </div>
      </div>
    </div>

    <!-- Product Render -->
    <div class="product-image-container">
      <div class="corner-reticle reticle-tl"></div>
      <div class="corner-reticle reticle-tr"></div>
      <div class="corner-reticle reticle-bl"></div>
      <div class="corner-reticle reticle-br"></div>
      <img src="{img_hopper_loader}" style="max-height: 48mm;" alt="Vacuum Hopper Loader">
    </div>
  </div>

  <!-- HOPPER LOADER SPECIFICATION TABLE -->
  <div style="margin-top: 2mm; flex: 1;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5mm;">
      <div class="font-orbitron" style="font-size: 9px; font-weight: 700; color: #FFFFFF;">
        HOPPER LOADER TECHNICAL SPECIFICATION MATRIX (6 MODELS)
      </div>
      <div class="font-mono" style="font-size: 7.2px; color: #94A3B8;">COMPRESSED AIR: 28.3 L/MIN @ 5.51 BAR</div>
    </div>
    <div class="spec-table-container">
      <table class="spec-table">
        <thead>
          <tr>
            <th class="label-col">SPECIFICATION PARAMETER</th>
            <th>VAL-02</th>
            <th>VAL-07</th>
            <th>VAL-12</th>
            <th>VAL-14</th>
            <th>VAL-32</th>
            <th>VAL-85</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-col">Nominal Throughput (kg/h)</td>
            <td style="color:#F97316; font-weight:700;">30</td>
            <td style="color:#F97316; font-weight:700;">150 – 200</td>
            <td style="color:#F97316; font-weight:700;">250</td>
            <td style="color:#F97316; font-weight:700;">600 – 750</td>
            <td style="color:#F97316; font-weight:700;">500</td>
            <td style="color:#F97316; font-weight:700;">1200</td>
          </tr>
          <tr>
            <td class="label-col">Loader / Receiver Volume (Liters)</td>
            <td style="color:#00D2FF; font-weight:700;">6</td>
            <td style="color:#00D2FF; font-weight:700;">6</td>
            <td style="color:#00D2FF; font-weight:700;">12</td>
            <td style="color:#00D2FF; font-weight:700;">14</td>
            <td style="color:#00D2FF; font-weight:700;">32</td>
            <td style="color:#00D2FF; font-weight:700;">85</td>
          </tr>
          <tr>
            <td class="label-col">Loader Body Diameter (mm)</td>
            <td>203</td>
            <td>203</td>
            <td>254</td>
            <td>304</td>
            <td>381</td>
            <td>635</td>
          </tr>
          <tr>
            <td class="label-col">Loader Total Height (mm)</td>
            <td>640</td>
            <td>470</td>
            <td>690</td>
            <td>475</td>
            <td>900</td>
            <td>1155</td>
          </tr>
          <tr>
            <td class="label-col">Material / Vacuum Line Size</td>
            <td>40 mm (1.5")</td>
            <td>40-50-60 mm (1.5"-2"-2.5")</td>
            <td>50-60-75 mm (2"-2.5"-3")</td>
            <td>40-50-60 mm (1.5"-2"-2.5")</td>
            <td>50-60-75 mm (2"-2.5"-3")</td>
            <td>2.5", 3", 4" Line</td>
          </tr>
          <tr>
            <td class="label-col">Vacuum Blower Size (kW)</td>
            <td>0.9</td>
            <td>0.9 / 1.5 / 2.2</td>
            <td>4.0</td>
            <td>4.0 / 5.5 / 7.5</td>
            <td>7.5</td>
            <td>7.5</td>
          </tr>
          <tr>
            <td class="label-col">Supply Voltage</td>
            <td>230 V, 1-Phase</td>
            <td>415 V, 3-Phase</td>
            <td>415 V, 3-Phase</td>
            <td>415 V, 3-Phase</td>
            <td>415 V, 3-Phase</td>
            <td>415 V, 3-Phase</td>
          </tr>
          <tr>
            <td class="label-col">Air Requirement</td>
            <td colspan="6" style="color: #CBD5E1; text-align: center;">28.3 Liters/min @ 5.51 bar compressed air pressure</td>
          </tr>
          <tr>
            <td class="label-col">Automation Options</td>
            <td colspan="6" style="color: #94A3B8; text-align: left; padding-left: 10px;">
              Auto filter cleaning (AC), Proportional ratio valve (AB), Positive discharge valve, Common line valve, Photo-electric level sensor, Intermediate glass hopper.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Suffix Guide -->
    <div style="background: rgba(0, 71, 225, 0.1); border: 1px solid rgba(0, 71, 225, 0.3); border-radius: 4px; padding: 3mm; margin-top: 3mm; display: flex; justify-content: space-between; align-items: center;">
      <div class="font-orbitron" style="font-size: 8px; color: #00D2FF; font-weight: 700;">MODEL NOMENCLATURE & SUFFIX CODES:</div>
      <div style="font-size: 7.5px; color: #CBD5E1;">
        <strong style="color: #F97316;">AB:</strong> With Proportional Ratio Mixing Valve &nbsp;|&nbsp; 
        <strong style="color: #F97316;">MC:</strong> Manual Filter Cleaning &nbsp;|&nbsp; 
        <strong style="color: #F97316;">AC:</strong> Automatic Air-Pulse Reverse Cleaning
      </div>
    </div>
  </div>

  {footer}
</div>
"""

# ================= PAGE 7: PRODUCT 04 - LASER MARKING =================
header, footer = get_page_chrome(7, "PRODUCT SHOWCASE // DIVISION 04", "laser-marking")
html += f"""
<div class="page">
  {header}

  <div style="display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 4mm; margin-bottom: 3mm;">
    <div>
      <div style="display: flex; gap: 5px; align-items: center; margin-bottom: 1.5mm;">
        <span class="tech-badge">HIGH-SPEED FIBER OPTICS</span>
        <span class="tech-badge tech-badge-orange">30W & 50W SYSTEMS</span>
      </div>
      <h2 class="font-orbitron" style="font-size: 16px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em; line-height: 1.15; margin-bottom: 1.5mm;">
        ONLINE LASER <span style="color: #00D2FF;">MARKING MACHINE</span>
      </h2>
      <p style="font-size: 8.5px; color: #CBD5E1; line-height: 1.35; margin-bottom: 2.5mm;">
        Engineered specifically for continuous "on-the-fly" extrusion marking on pipe, tube, profile, cable, and drip irrigation lines (LLDP, HDPE, PVC, PP, Nylon) at line speeds up to 180 m/min.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2mm;">
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Pulsed Fiber Laser:</strong> 1064 nm wavelength delivering ultra-crisp, indelible marking with 100,000-hour source life.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Speed Synchronization:</strong> High-resolution rotary encoder tracks linear extrusion speed in real time with zero skew.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Touch HMI Controller:</strong> 10" industrial touch screen with Laser Mark vector software and USB/U-Disk file import.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Fume Extraction:</strong> High-static centrifugal suction unit evacuates polymer ablation fumes directly from the marking zone.</div>
        </div>
      </div>
    </div>

    <!-- Product Render -->
    <div class="product-image-container">
      <div class="corner-reticle reticle-tl"></div>
      <div class="corner-reticle reticle-tr"></div>
      <div class="corner-reticle reticle-bl"></div>
      <div class="corner-reticle reticle-br"></div>
      <img src="{img_laser_marking}" style="max-height: 48mm;" alt="Laser Marking Machine">
    </div>
  </div>

  <!-- LASER SPECIFICATION TABLE -->
  <div style="margin-top: 1.5mm; flex: 1;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5mm;">
      <div class="font-orbitron" style="font-size: 9px; font-weight: 700; color: #FFFFFF;">
        ONLINE LASER MARKING MACHINE SPECIFICATION MATRIX
      </div>
      <div class="font-mono" style="font-size: 7.2px; color: #94A3B8;">REPEATED PRECISION: 0.0001 MM // ACCURACY: 0.19 MM</div>
    </div>
    <div class="spec-table-container">
      <table class="spec-table">
        <thead>
          <tr>
            <th class="label-col" style="width: 34%;">PARAMETER</th>
            <th style="width: 33%;">MODEL VAL-30</th>
            <th style="width: 33%;">MODEL VAL-50</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-col">Laser Source Type & Power</td>
            <td style="color:#00D2FF; font-weight:700;">Pulsed Fiber Laser, 30 Watt</td>
            <td style="color:#F97316; font-weight:700;">Pulsed Fiber Laser, 50 Watt</td>
          </tr>
          <tr>
            <td class="label-col">Laser Wavelength / Beam Quality</td>
            <td>1064 nm / M² &lt; 1.5</td>
            <td>1064 nm / M² &lt; 1.5</td>
          </tr>
          <tr>
            <td class="label-col">Cooling Mechanism</td>
            <td>Forced Air-Cooled (No external water required)</td>
            <td>Forced Air-Cooled (No external water required)</td>
          </tr>
          <tr>
            <td class="label-col">Repetition Frequency / Pulse Energy</td>
            <td>0 – 200 kHz / 0.5 – 1.0 mJ</td>
            <td>0 – 200 kHz / 0.5 – 1.0 mJ</td>
          </tr>
          <tr>
            <td class="label-col">Marking Field Area / Focal Distance</td>
            <td>150 × 150 mm / 210 mm focal length</td>
            <td>150 × 150 mm / 210 mm focal length</td>
          </tr>
          <tr>
            <td class="label-col">Z-Axis Column Travel Adjustment</td>
            <td>500 mm motorized / manual vertical travel</td>
            <td>500 mm motorized / manual vertical travel</td>
          </tr>
          <tr>
            <td class="label-col">Max Production Line Speed</td>
            <td style="color:#00D2FF; font-weight:700;">Up to 180 m/min (material & font dependent)</td>
            <td style="color:#00D2FF; font-weight:700;">Up to 180 m/min (material & font dependent)</td>
          </tr>
          <tr>
            <td class="label-col">Compatible Substrates</td>
            <td colspan="2">LLDPE / HDPE / DRIP / PVC / PP / PPR / Conduit Pipes / Wire & Cable Sheathing</td>
          </tr>
          <tr>
            <td class="label-col">Min Character Height / Single Line Width</td>
            <td>0.1 mm (font dependent) / 0.01 mm</td>
            <td>0.1 mm (font dependent) / 0.01 mm</td>
          </tr>
          <tr>
            <td class="label-col">Mechanical Repeated Precision</td>
            <td style="color:#F97316; font-weight:700;">0.0001 mm (0.1 micron)</td>
            <td style="color:#F97316; font-weight:700;">0.0001 mm (0.1 micron)</td>
          </tr>
          <tr>
            <td class="label-col">Fume Extraction System</td>
            <td>Centrifugal suction unit with hose</td>
            <td>Centrifugal suction unit with hose</td>
          </tr>
          <tr>
            <td class="label-col">Operator Interface & Storage</td>
            <td>10" Touch Panel HMI + Laser Mark Software + USB</td>
            <td>10" Touch Panel HMI + Laser Mark Software + USB</td>
          </tr>
          <tr>
            <td class="label-col">Laser Diode Life Expectancy</td>
            <td style="color:#00D2FF;">70,000 to 100,000 Hours MTBF</td>
            <td style="color:#00D2FF;">70,000 to 100,000 Hours MTBF</td>
          </tr>
          <tr>
            <td class="label-col">Power Consumption & Supply</td>
            <td>750 W // 220 V AC, 50/60 Hz (UPS protected)</td>
            <td>750 W // 220 V AC, 50/60 Hz (UPS protected)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  {footer}
</div>
"""

# ================= PAGE 8: PRODUCT 05 - VOLUMETRIC FEEDER =================
header, footer = get_page_chrome(8, "PRODUCT SHOWCASE // DIVISION 05", "volumetric-feeder")
html += f"""
<div class="page">
  {header}

  <div style="display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 4mm; margin-bottom: 3mm;">
    <div>
      <div style="display: flex; gap: 5px; align-items: center; margin-bottom: 1.5mm;">
        <span class="tech-badge">MASTERBATCH DOSING SYSTEM</span>
        <span class="tech-badge tech-badge-orange">5 SCREW SIZES</span>
      </div>
      <h2 class="font-orbitron" style="font-size: 16px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em; line-height: 1.15; margin-bottom: 1.5mm;">
        VOLUMETRIC <span style="color: #00D2FF;">DOSING FEEDER</span>
      </h2>
      <p style="font-size: 8.5px; color: #CBD5E1; line-height: 1.35; margin-bottom: 2.5mm;">
        Designed for micro-precision volumetric addition of masterbatch, additives, blowing agents, and regrind directly at the throat of injection moulding machines and extruders.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2mm;">
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Ultra-Wide Dosing Range:</strong> Accommodates micro-dosing as low as 0.004 kg/h up to 73 kg/h with high linearity.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Brushless DC Motor:</strong> Precision digital servo-driven dosing auger with instant RPM feedback.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Quick-Disconnect Hopper:</strong> 20 L stainless steel hopper tilts and detaches without tools for rapid colour changeover.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Synchronous Extruder Link:</strong> Directly couples to main extruder speed signal for automatic ratio tracking.</div>
        </div>
      </div>
    </div>

    <!-- Product Render -->
    <div class="product-image-container">
      <div class="corner-reticle reticle-tl"></div>
      <div class="corner-reticle reticle-tr"></div>
      <div class="corner-reticle reticle-bl"></div>
      <div class="corner-reticle reticle-br"></div>
      <img src="{img_volumetric}" style="max-height: 48mm;" alt="Volumetric Feeder">
    </div>
  </div>

  <!-- VOLUMETRIC FEEDER SPECIFICATION TABLE -->
  <div style="margin-top: 2mm; flex: 1;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5mm;">
      <div class="font-orbitron" style="font-size: 9px; font-weight: 700; color: #FFFFFF;">
        VOLUMETRIC DOSING FEEDER TECHNICAL SPECIFICATION MATRIX
      </div>
      <div class="font-mono" style="font-size: 7.2px; color: #94A3B8;">HOPPER CAPACITY: 20 LITERS // WEIGHT: 19 KG</div>
    </div>
    <div class="spec-table-container">
      <table class="spec-table">
        <thead>
          <tr>
            <th class="label-col">SCREW CODE</th>
            <th>VAL 1</th>
            <th>VAL 2</th>
            <th>VAL 3</th>
            <th>VAL 4</th>
            <th>VAL 5</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-col">Screw Dimension Description</td>
            <td style="color:#00D2FF; font-weight:700;">3/8" × 1/4"</td>
            <td style="color:#00D2FF; font-weight:700;">3/8" × 3/8"</td>
            <td style="color:#00D2FF; font-weight:700;">1/2" × 1/2"</td>
            <td style="color:#00D2FF; font-weight:700;">3/4" × 3/4"</td>
            <td style="color:#00D2FF; font-weight:700;">1" × 1"</td>
          </tr>
          <tr>
            <td class="label-col">Dosing Capacity (kg / hour)</td>
            <td style="color:#F97316; font-weight:700;">0.004 to 3.60</td>
            <td style="color:#F97316; font-weight:700;">0.070 to 7.00</td>
            <td style="color:#F97316; font-weight:700;">0.200 to 10.90</td>
            <td style="color:#F97316; font-weight:700;">0.500 to 33.00</td>
            <td style="color:#F97316; font-weight:700;">0.500 to 73.00</td>
          </tr>
          <tr>
            <td class="label-col">Dosing Capacity (grams / sec)</td>
            <td>0.011 to 1.000</td>
            <td>0.019 to 1.944</td>
            <td>0.058 to 3.028</td>
            <td>0.138 to 9.166</td>
            <td>1.100 to 20.000</td>
          </tr>
          <tr>
            <td class="label-col">Material Hopper Capacity</td>
            <td colspan="5" style="color:#CBD5E1; text-align:center;">20 Liters (Heavy-Gauge Polished Stainless Steel)</td>
          </tr>
          <tr>
            <td class="label-col">Control Panel Dimensions (H×W×D)</td>
            <td colspan="5" style="color:#CBD5E1; text-align:center;">300 mm × 230 mm × 160 mm (Wall or Machine Frame Mounted)</td>
          </tr>
          <tr>
            <td class="label-col">Operating Supply Voltage & Current</td>
            <td colspan="5" style="color:#CBD5E1; text-align:center;">230 V AC (50/60 Hz), Total Running Amps: 1.0 A</td>
          </tr>
          <tr>
            <td class="label-col">Total Feeder Unit Net Weight</td>
            <td colspan="5" style="color:#CBD5E1; text-align:center;">19.0 kg</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Application Note -->
    <div style="background: rgba(0, 71, 225, 0.1); border: 1px solid rgba(0, 71, 225, 0.3); border-radius: 4px; padding: 3mm; margin-top: 3mm;">
      <div class="font-orbitron" style="font-size: 8px; color: #00D2FF; font-weight: 700; margin-bottom: 1mm;">
        PRECISION DOSING ADVANTAGE:
      </div>
      <p style="font-size: 7.8px; color: #CBD5E1; line-height: 1.4;">
        Chrome-plated precision screws ensure zero additive bridging, while the forced-gear reducer motor guarantees uniform granule delivery even at the lowest rotational frequencies. The controller features non-volatile memory for recipe parameter storage.
      </p>
    </div>
  </div>

  {footer}
</div>
"""

# ================= PAGE 9: PRODUCT 06 - MOULD TEMP CONTROLLER =================
header, footer = get_page_chrome(9, "PRODUCT SHOWCASE // DIVISION 06", "mould-temp")
html += f"""
<div class="page">
  {header}

  <div style="display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 4mm; margin-bottom: 3mm;">
    <div>
      <div style="display: flex; gap: 5px; align-items: center; margin-bottom: 1.5mm;">
        <span class="tech-badge">PRECISION THERMAL MANAGEMENT</span>
        <span class="tech-badge tech-badge-orange">OIL (180°C) & WATER (95°C)</span>
      </div>
      <h2 class="font-orbitron" style="font-size: 16px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em; line-height: 1.15; margin-bottom: 1.5mm;">
        MOULD TEMPERATURE <span style="color: #00D2FF;">CONTROLLER (TCU)</span>
      </h2>
      <p style="font-size: 8.5px; color: #CBD5E1; line-height: 1.35; margin-bottom: 2.5mm;">
        Engineered to stabilize injection and blow mould surface temperatures, ensuring optical clarity, dimensional repeatability, and eliminated thermal sink marks in engineered plastics.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2mm;">
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Dual Heat Media:</strong> Oil series up to 180°C for engineering resins; Water series up to 95°C for rapid cycling.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Microprocessor PID:</strong> Smart PID control algorithm maintains mould cavity temperature within ±0.5°C.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>High-Pressure Pump:</strong> High-temperature multistage pump (up to 5.0 bar, 150 LPM) ensures turbulent cavity flow.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Comprehensive Safety:</strong> Reverse-phase detection, low-level oil cut-off, overpressure relief, and auto air purge.</div>
        </div>
      </div>
    </div>

    <!-- Product Render -->
    <div class="product-image-container">
      <div class="corner-reticle reticle-tl"></div>
      <div class="corner-reticle reticle-tr"></div>
      <div class="corner-reticle reticle-bl"></div>
      <div class="corner-reticle reticle-br"></div>
      <img src="{img_mould_temp}" style="max-height: 48mm;" alt="Mould Temperature Controller">
    </div>
  </div>

  <!-- TCU SPECIFICATION TABLE -->
  <div style="margin-top: 1.5mm; flex: 1;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5mm;">
      <div class="font-orbitron" style="font-size: 9px; font-weight: 700; color: #FFFFFF;">
        MOULD TEMPERATURE CONTROLLER SPECIFICATION MATRIX (9 MODELS)
      </div>
      <div class="font-mono" style="font-size: 7.2px; color: #94A3B8;">SUPPLY: 415 V 50 HZ 3Φ // CONTROL: 230 V</div>
    </div>
    <div class="spec-table-container">
      <table class="spec-table">
        <thead>
          <tr>
            <th class="label-col">MODEL CODE</th>
            <th>VAL-O-3</th>
            <th>VAL-O-6</th>
            <th>VAL-O-9</th>
            <th>VAL-O-12</th>
            <th>VAL-O-18</th>
            <th>VAL-W-3</th>
            <th>VAL-W-6</th>
            <th>VAL-W-9</th>
            <th>VAL-W-18</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-col">Circulating Media</td>
            <td style="color:#F97316; font-weight:700;">Oil</td>
            <td style="color:#F97316; font-weight:700;">Oil</td>
            <td style="color:#F97316; font-weight:700;">Oil</td>
            <td style="color:#F97316; font-weight:700;">Oil</td>
            <td style="color:#F97316; font-weight:700;">Oil</td>
            <td style="color:#00D2FF; font-weight:700;">Water</td>
            <td style="color:#00D2FF; font-weight:700;">Water</td>
            <td style="color:#00D2FF; font-weight:700;">Water</td>
            <td style="color:#00D2FF; font-weight:700;">Water</td>
          </tr>
          <tr>
            <td class="label-col">Max Operating Temp (°C)</td>
            <td style="color:#F97316;">180 °C</td>
            <td style="color:#F97316;">180 °C</td>
            <td style="color:#F97316;">180 °C</td>
            <td style="color:#F97316;">180 °C</td>
            <td style="color:#F97316;">180 °C</td>
            <td style="color:#00D2FF;">95 °C</td>
            <td style="color:#00D2FF;">95 °C</td>
            <td style="color:#00D2FF;">95 °C</td>
            <td style="color:#00D2FF;">95 °C</td>
          </tr>
          <tr>
            <td class="label-col">Heating Capacity (kW)</td>
            <td>3</td>
            <td>6</td>
            <td>9</td>
            <td>12</td>
            <td>18</td>
            <td>3</td>
            <td>6</td>
            <td>9</td>
            <td>18</td>
          </tr>
          <tr>
            <td class="label-col">Cooling Capacity (kW)</td>
            <td>20</td>
            <td>20</td>
            <td>20</td>
            <td>28</td>
            <td>28</td>
            <td>20</td>
            <td>20</td>
            <td>20</td>
            <td>28</td>
          </tr>
          <tr>
            <td class="label-col">Pump Pressure (Bar)</td>
            <td>3.8</td>
            <td>3.8</td>
            <td>3.8</td>
            <td>5.0</td>
            <td>5.0</td>
            <td>3.8</td>
            <td>3.8</td>
            <td>3.8</td>
            <td>5.0</td>
          </tr>
          <tr>
            <td class="label-col">Pump Motor Power (kW)</td>
            <td>0.5</td>
            <td>0.5</td>
            <td>0.5</td>
            <td>2.2</td>
            <td>2.2</td>
            <td>0.5</td>
            <td>0.5</td>
            <td>0.5</td>
            <td>2.2</td>
          </tr>
          <tr>
            <td class="label-col">Flow Rate (LPM)</td>
            <td>65</td>
            <td>65</td>
            <td>65</td>
            <td>100</td>
            <td>150</td>
            <td>65</td>
            <td>65</td>
            <td>65</td>
            <td>150</td>
          </tr>
          <tr>
            <td class="label-col">Expansion Tank Volume (L)</td>
            <td>16</td>
            <td>16</td>
            <td>16</td>
            <td>45</td>
            <td>45</td>
            <td>16</td>
            <td>16</td>
            <td>16</td>
            <td>45</td>
          </tr>
          <tr>
            <td class="label-col">Net Weight (kg)</td>
            <td>60</td>
            <td>60</td>
            <td>60</td>
            <td>100</td>
            <td>120</td>
            <td>60</td>
            <td>60</td>
            <td>60</td>
            <td>120</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Media Description -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; margin-top: 3mm;">
      <div class="bg-glass-card" style="padding: 2.5mm; border-left: 2px solid #F97316;">
        <span class="font-orbitron" style="font-size: 8px; color: #F97316; font-weight: 700;">VAL-O SERIES (OIL)</span>
        <div style="font-size: 7.2px; color: #94A3B8; margin-top: 1px;">
          Suited for high-temperature engineering plastics (PA66, PBT, PPS, PEEK). High-flashpoint thermal oil prevents high hydraulic line pressure.
        </div>
      </div>
      <div class="bg-glass-card" style="padding: 2.5mm; border-left: 2px solid #00D2FF;">
        <span class="font-orbitron" style="font-size: 8px; color: #00D2FF; font-weight: 700;">VAL-W SERIES (WATER)</span>
        <div style="font-size: 7.2px; color: #94A3B8; margin-top: 1px;">
          Ideal for standard commodities (PP, PE, PS, ABS). High specific heat capacity of water delivers ultra-fast cycle cooling and energy efficiency.
        </div>
      </div>
    </div>
  </div>

  {footer}
</div>
"""

# ================= PAGE 10: PRODUCT 07 - DEHUMIDIFIER =================
header, footer = get_page_chrome(10, "PRODUCT SHOWCASE // DIVISION 07", "dehumidifier")
html += f"""
<div class="page">
  {header}

  <div style="display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 4mm; margin-bottom: 3mm;">
    <div>
      <div style="display: flex; gap: 5px; align-items: center; margin-bottom: 1.5mm;">
        <span class="tech-badge">SS 304 HYGIENIC STRUCTURE</span>
        <span class="tech-badge tech-badge-orange">200 TO 500 LIT/DAY</span>
      </div>
      <h2 class="font-orbitron" style="font-size: 16px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em; line-height: 1.15; margin-bottom: 1.5mm;">
        SS 304 INDUSTRIAL <span style="color: #00D2FF;">DEHUMIDIFIER</span>
      </h2>
      <p style="font-size: 8.5px; color: #CBD5E1; line-height: 1.35; margin-bottom: 2.5mm;">
        Built entirely with heavy-gauge SS 304 stainless steel cabinets for moisture-critical environments: pharmaceutical cleanrooms, capsule filling, packaging halls, cold storages, and optical manufacturing.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2mm;">
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>SS 304 Structural Shell:</strong> Resists corrosion, sanitary washdown chemicals, and aggressive industrial environments.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Digital Humidity Control:</strong> Microprocessor sensor maintains ambient relative humidity down to 25% RH.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>3-Phase Reciprocating Compressor:</strong> Industrial-grade hermetic refrigeration compressor with R22/R407 charge.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Dual Condensate Handling:</strong> Large internal SS 304 collection tank (up to 30 L) plus direct gravity drain pipe fitting.</div>
        </div>
      </div>
    </div>

    <!-- Product Render -->
    <div class="product-image-container">
      <div class="corner-reticle reticle-tl"></div>
      <div class="corner-reticle reticle-tr"></div>
      <div class="corner-reticle reticle-bl"></div>
      <div class="corner-reticle reticle-br"></div>
      <img src="{img_dehumidifier}" style="max-height: 48mm;" alt="SS 304 Dehumidifier">
    </div>
  </div>

  <!-- DEHUMIDIFIER SPECIFICATION TABLE -->
  <div style="margin-top: 2mm; flex: 1;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5mm;">
      <div class="font-orbitron" style="font-size: 9px; font-weight: 700; color: #FFFFFF;">
        SS 304 INDUSTRIAL DEHUMIDIFIER TECHNICAL SPECIFICATION MATRIX
      </div>
      <div class="font-mono" style="font-size: 7.2px; color: #94A3B8;">POWER: 440 V AC, 50 HZ 3-PHASE // FILTER: 20 MICRON</div>
    </div>
    <div class="spec-table-container">
      <table class="spec-table">
        <thead>
          <tr>
            <th class="label-col" style="width: 35%;">TECHNICAL PARAMETER</th>
            <th>MODEL VI 2DH</th>
            <th>MODEL VI 3DH</th>
            <th>MODEL VI 5DH</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-col">Extraction Capacity (30°C & 80% RH)</td>
            <td style="color:#F97316; font-weight:700;">200 Litres / Day</td>
            <td style="color:#F97316; font-weight:700;">300 Litres / Day</td>
            <td style="color:#F97316; font-weight:700;">500 Litres / Day</td>
          </tr>
          <tr>
            <td class="label-col">Coverage Area (Non-AC Space)</td>
            <td>1600 sq ft / 450 m³</td>
            <td>2400 sq ft / 679 m³</td>
            <td>3000 sq ft / 845 m³</td>
          </tr>
          <tr>
            <td class="label-col">Extraction Capacity (23°C & 60% RH)</td>
            <td>100 Litres / Day</td>
            <td>300 Litres / Day</td>
            <td>250 Litres / Day</td>
          </tr>
          <tr>
            <td class="label-col">Coverage Area (AC Hall w/o AHU)</td>
            <td>800 sq ft / 220 m³</td>
            <td>1200 sq ft / 399 m³</td>
            <td>1500 sq ft / 424 m³</td>
          </tr>
          <tr>
            <td class="label-col">Humidity Setpoint Control Range</td>
            <td colspan="3" style="color:#00D2FF;">Up to 40% RH standard // Digital Microprocessor down to 25% RH</td>
          </tr>
          <tr>
            <td class="label-col">Air Flow Rate (Axial Fan)</td>
            <td>2500 m³ / hr</td>
            <td>4000 m³ / hr</td>
            <td>5400 m³ / hr</td>
          </tr>
          <tr>
            <td class="label-col">Acoustic Noise Level</td>
            <td>83 dB(A)</td>
            <td>87 dB(A)</td>
            <td>90 dB(A)</td>
          </tr>
          <tr>
            <td class="label-col">Internal Water Tank (SS 304)</td>
            <td>22 Litres (SS 304)</td>
            <td>25 Litres (SS 304)</td>
            <td>30 Litres (SS 304)</td>
          </tr>
          <tr>
            <td class="label-col">External Drain Connection</td>
            <td>Yes (Continuous Drain)</td>
            <td>Yes (Continuous Drain)</td>
            <td>Yes (Continuous Drain)</td>
          </tr>
          <tr>
            <td class="label-col">Structural Cabinet Material</td>
            <td colspan="3" style="color:#00D2FF; font-weight:700;">100% SS 304 Heavy-Gauge Brushed Stainless Steel</td>
          </tr>
          <tr>
            <td class="label-col">Structure Dimensions (Inches)</td>
            <td>21.5" × 20.5" × 38.5"</td>
            <td>24.0" × 21.0" × 40.0"</td>
            <td>33.0" × 20.5" × 57.0"</td>
          </tr>
          <tr>
            <td class="label-col">Compressor / Refrigerant</td>
            <td colspan="3">Reciprocating 3-Phase Industrial Compressor // Eco R-22 or R-407C</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  {footer}
</div>
"""

# ================= PAGE 11: PRODUCT 08 - HOT AIR DRYER =================
header, footer = get_page_chrome(11, "PRODUCT SHOWCASE // DIVISION 08", "hot-air-dryer")
html += f"""
<div class="page">
  {header}

  <div style="display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 4mm; margin-bottom: 3mm;">
    <div>
      <div style="display: flex; gap: 5px; align-items: center; margin-bottom: 1.5mm;">
        <span class="tech-badge">UNIFORM RESIN DEHUMIDIFYING</span>
        <span class="tech-badge tech-badge-orange">60 TO 800 LITERS</span>
      </div>
      <h2 class="font-orbitron" style="font-size: 16px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em; line-height: 1.15; margin-bottom: 1.5mm;">
        HOT AIR <span style="color: #00D2FF;">HOPPER DRYER</span>
      </h2>
      <p style="font-size: 8.5px; color: #CBD5E1; line-height: 1.35; margin-bottom: 2.5mm;">
        Engineered for rapid removal of surface and core moisture from hygroscopic and non-hygroscopic polymer resins, preventing splay marks, bubbles, and structural defects in moulded parts.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2mm;">
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Conical Diffuser:</strong> 360° downward-blowing hot air cone ensures uniform thermal gradient from base to crown.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Double-Walled Insulation:</strong> Heavy-gauge stainless steel inner bucket with high-efficiency thermal insulation wrap.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Quiet Centrifugal Blower:</strong> High-static blower (90 to 750 W) delivers consistent airflow through packed beds.</div>
        </div>
        <div class="feature-pill">
          <div class="feature-bullet"></div>
          <div><strong>Hinged Cleaning Door:</strong> Full-swing access door allows 2-minute cleanout during resin and colour changeovers.</div>
        </div>
      </div>
    </div>

    <!-- Product Render -->
    <div class="product-image-container">
      <div class="corner-reticle reticle-tl"></div>
      <div class="corner-reticle reticle-tr"></div>
      <div class="corner-reticle reticle-bl"></div>
      <div class="corner-reticle reticle-br"></div>
      <img src="{img_hot_air_dryer}" style="max-height: 48mm;" alt="Hot Air Hopper Dryer">
    </div>
  </div>

  <!-- DRYER SPECIFICATION TABLE -->
  <div style="margin-top: 2mm; flex: 1;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5mm;">
      <div class="font-orbitron" style="font-size: 9px; font-weight: 700; color: #FFFFFF;">
        HOT AIR HOPPER DRYER TECHNICAL SPECIFICATION MATRIX (8 MODELS)
      </div>
      <div class="font-mono" style="font-size: 7.2px; color: #94A3B8;">ELECTRICAL SUPPLY: 415 V, 3-PHASE, 50 HZ</div>
    </div>
    <div class="spec-table-container">
      <table class="spec-table">
        <thead>
          <tr>
            <th class="label-col">MODEL DESIGNATION</th>
            <th>VAL-50</th>
            <th>VAL-100</th>
            <th>VAL-150</th>
            <th>VAL-200</th>
            <th>VAL-300</th>
            <th>VAL-400</th>
            <th>VAL-600</th>
            <th>VAL-800</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-col">Hopper Capacity (Liters)</td>
            <td style="color:#00D2FF; font-weight:700;">60</td>
            <td style="color:#00D2FF; font-weight:700;">100</td>
            <td style="color:#00D2FF; font-weight:700;">150</td>
            <td style="color:#00D2FF; font-weight:700;">200</td>
            <td style="color:#00D2FF; font-weight:700;">300</td>
            <td style="color:#00D2FF; font-weight:700;">400</td>
            <td style="color:#00D2FF; font-weight:700;">600</td>
            <td style="color:#00D2FF; font-weight:700;">800</td>
          </tr>
          <tr>
            <td class="label-col">Heater Capacity (kW)</td>
            <td style="color:#F97316; font-weight:700;">2.7</td>
            <td style="color:#F97316; font-weight:700;">3.9</td>
            <td style="color:#F97316; font-weight:700;">6.0</td>
            <td style="color:#F97316; font-weight:700;">6.0</td>
            <td style="color:#F97316; font-weight:700;">10.0</td>
            <td style="color:#F97316; font-weight:700;">12.0</td>
            <td style="color:#F97316; font-weight:700;">18.0</td>
            <td style="color:#F97316; font-weight:700;">18.0</td>
          </tr>
          <tr>
            <td class="label-col">Blower Power (Watts)</td>
            <td>90 W</td>
            <td>200 W</td>
            <td>250 W</td>
            <td>250 W</td>
            <td>400 W</td>
            <td>400 W</td>
            <td>750 W</td>
            <td>750 W</td>
          </tr>
          <tr>
            <td class="label-col">Overall Height (mm)</td>
            <td>1040</td>
            <td>1200</td>
            <td>1234</td>
            <td>1390</td>
            <td>1640</td>
            <td>1840</td>
            <td>1910</td>
            <td>2260</td>
          </tr>
          <tr>
            <td class="label-col">Width (mm)</td>
            <td>730</td>
            <td>680</td>
            <td>1020</td>
            <td>1250</td>
            <td>1250</td>
            <td>1250</td>
            <td>1360</td>
            <td>1370</td>
          </tr>
          <tr>
            <td class="label-col">Depth (mm)</td>
            <td>430</td>
            <td>620</td>
            <td>660</td>
            <td>660</td>
            <td>840</td>
            <td>840</td>
            <td>990</td>
            <td>980</td>
          </tr>
          <tr>
            <td class="label-col">Supply Voltage</td>
            <td colspan="8">415 V AC, 3-Phase, 50 Hz (Standard Indian / Industrial Mains)</td>
          </tr>
          <tr>
            <td class="label-col">Construction Material</td>
            <td colspan="8">Polished stainless steel contact body with painted industrial mild steel exterior casing</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Optional Mounts -->
    <div style="background: rgba(0, 71, 225, 0.1); border: 1px solid rgba(0, 71, 225, 0.3); border-radius: 4px; padding: 3mm; margin-top: 3mm; display: flex; justify-content: space-between; align-items: center;">
      <div class="font-orbitron" style="font-size: 8px; color: #00D2FF; font-weight: 700;">MOUNTING OPTIONS:</div>
      <div style="font-size: 7.5px; color: #CBD5E1;">
        Direct Machine Throat Mounting Flange &nbsp;|&nbsp; 
        Mobile Floor-Standing Stand with Casters &nbsp;|&nbsp; 
        Integrated Vacuum Loader Mounting Adaptor
      </div>
    </div>
  </div>

  {footer}
</div>
"""

# ================= PAGE 12: MANUFACTURING RIGOR & PILLARS =================
header, footer = get_page_chrome(12, "MANUFACTURING INFRASTRUCTURE & FACILITY RIGOR")
html += f"""
<div class="page">
  {header}

  <div style="margin-bottom: 3.5mm;">
    <span class="tech-badge tech-badge-orange">FOUR PILLARS OF VALNEX MANUFACTURING</span>
    <h2 class="font-orbitron" style="font-size: 16px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em; margin: 1mm 0 2mm 0;">
      PRECISION INFRASTRUCTURE & QUALITY CONTROLS
    </h2>
    <p style="font-size: 8.5px; color: #94A3B8; max-width: 170mm;">
      Our manufacturing facility in Ahmedabad is purpose-built to maintain uncompromising quality across every mechanical weld, refrigeration circuit, and electronic harness.
    </p>
  </div>

  <!-- 4 Pillars Grid -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; flex: 1;">
    <!-- Pillar 1 -->
    <div class="bg-glass-card" style="padding: 3mm; display: flex; gap: 3.5mm; align-items: center;">
      <img src="{img_str1}" style="width: 38mm; height: 38mm; object-fit: cover; border-radius: 3px; border: 1px solid rgba(0, 71, 225, 0.35);" alt="Precision Tooling">
      <div style="flex: 1;">
        <span class="tech-badge" style="margin-bottom: 1mm;">PILLAR 01</span>
        <div class="font-orbitron" style="font-size: 10px; font-weight: 700; color: #FFFFFF; margin-bottom: 1mm;">
          CNC TOOLING & SHEET METAL
        </div>
        <p style="font-size: 7.8px; color: #CBD5E1; line-height: 1.4;">
          High-precision CNC hydraulic press brakes, laser cutting, and turret punching ensure repeatable chassis tolerances, zero vibration resonance, and seamless modular enclosure assembly.
        </p>
      </div>
    </div>

    <!-- Pillar 2 -->
    <div class="bg-glass-card" style="padding: 3mm; display: flex; gap: 3.5mm; align-items: center;">
      <img src="{img_str2}" style="width: 38mm; height: 38mm; object-fit: cover; border-radius: 3px; border: 1px solid rgba(0, 71, 225, 0.35);" alt="TIG Welding">
      <div style="flex: 1;">
        <span class="tech-badge" style="margin-bottom: 1mm;">PILLAR 02</span>
        <div class="font-orbitron" style="font-size: 10px; font-weight: 700; color: #FFFFFF; margin-bottom: 1mm;">
          HEAVY-GAUGE SS 304 TIG WELDING
        </div>
        <p style="font-size: 7.8px; color: #CBD5E1; line-height: 1.4;">
          Sanitary argon-purged TIG welding across all water reservoirs, pipework, and hopper receivers. Passivated welds eliminate crevices, preventing internal bacterial growth and pitting.
        </p>
      </div>
    </div>

    <!-- Pillar 3 -->
    <div class="bg-glass-card" style="padding: 3mm; display: flex; gap: 3.5mm; align-items: center;">
      <img src="{img_str3}" style="width: 38mm; height: 38mm; object-fit: cover; border-radius: 3px; border: 1px solid rgba(0, 71, 225, 0.35);" alt="Testing Rig">
      <div style="flex: 1;">
        <span class="tech-badge" style="margin-bottom: 1mm;">PILLAR 03</span>
        <div class="font-orbitron" style="font-size: 10px; font-weight: 700; color: #FFFFFF; margin-bottom: 1mm;">
          FACTORY ACCEPTANCE TESTING (FAT)
        </div>
        <p style="font-size: 7.8px; color: #CBD5E1; line-height: 1.4;">
          Every chiller and TCU undergoes pressurized nitrogen leak holding, high-voltage insulation dielectric checks, full-draw compressor amp measurement, and 4-hour thermal run-in test.
        </p>
      </div>
    </div>

    <!-- Pillar 4 -->
    <div class="bg-glass-card" style="padding: 3mm; display: flex; gap: 3.5mm; align-items: center;">
      <img src="{img_str4}" style="width: 38mm; height: 38mm; object-fit: cover; border-radius: 3px; border: 1px solid rgba(0, 71, 225, 0.35);" alt="Support Network">
      <div style="flex: 1;">
        <span class="tech-badge" style="margin-bottom: 1mm;">PILLAR 04</span>
        <div class="font-orbitron" style="font-size: 10px; font-weight: 700; color: #FFFFFF; margin-bottom: 1mm;">
          PAN-INDIA SERVICE & SPARES
        </div>
        <p style="font-size: 7.8px; color: #CBD5E1; line-height: 1.4;">
          With ready inventories of genuine replacement pumps, compressors, blades, heaters, and controllers, Valnex guarantees rapid technical dispatch to minimize unscheduled customer downtime.
        </p>
      </div>
    </div>
  </div>

  <!-- Corporate Certification Strip -->
  <div style="background: rgba(0, 71, 225, 0.12); border: 1px solid rgba(0, 71, 225, 0.35); border-radius: 4px; padding: 3mm 4mm; display: flex; justify-content: space-between; align-items: center; margin-top: 3.5mm;">
    <div>
      <div class="font-orbitron" style="font-size: 9px; font-weight: 700; color: #FFFFFF;">
        VALNEX INDUSTRIES PRIVATE LIMITED QUALITY COMMITMENT
      </div>
      <div style="font-size: 7.5px; color: #94A3B8; margin-top: 1px;">
        Make in India Certification // CE Machinery Directive Compliance // ISO 9001:2015 Quality Management System
      </div>
    </div>
    <div class="font-mono" style="font-size: 8px; color: #F97316; font-weight: 700;">
      100% PRE-DISPATCH CERTIFIED
    </div>
  </div>

  {footer}
</div>
"""

# ================= PAGE 13: BACK COVER =================
html += f"""
<div class="page" style="padding: 0;">
  <div class="cover-grid">
    <div class="corner-reticle reticle-tl" style="top: -3px; left: -3px; width: 15px; height: 15px; border-width: 2px;"></div>
    <div class="corner-reticle reticle-tr" style="top: -3px; right: -3px; width: 15px; height: 15px; border-width: 2px;"></div>
    <div class="corner-reticle reticle-bl" style="bottom: -3px; left: -3px; width: 15px; height: 15px; border-width: 2px;"></div>
    <div class="corner-reticle reticle-br" style="bottom: -3px; right: -3px; width: 15px; height: 15px; border-width: 2px;"></div>
  </div>

  <div class="cover-content" style="margin: 8mm; text-align: center;">
    <!-- Top Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0, 71, 225, 0.35); padding-bottom: 4mm;">
      <span class="tech-badge">CONNECT WITH OUR ENGINEERING TEAM</span>
      <div class="font-mono" style="font-size: 7.5px; color: #64748B;">
        GLOBAL HEADQUARTERS // AHMEDABAD, INDIA
      </div>
    </div>

    <!-- Center Contact Card -->
    <div style="margin: auto 0; padding: 0 8mm;">
      <!-- Logo Container -->
      <div style="margin-bottom: 4mm;">
        <img src="{img_logo}" style="height: 65px; width: auto; object-fit: contain; filter: drop-shadow(0 0 30px rgba(0, 71, 225, 0.5));" alt="Valnex Logo">
      </div>

      <h2 class="font-orbitron" style="font-size: 22px; font-weight: 900; letter-spacing: 0.1em; color: #FFFFFF; line-height: 1.1; margin-bottom: 1.5mm;">
        VALNEX INDUSTRIES
      </h2>
      <div class="font-orbitron" style="font-size: 11px; font-weight: 700; letter-spacing: 0.25em; color: #00D2FF; margin-bottom: 4mm;">
        PRIVATE LIMITED
      </div>

      <!-- The 3 Taglines from prior PDF located beneath logo -->
      <div style="display: inline-flex; align-items: center; gap: 10px; background: rgba(0, 71, 225, 0.15); border: 1px solid rgba(0, 71, 225, 0.4); padding: 4px 18px; border-radius: 20px; margin-bottom: 8mm;">
        <span class="font-orbitron" style="font-size: 9.5px; font-weight: 700; letter-spacing: 0.2em; color: #FFFFFF;">QUALITY</span>
        <span style="color: #F97316; font-size: 9px;">•</span>
        <span class="font-orbitron" style="font-size: 9.5px; font-weight: 700; letter-spacing: 0.2em; color: #FFFFFF;">EXCELLENCE</span>
        <span style="color: #F97316; font-size: 9px;">•</span>
        <span class="font-orbitron" style="font-size: 9.5px; font-weight: 700; letter-spacing: 0.2em; color: #FFFFFF;">COMMITMENT</span>
      </div>

      <!-- Contact Info Grid -->
      <div style="background: rgba(4, 19, 56, 0.7); border: 1px solid rgba(0, 71, 225, 0.35); border-radius: 6px; padding: 6mm; margin-bottom: 6mm; text-align: left; position: relative;">
        <div class="corner-reticle reticle-tl"></div>
        <div class="corner-reticle reticle-tr"></div>
        <div class="corner-reticle reticle-bl"></div>
        <div class="corner-reticle reticle-br"></div>

        <div style="display: grid; grid-template-columns: 1.4fr 0.8fr; gap: 6mm; align-items: center;">
          <div>
            <div style="margin-bottom: 3.5mm;">
              <div class="font-orbitron" style="font-size: 8px; font-weight: 700; color: #00D2FF; margin-bottom: 1mm;">
                MANUFACTURING FACILITY & REGISTERED OFFICE:
              </div>
              <div style="font-size: 9px; color: #FFFFFF; font-weight: 500; line-height: 1.45;">
                3, Maruti Industrial Park-2,<br>
                Dhamatvan Bakrol Road, Dhamatvan,<br>
                Ahmedabad - 382435, Gujarat, INDIA.
              </div>
            </div>

            <div style="margin-bottom: 3.5mm;">
              <div class="font-orbitron" style="font-size: 8px; font-weight: 700; color: #F97316; margin-bottom: 1mm;">
                TELEPHONE & DIRECT INQUIRIES:
              </div>
              <div class="font-mono" style="font-size: 11px; color: #FFFFFF; font-weight: 700;">
                +91 75748 48748
              </div>
            </div>

            <div>
              <div class="font-orbitron" style="font-size: 8px; font-weight: 700; color: #00D2FF; margin-bottom: 1mm;">
                ELECTRONIC MAIL & DIGITAL PORTAL:
              </div>
              <div class="font-mono" style="font-size: 9px; color: #CBD5E1; line-height: 1.4;">
                info@valnexindustries.com<br>
                sales@valnexindustries.com<br>
                <strong style="color: #00D2FF;">www.valnexindustries.com</strong>
              </div>
            </div>
          </div>

          <!-- QR Code Container -->
          <div style="text-align: center; border-left: 1px solid rgba(0, 71, 225, 0.25); padding-left: 5mm;">
            <div style="background: #FFFFFF; padding: 3mm; border-radius: 4px; display: inline-block; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);">
              <img src="{img_qr}" style="width: 28mm; height: 28mm; display: block;" alt="Scan for Quote">
            </div>
            <div class="font-orbitron" style="font-size: 7.5px; font-weight: 700; color: #F97316; margin-top: 2mm;">
              SCAN FOR INSTANT QUOTE
            </div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 6.5px; color: #94A3B8; margin-top: 1px;">
              Direct Portal & Spec Sheet Download
            </div>
          </div>
        </div>
      </div>

      <!-- Make in India & Certification Badges -->
      <div style="display: flex; justify-content: center; align-items: center; gap: 8mm;">
        <img src="{img_make_in_india}" style="height: 28px; width: auto;" alt="Make in India">
        <div style="height: 24px; width: 1px; background: rgba(255, 255, 255, 0.15);"></div>
        <div style="font-family: 'Orbitron', sans-serif; font-size: 8.5px; font-weight: 700; color: #00D2FF; letter-spacing: 0.1em;">
          ISO 9001:2015 CERTIFIED
        </div>
        <div style="height: 24px; width: 1px; background: rgba(255, 255, 255, 0.15);"></div>
        <div style="font-family: 'Orbitron', sans-serif; font-size: 8.5px; font-weight: 700; color: #FFFFFF; letter-spacing: 0.1em;">
          CE CONFORMITY
        </div>
      </div>
    </div>

    <!-- Bottom Legal Line -->
    <div style="border-top: 1px solid rgba(0, 71, 225, 0.35); padding-top: 4mm; display: flex; justify-content: space-between; align-items: center; font-family: 'JetBrains Mono', monospace; font-size: 7px; color: #64748B;">
      <div>
        © 2026 VALNEX INDUSTRIES PRIVATE LIMITED. ALL RIGHTS RESERVED.
      </div>
      <div>
        DOCUMENT REF: VAL-CAT-2026-V1.0 // PRINTED IN AHMEDABAD, INDIA
      </div>
    </div>
  </div>
</div>
</body>
</html>
"""

output_html_path = os.path.abspath("scratch/catalog.html")
os.makedirs("scratch", exist_ok=True)
with open(output_html_path, "w", encoding="utf-8") as f:
    f.write(html)
print(f"Catalog HTML written to: {output_html_path} ({len(html)} bytes)")

output_pdf_path = os.path.abspath("public/catalog.pdf")
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
print(f"Rendering PDF via Chrome headless: {output_pdf_path}...")
cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    f"--print-to-pdf={output_pdf_path}",
    "--no-pdf-header-footer",
    output_html_path
]
subprocess.run(cmd, check=True)
print(f"PDF generated successfully at: {output_pdf_path} ({os.path.getsize(output_pdf_path)} bytes)")

# Verify PDF with PyMuPDF
doc = fitz.open(output_pdf_path)
print(f"Verified PDF: {len(doc)} pages")
os.makedirs("scratch/catalog_pages", exist_ok=True)
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    img_out = f"scratch/catalog_pages/page_{i+1}.png"
    pix.save(img_out)
    print(f"Page {i+1} saved: {img_out} (size: {page.rect.width}x{page.rect.height})")

print("All pages rendered and verified!")
