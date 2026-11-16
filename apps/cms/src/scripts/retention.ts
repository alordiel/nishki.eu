/**
 * GDPR retention: deletes contact submissions older than SUBMISSION_RETENTION_MONTHS (default 12).
 * Run daily from cron:  pnpm --filter @nishki/cms retention
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const months = Number(process.env.SUBMISSION_RETENTION_MONTHS || 12)
const cutoff = new Date()
cutoff.setMonth(cutoff.getMonth() - months)

const payload = await getPayload({ config })
const res = await payload.delete({
  collection: 'submissions',
  overrideAccess: true,
  where: { createdAt: { less_than: cutoff.toISOString() } },
})
payload.logger.info(`[retention] deleted ${res.docs.length} submissions older than ${cutoff.toISOString()}`)
process.exit(0)
