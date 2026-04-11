export async function GET() {
  let kong = false
  let rabbitmq = false

  try {
    const res = await fetch("http://localhost:8001/status", { cache: "no-store" })
    const data = await res.json()
    kong = data?.database?.reachable === true
  } catch {}

  try {
    const res = await fetch("http://localhost:15672/api/overview", {
      headers: {
        Authorization: "Basic " + Buffer.from("guest:guest").toString("base64")
      },
      cache: "no-store"
    })
    rabbitmq = res.ok
  } catch {}

  return Response.json({ kong, rabbitmq })
}