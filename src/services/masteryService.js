import { supabase } from "../supabase/config";

export async function getMasteryCertificates() {
  const [{ data: certificates, error: certificateError }, { data: profiles, error: profileError }] =
    await Promise.all([
      supabase.from("mastery_certificates")
        .select("id,user_id,certificate_type,certificate_number,criteria_snapshot,is_official_lto,issued_at")
        .order("issued_at", { ascending: false }),
      supabase.from("profiles").select("id,full_name,first_name,last_name,email"),
    ]);

  if (certificateError) throw certificateError;
  if (profileError) throw profileError;
  const learners = new Map((profiles || []).map((profile) => [profile.id, profile]));

  return (certificates || []).map((certificate) => {
    const learner = learners.get(certificate.user_id) || {};
    const joinedName = `${learner.first_name || ""} ${learner.last_name || ""}`.trim();
    return {
      ...certificate,
      learnerName: learner.full_name || joinedName || "Unknown learner",
      learnerEmail: learner.email || "No email available",
    };
  });
}
