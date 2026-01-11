// app/upload/page.jsx
import UploadWizard from "../../app/components/UploadWizard";

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 py-12">
      <UploadWizard />
    </main>
  );
}