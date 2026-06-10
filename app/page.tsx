import { redirect } from "next/navigation";

// The coverage browser now lives at its own named hub, /coverage, with a URL per view
// (/coverage/matrix, /coverage/map, /coverage/explore). Root redirects there so "/" stays a valid
// entry point and existing links keep working.
// NOTE: when this app moves to a fully static export (output: "export", docs/ROADMAP.md §4),
// swap this server redirect for a next.config `redirects()` entry or a static meta-refresh, since
// redirect() is not supported under static export.
export default function HomePage() {
  redirect("/coverage");
}
