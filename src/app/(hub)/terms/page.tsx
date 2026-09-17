import Link from "next/link";
export const metadata = { title: "Terms of Use" };
export default function TermsPage() {
  return <article className="mx-auto max-w-3xl space-y-6 px-5 py-10 text-sm leading-7"><h1 className="text-4xl font-bold">Terms of Use</h1><p>Updated September 17, 2026</p>
    <section><h2 className="text-xl font-semibold">Using Bayside Hub</h2><p>Use Bayside Hub for school community activities with an account you are authorized to use. Keep your credentials private and report suspected account misuse. Confirm important dates and decisions with the relevant school staff.</p></section>
    <section><h2 className="text-xl font-semibold">Respectful communication</h2><p>Do not post harassment, threats, impersonation, spam, private student records or material you are not permitted to share. Only upload photographs with the necessary permission. Club messages and uploads may be moderated by authorized leaders and administrators.</p></section>
    <section><h2 className="text-xl font-semibold">Publishing and roles</h2><p>Leadership permissions apply to assigned clubs. School-wide announcements submitted by club leaders require administrator review. Do not attempt to bypass access controls. Administrators may remove inappropriate content or change access when necessary to manage the community.</p></section>
    <section><h2 className="text-xl font-semibold">Help, privacy and external links</h2><p>Report concerns and request account assistance through <Link href="/support" className="underline">Support</Link>. Read the <Link href="/privacy" className="underline">Privacy Policy</Link> before sharing information. External websites operate under their own terms. This site is not an emergency reporting service; contact appropriate school staff or emergency services for urgent safety concerns.</p></section>
    <section><h2 className="text-xl font-semibold">School policies</h2><p>These terms support the operation of Bayside Hub and do not replace applicable school policies. Where a school rule or authorized staff direction conflicts with information on the platform, follow the school rule or staff direction.</p></section>
  </article>;
}
