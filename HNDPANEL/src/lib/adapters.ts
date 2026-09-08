import {
  Patient,
  PriorityStatus,
  SocratesField,
  MedicalHistoryItem,
  LabResult,
  ExtractedDrug,
  TranscriptItem,
  PrescriptionItem,
} from '../types/clinical';
import { ClinicalSummary, ConsultationQueueItem, UploadedDocument } from '../types/api';

export function mapStatusToPriority(status: string, riskLevel: string): PriorityStatus {
  if (status === 'complete') return 'Completed';
  if (riskLevel === 'high_risk' || riskLevel === 'emergency') return 'Urgent';
  if (status === 'waiting_triage') return 'Waiting';
  if (status === 'in_queue' || status === 'call') return 'History Ready';
  return 'Waiting';
}

const formatSocratesField = (
  rawField?: any,
  fallbackConfidence?: 'High' | 'Verify' | 'Critical'
): SocratesField => {
  if (!rawField) {
    return {
      label: 'Not recorded',
      value: 'Not recorded',
      confidence: fallbackConfidence || 'Verify',
    };
  }

  if (typeof rawField === 'object' && rawField !== null) {
    const val = rawField.value || rawField.text || rawField.label || 'Not recorded';
    const conf = rawField.confidence || fallbackConfidence || (val !== 'Not recorded' ? 'High' : 'Verify');
    return {
      label: val,
      value: val,
      confidence: conf,
    };
  }

  const strVal = String(rawField);
  return {
    label: strVal,
    value: strVal,
    confidence: fallbackConfidence || (strVal && strVal !== 'Not recorded' ? 'High' : 'Verify'),
  };
};

export function mapQueueItemToPatient(
  item: ConsultationQueueItem,
  summary?: ClinicalSummary | null,
  reports: UploadedDocument[] = []
): Patient {
  const initials = item.full_name
    ? item.full_name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'PT';

  const mappedDocuments = reports.map((doc) => {
    const rawPath = doc.file_path_hash || '';
    const fileName = rawPath.split('/').pop() || doc.document_type || 'Document';
    const isImg =
      rawPath.endsWith('.png') ||
      rawPath.endsWith('.jpg') ||
      rawPath.endsWith('.jpeg') ||
      rawPath.endsWith('.webp');

    return {
      id: doc.id,
      name: fileName,
      date: doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recorded',
      type: (isImg ? 'image' : 'pdf') as 'pdf' | 'image',
      size: doc.extracted_data?.file_size || 'Attached Report',
      url: rawPath,
      filePath: rawPath,
      status: doc.status,
    };
  });

  // Extract SOCRATES from any available AI summary structure
  const rawSocrates =
    summary?.socrates ||
    summary?.ai_payload?.socrates ||
    summary?.ayush_attributes?.socrates ||
    {};

  const socratesGrid = {
    site: formatSocratesField(rawSocrates.site, rawSocrates.site_confidence),
    onset: formatSocratesField(rawSocrates.onset, rawSocrates.onset_confidence),
    character: formatSocratesField(rawSocrates.character, rawSocrates.character_confidence),
    radiation: formatSocratesField(rawSocrates.radiation, rawSocrates.radiation_confidence),
    associated: formatSocratesField(
      rawSocrates.associated || summary?.history_of_present_illness,
      rawSocrates.associated_confidence
    ),
    timing: formatSocratesField(rawSocrates.timing, rawSocrates.timing_confidence),
    aggravating: formatSocratesField(
      rawSocrates.aggravating || rawSocrates.exacerbating,
      rawSocrates.aggravating_confidence
    ),
    relieving: formatSocratesField(rawSocrates.relieving, rawSocrates.relieving_confidence),
    severity: formatSocratesField(rawSocrates.severity, rawSocrates.severity_confidence),
  };

  // Parse Medical History
  let parsedHistory: MedicalHistoryItem[] = [];
  const rawHistory = summary?.past_medical_history || summary?.ai_payload?.medical_history;
  if (Array.isArray(rawHistory)) {
    parsedHistory = rawHistory.map((m: any) => ({
      category: m.category || 'General',
      condition: m.condition || m.title || String(m),
      since: m.since || m.year || 'Recorded',
      status: m.status || 'Active',
      notes: m.notes || '',
    }));
  } else if (rawHistory && typeof rawHistory === 'object') {
    parsedHistory = Object.entries(rawHistory).map(([key, val]: [string, any]) => ({
      category: key,
      condition: typeof val === 'string' ? val : val?.condition || key,
      since: val?.since || 'Recorded',
      status: val?.status || 'Active',
      notes: val?.notes || '',
    }));
  }

  // Parse Lab Results from summary or reports
  let parsedLabs: LabResult[] = [];
  const rawLabs =
    summary?.ai_payload?.labs ||
    summary?.ayush_attributes?.labs ||
    reports.flatMap((r) => (Array.isArray(r.extracted_data?.labs) ? r.extracted_data.labs : []));

  if (Array.isArray(rawLabs)) {
    parsedLabs = rawLabs.map((l: any) => ({
      investigation: l.investigation || l.test_name || l.name || 'Laboratory Test',
      result: String(l.result || l.value || 'Normal'),
      reference: l.reference || l.reference_range || l.normal_range || 'Normal Range',
      status: (l.status as any) || 'Normal',
      date: l.date || (summary?.generated_at ? new Date(summary.generated_at).toLocaleDateString() : 'Current Visit'),
    }));
  }

  // Parse AI Extractions
  let parsedExtractions: ExtractedDrug[] = [];
  const rawExtractions =
    summary?.ai_payload?.medications ||
    summary?.ayush_attributes?.extractions ||
    reports.flatMap((r) =>
      Array.isArray(r.extracted_data?.medications) ? r.extracted_data.medications : []
    );

  if (Array.isArray(rawExtractions)) {
    parsedExtractions = rawExtractions.map((e: any) => ({
      drug: e.drug || e.name || e.drugName || 'Medication',
      dosage: e.dosage || 'Standard Dosage',
      frequency: e.frequency || 'Once daily',
      confidence: typeof e.confidence === 'number' ? e.confidence : 90,
      status: e.status || (e.confidence && e.confidence > 80 ? 'Verified' : 'Verify'),
    }));
  }

  // Parse Transcripts
  let parsedTranscripts: TranscriptItem[] = [];
  const rawTranscripts =
    summary?.ai_payload?.transcripts ||
    summary?.ayush_attributes?.transcripts ||
    summary?.ai_payload?.dialogue;

  if (Array.isArray(rawTranscripts) && rawTranscripts.length > 0) {
    parsedTranscripts = rawTranscripts.map((t: any, idx: number) => ({
      id: t.id || `transcript-${item.id}-${idx}`,
      speaker: t.speaker === 'user' || t.speaker === 'patient' ? 'patient' : 'bot',
      text: t.text || t.message || '',
      audioUrl: t.audioUrl || t.audio_url,
      audioDuration: t.audioDuration || t.duration,
    }));
  } else if (summary?.chief_complaint) {
    parsedTranscripts = [
      {
        id: `t-intro-${item.id}`,
        speaker: 'bot',
        text: 'Namaste! Please describe the symptoms or health concerns you are experiencing today.',
      },
      {
        id: `t-resp-${item.id}`,
        speaker: 'patient',
        text: summary.chief_complaint,
      },
    ];
  }

  // Parse Prescriptions
  let parsedPrescriptions: PrescriptionItem[] = [];
  const rawPrescriptions =
    summary?.medications ||
    summary?.ai_payload?.prescriptions ||
    summary?.ayush_attributes?.prescriptions;

  if (Array.isArray(rawPrescriptions)) {
    parsedPrescriptions = rawPrescriptions.map((rx: any, idx: number) => ({
      id: rx.id || `rx-${item.id}-${idx}`,
      drugName: rx.drugName || rx.name || 'Prescription Drug',
      dosage: rx.dosage || 'As directed',
      frequency: rx.frequency || '1-0-1',
      duration: rx.duration || '5 Days',
      instructions: rx.instructions || 'Take as advised by physician',
    }));
  }

  const patientAge = (item as any).age || summary?.ai_payload?.age || summary?.ayush_attributes?.age || 0;
  const patientGender =
    (item as any).gender || summary?.ai_payload?.gender || summary?.ayush_attributes?.gender || 'Other';
  const uhidVal =
    (item as any).uhid || (item.id ? `UHID-${item.id.slice(0, 8).toUpperCase()}` : 'Not Assigned');
  const deptVal =
    (item as any).department || summary?.ai_payload?.department || 'General Medicine / OPD';

  return {
    id: item.id,
    tokenNumber: item.token_number,
    name: item.full_name,
    initials,
    age: patientAge,
    gender: patientGender,
    uhid: uhidVal,
    department: deptVal,
    chiefComplaint: summary?.chief_complaint || 'Intake recorded at kiosk',
    complaintConfidence: item.risk_level === 'high_risk' || item.risk_level === 'emergency' ? 'Critical' : 'High',
    priority: mapStatusToPriority(item.status, item.risk_level),
    abhaLinked: Boolean(
      (item as any).abha_number ||
      summary?.ai_payload?.abha_number ||
      summary?.ayush_attributes?.abha_number
    ),
    alertMessage:
      item.risk_level === 'high_risk' || item.risk_level === 'emergency'
        ? 'High Risk Triage Flagged by Intake Kiosk'
        : undefined,
    createdAt: (item as any).created_at || summary?.generated_at,
    socrates: socratesGrid,
    labs: parsedLabs,
    documents: mappedDocuments,
    extractions: parsedExtractions,
    transcripts: parsedTranscripts,
    medicalHistory: parsedHistory,
    prescriptions: parsedPrescriptions,
  };
}
