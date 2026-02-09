'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";

export default function TechnicalQuestionPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to login if user is not authenticated
        router.push(`/${locale}/login`);
        return;
      }

      setUser(user);
    };
    checkUser();
  }, [locale, router]);


  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4">Technical Questions</h1>
        <p className="text-lg text-gray-600 mb-8">
          This page is under development. Check back soon!
        </p>
      </div>
    </div>
  );
}
