import type { Metadata } from "next";
import { LegalDoc } from "@/components/features/LegalDoc";
import { legal } from "@/lib/copy";

export const metadata: Metadata = { title: "Privacy · Slop Doctor" };

export default function Privacy() {
  return (
    <LegalDoc title="Privacy">
      <h2 className="t-headline-md">The short version</h2>
      <p>
        You give the doctor the address of a public web page. We photograph that page, have it examined by two AI
        services, and write up a chart. We ask you to sign in with Google so we can limit each person to 10 examinations
        a day. We don&rsquo;t sell data, we don&rsquo;t run ads, and we don&rsquo;t use analytics or tracking cookies.
      </p>

      <h2 className="t-headline-md">What we collect</h2>
      <ul>
        <li>
          <strong>Your account.</strong> When you sign in with Google we receive your name, email address and profile
          picture, and nothing else. We don&rsquo;t see your Google password.
        </li>
        <li>
          <strong>Examinations.</strong> The address you submit, the time you submitted it, and the chart we produce: a
          screenshot of the page, its title, fonts and colours, an excerpt of its text (up to 4,000 characters), a
          description of each section, the symptoms found, the Slop Index and the prescriptions. Each examination is
          linked to your account so we can show you your patient records.
        </li>
        <li>
          <strong>Sign-in cookies.</strong> Cookies keep you signed in for up to 30 days. They are needed for the
          service to work and are not used for anything else.
        </li>
        <li>
          <strong>Error logs.</strong> When an examination fails, our logs record the website&rsquo;s domain and the
          reason, so we can fix it. They never record the full address you submitted.
        </li>
      </ul>

      <h2 className="t-headline-md">Charts are public by link</h2>
      <p>
        Anyone with a chart&rsquo;s link can see it, and you can share that link. A chart shows the website&rsquo;s
        address without its query string, the screenshot and the diagnosis. It never shows who asked for the
        examination. If the same page was examined in the last 24 hours, we may show that chart to anyone else who
        submits it, instead of examining it again.
      </p>
      <p>
        The full address you submit, including anything after the <code>?</code>, stays on our servers. Even so, please
        don&rsquo;t submit private preview links or pages that need a password.
      </p>

      <h2 className="t-headline-md">Who else handles it</h2>
      <p>To run an examination, we use these services, each under its own terms:</p>
      <ul>
        <li>
          <strong>Firecrawl</strong> visits the page and takes the screenshot.
        </li>
        <li>
          <strong>Google Gemini</strong> receives the screenshot and describes each section of the page.
        </li>
        <li>
          <strong>TypeSafe</strong> receives those descriptions and the page&rsquo;s text, and makes the diagnosis.
        </li>
        <li>
          <strong>Convex</strong> stores your account, examinations and screenshots, in the United States.
        </li>
        <li>
          <strong>Vercel</strong> serves the website.
        </li>
        <li>
          <strong>Google</strong> handles sign-in.
        </li>
      </ul>
      <p>Apart from Google sign-in, these services receive the page being examined, never your name or email address.</p>

      <h2 className="t-headline-md">How long we keep it</h2>
      <p>
        We keep your account and your examinations until you ask us to delete them. Email us from the address you sign in
        with and we&rsquo;ll delete your account, your examinations and their screenshots within 30 days.
      </p>

      <h2 className="t-headline-md">If your website was examined</h2>
      <p>
        We only examine pages that anyone on the internet can already see. If you own a website and want a chart of it
        removed, email us the chart&rsquo;s link and we&rsquo;ll take it down.
      </p>

      <h2 className="t-headline-md">Your rights</h2>
      <p>
        You can ask us for a copy of the data we hold about you, ask us to correct it, or ask us to delete it. Email us
        and we&rsquo;ll reply within 30 days. If you&rsquo;re unhappy with how we handle your data, you can also complain
        to your local data protection authority.
      </p>

      <h2 className="t-headline-md">Changes</h2>
      <p>
        If this page changes in a way that matters, we&rsquo;ll update the date at the top and say what changed here.
      </p>

      <h2 className="t-headline-md">Contact</h2>
      <p>
        Slop Doctor is run by {legal.operator}. Write to <a href={`mailto:${legal.contact}`}>{legal.contact}</a>.
      </p>
    </LegalDoc>
  );
}
