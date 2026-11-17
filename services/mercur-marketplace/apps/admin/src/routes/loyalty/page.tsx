import { useEffect, useState } from "react"

export const config = {
  label: "Programma premi",
}

const LoyaltyAdminPage = () => {
  const [plans, setPlans] = useState("Caricamento…")
  const [ledger, setLedger] = useState("")
  const [planId, setPlanId] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch("/admin/loyalty/plans", { credentials: "include" })
      .then((response) => response.text())
      .then(setPlans)
      .catch((error) => setPlans(String(error)))
    fetch("/admin/loyalty/ledger", { credentials: "include" })
      .then((response) => response.text())
      .then(setLedger)
      .catch((error) => setLedger(String(error)))
  }, [])

  return (
    <div style={{ padding: 24, display: "grid", gap: 16 }}>
      <h1>Piani e ledger</h1>
      <p>
        Le bozze si approvano solo da un altro operatore. Lo sconto in checkout è credito
        WheBack, non un rimborso in denaro.
      </p>
      <form
        onSubmit={async (event) => {
          event.preventDefault()
          const response = await fetch("/admin/loyalty/plans", {
            method: "PUT",
            credentials: "include",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ id: planId }),
          })
          setMessage(await response.text())
        }}
      >
        <label>
          Id piano da approvare{" "}
          <input value={planId} onChange={(event) => setPlanId(event.target.value)} />
        </label>
        <button type="submit">Approva</button>
      </form>
      {message ? <pre>{message}</pre> : null}
      <h2>Piani</h2>
      <pre style={{ whiteSpace: "pre-wrap" }}>{plans}</pre>
      <h2>Ledger</h2>
      <pre style={{ whiteSpace: "pre-wrap" }}>{ledger}</pre>
    </div>
  )
}

export default LoyaltyAdminPage
