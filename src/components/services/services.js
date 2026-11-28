
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  CarFront,
  CircleDollarSign,
  ClipboardCheck,
  Handshake,
  MessageCircle,
  Wrench,
} from "lucide-react";
const HERO_IMAGE =
  "/images/cars/car5.jpg";
const SERVICES = [
  {
    number: "01",
    image: "/images/cars/car1.jpg",
    title: "Venta de vehículos",
    description:
      "Explora nuestro inventario cuidadosamente seleccionado y deja que nuestro equipo te ayude a encontrar un vehículo que se adapte a tu estilo de vida, preferencias y presupuesto.",
    icon: CarFront,
    label: "Encuentra tu vehículo",
  },
  {
    number: "02",
    image: "/images/cars/car2.jpg",
    title: "Pruebas de manejo",
    description:
      "Un vehículo debe sentirse adecuado antes de comprarlo. Programa una prueba de manejo y conoce por ti mismo el vehículo que prefieres.",
    icon: ClipboardCheck,
    label: "Vive la conducción",
  },
  {
    number: "03",
    image: "/images/cars/car3.jpg",
    title: "Entrega a cambio",
    description:
      "¿Estás pensando en renovar? Podemos ayudarte a conocer las opciones de entrega a cambio de tu vehículo actual mientras avanzas hacia tu próximo coche.",
    icon: Handshake,
    label: "Renueva tu vehículo",
  },
  {
    number: "04",
    image: "/images/cars/car4.jpg",
    title: "Financiación",
    description:
      "Consulta las opciones de financiación disponibles con nuestro equipo y conoce los requisitos y el proceso de compra antes de continuar.",
    icon: CircleDollarSign,
    label: "Explora tus opciones",
  },
  {
    number: "05",
    image: "/images/cars/car5.jpg",
    title: "Inspección del vehículo",
    description:
      "Obtén más información sobre el estado, las especificaciones y los detalles de inspección de un vehículo para tomar una decisión informada.",
    icon: Wrench,
    label: "Conoce tu vehículo",
  },
  {
    number: "06",
    image: "/images/cars/car1.jpg",
    title: "Atención al cliente",
    description:
      "Desde tu primera pregunta hasta tu decisión final, nuestro equipo está disponible para ayudarte por teléfono o correo electrónico.",
    icon: MessageCircle,
    label: "Habla con nuestro equipo",
  },
];

/* ============================================================
   GET BUSINESS
============================================================ */

/* ============================================================
   PAGE
============================================================ */

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      {/* ======================================================
          01 — HERO
      ====================================================== */}

      <section className="relative h-[40dvh] min-h-[320px] overflow-hidden bg-[#e8e8e5] md:min-h-[420px]">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt="Vehículo de lujo"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* DARK OVERLAY */}

        <div className="absolute inset-0 bg-black/30" />

        {/* LEFT GRADIENT */}

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        {/* HERO CONTENT */}

        <div className="absolute inset-0">
          <div className="mx-auto flex h-full max-w-[1800px] items-end px-6 pb-10 md:px-10 md:pb-14 lg:px-14 lg:pb-16">
            <div className="max-w-4xl">
              <p className="mb-4 font-montserrat text-[9px] font-medium uppercase tracking-[0.35em] text-white/55 md:text-[10px]">
                El concesionario experience
              </p>

              <h1 className="font-bebas text-[clamp(4.5rem,9vw,9rem)] leading-[0.78] tracking-[-0.05em] text-white">
                Services
              </h1>

              <p className="mt-6 max-w-lg font-montserrat text-[10px] leading-[1.8] tracking-[0.04em] text-white/55 md:text-[11px]">
Más que encontrar un vehículo. Desde tu primera consulta hasta
                ponerte al volante, estamos aquí para hacer que
                la experiencia sea sencilla.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          02 — INTRODUCTION
      ====================================================== */}

      <section>
        <div className="mx-auto max-w-[1800px] px-6 py-20 md:px-10 md:py-28 lg:px-14 lg:py-32">
          <div className="grid gap-10 lg:grid-cols-[0.4fr_1.6fr] lg:gap-20">
            <div>
              <p className="font-montserrat text-[10px] uppercase tracking-[0.3em] text-black/30">
                Nuestro enfoque
              </p>
            </div>

            <div>
              <h2 className="max-w-6xl font-bebas text-[clamp(3.8rem,7vw,8rem)] leading-[0.78] tracking-[-0.045em]">
El vehículo adecuado es solo
                <br />
                parte de la experiencia.
              </h2>

              <p className="mt-8 max-w-2xl font-montserrat text-[11px] leading-[1.9] tracking-[0.03em] text-black/45 md:text-[13px]">
En CMC CARS te ayudamos a explorar vehículos, programar una
                prueba de manejo y obtener la información que necesitas. Ya sea
                que busques tu próximo vehículo o quieras entregar uno a cambio,
                nuestro equipo está aquí para ayudarte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          03 — SERVICE SHOWCASE
      ====================================================== */}

      <section className="border-t border-black/10">
        <div className="mx-auto max-w-[1800px]">
          {/* SECTION HEADER */}

          <div className="px-6 py-14 md:px-10 md:py-16 lg:px-14">
            <div className="flex items-end justify-between">
             <div>
  <p className="font-montserrat text- uppercase tracking-[0.3em] text-black/30">
    Qué ofrecemos
  </p>

  <h2 className="mt-3 font-bebas text-5xl leading-none tracking-[-0.035em] md:text-7xl">
    Nuestros servicios
  </h2>
</div>

<span className="hidden font-montserrat text- uppercase tracking-[0.2em] text-black/25 sm:block">
  06 Servicios
</span>
            </div>
          </div>

          {/* SERVICE ROWS */}

          <div className="border-t border-black/10">
            {SERVICES.map((service, index) => (
              <ServiceRow
                key={service.number}
                service={service}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          04 — WHY US
      ====================================================== */}

      <section className="bg-[#181818] text-white">
        <div className="mx-auto max-w-[1800px] px-6 py-20 md:px-10 md:py-28 lg:px-14 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            {/* LEFT */}

            <div>
              <p className="font-montserrat text-[10px] uppercase tracking-[0.3em] text-white/30">
                Why choose us
              </p>

              <h2 className="mt-5 font-bebas text-[clamp(4rem,7vw,7rem)] leading-[0.78] tracking-[-0.045em]">
Sencillo.
                <br />
                Personal.
                <br />
                Directo.
              </h2>
            </div>

            {/* RIGHT */}

            <div className="grid border-t border-white/10 sm:grid-cols-2">
              <Feature
                number="01"
                title="Vehículos seleccionados"
                text="Una colección enfocada en la calidad, el estado y el valor."
              />

              <Feature
                number="02"
                title="Atención personal"
                text="Habla directamente con nuestro equipo siempre que necesites ayuda."
              />

              <Feature
                number="03"
                title="Proceso claro"
                text="Sin complicaciones innecesarias. Solo comunicación directa."
              />

              <Feature
                number="04"
                title="Servicio posventa"
                text="Nuestra relación no tiene por qué terminar cuando te vas."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          05 — INVENTORY CTA
      ====================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-[1800px] px-6 py-20 md:px-10 md:py-28 lg:px-14 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.65fr] lg:items-end">
            <div>
              <p className="font-montserrat text-[10px] uppercase tracking-[0.3em] text-black/30">
                Empieza tu búsqueda
              </p>

              <h2 className="mt-5 max-w-5xl font-bebas text-[clamp(4rem,8vw,8rem)] leading-[0.78] tracking-[-0.05em]">
                Tu próximo coche
                <br />
                te está esperando.
              </h2>

              <p className="mt-7 max-w-xl font-montserrat text-[11px] leading-[1.9] tracking-[0.03em] text-black/45 md:text-[13px]">
                Explora nuestro inventario actual o contacta con nuestro equipo
                para hablar de lo que estás buscando.
              </p>
            </div>

            <div className="border-t border-black/10 pt-7">
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/cars"
                  className="group inline-flex items-center gap-3 bg-black px-6 py-4 font-montserrat text-[9px] font-medium uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-black/80 md:text-[10px]"
                >
                  Explorar inventario

                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.2}
                    className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </Link>

                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-3 border border-black/15 px-6 py-4 font-montserrat text-[9px] font-medium uppercase tracking-[0.18em] text-black transition-all duration-300 hover:border-black md:text-[10px]"
                >
                  Contáctanos

                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.2}
                    className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   SERVICE ROW
============================================================ */

function ServiceRow({ service, index }) {
  const Icon = service.icon;

  const isEven = index % 2 === 0;

  return (
    <article className="group border-b border-black/10">
      <div className="mx-auto grid max-w-[1800px] md:grid-cols-2">
        {/* VISUAL SIDE */}

       <div
  className={`relative flex min-h-[320px] items-center justify-center overflow-hidden bg-[#f3f3f1] px-6 py-16 md:min-h-[440px] md:px-10 lg:px-14 ${
    !isEven ? "md:order-2" : ""
  }`}
>
  {/* SERVICE IMAGE */}
  <Image
    src={service.image}
    alt={service.title}
    fill
    sizes="(max-width: 768px) 100vw, 50vw"
    className="object-cover transition-transform duration-700 group-hover:scale-105"
  />

  {/* IMAGE OVERLAY */}
  <div className="absolute inset-0 bg-black/15 transition-colors duration-500 group-hover:bg-black/20" />

  {/* LARGE NUMBER */}
  <span className="absolute -bottom-10 -right-4 z-10 font-bebas text-[18rem] leading-none tracking-[-0.08em] text-white/15 transition-transform duration-700 group-hover:translate-x-3">
    {service.number}
  </span>

  {/* ICON */}
  <div className="relative z-10">
    <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/30 bg-white/90 backdrop-blur-sm transition-all duration-500 group-hover:scale-105 group-hover:bg-white md:h-36 md:w-36">
      <Icon
        size={48}
        strokeWidth={1}
        className="text-black/70 transition-transform duration-500 group-hover:scale-110"
      />
    </div>
  </div>

  {/* SMALL LABEL */}
  <div className="absolute left-6 top-6 z-10 md:left-10 md:top-10 lg:left-14">
    <span className="font-montserrat text-[9px] font-medium uppercase tracking-[0.25em] text-white drop-shadow-sm">
      {service.label}
    </span>
  </div>
</div>

        {/* CONTENT SIDE */}

        <div
          className={`flex min-h-[320px] flex-col justify-center px-6 py-16 md:min-h-[440px] md:px-10 lg:px-16 ${
            !isEven ? "md:order-1" : ""
          }`}
        >
          {/* NUMBER */}

          <p className="font-montserrat text-[10px] tracking-[0.25em] text-black/25 md:text-[11px]">
            {service.number}
          </p>

          {/* TITLE */}

          <h3 className="mt-5 max-w-xl font-bebas text-[clamp(3.5rem,5vw,6rem)] leading-[0.8] tracking-[-0.045em]">
            {service.title}
          </h3>

          {/* DESCRIPTION */}

          <p className="mt-7 max-w-lg font-montserrat text-[11px] leading-[1.9] tracking-[0.03em] text-black/45 md:text-[13px]">
            {service.description}
          </p>

          {/* LINK */}

          <Link
            href="/contact"
            className="group/link mt-8 inline-flex w-fit items-center gap-3 border-b border-black/15 pb-2 font-montserrat text-[9px] font-medium uppercase tracking-[0.2em] text-black/55 transition-all duration-300 hover:border-black hover:text-black md:text-[10px]"
          >
            Ponerse en contacto

            <ArrowUpRight
              size={14}
              strokeWidth={1.2}
              className="transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   FEATURE
============================================================ */

function Feature({ number, title, text }) {
  return (
    <div className="border-b border-white/10 px-1 py-8 sm:px-6 sm:py-10">
      <span className="font-montserrat text-[9px] tracking-[0.2em] text-white/25">
        {number}
      </span>

      <h3 className="mt-5 font-bebas text-3xl leading-none tracking-[-0.02em] md:text-4xl">
        {title}
      </h3>

      <p className="mt-4 max-w-xs font-montserrat text-[10px] leading-[1.8] tracking-[0.025em] text-white/35 md:text-[11px]">
        {text}
      </p>
    </div>
  );
}



