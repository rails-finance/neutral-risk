import { redirect } from "next/navigation";

// The guided explorer is now the fourth coverage view, at /coverage/explore (it renders inline as
// a peer of List / Matrix / Map). This standalone route is kept only as a stable redirect so any
// existing /explore link still resolves.
export default function ExploreRedirect() {
  redirect("/coverage/explore");
}
