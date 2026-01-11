import { redirect } from "next/navigation";

export default function StudentJoinRedirect() {
  redirect("/auth/student-signin");
}
