"""PDF report generator using ReportLab."""

import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT


PURPLE = colors.HexColor("#7C3AED")
LIGHT_PURPLE = colors.HexColor("#EDE9FE")
DARK = colors.HexColor("#1E1B4B")
GRAY = colors.HexColor("#6B7280")


def generate_career_report_pdf(user_name: str, report: dict) -> bytes:
    """Generate a styled PDF career report and return bytes."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("Title", fontSize=22, textColor=PURPLE, alignment=TA_CENTER, spaceAfter=6)
    subtitle_style = ParagraphStyle("Subtitle", fontSize=12, textColor=GRAY, alignment=TA_CENTER, spaceAfter=20)
    heading_style = ParagraphStyle("Heading", fontSize=14, textColor=DARK, spaceBefore=14, spaceAfter=6, fontName="Helvetica-Bold")
    body_style = ParagraphStyle("Body", fontSize=10, textColor=colors.black, spaceAfter=4)
    bullet_style = ParagraphStyle("Bullet", fontSize=10, textColor=colors.black, leftIndent=15, spaceAfter=3)

    story = []

    # Header
    story.append(Paragraph("CareerLift AI Career Counselor", title_style))
    story.append(Paragraph(f"Career Report for {user_name}", subtitle_style))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y')}", ParagraphStyle("Date", fontSize=9, textColor=GRAY, alignment=TA_CENTER)))
    story.append(HRFlowable(width="100%", thickness=2, color=PURPLE, spaceAfter=16))

    # Assessment
    assessment = report.get("assessment", {})
    story.append(Paragraph("Career Assessment", heading_style))
    story.append(Paragraph(assessment.get("summary", "N/A"), body_style))
    story.append(Paragraph("<b>Strengths:</b>", body_style))
    for s in assessment.get("strengths", []):
        story.append(Paragraph(f"• {s}", bullet_style))
    story.append(Paragraph("<b>Areas to Improve:</b>", body_style))
    for w in assessment.get("weaknesses", []):
        story.append(Paragraph(f"• {w}", bullet_style))

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_PURPLE))

    # Employability Score
    emp = report.get("employability", {})
    story.append(Paragraph("Employability Score", heading_style))
    score = emp.get("score", 0)
    story.append(Paragraph(f"<b>Overall Score: {score}/100</b>", body_style))
    story.append(Paragraph("<b>Suggestions:</b>", body_style))
    for tip in emp.get("suggestions", []):
        story.append(Paragraph(f"• {tip}", bullet_style))

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_PURPLE))

    # Career Recommendations Table
    story.append(Paragraph("Career Recommendations", heading_style))
    careers = report.get("recommended_careers", [])
    if careers:
        table_data = [["Role", "Salary", "Difficulty", "Growth", "Remote"]]
        for c in careers[:5]:
            table_data.append([
                c.get("role", ""),
                c.get("salary", ""),
                c.get("difficulty", ""),
                c.get("growth", ""),
                "Yes" if c.get("remote") else "No",
            ])
        t = Table(table_data, colWidths=[5 * cm, 3 * cm, 3 * cm, 2 * cm, 2 * cm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PURPLE),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_PURPLE]),
            ("GRID", (0, 0), (-1, -1), 0.5, GRAY),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(t)

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_PURPLE))

    # Skill Gap
    skill_gap = report.get("skill_gap", {})
    story.append(Paragraph("Skill Gap Analysis", heading_style))
    story.append(Paragraph("<b>Skills You Need to Learn:</b>", body_style))
    for skill in skill_gap.get("missing_skills", []):
        name = skill.get("name", "") if isinstance(skill, dict) else skill
        priority = skill.get("priority", "") if isinstance(skill, dict) else ""
        story.append(Paragraph(f"• {name} (Priority: {priority})", bullet_style))

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_PURPLE))

    # Roadmap Summary
    roadmap = report.get("roadmap", {})
    story.append(Paragraph("90-Day Learning Roadmap", heading_style))
    for phase, label in [("days_30", "First 30 Days"), ("days_60", "Days 31–60"), ("days_90", "Days 61–90")]:
        story.append(Paragraph(f"<b>{label}:</b>", body_style))
        for item in roadmap.get(phase, []):
            story.append(Paragraph(f"  • {item.get('day_range', '')}: {item.get('topic', '')} — {item.get('description', '')}", bullet_style))

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_PURPLE))

    # Interview Tips
    interview = report.get("interview", {})
    story.append(Paragraph("Interview Preparation Tips", heading_style))
    for tip in interview.get("tips", []):
        story.append(Paragraph(f"• {tip}", bullet_style))

    # Footer
    story.append(Spacer(1, 20))
    story.append(Paragraph("— CareerLift AI Career Counselor —", ParagraphStyle("Footer", fontSize=9, textColor=GRAY, alignment=TA_CENTER)))

    doc.build(story)
    return buffer.getvalue()
