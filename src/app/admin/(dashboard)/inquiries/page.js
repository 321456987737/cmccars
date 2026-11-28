"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STATUS_OPTIONS = ["Nueva", "Contactada", "En progreso", "Cerrada"];

export default function AdminInquiriesPage() {
  const [consultas, setInquiries] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
    hasSiguientePage: false,
    hasAnteriorPage: false,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  const [selectedInquiry, setSelectedInquiry] = useState(null);

  async function loadInquiries(page = 1) {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status) {
        params.set("status", status);
      }

      params.set("page", String(page));
      params.set("limit", "15");

      const response = await fetch(
        `/api/admin/inquiries?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "No se pudieron cargar las consultas");
      }

      // FIX: never set consultas to undefined
      const list =
        result.data?.consultas ??
        result.data?.inquiries ??
        (Array.isArray(result.data) ? result.data : []);

      setInquiries(list);

      setPagination(
        result.data?.pagination ?? {
          page: 1,
          limit: 15,
          total: list.length,
          totalPages: 1,
          hasSiguientePage: false,
          hasAnteriorPage: false,
        },
      );
    } catch (loadError) {
      console.error(loadError);

      setError(loadError.message || "No se pudieron cargar las consultas");
      setInquiries([]); // FIX: keep as array on error too
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadInquiries(1);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [status]);

  async function handleSearch(event) {
    event.preventDefault();

    await loadInquiries(1);
  }

  async function updateStatus(inquiryId, nextStatus) {
    try {
      setActionId(inquiryId);
      setError("");

      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "No se pudo actualizar el estado");
      }

      setInquiries((current) =>
        (current ?? []).map((consulta) =>
          consulta._id === inquiryId
            ? {
                ...consulta,
                status: nextStatus,
              }
            : consulta,
        ),
      );

      setSelectedInquiry((current) =>
        current?._id === inquiryId
          ? {
              ...current,
              status: nextStatus,
            }
          : current,
      );
    } catch (updateError) {
      console.error(updateError);

      setError(updateError.message || "No se pudo actualizar el estado");
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 pb-20 md:pb-0">
      <div className="mb-6 sm:mb-8">
        <p className="text- font-semibold uppercase tracking-[0.2em] text-black/35">
          Clientes potenciales
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Consultas
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
          Gestiona los mensajes de clientes interesados en tus vehículos.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 sm:mb-6 sm:p-5">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-black/10 bg-white p-3 sm:p-5">
        <form
          onSubmit={handleSearch}
          className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_200px_auto]"
        >
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar cliente, teléfono, correo o mensaje"
            className="h-11 w-full min-w-0 rounded-xl border border-black/15 px-4 text-sm outline-none placeholder:text-black/30 focus:border-black"
          />

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-11 w-full min-w-0 rounded-xl border border-black/15 bg-white px-3 text-sm outline-none focus:border-black"
          >
            <option value="">Todos los estados</option>

            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/80 active:scale-[0.98] sm:col-span-2 lg:col-span-1"
          >
            Buscar
          </button>
        </form>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-black/10 bg-white sm:mt-6">
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <h2 className="font-semibold">Consultas de clientes</h2>

            <p className="mt-1 text-xs text-black/40">
              {pagination.total}{" "}
              {pagination.total === 1 ? "consulta" : "consultas"}
            </p>
          </div>
        </div>

        {loading ? (
          <>
            <div className="hidden md:block">
              <LoadingRows />
            </div>

            <div className="md:hidden">
              <LoadingCards />
            </div>
          </>
        ) : (consultas ?? []).length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w- border-collapse">
                <thead>
                  <tr className="border-b border-black/10 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                      Cliente
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                      Vehículo
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                      Mensaje
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                      Estado
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {(consultas ?? []).map((consulta) => {
                    const busy = actionId === consulta._id;

                    return (
                      <tr
                        key={consulta._id}
                        className="border-b border-black/10 last:border-0"
                      >
                        <td className="px-6 py-5">
                          <button
                            type="button"
                            onClick={() => setSelectedInquiry(consulta)}
                            className="text-left"
                          >
                            <p className="font-semibold transition hover:text-black/55">
                              {consulta.customerName}
                            </p>

                            <p className="mt-1 text-xs text-black/45">
                              {consulta.phone}
                            </p>

                            {consulta.email && (
                              <p className="mt-1 max-w- truncate text-xs text-black/35">
                                {consulta.email}
                              </p>
                            )}
                          </button>
                        </td>

                        <td className="px-6 py-5">
                          {consulta.carId ? (
                            <Link
                              href={`/cars/${consulta.carId._id}`}
                              target="_blank"
                              className="group flex items-center gap-3"
                            >
                              <div className="h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-black/[0.05]">
                                {consulta.carId.images?.[0]?.url ? (
                                  <img
                                    src={consulta.carId.images[0].url}
                                    alt={`${consulta.carId.make} ${consulta.carId.model}`}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text- uppercase tracking-wider text-black/25">
                                    Sin imagen
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold group-hover:underline">
                                  {consulta.carId.make} {consulta.carId.model}
                                </p>

                                <p className="mt-1 text-xs text-black/40">
                                  {consulta.carId.year}
                                </p>
                              </div>
                            </Link>
                          ) : (
                            <span className="text-sm text-black/40">
                              Consulta general
                            </span>
                          )}
                        </td>

                        <td className="max-w- px-6 py-5">
                          <button
                            type="button"
                            onClick={() => setSelectedInquiry(consulta)}
                            className="text-left"
                          >
                            <p className="line-clamp-2 text-sm leading-6 text-black/55">
                              {consulta.message}
                            </p>
                          </button>
                        </td>

                        <td className="px-6 py-5">
                          <EstadoSelect
                            value={consulta.status}
                            disabled={busy}
                            onChange={(value) =>
                              updateStatus(consulta._id, value)
                            }
                          />
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedInquiry(consulta)}
                            className="rounded-lg border border-black/10 px-4 py-2 text-xs font-semibold transition hover:bg-black hover:text-white"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-black/10 md:hidden">
              {(consultas ?? []).map((consulta) => {
                const busy = actionId === consulta._id;

                return (
                  <article key={consulta._id} className="p-4 sm:p-5">
                    <button
                      type="button"
                      onClick={() => setSelectedInquiry(consulta)}
                      className="block w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold sm:text-base">
                            {consulta.customerName}
                          </p>

                          <p className="mt-1 text-xs text-black/45">
                            {consulta.phone}
                          </p>

                          {consulta.email && (
                            <p className="mt-1 truncate text-xs text-black/35">
                              {consulta.email}
                            </p>
                          )}
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text- font-semibold ${
                            consulta.status === "Nueva"
                              ? "bg-black text-white"
                              : "bg-black/[0.05] text-black/55"
                          }`}
                        >
                          {consulta.status}
                        </span>
                      </div>
                    </button>

                    {consulta.carId ? (
                      <Link
                        href={`/cars/${consulta.carId._id}`}
                        target="_blank"
                        className="mt-4 flex min-w-0 items-center gap-3 rounded-xl bg-black/[0.035] p-3"
                      >
                        <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-black/[0.05]">
                          {consulta.carId.images?.[0]?.url ? (
                            <img
                              src={consulta.carId.images[0].url}
                              alt={`${consulta.carId.make} ${consulta.carId.model}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text- uppercase text-black/25">
                              Sin imagen
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold">
                            {consulta.carId.make} {consulta.carId.model}
                          </p>

                          <p className="mt-1 text- text-black/40">
                            {consulta.carId.year}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <div className="mt-4 rounded-xl bg-black/[0.035] px-3 py-2.5 text-xs text-black/45">
                        Consulta general
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedInquiry(consulta)}
                      className="mt-4 block w-full rounded-xl border border-black/10 bg-white p-3 text-left"
                    >
                      <p className="text- font-semibold uppercase tracking-[0.12em] text-black/30">
                        Mensaje
                      </p>

                      <p className="mt-1 line-clamp-3 text-xs leading-5 text-black/60">
                        {consulta.message}
                      </p>
                    </button>

                    <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                      <EstadoSelect
                        value={consulta.status}
                        disabled={busy}
                        onChange={(value) => updateStatus(consulta._id, value)}
                        fullWidth
                      />

                      <button
                        type="button"
                        onClick={() => setSelectedInquiry(consulta)}
                        className="h-10 rounded-xl border border-black/10 px-4 text-xs font-semibold transition hover:bg-black hover:text-white"
                      >
                        Ver
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {!loading && pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2 sm:mt-6 sm:gap-3">
          <button
            type="button"
            disabled={!pagination.hasAnteriorPage}
            onClick={() => loadInquiries(pagination.page - 1)}
            className="rounded-full border border-black/10 bg-white px-3.5 py-2.5 text-xs font-medium transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-35 sm:px-5 sm:py-3 sm:text-sm"
          >
            Anterior
          </button>

          <div className="rounded-full bg-black px-3.5 py-2.5 text-xs font-semibold text-white sm:px-4 sm:py-3 sm:text-sm">
            {pagination.page} / {pagination.totalPages}
          </div>

          <button
            type="button"
            disabled={!pagination.hasSiguientePage}
            onClick={() => loadInquiries(pagination.page + 1)}
            className="rounded-full border border-black/10 bg-white px-3.5 py-2.5 text-xs font-medium transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-35 sm:px-5 sm:py-3 sm:text-sm"
          >
            Siguiente
          </button>
        </div>
      )}

      {selectedInquiry && (
        <InquiryModal
          consulta={selectedInquiry}
          actionId={actionId}
          onCerrar={() => setSelectedInquiry(null)}
          onStatusChange={(nextStatus) =>
            updateStatus(selectedInquiry._id, nextStatus)
          }
        />
      )}
    </div>
  );
}

function EstadoSelect({ value, disabled, onChange, fullWidth = false }) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={`h-10 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-black disabled:opacity-40 ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}

function InquiryModal({ consulta, actionId, onCerrar, onStatusChange }) {
  const busy = actionId === consulta._id;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
      onMouseDown={onCerrar}
    >
      <div
        className="max-h- w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-h- sm:max-w-2xl sm:rounded-3xl sm:p-6 md:p-8"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text- font-semibold uppercase tracking-[0.18em] text-black/35 sm:text-xs">
              Consulta de cliente
            </p>

            <h2 className="mt-2 truncate text-xl font-semibold tracking-tight sm:text-2xl">
              {consulta.customerName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-sm transition hover:bg-black hover:text-white"
            aria-label="Cerrar consulta"
          >
            ×
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
          <InfoBlock label="Teléfono" value={consulta.phone} />

          <InfoBlock label="Correo electrónico" value={consulta.email || "No indicado"} />

          <InfoBlock label="Origen" value={consulta.source} />

          <InfoBlock label="Recibida" value={formatFecha(consulta.createdAt)} />
        </div>

        {consulta.carId && (
          <div className="mt-5 rounded-2xl bg-black/[0.035] p-4 sm:mt-6 sm:p-5">
            <p className="text- font-semibold uppercase tracking-[0.15em] text-black/35 sm:text-xs">
              Vehículo
            </p>

            <div className="mt-3 flex min-w-0 items-center justify-between gap-3 sm:mt-4 sm:gap-4">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                {consulta.carId.images?.[0]?.url ? (
                  <img
                    src={consulta.carId.images[0].url}
                    alt={`${consulta.carId.make} ${consulta.carId.model}`}
                    className="h-14 w-20 shrink-0 rounded-xl object-cover sm:h-16 sm:w-20"
                  />
                ) : (
                  <div className="h-14 w-20 shrink-0 rounded-xl bg-black/[0.05] sm:h-16 sm:w-20" />
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {consulta.carId.make} {consulta.carId.model}
                  </p>

                  <p className="mt-1 text-xs text-black/45">
                    {consulta.carId.year}
                  </p>
                </div>
              </div>

              <Link
                href={`/cars/${consulta.carId._id}`}
                target="_blank"
                className="shrink-0 rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold transition hover:bg-black hover:text-white"
              >
                Ver
              </Link>
            </div>
          </div>
        )}

        <div className="mt-5 sm:mt-6">
          <p className="text- font-semibold uppercase tracking-[0.15em] text-black/35 sm:text-xs">
            Mensaje
          </p>

          <div className="mt-3 rounded-2xl border border-black/10 bg-white p-4 sm:p-5">
            <p className="whitespace-pre-line break-words text-sm leading-6 text-black/65 sm:leading-7">
              {consulta.message}
            </p>
          </div>
        </div>

        <div className="mt-5 sm:mt-6">
          <p className="mb-3 text- font-semibold uppercase tracking-[0.15em] text-black/35 sm:text-xs">
            Estado
          </p>

          <EstadoSelect
            value={consulta.status}
            disabled={busy}
            onChange={onStatusChange}
            fullWidth
          />
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-black/10 pt-5 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3 sm:pt-6">
          <a
            href={`tel:${consulta.phone}`}
            className="flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white transition hover:bg-black/80"
          >
            Llamar al cliente
          </a>

          {consulta.email && (
            <a
              href={`mailto:${consulta.email}`}
              className="flex h-11 items-center justify-center rounded-full border border-black/10 px-5 text-sm font-semibold transition hover:bg-black hover:text-white"
            >
              Enviar correo al cliente
            </a>
          )}

          <button
            type="button"
            onClick={onCerrar}
            className="flex h-11 items-center justify-center rounded-full border border-black/10 px-5 text-sm font-semibold transition hover:bg-black hover:text-white"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-black/10 bg-white p-3.5 sm:p-4">
      <p className="text- uppercase tracking-[0.12em] text-black/35 sm:text-xs">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="divide-y divide-black/10">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-5 px-6 py-5">
          <div className="h-12 w-12 animate-pulse rounded-xl bg-black/[0.05]" />

          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-black/[0.05]" />

            <div className="h-3 w-28 animate-pulse rounded bg-black/[0.05]" />
          </div>

          <div className="h-9 w-24 animate-pulse rounded-lg bg-black/[0.05]" />
        </div>
      ))}
    </div>
  );
}

function LoadingCards() {
  return (
    <div className="divide-y divide-black/10">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-black/[0.05]" />

              <div className="h-3 w-24 animate-pulse rounded bg-black/[0.05]" />
            </div>

            <div className="h-6 w-16 animate-pulse rounded-full bg-black/[0.05]" />
          </div>

          <div className="mt-4 h-16 animate-pulse rounded-xl bg-black/[0.05]" />

          <div className="mt-3 h-20 animate-pulse rounded-xl bg-black/[0.05]" />

          <div className="mt-3 h-10 animate-pulse rounded-xl bg-black/[0.05]" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-5 py-16 text-center sm:px-6 sm:py-20">
      <h3 className="text-lg font-semibold">No se encontraron consultas</h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-black/45">
        Las consultas de clientes aparecerán aquí cuando alguien contacte con
        el concesionario.
      </p>
    </div>
  );
}

function formatFecha(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}