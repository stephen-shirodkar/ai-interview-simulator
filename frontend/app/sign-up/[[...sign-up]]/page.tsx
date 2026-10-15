import { SignUp } from '@clerk/nextjs';
import { clerkAppearance } from '@/lib/clerkTheme';

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6">
      <SignUp appearance={clerkAppearance} />
    </div>
  );
}
