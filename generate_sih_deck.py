import os
import sys
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    template_path = r'C:\Users\acer\Downloads\SIH2026-IDEA-Presentation-Format.pptx'
    out_pptx = os.path.abspath('SwasthyaSetu_SIH2026_Idea_Presentation.pptx')
    out_pdf = os.path.abspath('SwasthyaSetu_SIH2026_Idea_Presentation.pdf')

    prs = pptx.Presentation(template_path)
    print(f"Loaded template with {len(prs.slides)} slides.")

    # Palette
    C_NAVY = RGBColor(15, 23, 42)       # #0F172A
    C_TEAL = RGBColor(13, 148, 136)     # #0D9488
    C_BLUE = RGBColor(37, 99, 235)      # #2563EB
    C_DARK = RGBColor(30, 41, 59)       # #1E293B
    C_MUTED = RGBColor(100, 116, 139)   # #64748B
    C_LIGHT_BG = RGBColor(248, 250, 252)# #F8FAFC
    C_TEAL_BG = RGBColor(240, 253, 250) # #F0FDFA
    C_BLUE_BG = RGBColor(239, 246, 255) # #EFF6FF
    C_BORDER = RGBColor(226, 232, 240)  # #E2E8F0
    C_WHITE = RGBColor(255, 255, 255)
    C_GREEN = RGBColor(16, 185, 129)
    C_RED = RGBColor(225, 29, 72)
    C_GOLD = RGBColor(217, 119, 6)

    # Image asset paths
    img_dir = os.path.abspath(r'assets\images')
    img_referral = os.path.join(img_dir, 'referral_workflow_infographic.jpg')
    img_tech = os.path.join(img_dir, 'platform_architecture_infographic.jpg')
    img_feasibility = os.path.join(img_dir, 'feasibility_pillars_infographic.jpg')
    img_impact = os.path.join(img_dir, 'impact_pillars_infographic.jpg')
    img_research = os.path.join(img_dir, 'research_evidence_infographic.jpg')

    # -------------------------------------------------------------
    # SLIDE 1: TITLE PAGE
    # -------------------------------------------------------------
    s1 = prs.slides[0]
    for shape in s1.shapes:
        if shape.name == 'Subtitle 3':
            tf = shape.text_frame
            tf.clear()
            p = tf.paragraphs[0]
            p.text = "SWASTHYASETU (स्वास्थ्यसेतु)"
            p.font.name = 'Arial'
            p.font.size = Pt(26)
            p.font.bold = True
            p.font.color.rgb = C_TEAL
            
            p2 = tf.add_paragraph()
            p2.text = "Rural Healthcare Referral & Care Continuity Platform"
            p2.font.name = 'Arial'
            p2.font.size = Pt(14)
            p2.font.bold = True
            p2.font.color.rgb = C_NAVY
            p2.space_before = Pt(4)

            p3 = tf.add_paragraph()
            p3.text = '"Don\'t just send the patient. Make sure the care is ready — and stay with the journey until care is complete."'
            p3.font.name = 'Arial'
            p3.font.size = Pt(10.5)
            p3.font.italic = True
            p3.font.color.rgb = C_MUTED
            p3.space_before = Pt(4)

        elif shape.name == 'TextBox 9':
            tf = shape.text_frame
            tf.clear()
            items = [
                ("Problem Statement ID:", " SIH26133"),
                ("Problem Statement Title:", " Accessibility and quality of public healthcare services, particularly in rural and underserved areas"),
                ("Nodal Authority:", " Government of Maharashtra (Maharashtra State Innovation Society; Department of Skills, Employment, Entrepreneurship and Innovation)"),
                ("Theme:", " MedTech / BioTech / HealthTech"),
                ("PS Category:", " Software"),
                ("Team ID:", " SIH2026-TEAM-2"),
                ("Team Name:", " SwasthyaSetu (Team 2)")
            ]
            for idx, (label, val) in enumerate(items):
                p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
                p.space_after = Pt(6)
                r1 = p.add_run()
                r1.text = "• " + label
                r1.font.name = 'Arial'
                r1.font.size = Pt(11)
                r1.font.bold = True
                r1.font.color.rgb = C_NAVY
                
                r2 = p.add_run()
                r2.text = val
                r2.font.name = 'Arial'
                r2.font.size = Pt(10.5)
                r2.font.bold = False
                r2.font.color.rgb = C_DARK

    # Logo asset paths
    logo_dir = os.path.abspath(r'assets\logo')
    logo_full = os.path.join(logo_dir, 'swasthya_setu_logo_transparent.png')
    logo_emblem = os.path.join(logo_dir, 'swasthya_setu_emblem_transparent.png')

    # Add Project Logo to Slide 1 (Top Left Header to balance SIH 2026 logo on Top Right)
    if os.path.exists(logo_full):
        s1.shapes.add_picture(logo_full, Inches(0.55), Inches(0.28), Inches(1.35), Inches(1.35))

    # Update team oval on slides 2 to 6 with brand emblem and team name
    for idx in range(1, 6):
        s = prs.slides[idx]
        for shape in s.shapes:
            if 'Oval' in shape.name or shape.name.startswith('Oval'):
                shape.width = Inches(1.85)
                shape.left = Inches(0.22)
                tf = shape.text_frame
                tf.clear()
                tf.margin_left = Inches(0.02)
                tf.margin_right = Inches(0.02)
                tf.margin_top = Inches(0.02)
                tf.margin_bottom = Inches(0.02)
                p = tf.paragraphs[0]
                p.text = "SwasthyaSetu"
                p.font.name = 'Arial'
                p.font.size = Pt(7.5)
                p.font.bold = True
                p.font.color.rgb = C_NAVY
                p.alignment = PP_ALIGN.CENTER
                p.space_before = Pt(26) # Push below emblem

        # Add emblem inside oval
        if os.path.exists(logo_emblem):
            s.shapes.add_picture(logo_emblem, Inches(0.80), Inches(0.33), Inches(0.68), Inches(0.34))

    # Helper function to remove raw TextBox 8 placeholder
    def clear_placeholder(slide):
        for shape in list(slide.shapes):
            if shape.name == 'TextBox 8':
                sp = shape._element
                sp.getparent().remove(sp)

    # -------------------------------------------------------------
    # SLIDE 2: PROPOSED SOLUTION & INNOVATION (WITH INFOGRAPHIC)
    # -------------------------------------------------------------
    s2 = prs.slides[1]
    clear_placeholder(s2)
    for shp in s2.shapes:
        if shp.name == 'Title 1':
            shp.left = Inches(2.15); shp.width = Inches(8.40)
            shp.text_frame.text = "IDEA TITLE: SwasthyaSetu (ग्रामीण स्वास्थ्य रेफरल और देखभाल निरंतरता मंच)"
            for p in shp.text_frame.paragraphs:
                p.font.name = 'Arial'; p.font.size = Pt(15.5); p.font.bold = True; p.font.color.rgb = C_NAVY
                p.alignment = PP_ALIGN.CENTER

    sub_box = s2.shapes.add_textbox(Inches(0.67), Inches(1.18), Inches(12.0), Inches(0.35))
    p = sub_box.text_frame.paragraphs[0]
    p.text = "Proposed Solution (Describe your Idea/Solution/Prototype) — Detailed Explanation | Problem Resolution | Uniqueness & Innovation"
    p.font.name = 'Arial'; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_TEAL

    # LEFT: High-Resolution Workflow Infographic Diagram
    if os.path.exists(img_referral):
        s2.shapes.add_picture(img_referral, Inches(0.67), Inches(1.58), Inches(6.6), Inches(3.71))
    
    # Left Bottom: Key Novelty Banner Card
    nov_box = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.67), Inches(5.38), Inches(6.6), Inches(1.42))
    nov_box.fill.solid(); nov_box.fill.fore_color.rgb = C_NAVY
    nov_box.line.color.rgb = C_TEAL; nov_box.line.width = Pt(1.5)
    tf_nov = nov_box.text_frame; tf_nov.word_wrap = True
    tf_nov.margin_left = Inches(0.12); tf_nov.margin_right = Inches(0.12); tf_nov.margin_top = Inches(0.08)
    p_nov = tf_nov.paragraphs[0]
    p_nov.text = "KEY NOVELTY: The ONLY Closed-Loop Public Health Referral Platform"
    p_nov.font.name = 'Arial'; p_nov.font.size = Pt(9.2); p_nov.font.bold = True; p_nov.font.color.rgb = C_WHITE
    nov_bullets = [
        "Bidirectional Care Visibility: Village Sub-Centre (AAM) ➔ PHC ➔ CHC ➔ District Hospital ➔ ASHA Counter-Referral.",
        "National Digital Health Rails: Native ABDM UHI (FHIR R4), ABHA creation, and auto-triage for MJPJAY cashless coverage."
    ]
    for nb in nov_bullets:
        pnb = tf_nov.add_paragraph()
        pnb.text = "• " + nb
        pnb.font.name = 'Arial'; pnb.font.size = Pt(7.8); pnb.font.color.rgb = RGBColor(226, 232, 240); pnb.space_before = Pt(2)

    # RIGHT: Structured Problem, Solution & 4 Architectural Pillars
    rx = Inches(7.45)
    rw = Inches(5.22)

    # Problem Card
    p_box = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, rx, Inches(1.58), rw, Inches(1.15))
    p_box.fill.solid(); p_box.fill.fore_color.rgb = RGBColor(254, 242, 242)
    p_box.line.color.rgb = RGBColor(254, 202, 202); p_box.line.width = Pt(1)
    tf = p_box.text_frame; tf.word_wrap = True
    tf.margin_left = Inches(0.10); tf.margin_right = Inches(0.10); tf.margin_top = Inches(0.06)
    p = tf.paragraphs[0]
    p.text = "THE PROBLEM: The Rural 'Clinical Black Hole'"
    p.font.name = 'Arial'; p.font.size = Pt(8.8); p.font.bold = True; p.font.color.rgb = C_RED
    for b in [
        "150,000+ blind paper referrals weekly across India's 31,000 PHCs without confirmation.",
        "48.2% drop-out: Patients travel 40-80 km only to find specialists absent or beds full.",
        "Zero Counter-Referral: Discharges never reach village ASHAs, causing fatal relapses."
    ]:
        pb = tf.add_paragraph()
        pb.text = "• " + b
        pb.font.name = 'Arial'; pb.font.size = Pt(7.2); pb.font.color.rgb = C_DARK; pb.space_before = Pt(1)

    # Solution Card
    s_box = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, rx, Inches(2.80), rw, Inches(1.12))
    s_box.fill.solid(); s_box.fill.fore_color.rgb = C_TEAL_BG
    s_box.line.color.rgb = RGBColor(94, 234, 212); s_box.line.width = Pt(1)
    tf = s_box.text_frame; tf.word_wrap = True
    tf.margin_left = Inches(0.10); tf.margin_right = Inches(0.10); tf.margin_top = Inches(0.06)
    p = tf.paragraphs[0]
    p.text = "THE SOLUTION: AI-Powered Closed-Loop Care Orchestration"
    p.font.name = 'Arial'; p.font.size = Pt(8.8); p.font.bold = True; p.font.color.rgb = C_TEAL
    for b in [
        "End-to-End Orchestration: Real-time patient tracking from village clinic to tertiary discharge.",
        "Care Readiness Verification: 6-factor check ensures specialist, ICU bed, & diagnostics ready.",
        "Zero-Data-Loss: Multilingual Marathi voice intake + offline-first encrypted sync."
    ]:
        pb = tf.add_paragraph()
        pb.text = "• " + b
        pb.font.name = 'Arial'; pb.font.size = Pt(7.2); pb.font.color.rgb = C_DARK; pb.space_before = Pt(1)

    # 4 Core Pillars Card
    pil_box = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, rx, Inches(3.99), rw, Inches(2.81))
    pil_box.fill.solid(); pil_box.fill.fore_color.rgb = C_LIGHT_BG
    pil_box.line.color.rgb = C_BLUE; pil_box.line.width = Pt(1)
    tf = pil_box.text_frame; tf.word_wrap = True
    tf.margin_left = Inches(0.10); tf.margin_right = Inches(0.10); tf.margin_top = Inches(0.06)
    p = tf.paragraphs[0]
    p.text = "4 ARCHITECTURAL PILLARS (Frontline to Tertiary)"
    p.font.name = 'Arial'; p.font.size = Pt(8.8); p.font.bold = True; p.font.color.rgb = C_NAVY
    pillars_content = [
        ("Pillar 1 (Voice-First):", " Bhashini Marathi/Hindi speech-to-text; 50s intake on 2GB RAM phones."),
        ("Pillar 2 (Offline-First):", " SQLite/WatermelonDB CRDTs store 5,000+ records in monsoon blindspots."),
        ("Pillar 3 (One-Trip Care):", " Bundles specialist OPD, ECG/CBC labs & transit into a single visit."),
        ("Pillar 4 (Readiness WOW):", " Algorithmic pre-departure verification of doctor presence & ICU beds (<85%).")
    ]
    for k, v in pillars_content:
        p_row = tf.add_paragraph()
        p_row.space_before = Pt(2.5)
        r1 = p_row.add_run(); r1.text = "• " + k; r1.font.name = 'Arial'; r1.font.size = Pt(7.3); r1.font.bold = True; r1.font.color.rgb = C_NAVY
        r2 = p_row.add_run(); r2.text = v; r2.font.name = 'Arial'; r2.font.size = Pt(7.1); r2.font.color.rgb = C_DARK

    # -------------------------------------------------------------
    # SLIDE 3: TECHNICAL APPROACH (WITH ARCHITECTURE INFOGRAPHIC)
    # -------------------------------------------------------------
    s3 = prs.slides[2]
    clear_placeholder(s3)
    for shp in s3.shapes:
        if shp.name == 'Title 1':
            shp.left = Inches(2.15); shp.width = Inches(8.40)
            shp.text_frame.text = "TECHNICAL APPROACH & IMPLEMENTATION METHODOLOGY"
            for p in shp.text_frame.paragraphs:
                p.font.name = 'Arial'; p.font.size = Pt(15.5); p.font.bold = True; p.font.color.rgb = C_NAVY
                p.alignment = PP_ALIGN.CENTER

    sub_box = s3.shapes.add_textbox(Inches(0.67), Inches(1.18), Inches(12.0), Inches(0.35))
    p = sub_box.text_frame.paragraphs[0]
    p.text = "Technologies Used (Languages, Frameworks, Architecture) & Methodology Process (Flowcharts / Working Prototype Pipeline)"
    p.font.name = 'Arial'; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_TEAL

    # LEFT: Platform Architecture Diagram Infographic
    if os.path.exists(img_tech):
        s3.shapes.add_picture(img_tech, Inches(0.67), Inches(1.58), Inches(6.5), Inches(3.66))

    # Left Bottom: Care Orchestration Pipeline Summary Card
    pipe_box = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.67), Inches(5.32), Inches(6.5), Inches(1.48))
    pipe_box.fill.solid(); pipe_box.fill.fore_color.rgb = C_LIGHT_BG
    pipe_box.line.color.rgb = C_TEAL; pipe_box.line.width = Pt(1.2)
    tf_p = pipe_box.text_frame; tf_p.word_wrap = True
    tf_p.margin_left = Inches(0.12); tf_p.margin_right = Inches(0.12); tf_p.margin_top = Inches(0.08)
    p = tf_p.paragraphs[0]
    p.text = "6-STAGE CARE ORCHESTRATION PIPELINE (WORKING PROTOTYPE)"
    p.font.name = 'Arial'; p.font.size = Pt(8.8); p.font.bold = True; p.font.color.rgb = C_TEAL
    steps = [
        "01. Intake (Voice): ASHA speaks Marathi; Bhashini STT + OCR slip ingests vitals offline.",
        "02. CDSS & Bundle: ICMR/WHO CDSS flags triage severity (Red/Amber) & bundles care.",
        "03. Readiness Check: Algorithmic 6-factor check (Doctor, Beds, Diagnostics) at destination.",
        "04. Dynamic Routing: Spatial PostGIS Haversine matrix routes patient; sends DLT SMS token.",
        "05. Fast-Track OPD: Hospital pre-notified; patient scans QR token, bypassing 3.5h queues.",
        "06. Counter-Referral: Tertiary discharge auto-creates home follow-up task on village ASHA app."
    ]
    for st in steps:
        p_st = tf_p.add_paragraph()
        p_st.text = "• " + st
        p_st.font.name = 'Arial'; p_st.font.size = Pt(6.9); p_st.font.color.rgb = C_DARK; p_st.space_before = Pt(1.2)

    # RIGHT: Production Technology Architecture Table
    t_top = Inches(1.58)
    t_h = Inches(5.22)
    t_w = Inches(5.35)
    t_left = Inches(7.32)
    table_shp = s3.shapes.add_table(7, 3, t_left, t_top, t_w, t_h)
    table = table_shp.table
    table.columns[0].width = Inches(1.35)
    table.columns[1].width = Inches(2.05)
    table.columns[2].width = Inches(1.95)

    headers = ["Layer", "Production Tech Stack", "Engineering Rationale"]
    for c_idx, h_text in enumerate(headers):
        cell = table.cell(0, c_idx)
        cell.fill.solid(); cell.fill.fore_color.rgb = C_NAVY
        p = cell.text_frame.paragraphs[0]
        p.text = h_text
        p.font.name = 'Arial'; p.font.size = Pt(7.8); p.font.bold = True; p.font.color.rgb = C_WHITE

    tech_matrix = [
        ("Mobile & Web", "Vite + React 18 PWA / React Native Android Go", "Ultra-lightweight (<15 MB APK), offline-ready, runs on 2GB RAM phones."),
        ("API Gateway", "NestJS (Node.js 20+) Modular Microservices", "High-throughput async REST/GraphQL, JWT + Argon2 security, DLT SMS."),
        ("Persistence & GIS", "PostgreSQL 16 + PostGIS + Prisma ORM", "ACID transactions, spatial hospital distance queries, drive-time radius."),
        ("Offline & Queue", "SQLite / WatermelonDB CRDTs + Redis BullMQ", "Guaranteed local storage during network drops; background sync workers."),
        ("AI & Speech", "Gemini 2.5 Flash + Bhashini Indic STT + OCR", "Sub-second symptom extraction, vernacular Marathi voice dictation."),
        ("Protocols & Security", "ABDM Gateway (ABHA, HFR), FHIR R4, DPDP Act", "National Health Authority compliant, encrypted health bundles, patient consent.")
    ]

    for r_idx, (layer, tech, rationale) in enumerate(tech_matrix, start=1):
        bg = C_LIGHT_BG if r_idx % 2 == 1 else C_WHITE
        for c_idx, val in enumerate([layer, tech, rationale]):
            cell = table.cell(r_idx, c_idx)
            cell.fill.solid(); cell.fill.fore_color.rgb = bg
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.name = 'Arial'; p.font.size = Pt(7.2)
            if c_idx == 0:
                p.font.bold = True; p.font.color.rgb = C_NAVY
            else:
                p.font.color.rgb = C_DARK

    # -------------------------------------------------------------
    # SLIDE 4: FEASIBILITY AND VIABILITY (WITH INFOGRAPHIC)
    # -------------------------------------------------------------
    s4 = prs.slides[3]
    clear_placeholder(s4)
    for shp in s4.shapes:
        if shp.name == 'Title 1':
            shp.left = Inches(2.15); shp.width = Inches(8.40)
            shp.text_frame.text = "FEASIBILITY, RISK MANAGEMENT & FINANCIAL VIABILITY"
            for p in shp.text_frame.paragraphs:
                p.font.name = 'Arial'; p.font.size = Pt(15.5); p.font.bold = True; p.font.color.rgb = C_NAVY
                p.alignment = PP_ALIGN.CENTER

    sub_box = s4.shapes.add_textbox(Inches(0.67), Inches(1.18), Inches(12.0), Inches(0.35))
    p = sub_box.text_frame.paragraphs[0]
    p.text = "Analysis of Idea Feasibility, Potential Challenges & Risks, and Strategic Mitigation Measures"
    p.font.name = 'Arial'; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_TEAL

    # LEFT: Deployment Feasibility Infographic
    if os.path.exists(img_feasibility):
        s4.shapes.add_picture(img_feasibility, Inches(0.67), Inches(1.58), Inches(6.0), Inches(3.38))

    # Left Bottom: Financial Viability & Public Health Economics Card
    econ_box = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.67), Inches(5.05), Inches(6.0), Inches(1.75))
    econ_box.fill.solid(); econ_box.fill.fore_color.rgb = C_TEAL_BG
    econ_box.line.color.rgb = C_TEAL; econ_box.line.width = Pt(1.2)
    tf_ec = econ_box.text_frame; tf_ec.word_wrap = True
    tf_ec.margin_left = Inches(0.12); tf_ec.margin_right = Inches(0.12); tf_ec.margin_top = Inches(0.08)
    p = tf_ec.paragraphs[0]
    p.text = "SUSTAINABLE B2G FINANCIAL MODEL & OPERATIONAL VIABILITY"
    p.font.name = 'Arial'; p.font.size = Pt(8.8); p.font.bold = True; p.font.color.rgb = C_TEAL
    econ_bullets = [
        "Operational Feasibility: Replaces 8 duplicate paper registers; works on existing smartphones.",
        "Sustainable Funding: Funded via State NHM PIP Innovation budget + ABDM DHIS incentives (₹500/bed/mo).",
        "District Unit Economics: ~₹18 Lakh/year district operating cost vs ~₹35 Lakh/year state contract.",
        "48.5% operating margin directly funds village frontline worker training and field engineering support."
    ]
    for eb in econ_bullets:
        peb = tf_ec.add_paragraph()
        peb.text = "• " + eb
        peb.font.name = 'Arial'; peb.font.size = Pt(7.1); peb.font.color.rgb = C_DARK; peb.space_before = Pt(1.5)

    # RIGHT: Risk Management & Mitigation Matrix Table
    r_x = Inches(6.82)
    r_w = Inches(5.85)
    r_top = Inches(1.58)
    r_h = Inches(5.22)
    t_shp = s4.shapes.add_table(5, 3, r_x, r_top, r_w, r_h)
    t = t_shp.table
    t.columns[0].width = Inches(1.25)
    t.columns[1].width = Inches(2.20)
    t.columns[2].width = Inches(2.40)

    t.rows[0].height = Inches(0.40)
    for r in range(1, 5):
        t.rows[r].height = Inches(1.20)

    r_headers = ["Risk Category", "Identified Challenge", "Strategic Mitigation Plan"]
    for c_idx, h_text in enumerate(r_headers):
        cell = t.cell(0, c_idx)
        cell.fill.solid(); cell.fill.fore_color.rgb = C_NAVY
        p = cell.text_frame.paragraphs[0]
        p.text = h_text
        p.font.name = 'Arial'; p.font.size = Pt(8.0); p.font.bold = True; p.font.color.rgb = C_WHITE

    risks = [
        ("Technical Risk", "Cellular blackout >7 days in deep tribal monsoon areas.", "Local SQLite retains 5,000 records encrypted; offline QR token + peer-to-peer sync at weekly PHC meet."),
        ("Operational Risk", "Hospital specialist ignores incoming referral queue.", "Auto-escalation alert to Civil Surgeon dashboard after 4 hours + SMS reminder + physical priority token."),
        ("Clinical Risk", "Triage rule misclassifies acute case as low risk.", "Deterministic ICMR/WHO CDSS thresholds; mandatory human-in-the-loop doctor authorization; no autonomous diagnosis."),
        ("Adoption Risk", "Low smartphone literacy among senior village ASHAs.", "Marathi voice dictation + visual iconographic UI + ₹50 performance incentive per verified referral follow-up.")
    ]

    for r_idx, (cat, chall, mit) in enumerate(risks, start=1):
        bg = C_LIGHT_BG if r_idx % 2 == 1 else C_WHITE
        for c_idx, val in enumerate([cat, chall, mit]):
            cell = t.cell(r_idx, c_idx)
            cell.fill.solid(); cell.fill.fore_color.rgb = bg
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.name = 'Arial'; p.font.size = Pt(7.4)
            if c_idx == 0:
                p.font.bold = True
                p.font.color.rgb = C_RED if "Clinical" in val or "Operational" in val else C_BLUE
            else:
                p.font.color.rgb = C_DARK

    # -------------------------------------------------------------
    # SLIDE 5: IMPACT AND BENEFITS (WITH INFOGRAPHIC & METRIC BADGES)
    # -------------------------------------------------------------
    s5 = prs.slides[4]
    clear_placeholder(s5)
    for shp in s5.shapes:
        if shp.name == 'Title 1':
            shp.left = Inches(2.15); shp.width = Inches(8.40)
            shp.text_frame.text = "MEASURABLE IMPACT, HEALTHCARE OUTCOMES & MULTI-TIER BENEFITS"
            for p in shp.text_frame.paragraphs:
                p.font.name = 'Arial'; p.font.size = Pt(15.5); p.font.bold = True; p.font.color.rgb = C_NAVY
                p.alignment = PP_ALIGN.CENTER

    sub_box = s5.shapes.add_textbox(Inches(0.67), Inches(1.18), Inches(12.0), Inches(0.35))
    p = sub_box.text_frame.paragraphs[0]
    p.text = "Potential Impact on Target Audience & Comprehensive Benefits (Social, Economic, Environmental, Administrative)"
    p.font.name = 'Arial'; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_TEAL

    # Top Row: 4 Hero KPI Metric Badges
    kpi_w = Inches(2.85)
    kpi_h = Inches(1.15)
    kpi_y = Inches(1.58)
    kpi_gap = Inches(0.20)
    kpi_start_x = Inches(0.67)

    kpis = [
        ("< 10%", "Referral Drop-out", "Slashed from 48.2% baseline via closed-loop tracking.", C_TEAL, C_TEAL_BG),
        ("60%+", "OOPE Travel Cut", "Saves families from debt traps via Coordinated One-Trip.", C_BLUE, C_BLUE_BG),
        ("< 45 Min", "Hospital Wait Time", "Fast-track casualty triage bypasses 3.5h general queues.", C_NAVY, C_LIGHT_BG),
        ("100%", "Follow-up Compliance", "Automated counter-referral tasks sent to village ASHAs.", C_GREEN, RGBColor(236, 253, 245))
    ]

    for k_idx, (num, lbl, desc, clr, bg) in enumerate(kpis):
        kx = kpi_start_x + k_idx * (kpi_w + kpi_gap)
        card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, kx, kpi_y, kpi_w, kpi_h)
        card.fill.solid(); card.fill.fore_color.rgb = bg
        card.line.color.rgb = clr; card.line.width = Pt(1.5)
        tf = card.text_frame; tf.word_wrap = True
        tf.margin_left = Inches(0.10); tf.margin_right = Inches(0.10); tf.margin_top = Inches(0.06)
        p = tf.paragraphs[0]
        p.text = num
        p.font.name = 'Arial'; p.font.size = Pt(16); p.font.bold = True; p.font.color.rgb = clr
        p2 = tf.add_paragraph()
        p2.text = lbl
        p2.font.name = 'Arial'; p2.font.size = Pt(8.5); p2.font.bold = True; p2.font.color.rgb = C_NAVY
        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.name = 'Arial'; p3.font.size = Pt(7.0); p3.font.color.rgb = C_DARK; p3.space_before = Pt(1)

    # Bottom Split: Infographic on Left + Multi-Tier Benefits Cards on Right
    b_y = Inches(2.88)
    if os.path.exists(img_impact):
        s5.shapes.add_picture(img_impact, Inches(0.67), b_y, Inches(6.4), Inches(3.60))

    # Right: 4-Tier Strategic Benefits (Stacked Cards)
    rw = Inches(5.35)
    rx = Inches(7.32)
    card_h = Inches(0.85)
    gap_y = Inches(0.07)

    quads = [
        ("SOCIAL IMPACT: Maternal & Cardiac Lives Saved", C_RED, RGBColor(254, 242, 242),
         "Prevents maternal deaths (PPH, eclampsia) & cardiac crises in tribal blocks (Melghat, Nandurbar); vernacular voice guides illiterate families; empowers ASHAs."),
        ("ECONOMIC IMPACT: Eliminating Healthcare Debt", C_BLUE, C_BLUE_BG,
         "Cuts private transport and redundant diagnostic fees that push 55M into poverty yearly; unlocks ABDM DHIS hospital cash incentives (₹500/bed/mo)."),
        ("ENVIRONMENTAL IMPACT: Paperless Green Health", C_GREEN, RGBColor(236, 253, 245),
         "Replaces millions of paper registers with digital health records; slashes transit vehicular emissions from repeated, failed hospital trips."),
        ("ADMINISTRATIVE IMPACT: Real-Time Governance", C_NAVY, C_LIGHT_BG,
         "Live District Health Officer (DHO) bottleneck heatmaps surface specialist shortages & equipment outages; replaces delayed 45-day HMIS reports.")
    ]

    for q_idx, (q_title, q_clr, q_bg, q_desc) in enumerate(quads):
        qy = b_y + q_idx * (card_h + gap_y)
        card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, rx, qy, rw, card_h)
        card.fill.solid(); card.fill.fore_color.rgb = q_bg
        card.line.color.rgb = q_clr; card.line.width = Pt(1.0)
        tf = card.text_frame; tf.word_wrap = True
        tf.margin_left = Inches(0.10); tf.margin_right = Inches(0.10); tf.margin_top = Inches(0.05)
        p = tf.paragraphs[0]
        p.text = q_title
        p.font.name = 'Arial'; p.font.size = Pt(8.0); p.font.bold = True; p.font.color.rgb = q_clr
        pb = tf.add_paragraph()
        pb.text = q_desc
        pb.font.name = 'Arial'; pb.font.size = Pt(6.8); pb.font.color.rgb = C_DARK; pb.space_before = Pt(1.5)

    # -------------------------------------------------------------
    # SLIDE 6: RESEARCH, REFERENCES & COMPETITIVE BENCHMARKING
    # -------------------------------------------------------------
    s6 = prs.slides[5]
    clear_placeholder(s6)
    for shp in s6.shapes:
        if shp.name == 'Title 1':
            shp.left = Inches(2.15); shp.width = Inches(8.40)
            shp.text_frame.text = "RESEARCH, REFERENCES & COMPETITIVE BENCHMARKING"
            for p in shp.text_frame.paragraphs:
                p.font.name = 'Arial'; p.font.size = Pt(15.5); p.font.bold = True; p.font.color.rgb = C_NAVY
                p.alignment = PP_ALIGN.CENTER

    sub_box = s6.shapes.add_textbox(Inches(0.67), Inches(1.18), Inches(12.0), Inches(0.35))
    p = sub_box.text_frame.paragraphs[0]
    p.text = "Details & Links of Reference Research Work, Competitive Benchmarking Matrix, and Epidemiological Evidence"
    p.font.name = 'Arial'; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_TEAL

    # Top: Competitive Comparison Matrix Table
    bench_top = Inches(1.58)
    bench_h = Inches(2.35)
    bench_w = Inches(12.0)
    b_shp = s6.shapes.add_table(6, 6, Inches(0.67), bench_top, bench_w, bench_h)
    bt = b_shp.table
    bt.columns[0].width = Inches(2.5)
    bt.columns[1].width = Inches(1.9)
    bt.columns[2].width = Inches(1.9)
    bt.columns[3].width = Inches(1.9)
    bt.columns[4].width = Inches(1.9)
    bt.columns[5].width = Inches(1.9)

    bt.rows[0].height = Inches(0.32)
    for r in range(1, 6):
        bt.rows[r].height = Inches(0.40)

    b_headers = ["Key Capability Dimension", "eSanjeevani (C-DAC)", "NIC e-Hospital", "Khushi Baby / CHT", "108 EMS Fleet", "SwasthyaSetu"]
    for c_idx, h_text in enumerate(b_headers):
        cell = bt.cell(0, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_TEAL if c_idx == 5 else C_NAVY
        p = cell.text_frame.paragraphs[0]
        p.text = h_text
        p.font.name = 'Arial'; p.font.size = Pt(7.8); p.font.bold = True; p.font.color.rgb = C_WHITE

    bench_data = [
        ("Closed-Loop Physical Referral", "✕ None (Tele-advice only)", "✕ None (Internal OPD only)", "⚠ Partial (MCH only)", "✕ Transport only", "✓ Full Closed-Loop Tracking"),
        ("Offline-First Mobile Architecture", "✕ Fails without 4G", "✕ Desktop Intranet only", "✓ Offline Sync", "⚠ Voice Call based", "✓ Offline SQLite + CRDT Sync"),
        ("Vernacular Voice Triage", "✕ None", "✕ None", "✕ None", "✕ None", "✓ Bhashini Marathi/Hindi STT"),
        ("Pre-Arrival Casualty Alert", "✕ None", "✕ None", "✕ None", "⚠ Manual Phone Call", "✓ Real-Time Triage Card"),
        ("Automated ASHA Counter-Referral", "✕ None", "✕ None", "✕ None", "✕ None", "✓ Discharge to ASHA Task")
    ]

    for r_idx, row_items in enumerate(bench_data, start=1):
        bg = C_LIGHT_BG if r_idx % 2 == 1 else C_WHITE
        for c_idx, val in enumerate(row_items):
            cell = bt.cell(r_idx, c_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = C_TEAL_BG if c_idx == 5 else bg
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.name = 'Arial'; p.font.size = Pt(7.2)
            if c_idx == 0:
                p.font.bold = True; p.font.color.rgb = C_NAVY
            elif c_idx == 5:
                p.font.bold = True; p.font.color.rgb = C_TEAL
            else:
                p.font.color.rgb = C_RED if val.startswith("✕") else (C_GOLD if "⚠" in val else C_DARK)

    # Bottom Section: Infographic on Left + Authoritative Research Citations on Right
    bot_y = Inches(4.10)
    if os.path.exists(img_research):
        s6.shapes.add_picture(img_research, Inches(0.67), bot_y, Inches(4.5), Inches(2.53))

    # Right: 4 Authoritative References Cards in 2x2 Grid
    ref_x = Inches(5.35)
    rw_ref = Inches(3.60)
    rh_ref = Inches(1.22)
    rgap_x = Inches(0.12)
    rgap_y = Inches(0.09)

    refs = [
        ("1. MoHFW Rural Health Statistics", C_BLUE, C_BLUE_BG, [
            ("Source:", " Health Dynamics of India 2022-23"),
            ("Finding:", " Acute 79.9% shortfall of specialists at rural CHCs."),
            ("Relevance:", " Validates why capacity-aware routing is essential.")
        ]),
        ("2. The Lancet Global Health", C_RED, RGBColor(254, 242, 242), [
            ("Source:", " Referral Pathways in Rural India (2020)"),
            ("Finding:", " 48.2% of referred primary patients never reach hospital."),
            ("Relevance:", " Direct empirical baseline for closed-loop tracking.")
        ]),
        ("3. National Health Accounts", C_NAVY, C_LIGHT_BG, [
            ("Source:", " NHA 2020-21 / Lancet Public Health"),
            ("Finding:", " OOPE is 47.1% of health spend; pushes 55M into debt."),
            ("Relevance:", " Solved by Coordinated One-Trip Care Bundles.")
        ]),
        ("4. JMIR 2025 & ABDM Specs", C_TEAL, C_TEAL_BG, [
            ("Source:", " Li et al., JMIR 2025; ABDM FHIR R4"),
            ("Finding:", " Bidirectional referral cuts transfer delay to 0.90 days."),
            ("Relevance:", " Blueprint for SwasthyaSetu ABHA integration.")
        ])
    ]

    for r_idx, (r_title, r_clr, r_bg, r_lines) in enumerate(refs):
        col = r_idx % 2
        row = r_idx // 2
        rx_pos = ref_x + col * (rw_ref + rgap_x)
        ry_pos = bot_y + row * (rh_ref + rgap_y)
        card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, rx_pos, ry_pos, rw_ref, rh_ref)
        card.fill.solid(); card.fill.fore_color.rgb = r_bg
        card.line.color.rgb = r_clr; card.line.width = Pt(1.0)
        tf = card.text_frame; tf.word_wrap = True
        tf.margin_left = Inches(0.08); tf.margin_right = Inches(0.08); tf.margin_top = Inches(0.05)
        p = tf.paragraphs[0]
        p.text = r_title
        p.font.name = 'Arial'; p.font.size = Pt(8.0); p.font.bold = True; p.font.color.rgb = r_clr
        for k, v in r_lines:
            pl = tf.add_paragraph()
            pl.space_before = Pt(1.5)
            r1 = pl.add_run(); r1.text = k; r1.font.name = 'Arial'; r1.font.size = Pt(6.8); r1.font.bold = True; r1.font.color.rgb = C_NAVY
            r2 = pl.add_run(); r2.text = v; r2.font.name = 'Arial'; r2.font.size = Pt(6.6); r2.font.color.rgb = C_DARK

    # -------------------------------------------------------------
    # SLIDE 7: DELETE TO SATISFY 6-SLIDE STRICT RULE
    # -------------------------------------------------------------
    if len(prs.slides) > 6:
        rId = prs.slides._sldIdLst[6].rId
        prs.part.drop_rel(rId)
        del prs.slides._sldIdLst[6]
        print("Deleted Slide 7 (Important Instructions) to ensure strict 6-slide compliance.")

    prs.save(out_pptx)
    print(f"Presentation saved successfully at: {out_pptx}")

    # Export to PDF via PowerPoint COM
    try:
        import win32com.client
        powerpoint = win32com.client.Dispatch('PowerPoint.Application')
        pres = powerpoint.Presentations.Open(out_pptx, WithWindow=False)
        pres.SaveAs(out_pdf, 32) # 32 = ppSaveAsPDF
        pres.Close()
        powerpoint.Quit()
        print(f"Native PDF exported successfully at: {out_pdf} (Size: {os.path.getsize(out_pdf)} bytes)")
    except Exception as e:
        print(f"COM Export notice: {e}")

if __name__ == '__main__':
    create_deck()
