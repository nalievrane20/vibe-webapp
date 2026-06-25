import { getRegistrationEvents } from "@/app/actions/admin/registration";
import { RegistrationTable } from "@/components/pages/admin/registrations/registration-table";

export const dynamic = "force-dynamic";

export default async function RegistrationsPage() {
  const events = await getRegistrationEvents();

  return (
    <div>
      <RegistrationTable data={events} />
    </div>
  );
}