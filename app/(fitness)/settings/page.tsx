import type { Metadata } from "next";
import { FitnessPage } from "@/components/fitness/page";
import { FitnessSettingsForm } from "@/components/fitness/settings-form";

export const metadata: Metadata = {
  title: "Settings | Meal Eye",
};

export default function SettingsPage() {
  return (
    <FitnessPage title="Settings">
      <FitnessSettingsForm />
    </FitnessPage>
  );
}
