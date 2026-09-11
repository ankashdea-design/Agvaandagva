import { redirect } from "next/navigation";

// The main /teacher page IS the child list (search/filter/bulk/inline edit
// all live there per the product spec). This route exists so the bottom
// nav's "Хүүхдүүд" tab has a target; keep it pointed at the same view.
export default function TeacherChildrenPage() {
  redirect("/teacher");
}
