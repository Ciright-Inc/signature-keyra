import type { AuthenticatedIdentity } from "@/lib/types/documentSignature";

/** Local full-stack testing without auth backend (never in production). */
export function devBypassIdentity(): AuthenticatedIdentity | null {
  if (process.env.NODE_ENV === "production") return null;
  if (process.env.SIGNATURERS_DEV_BYPASS_AUTH !== "true") return null;

  const uid =
    process.env.SIGNATURERS_DEV_UID?.trim() || "keyra-uid-dev-signaturers-local";
  const displayName = process.env.SIGNATURERS_DEV_DISPLAY_NAME?.trim() || "Dev Vault User";

  return {
    uid,
    phone_e164: "+353000000000",
    display_name: displayName,
    eid_mappings: [
      {
        eid: `${uid}-eid-ciright-ie`,
        world_id: "world-ciright-ie",
        world_name: "Ciright Ireland",
        person_display_name: displayName,
        role_types: ["employee", "subscriber"],
      },
      {
        eid: `${uid}-eid-vendor`,
        world_id: "world-ciright-vendor",
        world_name: "Ciright Vendor World",
        person_display_name: displayName,
        role_types: ["management", "signer"],
      },
      {
        eid: `${uid}-eid-customer`,
        world_id: "world-customer-portal",
        world_name: "Customer Portal World",
        person_display_name: displayName,
        role_types: ["customer"],
      },
    ],
  };
}
