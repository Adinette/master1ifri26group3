export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({
    status: 'Compatibility route active',
    message: 'The production consumer is now decoupled from the Next build.',
  })
}