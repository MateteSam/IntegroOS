"""
WCCCS Command Center Bot — The AI CEO for World Class Content Creation Solutions
Author: Antigravity AI
Version: 1.0.0

This bot connects the 6-person WCCCS team to the AI Agent OS via Telegram.
Deploy free on Railway.app or Render.com.
"""

import os
import asyncio
import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    CallbackQueryHandler, filters, ContextTypes
)
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# ─── AI BRAIN SETUP ───────────────────────────────────────────────────────────
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel(
    "gemini-2.0-flash-exp",
    system_instruction="""You are the WCCCS AI Command Agent — CEO and Head of Production for WCCCS StudioWorks (studioworks.wcccs.io).

STUDIOWORKS IS THE MAIN ENGINE. It is the revenue-generating, market-facing arm of WCCCS.
WCCCS builds platforms; StudioWorks EXECUTES solutions. StudioWorks sells execution: governance, standards, reliability, repeatability.
StudioWorks is NOT a casual agency. It is NOT a freelance collective. It is a premium professional execution company.

90-DAY TARGETS (March–May 2026): 25 church engagements | 10 corporate leads | 10 proposals | 5 signed contracts | 2 retainer agreements
RETAINERS ARE THE PRIORITY over one-off projects.

PRIMARY MARKET: Churches (network scale, recurring projects, long-term retainers)
SECONDARY: Corporates and NGOs

TEAM:
- Dr. Charles = Global Team Lead (final contract approval, strategic direction)
- Samuel = AI & Software Lead (tech, architecture, security, compliance)
- Palesa = Marketing & Business Development Lead (pipeline, proposals, outreach)
- Mamphosi = Finance & Admin Lead (invoicing, retainer billing, contracts)
- PK = Sound & Visual Lead (AV, streaming, event production)
- Tlali = Creative Lead (brand, graphics, publishing, visual standards)

STUDIOWORKS GOVERNED PRICING (no discounting without approval):
SOFTWARE & WEBSITES:
- Basic website (5 pages): R25K–R45K | Church website (interactive+giving): R45K–R85K
- Corporate website: R65K–R150K | E-commerce: R75K–R180K
- Web app: from R150K | Mobile app: R250K–R450K | Custom platform: R350K–R900K+
AI SERVICES:
- AI strategy consult (2hrs): R6,500 | AI workshop (full day): R35K
- Workflow automation: R65K–R150K | Custom AI assistant: R85K–R220K
- AI advisory retainer/month: R25K–R75K
AV & MEDIA:
- Video (1-3min promo): R18K–R45K | Full-day shoot: R25K–R65K
- Podcast setup: R45K–R120K | Livestream consultation: R15K–R35K
- Church livestream installation: R85K–R250K (excl. equip)
- Monthly media support retainer: R25K–R80K
EVENT PRODUCTION:
- Small church event (technical): R45K–R120K
- Medium conference (300-800 pax): R150K–R400K
- Large conference: R500K–R1.2M+
- Technical director/day: R8,500–R18K
CHURCH-SPECIFIC:
- Basic church website: R35K–R55K | Interactive: R55K–R95K
- Church management system: R85K–R180K | Online giving integration: R15K–R35K
- Website maintenance/month: R4,500–R12K
- AI strategy session: R5,500 | AI ministry workshop: R28K
- Visitor follow-up automation: R45K–R95K | Content repurposing: R35K–R85K
- AI advisory retainer/month: R20K–R55K
- Livestream consultation: R12K–R25K | Livestream installation: R75K–R220K
- Sound optimization: R35K–R95K | Media dept restructure: R65K–R150K
- Monthly media support retainer: R20K–R75K
MEDIA/ADVERTISING (Ocean City Radio FM, 350K+ listeners):
- Bronze (5 spots/day): R5K/month | Silver (10 spots/day): R10K/month
- Gold (20 spots+mentions): R20K/month | Title Sponsor: R35K/month
SAAS LICENSING: ProLens R299-R2,499/mo | Onixone R399-R3,999/mo | Integro Mail R299-R2,499/mo

GOVERNANCE RULES:
- No verbal pricing without review — everything documented
- Project flow: Discovery → Scope → Proposal → Contract → Execution → Delivery → Retainer Assessment
- No work without signed agreement
- Commission for collaborators: 8-12% first project, 5-8% above R500K

RULES:
- Always give COMPLETE, ready-to-use outputs. Write the actual proposal, letter, post — not instructions.
- Enforce pricing — StudioWorks is PREMIUM, not affordable.
- Position church clients as STRATEGIC (network scale, retainer potential)
- Every response moves toward R1,000,000 by March 31, 2026
- Culture: Integrity. Professionalism. Excellence. Discipline. Respect. Stewardship."""
)


# ─── AUTH ─────────────────────────────────────────────────────────────────────
RAW_IDS = os.getenv("AUTHORIZED_USERS", "")
try:
    AUTHORIZED_USERS = [int(uid.strip()) for uid in RAW_IDS.split(",") if uid.strip().isdigit()]
except:
    AUTHORIZED_USERS = []

async def check_auth(update: Update) -> bool:
    """Check if user is authorized to use the bot."""
    user_id = update.effective_user.id
    if AUTHORIZED_USERS and user_id not in AUTHORIZED_USERS:
        await update.message.reply_text(
            "⛔ *Access Denied*\n\nYou are not authorized to use the WCCCS Command Center.\n"
            "Contact Samuel (CTO) to get access.\n\n"
            "_Your Telegram ID: `" + str(user_id) + "`_",
            parse_mode="Markdown"
        )
        return False
    return True

async def ai_respond(prompt: str, max_chars: int = 3800) -> str:
    """Get AI response, truncated for Telegram limits."""
    try:
        response = model.generate_content(prompt)
        text = response.text
        if len(text) > max_chars:
            text = text[:max_chars] + "\n\n_[Message truncated — ask for Part 2 if needed]_"
        return text
    except Exception as e:
        return f"⚠️ AI temporarily unavailable. Error: {str(e)[:100]}\n\nPlease try again in 30 seconds."

# ─── COMMANDS ──────────────────────────────────────────────────────────────────

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Welcome command."""
    if not await check_auth(update): return
    name = update.effective_user.first_name
    keyboard = [
        [InlineKeyboardButton("📊 Morning Briefing", callback_data="briefing"),
         InlineKeyboardButton("📱 Draft Post", callback_data="post_menu")],
        [InlineKeyboardButton("💼 Sponsor Letter", callback_data="letter_menu"),
         InlineKeyboardButton("📊 Rate Cards", callback_data="rates")],
        [InlineKeyboardButton("🖥️ Platform Status", callback_data="status"),
         InlineKeyboardButton("❓ Help", callback_data="help")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        f"🌍 *WCCCS AI Command Center*\n\n"
        f"Welcome, *{name}*. I am your AI CEO.\n\n"
        f"I run 14 platforms and I'm here to make WCCCS *R1,000,000 by March 31*.\n\n"
        f"What do you need?",
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )

async def briefing(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Generate morning intelligence briefing."""
    if not await check_auth(update): return
    msg = update.message or update.callback_query.message
    await msg.reply_text("⏳ Generating your intelligence briefing...")
    
    today = datetime.datetime.now().strftime("%A, %d %B %Y")
    days_left = (datetime.date(2026, 3, 31) - datetime.date.today()).days
    
    text = await ai_respond(f"""Generate a morning intelligence briefing for the WCCCS team. Today is {today}. 
    We have {days_left} days left to reach R1,000,000 by March 31, 2026.
    
    Format:
    🌅 WCCCS MORNING BRIEFING — {today}
    ⏰ {days_left} DAYS TO R1,000,000
    
    📊 TODAY'S REVENUE FOCUS:
    [Pick the highest-impact revenue activity for today and explain exactly what to do]
    
    🎯 TOP 3 PRIORITIES:
    1. [Specific action with owner name]
    2. [Specific action with owner name]  
    3. [Specific action with owner name]
    
    🎙️ OCEAN CITY RADIO TODAY:
    [Schedule note or advertiser outreach target]
    
    📱 SOCIAL MEDIA TODAY:
    [What to post today across platforms]
    
    💡 CEO DIRECTIVE:
    [One sharp, motivating directive — no fluff, just action]
    
    Keep it punchy and action-focused. No filler.""")
    
    await msg.reply_text(text, parse_mode="Markdown")

async def draft_post(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Draft social media posts."""
    if not await check_auth(update): return
    topic = " ".join(context.args) if context.args else None
    
    if not topic:
        await update.message.reply_text(
            "📱 *Draft Social Posts*\n\n"
            "Usage: `/post [your topic]`\n\n"
            "Examples:\n"
            "• `/post Ocean City Radio live show tonight`\n"
            "• `/post WCCCS studio booking available`\n"
            "• `/post Faith Nexus summit 2026`",
            parse_mode="Markdown"
        )
        return
    
    await update.message.reply_text(f"✍️ Drafting posts about: _{topic}_...", parse_mode="Markdown")
    
    text = await ai_respond(f"""Write 3 ready-to-publish social media posts about: {topic}
    Brand: WCCCS — World Class Content Creation Solutions / Ocean City Radio FM

    **INSTAGRAM/FACEBOOK POST:**
    [Engaging post with 3-5 relevant emojis, 3-5 hashtags. 100-150 words. Include a call to action.]
    
    **TWITTER/X POST:**
    [Under 250 characters. Punchy and shareable. 2-3 hashtags max.]
    
    **LINKEDIN POST:**
    [Professional tone, 100-150 words. No spam hashtags, maximum 3. Focus on value and authority.]
    
    Make all posts feel authentic, Pan-African, and action-driving. NO generic corporate speak.""")
    
    await update.message.reply_text(text, parse_mode="Markdown")

async def sponsor_letter(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Generate sponsorship/partnership letter."""
    if not await check_auth(update): return
    company = " ".join(context.args) if context.args else None
    
    if not company:
        await update.message.reply_text(
            "📝 *Sponsorship Letter Generator*\n\n"
            "Usage: `/letter [Company Name]`\n\n"
            "Examples:\n"
            "• `/letter Standard Bank`\n"
            "• `/letter Chicken Licken`\n"
            "• `/letter MTN South Africa`",
            parse_mode="Markdown"
        )
        return
    
    await update.message.reply_text(f"📝 Writing sponsorship letter for *{company}*...", parse_mode="Markdown")
    
    text = await ai_respond(f"""Write a complete, professional sponsorship/advertising proposal letter from WCCCS to {company}.

    Make it SPECIFIC to {company}'s likely industry and interests.
    
    Letter structure:
    
    [Date: {datetime.datetime.now().strftime("%d %B %Y")}]
    
    Dear {company} Marketing Team,
    
    [Opening: One powerful line about why we're reaching out to them specifically]
    
    [WCCCS Introduction: 2 sentences about who we are — Pan-African media and tech company with 14 platforms]
    
    [The Opportunity — pick ONE best fit for this company from:
    • Radio advertising on Ocean City Radio FM (350,000+ listeners, Pan-African reach)
    • Sponsored content on Content World magazine  
    • Standard IQ business magazine thought leadership
    • Digital advertising across our platform network]
    
    [Packages: 
    Bronze: R5,000/month | Silver: R10,000/month | Gold: R20,000/month | Title: R35,000/month]
    
    [Why now: 2026 African digital growth stats]
    
    [CTA: Schedule a call this week]
    
    Warm regards,
    Dr. Charles [CEO]
    World Class Content Creation Solutions
    advertise@oceancityradio.co.za | wcccs.co.za
    
    Write the full letter, ready to copy and send. Professional, confident, not desperate.""")
    
    await update.message.reply_text(text)

async def draft_article(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Draft a magazine article."""
    if not await check_auth(update): return
    title = " ".join(context.args) if context.args else None
    
    if not title:
        await update.message.reply_text(
            "📰 *Article Generator*\n\n"
            "Usage: `/article [title or topic]`\n\n"
            "Examples:\n"
            "• `/article 5 Ways AI Is Changing African Business in 2026`\n"
            "• `/article The Rise of Digital Radio in Africa`\n"
            "• `/article Why Every SA Brand Needs a Podcast`",
            parse_mode="Markdown"
        )
        return
    
    await update.message.reply_text(f"📰 Writing article: _{title}_...", parse_mode="Markdown")
    
    text = await ai_respond(f"""Write a 550-word professional article for Content World Online Magazine.

    Title: {title}
    
    Structure:
    # {title}
    *By Content World Editorial Team | {datetime.datetime.now().strftime("%d %B %Y")}*
    
    [Compelling opening paragraph that hooks the reader immediately]
    
    [3 main sections with bold headers — each section 1-2 paragraphs]
    
    [Practical insight or data point per section — African context preferred]
    
    [Strong closing paragraph with takeaway]
    
    *Content World is Africa's premier platform for creative, business, and tech insights.*
    
    Write with authority. Real insights, African lens, global ambition.""")
    
    await update.message.reply_text(text, parse_mode="Markdown")

async def rates(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show advertising rates."""
    if not await check_auth(update): return
    msg = update.message or update.callback_query.message
    await msg.reply_text(
        "💰 *STUDIOWORKS + WCCCS RATE CARD 2026*\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "⛪ *CHURCH SERVICES (Primary)*\n"
        "• Basic church website: R35K–R55K\n"
        "• Interactive + giving: R55K–R95K\n"
        "• Livestream installation: R75K–R220K\n"
        "• Media dept restructure: R65K–R150K\n"
        "• AI ministry workshop: R28K\n"
        "• AI advisory retainer: R20K–R55K/mo\n"
        "• Media support retainer: R20K–R75K/mo\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "🤖 *AI SERVICES*\n"
        "• AI strategy consult (2hrs): R6,500\n"
        "• AI workshop (full day): R35K\n"
        "• Workflow automation: R65K–R150K\n"
        "• Custom AI assistant: R85K–R220K\n"
        "• AI advisory retainer: R25K–R75K/mo\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "🎬 *AV & EVENT PRODUCTION*\n"
        "• Video (1-3 min): R18K–R45K\n"
        "• Conference (300-800 pax): R150K–R400K\n"
        "• Technical director/day: R8.5K–R18K\n"
        "• Podcast setup: R45K–R120K\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "🎙️ *OCEAN CITY RADIO FM*\n"
        "• Bronze (5 spots/day): R5K/mo\n"
        "• Gold (20 spots+mentions): R20K/mo\n"
        "• Title Sponsor: R35K/mo\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "📧 studio@wcccs.co.za\n"
        "🌐 studioworks.wcccs.io",
        parse_mode="Markdown"
    )

async def platform_status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Platform health status."""
    if not await check_auth(update): return
    msg = update.message or update.callback_query.message
    days_left = (datetime.date(2026, 3, 31) - datetime.date.today()).days
    await msg.reply_text(
        "🖥️ *WCCCS PLATFORM STATUS*\n"
        f"_{datetime.datetime.now().strftime('%d %B %Y, %H:%M')} SAST_\n\n"
        "✅ Ocean City Radio FM — `oceancityradio.co.za`\n"
        "✅ TalkWorld — `talkworld.digital`\n"
        "✅ Content World — `contentworld.online`\n"
        "✅ WCCCS Main — `wcccs.co.za`\n"
        "✅ ONIXone Studio — `onixone.digital`\n"
        "✅ ProLens Studio — `prolense.digital`\n"
        "✅ Faith Nexus — Deployed\n"
        "✅ Assembly Mission Portal — Deployed\n"
        "✅ Afro ISO — Deployed\n"
        "✅ Integro Mail CRM — `campaign-craftsman.netlify.app`\n"
        "✅ Marketing Brain — Local (port 5174)\n\n"
        "⚠️ LinkedIn — *NOT CREATED* — Samuel action needed\n"
        "⚠️ TikTok — *NOT CREATED* — Action needed\n"
        "⚠️ WhatsApp Business — *Setup needed*\n\n"
        f"⏰ *{days_left} days remaining to R1,000,000*",
        parse_mode="Markdown"
    )

async def revenue_report(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Revenue pipeline report."""
    if not await check_auth(update): return
    days_left = (datetime.date(2026, 3, 31) - datetime.date.today()).days
    await update.message.reply_text(
        "📊 *STUDIOWORKS REVENUE PIPELINE — March 2026*\n\n"
        f"🎯 Target: *R1,000,000*\n"
        f"⏰ Days Remaining: *{days_left}*\n"
        f"📅 Deadline: *31 March 2026*\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "⛪ *PRIMARY: CHURCH CLIENTS (StudioWorks)*\n\n"
        "🔵 Retainer #1 (Church Media) — R25K–R75K/mo\n"
        "🔵 Retainer #2 (Church AI Advisory) — R20K–R55K/mo\n"
        "🌐 Church Website x2 — R110K–R190K\n"
        "📡 Livestream Installation x1 — R85K–R250K\n"
        "🎤 Medium Conference x1 — R150K–R400K\n"
        "🤖 AI Workshop x2 — R56K\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "🏢 *SECONDARY: CORPORATES + MEDIA*\n\n"
        "🎙️ Radio Advertising (OCR) — R120K\n"
        "_4 advertisers × R30K/month_\n"
        "⛪ Faith Nexus Sponsorship — R100K\n"
        "💻 SAAS Licensing — R80K\n"
        "📰 Content Sponsorships — R80K\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "💰 *TOTAL TARGET: R1,000,000*\n\n"
        "_Track signed contracts with Mamphosi_",
        parse_mode="Markdown"
    )

async def content_calendar(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Generate content calendar for the week."""
    if not await check_auth(update): return
    await update.message.reply_text("📅 Generating this week's content calendar...")
    
    text = await ai_respond(f"""Generate a detailed 7-day social media content calendar for WCCCS. 
    Today is {datetime.datetime.now().strftime('%A %d %B %Y')}.
    
    For each day, provide:
    - Morning Post (9am): Platform, topic, brief content idea
    - Afternoon Post (1pm): Platform, topic, brief content idea  
    - Evening Post (6pm): Platform, topic, brief content idea
    
    Rotate across: Ocean City Radio, Content World, WCCCS brand, TalkWorld, Faith Nexus, Standard IQ, Onixone
    
    Include a mix of: show promotions, advertiser callouts, behind-the-scenes, thought leadership, testimonials
    
    Format cleanly with day headers. Make it actionable for Palesa and Tlali.""")
    
    await update.message.reply_text(text, parse_mode="Markdown")

async def lead_targets(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Generate list of warm leads to target."""
    if not await check_auth(update): return
    await update.message.reply_text("🎯 Generating today's lead targets...")
    
    text = await ai_respond(f"""Generate a list of 10 specific CHURCH targets for WCCCS StudioWorks to contact TODAY.
    Primary goal: Sign church clients for websites, livestream installs, AI advisory retainers, or media support retainers.
    Date: {datetime.datetime.now().strftime('%d %B %Y')}
    
    For each target, provide:
    ⛪ **[Church Name]** — [Location, SA]
    Best service pitch: [1 specific StudioWorks service that fits this church]
    Estimated project value: [R amount from pricing catalogue]
    Contact approach: [Senior Pastor / Media Director / Admin]
    Potential email format: [guess based on church name]
    
    Mix of: large charismatic churches, established denominations, growing new plants, church schools.
    Focus on: Johannesburg, Cape Town, Pretoria, Durban, — where StudioWorks can serve this year.""")
    
    await update.message.reply_text(text, parse_mode="Markdown")

async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show all commands."""
    if not await check_auth(update): return
    msg = update.message or update.callback_query.message
    await msg.reply_text(
        "🤖 *WCCCS AI Command Center — Commands*\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "📊 *INTELLIGENCE*\n"
        "/briefing — Morning intelligence report\n"
        "/status — All platform health check\n"
        "/revenue — Revenue pipeline report\n"
        "/leads — Today's 10 target companies\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "✍️ *CONTENT CREATION*\n"
        "/post [topic] — Draft 3 social posts\n"
        "/article [title] — Write magazine article\n"
        "/calendar — 7-day content calendar\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "💼 *BUSINESS TOOLS*\n"
        "/letter [company] — Write sponsorship letter\n"
        "/rates — Advertising rate cards\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "💬 *NATURAL LANGUAGE*\n"
        "Just type anything! Examples:\n"
        "• _Write me a post about our radio show_\n"
        "• _Draft a follow up email to Standard Bank_\n"
        "• _What should I prioritize today?_\n"
        "• _Give me 5 ideas to get studio clients_\n\n"
        "I'm your AI CEO. Ask me anything. 🌍",
        parse_mode="Markdown"
    )

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle inline keyboard callbacks."""
    query = update.callback_query
    await query.answer()
    
    if query.data == "briefing":
        await briefing(update, context)
    elif query.data == "rates":
        await rates(update, context)
    elif query.data == "status":
        await platform_status(update, context)
    elif query.data == "help":
        await help_cmd(update, context)
    elif query.data == "post_menu":
        await query.message.reply_text("📱 Type: `/post [your topic]`\n\nExample: `/post Ocean City Radio new show`", parse_mode="Markdown")
    elif query.data == "letter_menu":
        await query.message.reply_text("📝 Type: `/letter [company name]`\n\nExample: `/letter Standard Bank`", parse_mode="Markdown")

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle natural language messages."""
    if not await check_auth(update): return
    
    user_msg = update.message.text
    user_name = update.effective_user.first_name
    
    # Show typing indicator
    await context.bot.send_chat_action(update.effective_chat.id, "typing")
    
    text = await ai_respond(
        f"WCCCS team member {user_name} says: '{user_msg}'\n\n"
        f"Today is {datetime.datetime.now().strftime('%d %B %Y')} and we have "
        f"{(datetime.date(2026, 3, 31) - datetime.date.today()).days} days to reach R1,000,000.\n\n"
        f"Respond as the WCCCS AI CEO. Be decisive and give COMPLETE, ready-to-use outputs. "
        f"If they ask for content — write it. If they ask for a letter — write it. "
        f"If they ask for advice — give it specifically.",
        max_chars=3800
    )
    await update.message.reply_text(text, parse_mode="Markdown")

# ─── ERROR HANDLER ─────────────────────────────────────────────────────────────
async def error_handler(update, context):
    print(f"Error: {context.error}")
    if update and update.message:
        await update.message.reply_text(
            "⚠️ I hit a snag. Please try again in a moment.\n"
            "If the issue persists, contact Samuel (CTO)."
        )

# ─── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token or token == "your_telegram_bot_token_here":
        print("❌ ERROR: TELEGRAM_BOT_TOKEN not set in .env file")
        print("→ Get your token from @BotFather on Telegram")
        return
    
    print("🚀 WCCCS Command Center Bot starting...")
    print(f"🤖 AI Model: Gemini 2.0 Flash")
    print(f"👥 Authorized users: {len(AUTHORIZED_USERS)} configured" if AUTHORIZED_USERS else "⚠️  No authorized users configured — open access mode")
    
    app = Application.builder().token(token).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("briefing", briefing))
    app.add_handler(CommandHandler("post", draft_post))
    app.add_handler(CommandHandler("letter", sponsor_letter))
    app.add_handler(CommandHandler("article", draft_article))
    app.add_handler(CommandHandler("rates", rates))
    app.add_handler(CommandHandler("status", platform_status))
    app.add_handler(CommandHandler("revenue", revenue_report))
    app.add_handler(CommandHandler("calendar", content_calendar))
    app.add_handler(CommandHandler("leads", lead_targets))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CallbackQueryHandler(button_callback))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    app.add_error_handler(error_handler)
    
    print("✅ All handlers registered. Bot is LIVE.\n")
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
