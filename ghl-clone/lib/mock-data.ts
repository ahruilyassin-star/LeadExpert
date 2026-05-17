export const contacts = [
  { id: "1", name: "Fatima Al-Hassan", email: "fatima@example.com", phone: "+31 6 12345678", tags: ["Lead", "Hot"], stage: "New Lead", source: "Facebook", lastActivity: "2026-05-16", value: 1200 },
  { id: "2", name: "Yusuf Bakr", email: "yusuf.bakr@email.nl", phone: "+31 6 23456789", tags: ["Customer"], stage: "Won", source: "Website", lastActivity: "2026-05-15", value: 850 },
  { id: "3", name: "Aisha Mohammed", email: "aisha.m@gmail.com", phone: "+32 4 87654321", tags: ["Lead"], stage: "Contacted", source: "Instagram", lastActivity: "2026-05-14", value: 600 },
  { id: "4", name: "Omar Khalid", email: "omar.k@outlook.com", phone: "+31 6 34567890", tags: ["Customer", "VIP"], stage: "Won", source: "Referral", lastActivity: "2026-05-13", value: 2400 },
  { id: "5", name: "Mariam Tahir", email: "mariam.t@hotmail.com", phone: "+33 6 12345678", tags: ["Lead"], stage: "Proposal Sent", source: "Google", lastActivity: "2026-05-12", value: 950 },
  { id: "6", name: "Ibrahim Diallo", email: "i.diallo@email.com", phone: "+31 6 45678901", tags: ["Lead", "Warm"], stage: "Negotiation", source: "Facebook", lastActivity: "2026-05-11", value: 1500 },
  { id: "7", name: "Khadija Osman", email: "khadija.o@gmail.com", phone: "+32 4 76543210", tags: ["Unsubscribed"], stage: "Lost", source: "Email", lastActivity: "2026-05-10", value: 0 },
  { id: "8", name: "Hassan Nour", email: "hassan.n@yahoo.com", phone: "+31 6 56789012", tags: ["Customer"], stage: "Won", source: "Website", lastActivity: "2026-05-09", value: 3200 },
  { id: "9", name: "Zainab Ali", email: "zainab.ali@email.nl", phone: "+49 152 12345678", tags: ["Lead"], stage: "New Lead", source: "TikTok", lastActivity: "2026-05-08", value: 450 },
  { id: "10", name: "Mustafa Yilmaz", email: "mustafa.y@gmail.com", phone: "+31 6 67890123", tags: ["Lead", "Hot"], stage: "Contacted", source: "Facebook", lastActivity: "2026-05-07", value: 780 },
  { id: "11", name: "Nadia Benali", email: "nadia.b@hotmail.fr", phone: "+33 6 98765432", tags: ["Customer"], stage: "Won", source: "Referral", lastActivity: "2026-05-06", value: 1100 },
  { id: "12", name: "Bilal Mansour", email: "bilal.m@email.com", phone: "+31 6 78901234", tags: ["Lead"], stage: "Proposal Sent", source: "Google", lastActivity: "2026-05-05", value: 650 },
  { id: "13", name: "Samira Houari", email: "samira.h@gmail.com", phone: "+32 4 65432109", tags: ["Lead", "Warm"], stage: "New Lead", source: "Instagram", lastActivity: "2026-05-04", value: 320 },
  { id: "14", name: "Tariq Rahman", email: "tariq.r@outlook.com", phone: "+31 6 89012345", tags: ["Customer", "VIP"], stage: "Won", source: "Website", lastActivity: "2026-05-03", value: 4500 },
  { id: "15", name: "Leila Aziz", email: "leila.a@email.nl", phone: "+49 160 87654321", tags: ["Lead"], stage: "Contacted", source: "Facebook", lastActivity: "2026-05-02", value: 590 },
  { id: "16", name: "Karim Boudiaf", email: "karim.b@gmail.com", phone: "+33 6 45678901", tags: ["Lead"], stage: "Negotiation", source: "Google Ads", lastActivity: "2026-05-01", value: 2100 },
  { id: "17", name: "Amina Sow", email: "amina.sow@email.com", phone: "+31 6 90123456", tags: ["Customer"], stage: "Won", source: "Referral", lastActivity: "2026-04-30", value: 870 },
  { id: "18", name: "Ridwan Patel", email: "ridwan.p@yahoo.com", phone: "+44 7700 900123", tags: ["Lead", "Cold"], stage: "New Lead", source: "Email", lastActivity: "2026-04-29", value: 250 },
  { id: "19", name: "Houda El-Amine", email: "houda.e@gmail.com", phone: "+32 4 54321098", tags: ["Lead"], stage: "Contacted", source: "TikTok", lastActivity: "2026-04-28", value: 430 },
  { id: "20", name: "Nassim Cherif", email: "nassim.c@email.nl", phone: "+31 6 01234567", tags: ["Customer"], stage: "Won", source: "Website", lastActivity: "2026-04-27", value: 1650 },
];

export const conversations = [
  {
    id: "1", contact: "Fatima Al-Hassan", avatar: "FA", channel: "SMS", preview: "Hoi! Wanneer kan ik bestellen?", time: "10:32", unread: 2,
    messages: [
      { id: "1", from: "contact", text: "Hoi! Wanneer kan ik de producten bestellen?", time: "10:28" },
      { id: "2", from: "agent", text: "Hallo Fatima! U kunt nu direct bestellen via onze webshop.", time: "10:30" },
      { id: "3", from: "contact", text: "Super! En hoe lang is de levertijd naar België?", time: "10:31" },
      { id: "4", from: "contact", text: "Hoi! Wanneer kan ik bestellen?", time: "10:32" },
    ]
  },
  {
    id: "2", contact: "Yusuf Bakr", avatar: "YB", channel: "Email", preview: "Bedankt voor uw snelle reactie!", time: "09:15", unread: 0,
    messages: [
      { id: "1", from: "agent", text: "Goedemorgen Yusuf, bedankt voor uw bestelling!", time: "08:45" },
      { id: "2", from: "contact", text: "Bedankt voor uw snelle reactie!", time: "09:15" },
    ]
  },
  {
    id: "3", contact: "Aisha Mohammed", avatar: "AM", channel: "Facebook", preview: "Is er een kortingscode beschikbaar?", time: "Gisteren", unread: 1,
    messages: [
      { id: "1", from: "contact", text: "Hallo! Ik zag jullie advertentie op Facebook.", time: "Gisteren 14:20" },
      { id: "2", from: "contact", text: "Is er een kortingscode beschikbaar?", time: "Gisteren 14:22" },
    ]
  },
  {
    id: "4", contact: "Omar Khalid", avatar: "OK", channel: "SMS", preview: "Mijn pakket is nog niet aangekomen", time: "Gisteren", unread: 3,
    messages: [
      { id: "1", from: "contact", text: "Goedemorgen, ik heb op 12 mei besteld.", time: "Gisteren 11:00" },
      { id: "2", from: "contact", text: "Mijn pakket is nog niet aangekomen", time: "Gisteren 11:05" },
      { id: "3", from: "agent", text: "Hallo Omar, excuses voor het ongemak. Ik ga dit direct natrekken.", time: "Gisteren 11:30" },
    ]
  },
  {
    id: "5", contact: "Mariam Tahir", avatar: "MT", channel: "Instagram", preview: "Zijn de arabische letters ook magnetisch?", time: "Ma", unread: 0,
    messages: [
      { id: "1", from: "contact", text: "Zijn de arabische letters ook magnetisch?", time: "Ma 16:00" },
      { id: "2", from: "agent", text: "Ja! Al onze Arabic Letter sets zijn magnetisch en veilig voor kinderen.", time: "Ma 16:30" },
    ]
  },
  {
    id: "6", contact: "Ibrahim Diallo", avatar: "ID", channel: "Email", preview: "Graag een offerte voor 5 sets", time: "Ma", unread: 0,
    messages: [
      { id: "1", from: "contact", text: "Graag een offerte voor 5 sets arabic letters", time: "Ma 09:15" },
    ]
  },
  {
    id: "7", contact: "Hassan Nour", avatar: "HN", channel: "SMS", preview: "Top product! Wij bestellen opnieuw", time: "Zo", unread: 0,
    messages: [
      { id: "1", from: "contact", text: "Top product! Wij bestellen opnieuw", time: "Zo 13:45" },
      { id: "2", from: "agent", text: "Dank u Hassan! Fijn te horen. Gebruik code TERUG10 voor 10% korting!", time: "Zo 14:00" },
    ]
  },
  {
    id: "8", contact: "Zainab Ali", avatar: "ZA", channel: "Facebook", preview: "Leveren jullie ook naar Duitsland?", time: "Zo", unread: 1,
    messages: [
      { id: "1", from: "contact", text: "Leveren jullie ook naar Duitsland?", time: "Zo 10:20" },
    ]
  },
  {
    id: "9", contact: "Nadia Benali", avatar: "NB", channel: "Email", preview: "Bedankt! 5 sterren review geplaatst", time: "Za", unread: 0,
    messages: [
      { id: "1", from: "contact", text: "Bedankt! 5 sterren review geplaatst op Trustpilot", time: "Za 15:30" },
    ]
  },
  {
    id: "10", contact: "Tariq Rahman", avatar: "TR", channel: "SMS", preview: "Wanneer komt de nieuwe collectie?", time: "Vr", unread: 0,
    messages: [
      { id: "1", from: "contact", text: "Wanneer komt de nieuwe collectie voor Eid?", time: "Vr 11:00" },
      { id: "2", from: "agent", text: "Hoi Tariq! De Eid collectie lanceert 1 juni. Wil je een early access notificatie?", time: "Vr 11:30" },
    ]
  },
];

export const appointments = [
  { id: "1", title: "Intake gesprek - Fatima Al-Hassan", contact: "Fatima Al-Hassan", date: "2026-05-19", time: "10:00", type: "Videocall", duration: 30 },
  { id: "2", title: "Demo - Ibrahim Diallo", contact: "Ibrahim Diallo", date: "2026-05-20", time: "14:00", type: "Telefonisch", duration: 45 },
  { id: "3", title: "Follow-up - Mariam Tahir", contact: "Mariam Tahir", date: "2026-05-21", time: "11:00", type: "Videocall", duration: 30 },
  { id: "4", title: "Offerte bespreking - Karim Boudiaf", contact: "Karim Boudiaf", date: "2026-05-22", time: "15:30", type: "In persoon", duration: 60 },
  { id: "5", title: "Onboarding - Hassan Nour", contact: "Hassan Nour", date: "2026-05-23", time: "09:00", type: "Videocall", duration: 60 },
  { id: "6", title: "Check-in - Omar Khalid", contact: "Omar Khalid", date: "2026-05-26", time: "13:00", type: "Telefonisch", duration: 15 },
  { id: "7", title: "Presentatie - Tariq Rahman", contact: "Tariq Rahman", date: "2026-05-28", time: "10:00", type: "Videocall", duration: 45 },
];

export const deals = [
  { id: "1", contact: "Fatima Al-Hassan", avatar: "FA", stage: "New Lead", value: 1200, days: 2, email: "fatima@example.com" },
  { id: "2", contact: "Zainab Ali", avatar: "ZA", stage: "New Lead", value: 450, days: 1, email: "zainab.ali@email.nl" },
  { id: "3", contact: "Samira Houari", avatar: "SH", stage: "New Lead", value: 320, days: 3, email: "samira.h@gmail.com" },
  { id: "4", contact: "Ridwan Patel", avatar: "RP", stage: "New Lead", value: 250, days: 5, email: "ridwan.p@yahoo.com" },
  { id: "5", contact: "Aisha Mohammed", avatar: "AM", stage: "Contacted", value: 600, days: 4, email: "aisha.m@gmail.com" },
  { id: "6", contact: "Mustafa Yilmaz", avatar: "MY", stage: "Contacted", value: 780, days: 6, email: "mustafa.y@gmail.com" },
  { id: "7", contact: "Leila Aziz", avatar: "LA", stage: "Contacted", value: 590, days: 8, email: "leila.a@email.nl" },
  { id: "8", contact: "Houda El-Amine", avatar: "HE", stage: "Contacted", value: 430, days: 7, email: "houda.e@gmail.com" },
  { id: "9", contact: "Mariam Tahir", avatar: "MT", stage: "Proposal Sent", value: 950, days: 10, email: "mariam.t@hotmail.com" },
  { id: "10", contact: "Bilal Mansour", avatar: "BM", stage: "Proposal Sent", value: 650, days: 12, email: "bilal.m@email.com" },
  { id: "11", contact: "Ibrahim Diallo", avatar: "ID", stage: "Negotiation", value: 1500, days: 15, email: "i.diallo@email.com" },
  { id: "12", contact: "Karim Boudiaf", avatar: "KB", stage: "Negotiation", value: 2100, days: 18, email: "karim.b@gmail.com" },
  { id: "13", contact: "Yusuf Bakr", avatar: "YB", stage: "Won", value: 850, days: 22, email: "yusuf.bakr@email.nl" },
  { id: "14", contact: "Omar Khalid", avatar: "OK", stage: "Won", value: 2400, days: 30, email: "omar.k@outlook.com" },
  { id: "15", contact: "Hassan Nour", avatar: "HN", stage: "Won", value: 3200, days: 45, email: "hassan.n@yahoo.com" },
  { id: "16", contact: "Nadia Benali", avatar: "NB", stage: "Won", value: 1100, days: 28, email: "nadia.b@hotmail.fr" },
  { id: "17", contact: "Tariq Rahman", avatar: "TR", stage: "Won", value: 4500, days: 60, email: "tariq.r@outlook.com" },
  { id: "18", contact: "Amina Sow", avatar: "AS", stage: "Won", value: 870, days: 35, email: "amina.sow@email.com" },
  { id: "19", contact: "Nassim Cherif", avatar: "NC", stage: "Won", value: 1650, days: 40, email: "nassim.c@email.nl" },
  { id: "20", contact: "Khadija Osman", avatar: "KO", stage: "Lost", value: 0, days: 25, email: "khadija.o@gmail.com" },
];

export const campaigns = [
  { id: "1", name: "Eid Al-Adha Campagne 2026", subject: "🌙 Eid Mubarak! Speciale aanbieding voor jou", status: "Sent", sent: 1248, opened: 687, clicked: 312, openRate: 55.1, clickRate: 25.0, date: "2026-05-10" },
  { id: "2", name: "Welkomst Serie - Nieuwe Abonnees", subject: "Welkom bij Little Oummah Familie! 👋", status: "Active", sent: 342, opened: 210, clicked: 98, openRate: 61.4, clickRate: 28.7, date: "2026-05-01" },
  { id: "3", name: "Productlaunch: Magnetisch Alfabet v2", subject: "Nieuw! Arabisch Alfabet Magneten v2 🎉", status: "Sent", sent: 892, opened: 401, clicked: 178, openRate: 44.9, clickRate: 19.9, date: "2026-04-25" },
  { id: "4", name: "Re-engagement: Inactieve Klanten", subject: "We missen je! Hier is 15% korting", status: "Sent", sent: 534, opened: 187, clicked: 54, openRate: 35.0, clickRate: 10.1, date: "2026-04-18" },
  { id: "5", name: "Moederdag Aanbieding", subject: "Moederdag Special - Perfecte cadeau-ideeën 💝", status: "Sent", sent: 1567, opened: 892, clicked: 445, openRate: 56.9, clickRate: 28.4, date: "2026-05-08" },
  { id: "6", name: "Zomer Sale Preview", subject: "Exclusief preview: Zomer Sale start binnenkort!", status: "Draft", sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0, date: "2026-06-01" },
  { id: "7", name: "EU Expansie - Frans Segment", subject: "Découvrez Little Oummah - Livraison gratuite!", status: "Scheduled", sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0, date: "2026-05-25" },
  { id: "8", name: "Trouwe Klanten Reward", subject: "Speciaal voor jou: VIP voordelen 🌟", status: "Sent", sent: 287, opened: 198, clicked: 145, openRate: 69.0, clickRate: 50.5, date: "2026-04-12" },
];

export const workflows = [
  { id: "1", name: "Welkomst Nieuwe Lead", description: "Stuur welkomstberichten naar nieuwe leads", trigger: "Contact aangemaakt", actions: 4, enrolled: 142, lastRun: "2026-05-17 08:30", active: true },
  { id: "2", name: "Verlaten Winkelwagen Follow-up", description: "Herinner klanten aan hun verlaten winkelwagen", trigger: "Winkelwagen verlaten", actions: 3, enrolled: 89, lastRun: "2026-05-17 07:45", active: true },
  { id: "3", name: "Post-Aankoop Review Verzoek", description: "Vraag reviews na succesvolle levering", trigger: "Bestelling geleverd", actions: 2, enrolled: 234, lastRun: "2026-05-16 16:00", active: true },
  { id: "4", name: "Lead Nurturing Sequentie", description: "7-staps email sequentie voor nieuwe leads", trigger: "Tag toegevoegd: Lead", actions: 7, enrolled: 67, lastRun: "2026-05-16 12:00", active: true },
  { id: "5", name: "Heractivering Inactieve Klanten", description: "Win terug klanten die al 30 dagen inactief zijn", trigger: "Geen activiteit 30 dagen", actions: 5, enrolled: 312, lastRun: "2026-05-15 09:00", active: false },
  { id: "6", name: "Verjaardag Felicitatie", description: "Stuur een persoonlijk verjaardagsbericht", trigger: "Verjaardag contact", actions: 2, enrolled: 45, lastRun: "2026-05-17 00:00", active: true },
  { id: "7", name: "Afspraak Herinnering", description: "Stuur herinneringen voor geplande afspraken", trigger: "Afspraak gepland", actions: 3, enrolled: 28, lastRun: "2026-05-16 18:00", active: true },
  { id: "8", name: "Upsell Na Aankoop", description: "Stel aanvullende producten voor na aankoop", trigger: "Aankoop voltooid", actions: 4, enrolled: 156, lastRun: "2026-05-16 14:30", active: false },
];

export const funnels = [
  { id: "1", name: "Arabisch Alfabet Lead Magnet", visits: 3421, optIns: 687, conversions: 312, convRate: 9.1, status: "Active", pages: 3 },
  { id: "2", name: "Productpagina - Bouwblokken", visits: 1892, optIns: 0, conversions: 234, convRate: 12.4, status: "Active", pages: 2 },
  { id: "3", name: "Webinar: Islamitisch Leren voor Kinderen", visits: 987, optIns: 445, conversions: 89, convRate: 9.0, status: "Active", pages: 4 },
  { id: "4", name: "Gratis Gids: 10 Leeraktiviteiten", visits: 2145, optIns: 892, conversions: 178, convRate: 8.3, status: "Active", pages: 2 },
  { id: "5", name: "Kerstpakket Aanbieding 2025", visits: 5678, optIns: 1234, conversions: 567, convRate: 10.0, status: "Paused", pages: 5 },
  { id: "6", name: "EU Launch - Frans", visits: 0, optIns: 0, conversions: 0, convRate: 0, status: "Draft", pages: 1 },
];

export const revenueData = [
  { month: "Nov", revenue: 4200 },
  { month: "Dec", revenue: 7800 },
  { month: "Jan", revenue: 3400 },
  { month: "Feb", revenue: 4100 },
  { month: "Mrt", revenue: 5200 },
  { month: "Apr", revenue: 6800 },
  { month: "Mei", revenue: 8900 },
];

export const leadSources = [
  { name: "Facebook", value: 35 },
  { name: "Website", value: 25 },
  { name: "Instagram", value: 18 },
  { name: "Google", value: 12 },
  { name: "Referral", value: 7 },
  { name: "Overig", value: 3 },
];

export const PIPELINE_STAGES = ["New Lead", "Contacted", "Proposal Sent", "Negotiation", "Won", "Lost"];
