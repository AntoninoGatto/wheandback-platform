import { PARTNER_CONTRACT } from "@/constants/partner-contract";

export function buildPartnerInviteEmail(params: {
  companyName: string;
  inviteUrl: string;
  contractUrl: string;
  contactName?: string;
  notes?: string;
}) {
  const greeting = params.contactName ? `Gentile ${params.contactName},` : "Gentile Partner,";
  const companyLine = params.companyName
    ? `Come concordato con ${params.companyName},`
    : "Come concordato,";

  const body = `${greeting}

${companyLine} Buy All Free LTD (Whe&Back®) Le propone di entrare nel nostro marketplace come Partner convenzionato.

PASSAGGI:
1. Apri il link di onboarding (valido 30 giorni):
${params.inviteUrl}

2. Leggi e accetta il Contratto di Convenzionamento:
${params.contractUrl}

3. Crea il tuo account (o accedi) e completa la candidatura in autonomia.

4. Invia il contratto firmato in PDF a: ${PARTNER_CONTRACT.CONTRACT_EMAIL}

REGOLE PRODOTTI (sintesi):
• Solo categorie ammesse e prodotti conformi al regolamento etico Whe&Back®
• Margine minimo 50% sul prezzo di vendita
• Cashback referral 5–35%
• Ogni prodotto passa approvazione prima della pubblicazione

${params.notes ? `Note: ${params.notes}\n\n` : ""}Restiamo a disposizione per qualsiasi chiarimento.

Cordiali saluti,
Team Whe&Back® — Buy All Free LTD`;

  const subject = encodeURIComponent(
    `Invito Partner Whe&Back® — ${params.companyName || "Convenzionamento B2B"}`
  );
  const encodedBody = encodeURIComponent(body);

  return {
    subject: decodeURIComponent(subject),
    body,
    mailto: `mailto:${encodeURIComponent(params.companyName ? "" : "")}?subject=${subject}&body=${encodedBody}`,
  };
}

export function buildPartnerInviteEmailForRecipient(
  recipientEmail: string,
  params: Parameters<typeof buildPartnerInviteEmail>[0]
) {
  const { subject, body } = buildPartnerInviteEmail(params);
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return {
    subject,
    body,
    mailto: `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodedSubject}&body=${encodedBody}`,
  };
}
