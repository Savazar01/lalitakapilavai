import { redirect } from "next/navigation";

export default function PostsLegacyRedirect() {
  redirect("/blogs");
}
