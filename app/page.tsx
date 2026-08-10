import Link from "next/link";
import {
  ArrowRight,
  Cable,
  Headphones,
  MapPin,
  MessageCircle,
  PackageCheck,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

const categories = [
  {
    name: "Charging Cables",
    detail: "Cords that keep up with campus days.",
    icon: Cable,
  },
  {
    name: "Earpieces",
    detail: "Sound for study sessions and commutes.",
    icon: Headphones,
  },
];

const conveniencePoints = [
  {
    icon: MapPin,
    title: "Campus delivery",
    text: "Delivered to your campus location.",
  },
  {
    icon: PackageCheck,
    title: "Easy pickup",
    text: "Collect at the agreed pickup point.",
  },
  {
    icon: MessageCircle,
    title: "Need help?",
    text: "Message us before you order.",
  },
];

export default function HomePage() {
  return (
    <main>
      <header className="border-b border-black/10">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-black tracking-tight">
            Campus Accessories
          </Link>
          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-5 text-sm font-semibold"
          >
            <Link href="/shop">Shop</Link>
            <Link href="/cart">Cart</Link>
          </nav>
        </Container>
      </header>
      <section className="bg-[#17211d] py-20 text-white sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div>
            <p className="mb-5 text-sm font-bold tracking-[0.2em] text-[#c7ff3d] uppercase">
              Made for campus life
            </p>
            <h1 className="max-w-3xl text-5xl font-black tracking-[-0.06em] sm:text-7xl">
              Your essentials, right when you need them.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
              Reliable charging cables and earpieces, with straightforward
              pickup or delivery across campus.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/shop">
                Shop accessories <ArrowRight size={17} />
              </ButtonLink>
              <ButtonLink href="#how-it-works" variant="secondary">
                How it works
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-[2rem] bg-[#c7ff3d] p-7 text-[#17211d] shadow-2xl sm:p-10">
            <PackageCheck size={38} strokeWidth={2.5} />
            <p className="mt-8 text-3xl font-black tracking-tight">
              Campus-ready convenience.
            </p>
            <p className="mt-3 leading-7">
              Choose delivery to your location or collect when it suits your
              schedule.
            </p>
          </div>
        </Container>
      </section>
      <section id="how-it-works" className="py-18 sm:py-24">
        <Container>
          <p className="text-sm font-bold tracking-[0.18em] text-[#5b665f] uppercase">
            Start here
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            The everyday essentials
          </h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {categories.map(({ name, detail, icon: Icon }) => (
              <Link
                key={name}
                href="/shop"
                className="group rounded-3xl border border-black/10 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <Icon size={30} />
                <h3 className="mt-10 text-2xl font-black">{name}</h3>
                <p className="mt-2 text-[#5b665f]">{detail}</p>
                <span className="mt-6 inline-flex items-center gap-2 font-bold">
                  Explore{" "}
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
      <section className="border-y border-black/10 bg-[#e7ebe0] py-16">
        <Container className="grid gap-8 md:grid-cols-3">
          {conveniencePoints.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <Icon size={25} />
              <h3 className="mt-4 text-lg font-black">{title}</h3>
              <p className="mt-2 text-[#5b665f]">{text}</p>
            </div>
          ))}
        </Container>
      </section>
      <footer className="py-10">
        <Container className="flex flex-col gap-3 text-sm text-[#5b665f] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Campus Accessories</p>
          <a href="https://wa.me/" aria-label="Contact us on WhatsApp">
            WhatsApp us
          </a>
        </Container>
      </footer>
    </main>
  );
}
