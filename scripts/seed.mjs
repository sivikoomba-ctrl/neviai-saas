/**
 * Seed script for NeviAIB0015 SaaS App
 *
 * Inserts demo data (contacts, deals, interactions, templates, campaigns, emails)
 * for a given organization.
 *
 * Usage:
 *   node scripts/seed.mjs <org_id>
 *
 * Reads DATABASE_URL from process.env or falls back to the direct Supabase URL.
 */

import pg from "pg";
const { Client } = pg;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:1M9yMrNtkSPCj8oM@db.cesfryxslnryspthrsee.supabase.co:5432/postgres";

const orgId = process.argv[2];
if (!orgId) {
  console.error("Usage: node scripts/seed.mjs <org_id>");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const contacts = [
  { name: "Priya Sharma",      email: "priya.sharma@techvista.io",     phone: "+91 98765 43210", company: "TechVista Solutions",  tags: '["enterprise","hot-lead"]',           notes: "CTO — interested in AI automation for their support team." },
  { name: "James Whitfield",   email: "j.whitfield@meridian.co",       phone: "+1 415-555-0142", company: "Meridian Partners",    tags: '["investor","priority"]',             notes: "Managing partner. Met at SaaS Connect 2026." },
  { name: "Ananya Reddy",      email: "ananya@cloudpeak.dev",          phone: "+91 87654 32109", company: "CloudPeak Dev",        tags: '["startup","product-demo"]',          notes: "Founder — evaluating CRM options for a 15-person team." },
  { name: "David Okonkwo",     email: "david.o@nairosystems.com",      phone: "+234 802 345 6789", company: "Nairo Systems",      tags: '["partner","integration"]',           notes: "VP Engineering. Exploring API integration with their ERP." },
  { name: "Sophie Laurent",    email: "sophie.l@designhaus.eu",        phone: "+33 6 12 34 56 78", company: "DesignHaus Europe",  tags: '["agency","creative"]',               notes: "Creative director. Needs bulk email for client campaigns." },
  { name: "Ravi Patel",        email: "ravi@greenleafventures.in",     phone: "+91 99887 76655", company: "GreenLeaf Ventures",   tags: '["investor","warm-lead"]',            notes: "Angel investor. Interested in seed round details." },
  { name: "Emily Chen",        email: "emily.chen@lumoshealth.com",    phone: "+1 628-555-0198", company: "Lumos Health",         tags: '["healthcare","compliance"]',         notes: "Head of Ops. HIPAA compliance is a requirement." },
  { name: "Arjun Mehta",       email: "arjun@swiftlogistics.co",       phone: "+91 77665 54433", company: "Swift Logistics",      tags: '["logistics","enterprise"]',          notes: "Co-founder. Wants deal pipeline tracking for sales team." },
  { name: "Maria Gonzalez",    email: "maria.g@brillanteconsulting.mx", phone: "+52 55 1234 5678", company: "Brillante Consulting", tags: '["consulting","referral"]',          notes: "Referred by James Whitfield. Looking for email automation." },
  { name: "Kenji Tanaka",      email: "kenji@nexwave.jp",              phone: "+81 90-1234-5678", company: "NexWave Inc.",         tags: '["technology","apac"]',               notes: "Product lead. Evaluating for their Japan + SEA offices." },
];

const dealStages = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];

// Each deal references a contact by index into the contacts array
const deals = [
  { title: "TechVista AI Support Suite",         value: 120000, stage: "Proposal",     contactIdx: 0 },
  { title: "Meridian Strategic Partnership",      value: 250000, stage: "Negotiation",  contactIdx: 1 },
  { title: "CloudPeak CRM Starter",              value: 15000,  stage: "Qualified",    contactIdx: 2 },
  { title: "Nairo ERP Integration",              value: 85000,  stage: "Proposal",     contactIdx: 3 },
  { title: "DesignHaus Campaign Package",        value: 32000,  stage: "Won",          contactIdx: 4 },
  { title: "GreenLeaf Seed Investment",          value: 300000, stage: "Lead",         contactIdx: 5 },
  { title: "Lumos Health Compliance Module",     value: 175000, stage: "Negotiation",  contactIdx: 6 },
  { title: "Swift Logistics Pipeline Pro",       value: 48000,  stage: "Qualified",    contactIdx: 7 },
  { title: "Brillante Email Automation",         value: 22000,  stage: "Won",          contactIdx: 8 },
  { title: "NexWave APAC Rollout",              value: 95000,  stage: "Proposal",     contactIdx: 9 },
  { title: "TechVista Phase 2 — Analytics",      value: 80000,  stage: "Lead",         contactIdx: 0 },
  { title: "Meridian Portfolio Dashboard",       value: 140000, stage: "Qualified",    contactIdx: 1 },
  { title: "CloudPeak Pro Upgrade",              value: 28000,  stage: "Lost",         contactIdx: 2 },
  { title: "Swift Logistics Reporting Add-on",   value: 18000,  stage: "Won",          contactIdx: 7 },
  { title: "Lumos Health Training Package",      value: 45000,  stage: "Lead",         contactIdx: 6 },
];

// Each interaction references a contact by index
const interactions = [
  { type: "email",   subject: "Introduction & Demo Scheduling",       body: "Hi Priya, great speaking with you at the conference. Let's set up a demo this week.", contactIdx: 0 },
  { type: "call",    subject: "Discovery Call",                        body: "30-min call discussing current CRM pain points and integration needs.", contactIdx: 1 },
  { type: "meeting", subject: "Product Demo — AI Features",           body: "Live demo of AI summarization, deal scoring, and smart search capabilities.", contactIdx: 2 },
  { type: "note",    subject: "Internal: Compliance Requirements",     body: "Emily mentioned HIPAA + SOC2 as hard requirements. Need to verify our certifications.", contactIdx: 6 },
  { type: "email",   subject: "Proposal Follow-up",                   body: "Hi David, attaching the revised proposal with API integration details.", contactIdx: 3 },
  { type: "call",    subject: "Pricing Discussion",                    body: "Discussed enterprise pricing tiers. Sophie wants a custom package for 3 clients.", contactIdx: 4 },
  { type: "meeting", subject: "Investor Pitch Meeting",               body: "Presented growth metrics and product roadmap to Ravi and team.", contactIdx: 5 },
  { type: "email",   subject: "Contract Draft Review",                body: "Sent MSA and SOW for review. Legal team expected to respond by Friday.", contactIdx: 1 },
  { type: "note",    subject: "Deal Lost — Budget Constraints",       body: "Ananya confirmed they're going with a free tool for now. Revisit in Q3.", contactIdx: 2 },
  { type: "call",    subject: "Onboarding Kickoff",                   body: "Welcome call for DesignHaus. Set up their org, imported 200 contacts.", contactIdx: 4 },
  { type: "email",   subject: "Feature Request: Bulk Import",         body: "Arjun needs CSV import for 5,000+ contacts. Logged as feature request.", contactIdx: 7 },
  { type: "meeting", subject: "Quarterly Business Review",            body: "Reviewed campaign performance metrics with Maria. 42% open rate achieved.", contactIdx: 8 },
  { type: "email",   subject: "APAC Expansion Discussion",            body: "Kenji wants to pilot in Tokyo office first, then expand to Singapore.", contactIdx: 9 },
  { type: "note",    subject: "Internal: Upsell Opportunity",         body: "TechVista Phase 1 going well. Priya mentioned analytics needs — good upsell.", contactIdx: 0 },
];

const templates = [
  {
    name: "Welcome Email",
    subject: "Welcome to NeviAI, {{name}}!",
    body: "Hi {{name}},\n\nWelcome aboard! We're thrilled to have {{company}} as part of the NeviAI family.\n\nHere's what you can do next:\n1. Import your contacts\n2. Set up your first campaign\n3. Explore AI-powered features\n\nReach out anytime — we're here to help.\n\nCheers,\nThe NeviAI Team",
    category: "onboarding",
    variables: '["name","company"]',
  },
  {
    name: "Follow-up After Demo",
    subject: "Great connecting, {{name}} — next steps",
    body: "Hi {{name}},\n\nThanks for taking the time to see NeviAI in action. I hope the demo gave you a clear picture of how we can help {{company}}.\n\nAs discussed, here are the next steps:\n- {{next_step}}\n\nLet me know if you have any questions.\n\nBest,\n{{sender_name}}",
    category: "sales",
    variables: '["name","company","next_step","sender_name"]',
  },
  {
    name: "Proposal Delivery",
    subject: "Your Custom Proposal from NeviAI",
    body: "Hi {{name}},\n\nPlease find attached our proposal tailored for {{company}}.\n\nHighlights:\n- {{highlight_1}}\n- {{highlight_2}}\n- {{highlight_3}}\n\nThe total investment is {{amount}}. Happy to walk through the details at your convenience.\n\nRegards,\n{{sender_name}}",
    category: "sales",
    variables: '["name","company","highlight_1","highlight_2","highlight_3","amount","sender_name"]',
  },
  {
    name: "Meeting Request",
    subject: "Can we schedule a quick call, {{name}}?",
    body: "Hi {{name}},\n\nI'd love to set up a {{duration}}-minute call to discuss {{topic}}.\n\nWould any of these work?\n- {{slot_1}}\n- {{slot_2}}\n- {{slot_3}}\n\nFeel free to suggest another time if none of these suit you.\n\nBest,\n{{sender_name}}",
    category: "outreach",
    variables: '["name","duration","topic","slot_1","slot_2","slot_3","sender_name"]',
  },
  {
    name: "Monthly Newsletter",
    subject: "NeviAI Monthly — {{month}} Edition",
    body: "Hi {{name}},\n\nHere's what's new at NeviAI this month:\n\n## Product Updates\n{{updates}}\n\n## Tips & Tricks\n{{tips}}\n\n## Community Spotlight\n{{spotlight}}\n\nStay productive!\nThe NeviAI Team",
    category: "newsletter",
    variables: '["name","month","updates","tips","spotlight"]',
  },
];

const campaigns = [
  { name: "Q1 2026 Outreach",   description: "Targeted outreach to enterprise leads identified in Q4 pipeline review.", status: "active" },
  { name: "Product Launch",     description: "Announcement campaign for AI Deal Scoring feature launch.",              status: "draft" },
  { name: "Re-engagement",     description: "Win-back campaign for churned and inactive contacts from last 90 days.",  status: "draft" },
];

// Emails reference contacts by index; some reference campaigns by index
const emailsData = [
  { contactIdx: 0, subject: "Introduction & Demo Scheduling",         body: "Hi Priya, great speaking with you at the conference. I'd love to schedule a demo of our AI-powered CRM. Would Thursday at 2 PM work?", tone: "professional", status: "sent" },
  { contactIdx: 1, subject: "Partnership Proposal — NeviAI x Meridian", body: "Hi James, following up on our conversation about a strategic partnership. Attached is our partnership framework document.", tone: "formal", status: "sent" },
  { contactIdx: 2, subject: "Welcome to NeviAI!",                     body: "Hi Ananya, welcome aboard! Your CloudPeak Dev workspace is all set up. Here's a quick start guide.", tone: "friendly", status: "sent", campaignIdx: 0 },
  { contactIdx: 4, subject: "Campaign Setup Complete",                body: "Hi Sophie, your first email campaign is ready for review. We've imported your contact list and set up the templates.", tone: "professional", status: "sent", campaignIdx: 0 },
  { contactIdx: 5, subject: "NeviAI Seed Round — Key Metrics",       body: "Hi Ravi, as discussed, here are our key growth metrics and unit economics for your review.", tone: "formal", status: "draft" },
  { contactIdx: 7, subject: "Pipeline Pro — Feature Overview",        body: "Hi Arjun, here's a detailed overview of our Pipeline Pro features tailored for logistics companies.", tone: "professional", status: "draft" },
  { contactIdx: 8, subject: "Your Campaign Performance Report",       body: "Hi Maria, great news! Your Q1 campaign achieved a 42% open rate and 12% click-through rate. Here's the full breakdown.", tone: "enthusiastic", status: "sent", campaignIdx: 0 },
  { contactIdx: 9, subject: "NeviAI for APAC Teams",                 body: "Hi Kenji, I've prepared a localization overview for the Japan and SEA markets. Let's discuss the pilot timeline.", tone: "professional", status: "draft" },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log("Connected to database.");

  try {
    // ------------------------------------------------------------------
    // 1. Contacts
    // ------------------------------------------------------------------
    console.log("\nInserting 10 contacts...");
    const contactIds = [];
    for (const c of contacts) {
      const res = await client.query(
        `INSERT INTO contacts (org_id, name, email, phone, company, tags, notes, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, now())
         ON CONFLICT (org_id, email) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [orgId, c.name, c.email, c.phone, c.company, c.tags, c.notes]
      );
      contactIds.push(res.rows[0].id);
      console.log(`  + Contact: ${c.name} (${c.company})`);
    }

    // ------------------------------------------------------------------
    // 2. Deals
    // ------------------------------------------------------------------
    console.log("\nInserting 15 deals...");
    for (const d of deals) {
      await client.query(
        `INSERT INTO deals (org_id, title, value, stage, contact_id, updated_at)
         VALUES ($1, $2, $3, $4, $5, now())`,
        [orgId, d.title, d.value, d.stage, contactIds[d.contactIdx]]
      );
      console.log(`  + Deal: ${d.title} — $${d.value.toLocaleString()} (${d.stage})`);
    }

    // ------------------------------------------------------------------
    // 3. Interactions
    // ------------------------------------------------------------------
    console.log("\nInserting 14 interactions...");
    for (const i of interactions) {
      await client.query(
        `INSERT INTO interactions (org_id, type, subject, body, contact_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [orgId, i.type, i.subject, i.body, contactIds[i.contactIdx]]
      );
      console.log(`  + Interaction: [${i.type}] ${i.subject}`);
    }

    // ------------------------------------------------------------------
    // 4. Templates
    // ------------------------------------------------------------------
    console.log("\nInserting 5 email templates...");
    const templateIds = [];
    for (const t of templates) {
      const res = await client.query(
        `INSERT INTO templates (org_id, name, subject, body, category, variables, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, now())
         RETURNING id`,
        [orgId, t.name, t.subject, t.body, t.category, t.variables]
      );
      templateIds.push(res.rows[0].id);
      console.log(`  + Template: ${t.name} (${t.category})`);
    }

    // ------------------------------------------------------------------
    // 5. Campaigns (link first campaign to "Follow-up After Demo" template)
    // ------------------------------------------------------------------
    console.log("\nInserting 3 campaigns...");
    const campaignIds = [];
    for (let idx = 0; idx < campaigns.length; idx++) {
      const c = campaigns[idx];
      const tplId = idx === 0 ? templateIds[1] : idx === 1 ? templateIds[2] : templateIds[0];
      const res = await client.query(
        `INSERT INTO campaigns (org_id, name, description, status, template_id, updated_at)
         VALUES ($1, $2, $3, $4, $5, now())
         RETURNING id`,
        [orgId, c.name, c.description, c.status, tplId]
      );
      campaignIds.push(res.rows[0].id);
      console.log(`  + Campaign: ${c.name} (${c.status})`);
    }

    // ------------------------------------------------------------------
    // 6. Emails
    // ------------------------------------------------------------------
    console.log("\nInserting 8 emails...");
    for (const e of emailsData) {
      const contact = contacts[e.contactIdx];
      const campaignId = e.campaignIdx !== undefined ? campaignIds[e.campaignIdx] : null;
      const sentAt = e.status === "sent" ? "now()" : null;

      await client.query(
        `INSERT INTO emails (org_id, contact_id, contact_name, contact_email, subject, body, tone, status, sent_at, campaign_id, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ${sentAt ? "now()" : "NULL"}, $9, now())`,
        [
          orgId,
          contactIds[e.contactIdx],
          contact.name,
          contact.email,
          e.subject,
          e.body,
          e.tone,
          e.status,
          campaignId,
        ]
      );
      console.log(`  + Email: [${e.status}] "${e.subject}" -> ${contact.name}`);
    }

    // ------------------------------------------------------------------
    // Done
    // ------------------------------------------------------------------
    console.log("\n--- Seed complete! ---");
    console.log(`  Org:          ${orgId}`);
    console.log(`  Contacts:     ${contactIds.length}`);
    console.log(`  Deals:        ${deals.length}`);
    console.log(`  Interactions: ${interactions.length}`);
    console.log(`  Templates:    ${templates.length}`);
    console.log(`  Campaigns:    ${campaigns.length}`);
    console.log(`  Emails:       ${emailsData.length}`);

  } catch (err) {
    console.error("\nSeed failed:", err.message);
    throw err;
  } finally {
    await client.end();
    console.log("\nDatabase connection closed.");
  }
}

main().catch(() => process.exit(1));
