import {
  CalendarCheck,
  LineChart,
  ShieldCheck,
  Smartphone,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: <Zap className="size-5" />,
    title: "10-20 секундэд тайлан",
    text: "Багш бичихгүй, зөвхөн товчлохоор 5 төрлийн мэдээллийг хурдан бөглөнө.",
  },
  {
    icon: <Smartphone className="size-5" />,
    title: "Эцэг эхэд зориулсан товч мэдээлэл",
    text: "Хүүхдийн хооллолт, уусан зүйлс болон биеийн байдлын мэдээллийг өдөр бүр шинэчлэн хүргэнэ.",
  },
  {
    icon: <ShieldCheck className="size-5" />,
    title: "Аюулгүй, эрхийн хязгаартай",
    text: "Хүүхэд бүрийн мэдээлэл зөвхөн түүний гэр бүл болон багш нарт харагдана.",
  },
  {
    icon: <LineChart className="size-5" />,
    title: "Цэцэрлэгийн хяналт",
    text: "Админ бүлэг бүрийн бөглөлтийн хувь, статистикийг нэг дор харна.",
  },
  {
    icon: <CalendarCheck className="size-5" />,
    title: "Түүх бүрэн хадгалагдана",
    text: "Өнгөрсөн өдрийн тайлангууд огноогоор хайж, дахин харах боломжтой.",
  },
];

export function LoginFeatures() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => (
        <div key={f.title} className="glass glass-hover rounded-3xl p-6">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
            {f.icon}
          </div>
          <h3 className="mt-4 text-base font-bold">{f.title}</h3>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">{f.text}</p>
        </div>
      ))}
    </div>
  );
}
