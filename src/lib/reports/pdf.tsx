import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ReportRecord } from '@/lib/reports/store'
import type { StormEvent } from '@/lib/storms/mock-data'

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 11, fontFamily: 'Helvetica' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#1e293b' },
  subtitle: { fontSize: 12, color: '#64748b', marginBottom: 20 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#0f172a' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { color: '#64748b', fontSize: 10 },
  value: { color: '#0f172a', fontWeight: 600 },
  callout: { marginTop: 10, padding: 14, borderRadius: 6, backgroundColor: '#f1f5f9' },
  mapBox: { marginTop: 10, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6 },
  listItem: { marginBottom: 4, fontSize: 10, color: '#334155' },
  footer: { marginTop: 28, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10, color: '#94a3b8', fontSize: 9 },
})

function miles(meters: number | null) {
  if (meters == null) return 'N/A'
  return `${(meters / 1609.34).toFixed(1)} mi`
}

function stormDescription(event: StormEvent): string {
  if (event.ai_explanation) return event.ai_explanation
  const type = event.type === 'hail' ? 'Hail' : 'Wind'
  const parts = [`${type} storm with severity score ${event.severityScore}/100.`]
  if (event.type === 'hail' && event.maxHailSizeIn != null) {
    parts.push(`Maximum hail size ${event.maxHailSizeIn}".`)
  }
  if (event.type === 'wind' && event.maxWindSpeedMph != null) {
    parts.push(`Wind gusts up to ${event.maxWindSpeedMph} mph.`)
  }
  parts.push(`Impact window: ${new Date(event.startTime).toLocaleString()} – ${new Date(event.endTime).toLocaleString()}.`)
  return parts.join(' ')
}

export function StormReportDocument({ report, event }: { report: ReportRecord; event: StormEvent }) {
  const generatedAt = new Date(report.createdAt)
  const start = new Date(event.startTime)
  const end = new Date(event.endTime)
  const impactStatement = report.impacted
    ? 'This location falls within a confirmed storm impact zone based on polygon analysis.'
    : `This location is outside confirmed impact zones. Nearest confirmed zone is approximately ${miles(report.distanceToPolygonM)} away.`

  const neighborhoods = Array.from(
    new Set(event.polygons.flatMap((p) => p.impactedNeighborhoods || []))
  ).slice(0, 15)

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>Storm Impact Verification Report</Text>
        <Text style={styles.subtitle}>{report.address}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storm Description</Text>
          <View style={styles.callout}>
            <Text>{stormDescription(event)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storm Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Impact window</Text>
            <Text style={styles.value}>{`${start.toLocaleString()} – ${end.toLocaleString()}`}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Storm type</Text>
            <Text style={styles.value}>{event.type.toUpperCase()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Severity score</Text>
            <Text style={styles.value}>{event.severityScore} / 100</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Max hail size</Text>
            <Text style={styles.value}>{event.maxHailSizeIn ? `${event.maxHailSizeIn}"` : 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Max wind speed</Text>
            <Text style={styles.value}>{event.maxWindSpeedMph ? `${event.maxWindSpeedMph} mph` : 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Impact polygons</Text>
            <Text style={styles.value}>{event.polygons.length}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Impacted areas</Text>
            <Text style={styles.value}>{event.impactedAreaCount}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impact Statement</Text>
          <View style={styles.callout}>
            <Text>{impactStatement}</Text>
          </View>
          <View style={{ marginTop: 8 }}>
            <Text style={styles.label}>Coordinates</Text>
            <Text style={styles.value}>{`${report.lat.toFixed(5)}, ${report.lon.toFixed(5)}`}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Map Areas</Text>
          <View style={styles.mapBox}>
            <Text style={[styles.label, { marginBottom: 6 }]}>Storm centroid</Text>
            <Text style={styles.value}>{`${event.centroid.lat.toFixed(4)}, ${event.centroid.lng.toFixed(4)}`}</Text>
            {neighborhoods.length > 0 && (
              <>
                <Text style={[styles.label, { marginTop: 10, marginBottom: 4 }]}>Impacted neighborhoods</Text>
                {neighborhoods.map((n, i) => (
                  <Text key={i} style={styles.listItem}>• {n}</Text>
                ))}
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Metadata</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Report ID</Text>
            <Text style={styles.value}>{report.id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Generated</Text>
            <Text style={styles.value}>{generatedAt.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          TempestIQ Storm Intelligence & Proof System · {generatedAt.toISOString()}
        </Text>
      </Page>
    </Document>
  )
}
