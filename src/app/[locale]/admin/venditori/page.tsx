import { createClient, createAdminClient } from "@/lib/supabase/server";

import { revalidatePath } from "next/cache";

import { CheckCircle, XCircle, Mail, FileCheck } from "lucide-react";

import Link from "next/link";

import { markContractReceived } from "@/lib/seller/invitation-actions";



async function approveSeller(sellerId: string, locale: string) {

  "use server";

  const supabase = await createClient();

  const admin = await createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();

  await admin.from("seller_profiles").update({

    is_active: true,

    approved_at: new Date().toISOString(),

    approved_by: user!.id,

  }).eq("id", sellerId);

  revalidatePath(`/${locale}/admin/venditori`);

}



async function rejectSeller(sellerId: string, locale: string) {

  "use server";

  const supabase = await createClient();

  const admin = await createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();

  await admin.from("seller_profiles").update({

    is_active: false,

    rejected_at: new Date().toISOString(),

    rejected_by: user!.id,

  }).eq("id", sellerId);

  revalidatePath(`/${locale}/admin/venditori`);

}



export default async function AdminVenditoriPage({

  params,

}: {

  params: Promise<{ locale: string }>;

}) {

  const { locale } = await params;

  const admin = await createAdminClient();



  const { data: sellers } = await admin

    .from("seller_profiles")

    .select(

      "id, company_name, vat_number, contact_name, contact_email, contact_phone, product_categories, is_active, approved_at, rejected_at, terms_accepted_at, contract_accepted_at, contract_signed_received_at, supplier_country, delivery_sla_days, user_id"

    )

    .order("created_at", { ascending: false });



  return (

    <div className="p-8">

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">

        <div>

          <h1 className="text-2xl font-black" style={{ color: "#253866" }}>Gestione Partner</h1>

          <p className="text-gray-400 text-sm mt-1">{sellers?.length ?? 0} candidature</p>

        </div>

        <Link

          href={`/${locale}/admin/venditori/inviti`}

          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold"

          style={{ backgroundColor: "#00b295" }}

        >

          <Mail className="w-4 h-4" /> Invita nuovo fornitore

        </Link>

      </div>



      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">

        {!sellers || sellers.length === 0 ? (

          <div className="p-16 text-center text-gray-400 text-sm">Nessuna candidatura ancora.</div>

        ) : (

          <table className="w-full text-sm min-w-[900px]">

            <thead>

              <tr className="border-b border-gray-100">

                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Azienda</th>

                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Contatto</th>

                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Contratto</th>

                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Stato</th>

                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Azioni</th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-50">

              {sellers.map((seller) => (

                <tr key={seller.id} className="hover:bg-gray-50 align-top">

                  <td className="px-4 py-4">

                    <p className="font-semibold" style={{ color: "#253866" }}>{seller.company_name}</p>

                    <p className="text-xs text-gray-400">{seller.vat_number || "—"} · {seller.product_categories || "—"}</p>

                    <p className="text-xs text-gray-400">{seller.supplier_country || "IT"} · SLA {seller.delivery_sla_days ?? 5}gg</p>

                  </td>

                  <td className="px-4 py-4 text-xs text-gray-500">

                    <p>{seller.contact_name || "—"}</p>

                    <p>{seller.contact_email || "—"}</p>

                    <p>{seller.contact_phone || "—"}</p>

                  </td>

                  <td className="px-4 py-4 text-xs text-gray-500">

                    <p>Digitale: {seller.contract_accepted_at ? new Date(seller.contract_accepted_at).toLocaleDateString("it-IT") : "—"}</p>

                    <p className={seller.contract_signed_received_at ? "text-emerald-600 font-bold" : "text-amber-600"}>

                      Firmato: {seller.contract_signed_received_at ? "Ricevuto" : "In attesa PDF"}

                    </p>

                  </td>

                  <td className="px-4 py-4">

                    {seller.is_active ? (

                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"

                        style={{ backgroundColor: "rgba(0,178,149,0.1)", color: "#00b295" }}>

                        Attivo

                      </span>

                    ) : seller.rejected_at ? (

                      <span className="text-xs font-bold px-2.5 py-1 rounded-full text-red-500 bg-red-50">

                        Rifiutato

                      </span>

                    ) : (

                      <span className="text-xs font-bold px-2.5 py-1 rounded-full text-amber-600 bg-amber-50">

                        In attesa

                      </span>

                    )}

                  </td>

                  <td className="px-4 py-4">

                    <div className="flex flex-col gap-2">

                      {!seller.is_active && !seller.rejected_at && (

                        <>

                          <form action={approveSeller.bind(null, seller.id, locale)}>

                            <button type="submit"

                              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg text-white w-full"

                              style={{ backgroundColor: "#00b295" }}>

                              <CheckCircle className="w-3 h-3" /> Approva partner

                            </button>

                          </form>

                          <form action={rejectSeller.bind(null, seller.id, locale)}>

                            <button type="submit"

                              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg text-white w-full"

                              style={{ backgroundColor: "#ef4444" }}>

                              <XCircle className="w-3 h-3" /> Rifiuta

                            </button>

                          </form>

                        </>

                      )}

                      {!seller.contract_signed_received_at && (

                        <form action={markContractReceived.bind(null, seller.id, locale)}>

                          <button type="submit"

                            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border w-full">

                            <FileCheck className="w-3 h-3" /> Segna contratto ricevuto

                          </button>

                        </form>

                      )}

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>

  );

}

