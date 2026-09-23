import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/features/LegalDoc";
import { legal } from "@/lib/copy";

export const metadata: Metadata = { title: "Terms · Slop Doctor" };

export default function Terms() {
  return (
    <LegalDoc title="Terms">
      <h2 className="t-headline-md">What Slop Doctor is</h2>
      <p>
        Slop Doctor examines a public web page and tells you, with a straight face, how much it looks like it was made
        by an AI tool. It&rsquo;s free. By signing in or using it, you agree to these terms.
      </p>

      <h2 className="t-headline-md">The doctor is not a real doctor</h2>
      <p>
        Every diagnosis, Slop Index, archetype, place of birth and prescription is produced automatically by software,
        including AI models. It&rsquo;s an opinion about design, meant to be useful and funny. It can be wrong. It is not
        professional advice, it is not a statement of fact about who built a website or how, and it is certainly not
        medical advice.
      </p>

      <h2 className="t-headline-md">Your account</h2>
      <p>
        You sign in with Google. You get 10 examinations a day, and the clinic as a whole has a daily limit too. We may
        change these limits to keep the service running. One person, one account: don&rsquo;t create extra accounts to
        get around the limits.
      </p>

      <h2 className="t-headline-md">What you may examine</h2>
      <p>Only submit the address of a public web page that anyone could open in a browser. Don&rsquo;t submit:</p>
      <ul>
        <li>pages behind a login, private preview links, or addresses containing passwords or access tokens</li>
        <li>addresses on private or internal networks, or anything meant to probe systems you don&rsquo;t own</li>
        <li>pages with illegal content</li>
      </ul>
      <p>Don&rsquo;t use Slop Doctor to examine pages in bulk, or to scrape or overload anyone&rsquo;s website.</p>

      <h2 className="t-headline-md">Charts and sharing</h2>
      <p>
        Charts are public to anyone with the link, as the <Link href="/privacy">privacy page</Link> explains. Share them
        in good humour. The joke is about design, never about the people who made it: don&rsquo;t use charts to harass
        anyone.
      </p>
      <p>
        Websites belong to their owners. We show a screenshot of a page only to explain its diagnosis. If you own a site
        and want its chart removed, email us and we&rsquo;ll take it down.
      </p>

      <h2 className="t-headline-md">Availability and liability</h2>
      <p>
        Slop Doctor is provided as it is, without any guarantee that it will be available, accurate or fit for a
        particular purpose. We may change it, pause it or shut it down. To the extent the law allows, we aren&rsquo;t
        liable for any loss arising from using it or relying on a diagnosis. Nothing in these terms limits liability that
        can&rsquo;t be limited by law.
      </p>

      <h2 className="t-headline-md">Ending things</h2>
      <p>
        You can stop using Slop Doctor at any time and ask us to delete your account. We may suspend accounts that break
        these terms.
      </p>

      <h2 className="t-headline-md">Changes</h2>
      <p>If these terms change in a way that matters, we&rsquo;ll update the date at the top and say what changed here.</p>

      <h2 className="t-headline-md">Contact</h2>
      <p>
        Slop Doctor is run by {legal.operator}. Write to <a href={`mailto:${legal.contact}`}>{legal.contact}</a>.
      </p>
    </LegalDoc>
  );
}
