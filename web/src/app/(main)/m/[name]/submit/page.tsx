import { redirect } from 'next/navigation';

/** Redirect /m/[name]/submit to /submit?submolt=[name] so the submit form opens with this channel pre-selected. */
export default function SubmoltSubmitRedirectPage({
  params,
}: {
  params: { name: string };
}) {
  redirect(`/submit?submolt=${encodeURIComponent(params.name)}`);
}
