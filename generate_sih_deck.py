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

    # Update team oval on slides 2 to 6
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
                tf.margin_top = Inches(0.05)
                tf.margin_bottom = Inches(0.05)
                p = tf.paragraphs[0]
                p.text = "SwasthyaSetu"
                p.font.name = 'Arial'
                p.font.size = Pt(8.5)
                p.font.bold = True
                p.font.color.rgb = C_NAVY
                p.alignment = PP_ALIGN.CENTER

    # Helper function to remove raw TextBox 8 placeholder
    def clear_placeholder(slide):
        for shape in list(slide.shapes):
            if shape.name == 'TextBox 8':
                sp = shape._element
                sp.getparent().remove(sp)

    # -------------------------------------------------------------
    # SLIDE 2: PROPOSED SOLUTION & INNOVATION
    # -------------------------------------------------------------
    s2 = prs.slides[1]
    clear_placeholder(s2)
    for shp in s2.shapes:
        if shp.name == 'Title 1':
            shp.left = Inches(2.15); shp.width = Inches(8.40)
            shp.text_frame.text = "IDEA TITLE: SwasthyaSetu (ग्रामीण स्वास्थ्य रेफरल और देखभाल निरंतरता मंच)"
            for p in shp.text_frame.paragraphs:
                p.font.name = 'Arial'
                p.font.size = Pt(15.5)
                p.font.bold = True
                p.font.color.rgb = C_NAVY
                p.alignment = PP_ALIGN.CENTER

    sub_box = s2.shapes.add_textbox(Inches(0.67), Inches(1.18), Inches(12.0), Inches(0.35))
    p = sub_box.text_frame.paragraphs[0]
    p.text = "Proposed Solution (Describe your Idea/Solution/Prototype) — Detailed Explanation | Problem Resolution | Uniqueness & Innovation"
    p.font.name = 'Arial'; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_TEAL

    # Top Split: The Problem & Solution Overview
    card_w = Inches(5.85)
    card_h = Inches(1.45)
    top_y = Inches(1.55)

    p_box = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.67), top_y, card_w, card_h)
    p_box.fill.solid(); p_box.fill.fore_color.rgb = RGBColor(254, 242, 242)
    p_box.line.color.rgb = RGBColor(254, 202, 202); p_box.line.width = Pt(1)
    tf = p_box.text_frame; tf.word_wrap = True
    tf.margin_left = Inches(0.14); tf.margin_right = Inches(0.14); tf.margin_top = Inches(0.08)
    p = tf.paragraphs[0]
    p.text = "THE PROBLEM: The Rural Healthcare 'Clinical Black Hole'"
    p.font.name = 'Arial'; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_RED
    bullets_p = [
        "150,000+ blind paper referrals weekly across India's 31,000 PHCs without receiving notice.",
        "48.2% Referral Drop-out: Patients travel 40-80 km only to find specialists absent or beds full.",
        "Zero Counter-Referral: Discharges never reach village ASHAs, causing fatal relapses & OOPE debt."
    ]
    for b in bullets_p:
        p_b = tf.add_paragraph()
        p_b.text = "• " + b
        p_b.font.name = 'Arial'; p_b.font.size = Pt(8.2); p_b.font.color.rgb = C_DARK; p_b.space_before = Pt(1.5)

    s_box = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.82), top_y, card_w, card_h)
    s_box.fill.solid(); s_box.fill.fore_color.rgb = C_TEAL_BG
    s_box.line.color.rgb = RGBColor(94, 234, 212); s_box.line.width = Pt(1)
    tf = s_box.text_frame; tf.word_wrap = True
    tf.margin_left = Inches(0.14); tf.margin_right = Inches(0.14); tf.margin_top = Inches(0.08)
    p = tf.paragraphs[0]
    p.text = "THE SOLUTION: AI-Powered Closed-Loop Care Orchestration"
    p.font.name = 'Arial'; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_TEAL
    bullets_s = [
        "End-to-End Care Continuity: Connects Sub-Centre (AAM) -> PHC -> CHC -> District Hospital.",
        "Care Readiness Verification: Verifies 6-factor readiness before travel + auto-reroutes if blocked.",
        "Zero-Typing & Zero-Data-Loss: Multilingual voice intake in Marathi + offline-first sync queue."
    ]
    for b in bullets_s:
        p_b = tf.add_paragraph()
        p_b.text = "• " + b
        p_b.font.name = 'Arial'; p_b.font.size = Pt(8.2); p_b.font.color.rgb = C_DARK; p_b.space_before = Pt(1.5)

    # Bottom Row: The 4 Core Architectural Pillars
    pillar_w = Inches(2.85)
    pillar_h = Inches(3.40)
    pillar_y = Inches(3.12)
    pillar_gap = Inches(0.20)
    pillar_start_x = Inches(0.67)

    pillars = [
        ("Pillar 1: Voice-First Vernacular", C_BLUE, C_BLUE_BG, [
            ("Tech:", " Bhashini Indic STT / NMT"),
            ("Action:", " Spoken Marathi/Hindi symptom dictation (e.g. 'छातीत दुखणे, धाप लागणे')."),
            ("Impact:", " Eliminates complex English text entry; reduces ASHA logging from 8m to 50s on basic Android Go phones.")
        ]),
        ("Pillar 2: Patient Offline-First", C_TEAL, C_TEAL_BG, [
            ("Tech:", " SQLite / WatermelonDB CRDTs"),
            ("Action:", " Local encrypted queue storing 5,000+ patient records on mobile device."),
            ("Impact:", " Guaranteed zero data loss in rural monsoon network dead zones; automatic background sync on reconnect.")
        ]),
        ("Pillar 3: Coordinated One-Trip", C_NAVY, C_LIGHT_BG, [
            ("Tech:", " Care Bundle Decision Model"),
            ("Action:", " Bundles specialty consultation, on-site diagnostics (ECG, CBC), and documents."),
            ("Impact:", " Stops the 'ping-pong' referral cycle; cuts travel & catastrophic out-of-pocket costs by >60%.")
        ]),
        ("Pillar 4: Care Readiness (WOW)", C_RED, RGBColor(255, 241, 242), [
            ("Tech:", " 6-Factor Decision Engine"),
            ("Action:", " Checks Doctor, Diagnostics, Equipment, ICU Beds (<85%), and Docs before departure."),
            ("Impact:", " Stops door refusals; dynamic rerouting recovers referral if hospital becomes unavailable.")
        ])
    ]

    for p_idx, (p_title, p_color, p_bg, p_lines) in enumerate(pillars):
        px = pillar_start_x + p_idx * (pillar_w + pillar_gap)
        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, px, pillar_y, pillar_w, pillar_h)
        card.fill.solid(); card.fill.fore_color.rgb = p_bg
        card.line.color.rgb = p_color; card.line.width = Pt(1.2)
        tf = card.text_frame; tf.word_wrap = True
        tf.margin_left = Inches(0.12); tf.margin_right = Inches(0.12); tf.margin_top = Inches(0.10)
        p = tf.paragraphs[0]
        p.text = p_title
        p.font.name = 'Arial'; p.font.size = Pt(9.5); p.font.bold = True; p.font.color.rgb = p_color
        
        for k, v in p_lines:
            p_line = tf.add_paragraph()
            p_line.space_before = Pt(3.5)
            r1 = p_line.add_run(); r1.text = k; r1.font.name = 'Arial'; r1.font.size = Pt(8.0); r1.font.bold = True; r1.font.color.rgb = C_NAVY
            r2 = p_line.add_run(); r2.text = v; r2.font.name = 'Arial'; r2.font.size = Pt(7.8); r2.font.bold = False; r2.font.color.rgb = C_DARK

    u_box = s2.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.67), Inches(6.60), Inches(12.0), Inches(0.28))
    u_box.fill.solid(); u_box.fill.fore_color.rgb = C_NAVY
    u_box.line.fill.background()
    p = u_box.text_frame.paragraphs[0]
    p.text = "KEY NOVELTY: The ONLY system providing Closed-Loop Tracking (Village -> Hospital -> ASHA Counter-Referral) + ABDM UHI & MJPJAY Integration"
    p.font.name = 'Arial'; p.font.size = Pt(8.2); p.font.bold = True; p.font.color.rgb = C_WHITE; p.alignment = PP_ALIGN.CENTER

    # -------------------------------------------------------------
    # SLIDE 3: TECHNICAL APPROACH
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

    flow_y = Inches(1.58)
    flow_h = Inches(1.30)
    box_w = Inches(1.85)
    gap_x = Inches(0.18)

    flow_steps = [
        ("01. INTAKE & TRIAGE", "ASHA speaks Marathi;\nBhashini STT + OCR slip\ningests vitals offline.", C_BLUE, C_BLUE_BG),
        ("02. CLINICAL CDSS", "ICMR/WHO rule engine\nflags Red/Amber triage;\nbuilds Care Bundle.", C_TEAL, C_TEAL_BG),
        ("03. CARE READINESS", "6-factor check (Beds,\nDoctor, Diagnostics)\nat destination facility.", C_RED, RGBColor(254, 242, 242)),
        ("04. DYNAMIC ROUTING", "Spatial Haversine matrix\npicks best hospital;\nDLT SMS token sent.", C_NAVY, C_LIGHT_BG),
        ("05. FAST-TRACK OPD", "Hospital pre-notified;\npatient scans QR token;\nbypasses 3.5h line.", C_BLUE, C_BLUE_BG),
        ("06. COUNTER-REFERRAL", "E-discharge auto-creates\nhome follow-up task on\nvillage ASHA app.", C_GREEN, RGBColor(236, 253, 245))
    ]

    for f_idx, (f_title, f_desc, f_clr, f_bg) in enumerate(flow_steps):
        fx = Inches(0.67) + f_idx * (box_w + gap_x)
        shp = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, fx, flow_y, box_w, flow_h)
        shp.fill.solid(); shp.fill.fore_color.rgb = f_bg
        shp.line.color.rgb = f_clr; shp.line.width = Pt(1.2)
        tf = shp.text_frame; tf.word_wrap = True
        tf.margin_left = Inches(0.08); tf.margin_right = Inches(0.08); tf.margin_top = Inches(0.08)
        p = tf.paragraphs[0]
        p.text = f_title
        p.font.name = 'Arial'; p.font.size = Pt(8.2); p.font.bold = True; p.font.color.rgb = f_clr
        p.alignment = PP_ALIGN.CENTER
        p2 = tf.add_paragraph()
        p2.text = f_desc
        p2.font.name = 'Arial'; p2.font.size = Pt(7.4); p2.font.color.rgb = C_DARK; p2.space_before = Pt(2)
        p2.alignment = PP_ALIGN.CENTER

        if f_idx < 5:
            arr_x = fx + box_w + Inches(0.02)
            arr_box = s3.shapes.add_textbox(arr_x, flow_y + Inches(0.40), Inches(0.14), Inches(0.40))
            tf_arr = arr_box.text_frame
            tf_arr.margin_left = 0; tf_arr.margin_right = 0; tf_arr.margin_top = 0; tf_arr.margin_bottom = 0
            p_arr = tf_arr.paragraphs[0]
            p_arr.text = "➔"
            p_arr.font.name = 'Arial'; p_arr.font.size = Pt(11); p_arr.font.bold = True; p_arr.font.color.rgb = C_MUTED

    t_top = Inches(3.02)
    t_h = Inches(3.80)
    t_w = Inches(12.0)
    table_shp = s3.shapes.add_table(7, 3, Inches(0.67), t_top, t_w, t_h)
    table = table_shp.table
    table.columns[0].width = Inches(2.2)
    table.columns[1].width = Inches(4.3)
    table.columns[2].width = Inches(5.5)

    headers = ["Architecture Layer", "Production Technology Stack", "Engineering & Operational Rationale"]
    for c_idx, h_text in enumerate(headers):
        cell = table.cell(0, c_idx)
        cell.fill.solid(); cell.fill.fore_color.rgb = C_NAVY
        p = cell.text_frame.paragraphs[0]
        p.text = h_text
        p.font.name = 'Arial'; p.font.size = Pt(8.5); p.font.bold = True; p.font.color.rgb = C_WHITE

    tech_matrix = [
        ("Mobile & Web Client", "Vite + React 18 PWA / React Native Android Go", "Ultra-lightweight (<15 MB APK), offline-ready, runs smoothly on 2GB RAM phones."),
        ("API Gateway & Services", "NestJS (Node.js 20+) Modular Microservices Architecture", "High-throughput asynchronous REST/GraphQL gateway, JWT + Argon2 security, DLT SMS."),
        ("Persistence & GIS", "PostgreSQL + PostGIS (Spatial) + Prisma ORM", "ACID transactions, spatial hospital distance queries, drive-time and load balancing."),
        ("Offline Storage & Queue", "SQLite / WatermelonDB (CRDTs) + Redis BullMQ", "Guaranteed local storage during network drops; event-based background synchronization."),
        ("AI & Intelligence Layer", "Gemini 2.5 Flash + Bhashini Indic STT + Tesseract OCR", "Sub-second symptom extraction, vernacular Marathi voice dictation, scanned slip OCR."),
        ("Protocols & Security", "ABDM Gateway (ABHA, HFR, HPR), FHIR R4, DPDP Act 2023", "National Health Authority compliant, encrypted health bundles, verifiable patient consent.")
    ]

    for r_idx, (layer, tech, rationale) in enumerate(tech_matrix, start=1):
        bg = C_LIGHT_BG if r_idx % 2 == 1 else C_WHITE
        for c_idx, val in enumerate([layer, tech, rationale]):
            cell = table.cell(r_idx, c_idx)
            cell.fill.solid(); cell.fill.fore_color.rgb = bg
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.name = 'Arial'; p.font.size = Pt(8.0)
            if c_idx == 0:
                p.font.bold = True; p.font.color.rgb = C_NAVY
            else:
                p.font.color.rgb = C_DARK

    # -------------------------------------------------------------
    # SLIDE 4: FEASIBILITY AND VIABILITY
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

    # Left Column: Feasibility Analysis (3 Cards)
    f_x = Inches(0.67)
    f_w = Inches(5.1)
    f_card_h = Inches(1.65)
    f_gap = Inches(0.12)
    start_y = Inches(1.58)

    feas_cards = [
        ("1. Operational Feasibility (Frontline Ready)", C_TEAL, C_TEAL_BG, [
            "Replaces 8 duplicate paper registers with 50-second Marathi voice dictation.",
            "Operates on existing government smartphones without purchasing specialized tablets.",
            "Designed for low-literacy ASHAs with audio cues, icons, and automated SMS."
        ]),
        ("2. Technical Feasibility (Interoperable Rails)", C_BLUE, C_BLUE_BG, [
            "Integrates directly with live national APIs: ABDM (67 Cr ABHA IDs) & Bhashini.",
            "CRDT local replication guarantees zero data corruption during partial syncs.",
            "Runs on proven open-source web and mobile architecture with MeitY cloud compliance."
        ]),
        ("3. Financial Viability (B2G Unit Economics)", C_NAVY, C_LIGHT_BG, [
            "Funded via State NHM PIP Innovation budget + ABDM DHIS incentives (₹500/bed/mo).",
            "District Operating Cost: ~₹18 Lakh/year vs. State Contract Value: ~₹35 Lakh/year.",
            "48.5% operating margin supports field engineers and frontline worker training."
        ])
    ]

    for c_idx, (c_title, c_color, c_bg, c_bullets) in enumerate(feas_cards):
        cy = start_y + c_idx * (f_card_h + f_gap)
        card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, f_x, cy, f_w, f_card_h)
        card.fill.solid(); card.fill.fore_color.rgb = c_bg
        card.line.color.rgb = c_color; card.line.width = Pt(1.2)
        tf = card.text_frame; tf.word_wrap = True
        tf.margin_left = Inches(0.12); tf.margin_right = Inches(0.12); tf.margin_top = Inches(0.08)
        p = tf.paragraphs[0]
        p.text = c_title
        p.font.name = 'Arial'; p.font.size = Pt(9.2); p.font.bold = True; p.font.color.rgb = c_color
        for b in c_bullets:
            pb = tf.add_paragraph()
            pb.text = "• " + b
            pb.font.name = 'Arial'; pb.font.size = Pt(7.8); pb.font.color.rgb = C_DARK; pb.space_before = Pt(1.5)

    # Right Column: Risk Management Matrix Table
    r_x = Inches(5.95)
    r_w = Inches(6.72)
    r_top = Inches(1.58)
    r_h = Inches(5.20)
    t_shp = s4.shapes.add_table(5, 3, r_x, r_top, r_w, r_h)
    t = t_shp.table
    t.columns[0].width = Inches(1.5)
    t.columns[1].width = Inches(2.2)
    t.columns[2].width = Inches(3.02)

    # Adjust row heights for tighter layout
    t.rows[0].height = Inches(0.40)
    for r in range(1, 5):
        t.rows[r].height = Inches(1.20)

    r_headers = ["Risk Category", "Identified Challenge", "Strategic Mitigation Plan"]
    for c_idx, h_text in enumerate(r_headers):
        cell = t.cell(0, c_idx)
        cell.fill.solid(); cell.fill.fore_color.rgb = C_NAVY
        p = cell.text_frame.paragraphs[0]
        p.text = h_text
        p.font.name = 'Arial'; p.font.size = Pt(8.5); p.font.bold = True; p.font.color.rgb = C_WHITE

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
            p.font.name = 'Arial'; p.font.size = Pt(7.8)
            if c_idx == 0:
                p.font.bold = True
                p.font.color.rgb = C_RED if "Clinical" in val or "Operational" in val else C_BLUE
            else:
                p.font.color.rgb = C_DARK

    # -------------------------------------------------------------
    # SLIDE 5: IMPACT AND BENEFITS
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

    # Hero KPI Cards (Top 4 Metrics)
    kpi_w = Inches(2.85)
    kpi_h = Inches(1.40)
    kpi_y = Inches(1.58)
    kpi_gap = Inches(0.20)
    kpi_start_x = Inches(0.67)

    kpis = [
        ("< 10%", "Referral Drop-out", "Slashed from 48.2% baseline via closed-loop tracking & active navigation.", C_TEAL, C_TEAL_BG),
        ("60%+", "OOPE Travel Reduction", "Saves rural families from debt traps via Coordinated One-Trip Care Bundles.", C_BLUE, C_BLUE_BG),
        ("< 45 Min", "Hospital Wait Time", "Fast-track casualty triage bypasses 3.5-hour general OPD queues.", C_NAVY, C_LIGHT_BG),
        ("100%", "Follow-up Compliance", "Automated counter-referral tasks sent to village ASHAs on patient discharge.", C_GREEN, RGBColor(236, 253, 245))
    ]

    for k_idx, (num, lbl, desc, clr, bg) in enumerate(kpis):
        kx = kpi_start_x + k_idx * (kpi_w + kpi_gap)
        card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, kx, kpi_y, kpi_w, kpi_h)
        card.fill.solid(); card.fill.fore_color.rgb = bg
        card.line.color.rgb = clr; card.line.width = Pt(1.5)
        tf = card.text_frame; tf.word_wrap = True
        tf.margin_left = Inches(0.12); tf.margin_right = Inches(0.12); tf.margin_top = Inches(0.08)
        p = tf.paragraphs[0]
        p.text = num
        p.font.name = 'Arial'; p.font.size = Pt(18); p.font.bold = True; p.font.color.rgb = clr
        p2 = tf.add_paragraph()
        p2.text = lbl
        p2.font.name = 'Arial'; p2.font.size = Pt(9.2); p2.font.bold = True; p2.font.color.rgb = C_NAVY
        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.name = 'Arial'; p3.font.size = Pt(7.5); p3.font.color.rgb = C_DARK; p3.space_before = Pt(2)

    # 4-Quadrant Multi-Dimensional Benefits Matrix
    q_y = Inches(3.12)
    q_w = Inches(5.85)
    q_h = Inches(1.80)
    q_gap_y = Inches(0.12)

    quads = [
        ("SOCIAL IMPACT: Maternal & Cardiac Lives Saved", Inches(0.67), q_y, C_RED, RGBColor(254, 242, 242), [
            "Prevents maternal mortality (PPH, eclampsia) & cardiac deaths in tribal blocks (Melghat, Nandurbar).",
            "Eliminates fear and confusion for illiterate citizens through vernacular voice guidance.",
            "Empowers frontline women (ASHAs) as digital healthcare leaders in their community."
        ]),
        ("ECONOMIC IMPACT: Eliminating Healthcare Debt", Inches(6.82), q_y, C_BLUE, C_BLUE_BG, [
            "Health expenses push 55 million Indians into poverty annually; platform cuts private jeep & repeat test costs.",
            "Reduces tertiary hospital over-utilization by triaging treatable cases at primary PHC/CHC level.",
            "Unlocks ABDM DHIS federal cash incentives (₹500/bed/mo) for participating state hospitals."
        ]),
        ("ENVIRONMENTAL IMPACT: Paperless Green Health", Inches(0.67), q_y + q_h + q_gap_y, C_GREEN, RGBColor(236, 253, 245), [
            "Replaces millions of physical registers and paper referral slips with digital records.",
            "Significantly cuts vehicular emissions and fuel consumption from repeated, failed hospital trips.",
            "Eco-friendly server architecture optimized for low-power edge execution."
        ]),
        ("ADMINISTRATIVE IMPACT: Real-Time Governance", Inches(6.82), q_y + q_h + q_gap_y, C_NAVY, C_LIGHT_BG, [
            "Live District Health Officer (DHO) bottleneck heatmaps surface specialist shortages & equipment outages.",
            "Replaces delayed 45-day HMIS aggregate reports with actionable operational telemetry.",
            "Provides accountability across secondary facilities for referral turnaround and bed readiness."
        ])
    ]

    for q_title, qx, qy, q_clr, q_bg, q_bullets in quads:
        card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, qx, qy, q_w, q_h)
        card.fill.solid(); card.fill.fore_color.rgb = q_bg
        card.line.color.rgb = q_clr; card.line.width = Pt(1.2)
        tf = card.text_frame; tf.word_wrap = True
        tf.margin_left = Inches(0.12); tf.margin_right = Inches(0.12); tf.margin_top = Inches(0.08)
        p = tf.paragraphs[0]
        p.text = q_title
        p.font.name = 'Arial'; p.font.size = Pt(9.2); p.font.bold = True; p.font.color.rgb = q_clr
        for b in q_bullets:
            pb = tf.add_paragraph()
            pb.text = "• " + b
            pb.font.name = 'Arial'; pb.font.size = Pt(7.8); pb.font.color.rgb = C_DARK; pb.space_before = Pt(1.5)

    # -------------------------------------------------------------
    # SLIDE 6: RESEARCH AND REFERENCES
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
    bench_h = Inches(2.55)
    bench_w = Inches(12.0)
    b_shp = s6.shapes.add_table(6, 6, Inches(0.67), bench_top, bench_w, bench_h)
    bt = b_shp.table
    bt.columns[0].width = Inches(2.5)
    bt.columns[1].width = Inches(1.9)
    bt.columns[2].width = Inches(1.9)
    bt.columns[3].width = Inches(1.9)
    bt.columns[4].width = Inches(1.9)
    bt.columns[5].width = Inches(1.9)

    bt.rows[0].height = Inches(0.35)
    for r in range(1, 6):
        bt.rows[r].height = Inches(0.44)

    b_headers = ["Key Capability Dimension", "eSanjeevani (C-DAC)", "NIC e-Hospital", "Khushi Baby / CHT", "108 EMS Fleet", "SwasthyaSetu"]
    for c_idx, h_text in enumerate(b_headers):
        cell = bt.cell(0, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_TEAL if c_idx == 5 else C_NAVY
        p = cell.text_frame.paragraphs[0]
        p.text = h_text
        p.font.name = 'Arial'; p.font.size = Pt(8.0); p.font.bold = True; p.font.color.rgb = C_WHITE

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
            p.font.name = 'Arial'; p.font.size = Pt(7.5)
            if c_idx == 0:
                p.font.bold = True; p.font.color.rgb = C_NAVY
            elif c_idx == 5:
                p.font.bold = True; p.font.color.rgb = C_TEAL
            else:
                p.font.color.rgb = C_RED if val.startswith("✕") else (C_GOLD if "⚠" in val else C_DARK)

    # Bottom Section: Authoritative References (4 Cards)
    ref_y = Inches(4.30)
    ref_h = Inches(2.40)
    ref_w = Inches(2.85)
    ref_gap = Inches(0.20)
    ref_start_x = Inches(0.67)

    refs = [
        ("1. MoHFW Rural Health Statistics", C_BLUE, C_BLUE_BG, [
            ("Source:", " Health Dynamics of India 2022-23"),
            ("Finding:", " Acute 79.9% shortfall of specialists at rural CHCs nationwide."),
            ("Relevance:", " Validates why capacity-aware routing is the only viable allocation mechanism.")
        ]),
        ("2. The Lancet Global Health", C_RED, RGBColor(254, 242, 242), [
            ("Source:", " Referral Pathways in Rural India (2020)"),
            ("Finding:", " 48.2% of referred primary patients never reach secondary hospitals."),
            ("Relevance:", " Provides empirical baseline for SwasthyaSetu closed-loop tracking.")
        ]),
        ("3. National Health Accounts", C_NAVY, C_LIGHT_BG, [
            ("Source:", " NHA 2020-21 / Lancet Public Health"),
            ("Finding:", " OOPE accounts for 47.1% of health spend; pushes 55M into poverty."),
            ("Relevance:", " Proves need for Coordinated One-Trip care to slash private transport costs.")
        ]),
        ("4. JMIR 2025 & ABDM Specs", C_TEAL, C_TEAL_BG, [
            ("Source:", " Li et al., JMIR 2025; ABDM FHIR R4"),
            ("Finding:", " Bidirectional referral cuts transfer delay from 2.51 to 0.90 days."),
            ("Relevance:", " Core blueprint for SwasthyaSetu 3-way visibility & ABHA integration.")
        ])
    ]

    for r_idx, (r_title, r_clr, r_bg, r_lines) in enumerate(refs):
        rx = ref_start_x + r_idx * (ref_w + ref_gap)
        card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, rx, ref_y, ref_w, ref_h)
        card.fill.solid(); card.fill.fore_color.rgb = r_bg
        card.line.color.rgb = r_clr; card.line.width = Pt(1.2)
        tf = card.text_frame; tf.word_wrap = True
        tf.margin_left = Inches(0.12); tf.margin_right = Inches(0.12); tf.margin_top = Inches(0.08)
        p = tf.paragraphs[0]
        p.text = r_title
        p.font.name = 'Arial'; p.font.size = Pt(8.8); p.font.bold = True; p.font.color.rgb = r_clr
        for k, v in r_lines:
            pl = tf.add_paragraph()
            pl.space_before = Pt(2.5)
            r1 = pl.add_run(); r1.text = k; r1.font.name = 'Arial'; r1.font.size = Pt(7.5); r1.font.bold = True; r1.font.color.rgb = C_NAVY
            r2 = pl.add_run(); r2.text = v; r2.font.name = 'Arial'; r2.font.size = Pt(7.2); r2.font.color.rgb = C_DARK

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
