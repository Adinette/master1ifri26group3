function isBuildTime() {
	return (
		process.env.npm_lifecycle_event === 'build' ||
		process.env.NEXT_PHASE === 'phase-production-build' ||
		process.env.__NEXT_PRIVATE_BUILD_WORKER === '1' ||
		process.argv.join(' ').includes('next build')
	)
}

async function ensureConsumerStarted() {
	if (isBuildTime()) {
		return
	}

	const { startConsumer } = await import('../../lib/consumer')
	void startConsumer()
}

export async function GET() {
	await ensureConsumerStarted()
	return Response.json({
		service: 'notification-service',
		status: 'ok',
		timestamp: new Date().toISOString(),
	})
}