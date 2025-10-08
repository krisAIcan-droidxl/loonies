import { Identifiable, Timestamped, Coordinates } from '../shared/base';
import { VerificationStatus } from '../shared/enums';

export interface SafetyCheckIn extends Identifiable, Timestamped {
  user_id: string;
  session_id: string;
  ping_id: string;
  scheduled_at: string;
  due_at: string;
  checked_in_at?: string;
  missed: boolean;
  reminder_sent: boolean;
  emergency_contact_notified: boolean;
}

export interface EmergencyContact extends Identifiable, Timestamped {
  user_id: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  is_primary: boolean;
}

export interface SOSAlert extends Identifiable, Timestamped {
  user_id: string;
  session_id?: string;
  location: Coordinates;
  emergency_contact_notified: boolean;
  admin_notified: boolean;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
}

export interface UserVerification extends Identifiable, Timestamped {
  user_id: string;
  photo_url: string;
  selfie_url: string;
  id_document_url?: string;
  status: VerificationStatus;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  verification_type: 'basic' | 'host';
}

export interface HostVerification extends UserVerification {
  id_document_url: string;
  verification_type: 'host';
  background_check_completed: boolean;
  background_check_passed: boolean;
}

export interface UserReport extends Identifiable, Timestamped {
  reported_user_id: string;
  reporter_id: string;
  session_id?: string;
  ping_id?: string;
  reason: 'harassment' | 'inappropriate' | 'spam' | 'safety_concern' | 'fake_profile' | 'other';
  description: string;
  evidence_urls?: string[];
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  reviewed_at?: string;
  reviewed_by?: string;
  resolution_notes?: string;
  action_taken?: 'warning' | 'temporary_ban' | 'permanent_ban' | 'none';
}

export interface UserBlock extends Identifiable, Timestamped {
  blocker_id: string;
  blocked_id: string;
  reason?: string;
}

export interface CreateReportRequest {
  reported_user_id: string;
  reason: string;
  description: string;
  session_id?: string;
  evidence_urls?: string[];
}

export interface TriggerSOSRequest {
  session_id?: string;
  latitude: number;
  longitude: number;
}
