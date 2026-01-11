import { redirect } from "next/navigation";

export default function TeacherLoginRedirect() {
  redirect("/auth/signin");
}
