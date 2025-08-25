// app/email-template/page.tsx
import WelcomeEmail from '@/components/email/welcome-email';

export default function Page({
  searchParams,
}: {
  searchParams: { firstName?: string };
}) {
  const firstName = searchParams?.firstName ?? 'Michael';
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-[600px] bg-white p-6 shadow">
        <WelcomeEmail firstName={firstName} />
      </div>
    </div>
  );
}