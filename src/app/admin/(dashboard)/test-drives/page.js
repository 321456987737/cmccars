"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const STATUS_OPTIONS = [
  "Pendiente",
  "Confirmada",
  "Completada",
  "Cancelada",
];

const INITIAL_PAGINATION = {
  page: 1,
  limit: 15,
  total: 0,
  totalPages: 0,
  hasSiguientePage: false,
  hasAnteriorPage: false,
};

export default function AdminTestDrivesPage() {
  const [testDrives, setTestDrives] = useState([]);

  const [pagination, setPagination] =
    useState(INITIAL_PAGINATION);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionId, setActionId] = useState(null);
  const [selectedTestDrive, setSelectedTestDrive] =
    useState(null);

  const solicitudIdRef = useRef(0);
  const controllerRef = useRef(null);

  /*
   * -------------------------------------------------------------------------
   * FETCH TEST DRIVES
   * -------------------------------------------------------------------------
   */

  const fetchTestDrives = useCallback(
    async (
      page = 1,
      searchValue = "",
      statusValue = "",
      dateValue = ""
    ) => {
      const solicitudId =
        ++solicitudIdRef.current;

      controllerRef.current?.abort();

      const controller =
        new AbortController();

      controllerRef.current = controller;

      try {
        const params = new URLSearchParams();

        if (searchValue.trim()) {
          params.set(
            "search",
            searchValue.trim()
          );
        }

        if (statusValue) {
          params.set(
            "status",
            statusValue
          );
        }

        if (dateValue) {
          params.set(
            "date",
            dateValue
          );
        }

        params.set(
          "page",
          String(page)
        );

        params.set(
          "limit",
          "15"
        );

        const response = await fetch(
          `/api/admin/test-drives?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "No se pudieron cargar las pruebas de manejo"
          );
        }

        /*
         * Ignore stale solicituds.
         * For example, if the user changes filters
         * before an older solicitud finishes.
         */
        if (
          solicitudId !==
          solicitudIdRef.current
        ) {
          return;
        }

        // FIX: never set to undefined
        setTestDrives(
          result.data?.testDrives ?? result.data?.test_drives ?? []
        );

        setPagination(
          result.data?.pagination ?? INITIAL_PAGINATION
        );

        setError("");
        setLoading(false);
      } catch (solicitudError) {
        if (
          solicitudError.name ===
          "AbortError"
        ) {
          return;
        }

        if (
          solicitudId !==
          solicitudIdRef.current
        ) {
          return;
        }

        console.error(
          solicitudError
        );

        setError(
          solicitudError.message ||
            "No se pudieron cargar las pruebas de manejo"
        );

        setTestDrives([]); // FIX: keep as array on error
        setLoading(false);
      }
    },
    []
  );

  /*
   * -------------------------------------------------------------------------
   * INITIAL LOAD + FILTER CHANGES
   * -------------------------------------------------------------------------
   */

  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        fetchTestDrives(
          1,
          search,
          status,
          date
        );
      }, 0);

    return () => {
      window.clearTimeout(
        timeoutId
      );

      controllerRef.current?.abort();
    };
  }, [
    status,
    date,
    fetchTestDrives,
  ]);

  /*
   * -------------------------------------------------------------------------
   * SEARCH
   * -------------------------------------------------------------------------
   */

  async function handleSearch(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    await fetchTestDrives(
      1,
      search,
      status,
      date
    );
  }

  /*
   * -------------------------------------------------------------------------
   * FILTERS
   * -------------------------------------------------------------------------
   */

  function handleStatusChange(event) {
    setLoading(true);
    setError("");

    setStatus(event.target.value);
  }

  function handleFechaChange(event) {
    setLoading(true);
    setError("");

    setDate(event.target.value);
  }

  /*
   * -------------------------------------------------------------------------
   * PAGINATION
   * -------------------------------------------------------------------------
   */

  async function handlePageChange(
    nextPage
  ) {
    if (
      nextPage < 1 ||
      nextPage >
        pagination.totalPages ||
      nextPage === pagination.page
    ) {
      return;
    }

    setLoading(true);
    setError("");

    await fetchTestDrives(
      nextPage,
      search,
      status,
      date
    );
  }

  /*
   * -------------------------------------------------------------------------
   * UPDATE STATUS
   * -------------------------------------------------------------------------
   */

  async function updateStatus(
    testDriveId,
    nextStatus
  ) {
    try {
      setActionId(testDriveId);
      setError("");

      const response = await fetch(
        `/api/admin/test-drives/${testDriveId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "No se pudo actualizar el estado"
        );
      }

      setTestDrives((current) =>
        (current ?? []).map((testDrive) =>
          testDrive._id ===
          testDriveId
            ? {
                ...testDrive,
                status: nextStatus,
              }
            : testDrive
        )
      );

      setSelectedTestDrive(
        (current) =>
          current?._id === testDriveId
            ? {
                ...current,
                status: nextStatus,
              }
            : current
      );
    } catch (updateError) {
      console.error(
        updateError
      );

      setError(
        updateError.message ||
          "No se pudo actualizar el estado"
      );
    } finally {
      setActionId(null);
    }
  }

  /*
   * -------------------------------------------------------------------------
   * RENDER
   * -------------------------------------------------------------------------
   */

  return (
    <div className="mx-auto w-full max-w-7xl mb-20 md:pb-0">
      {/* Page header */}
      <div className="mb-6 sm:mb-8">
        <p className="text- font-semibold uppercase tracking-[0.2em] text-black/35 sm:text-xs">
          Citas
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
          Pruebas de manejo
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
          Gestiona las solicitudes y citas de pruebas de conducción.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 sm:mb-6 sm:p-5">
          {error}
        </div>
      )}

      {/* Filters */}
      <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]"
        >
          {/* Buscar */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label
              htmlFor="test-drive-search"
              className="sr-only"
            >
              Buscar
            </label>

            <input
              id="test-drive-search"
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Buscar cliente, teléfono o correo"
              className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-black/30 focus:border-black"
            />
          </div>

          {/* Estado */}
          <div>
            <label
              htmlFor="test-drive-status"
              className="sr-only"
            >
              Estado
            </label>

            <select
              id="test-drive-status"
              value={status}
              onChange={
                handleStatusChange
              }
              className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-black"
            >
              <option value="">
                Todos los estados
              </option>

              {STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label
              htmlFor="test-drive-date"
              className="sr-only"
            >
              Fecha
            </label>

            <input
              id="test-drive-date"
              type="date"
              value={date}
              onChange={
                handleFechaChange
              }
              className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-black"
            />
          </div>

          {/* Buscar button */}
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
          >
            {loading
              ? "Cargando..."
              : "Buscar"}
          </button>
        </form>
      </section>

      {/* Requests section */}
      <section className="mt-5 overflow-hidden rounded-2xl border border-black/10 bg-white sm:mt-6">
        {/* Section header */}
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <h2 className="font-semibold">
              Solicitudes de prueba de manejo
            </h2>

            <p className="mt-1 text-xs text-black/40">
              {pagination.total}{" "}
              {pagination.total === 1
                ? "solicitud"
                : "solicitudes"}
            </p>
          </div>

          {loading && (
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-black" />
          )}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingRows />
        ) : (testDrives ?? []).length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* -------------------------------------------------------------- */}
            {/* DESKTOP TABLE                                                   */}
            {/* -------------------------------------------------------------- */}

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-black/10 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                      Cliente
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                      Vehículo
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                      Cita
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
                  {(testDrives ?? []).map(
                    (testDrive) => (
                      <DesktopTestDriveRow
                        key={
                          testDrive._id
                        }
                        testDrive={
                          testDrive
                        }
                        busy={
                          actionId ===
                          testDrive._id
                        }
                        onOpen={() =>
                          setSelectedTestDrive(
                            testDrive
                          )
                        }
                        onStatusChange={(
                          nextStatus
                        ) =>
                          updateStatus(
                            testDrive._id,
                            nextStatus
                          )
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* MOBILE / TABLET CARDS                                          */}
            {/* -------------------------------------------------------------- */}

            <div className="divide-y divide-black/10 lg:hidden">
              {(testDrives ?? []).map(
                (testDrive) => (
                  <MobileTestDriveCard
                    key={
                      testDrive._id
                    }
                    testDrive={
                      testDrive
                    }
                    busy={
                      actionId ===
                      testDrive._id
                    }
                    onOpen={() =>
                      setSelectedTestDrive(
                        testDrive
                      )
                    }
                    onStatusChange={(
                      nextStatus
                    ) =>
                      updateStatus(
                        testDrive._id,
                        nextStatus
                      )
                    }
                  />
                )
              )}
            </div>
          </>
        )}
      </section>

      {/* Pagination */}
      {!loading &&
        pagination.totalPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2 sm:mt-6 sm:gap-3">
            <button
              type="button"
              disabled={
                !pagination.hasAnteriorPage
              }
              onClick={() =>
                handlePageChange(
                  pagination.page - 1
                )
              }
              className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-medium transition hover:border-black/20 disabled:cursor-not-allowed disabled:opacity-35 sm:px-5 sm:py-3 sm:text-sm"
            >
              Anterior
            </button>

            <div className="rounded-full bg-black px-4 py-2.5 text-xs font-semibold text-white sm:px-4 sm:py-3 sm:text-sm">
              {pagination.page} /{" "}
              {pagination.totalPages}
            </div>

            <button
              type="button"
              disabled={
                !pagination.hasSiguientePage
              }
              onClick={() =>
                handlePageChange(
                  pagination.page + 1
                )
              }
              className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-medium transition hover:border-black/20 disabled:cursor-not-allowed disabled:opacity-35 sm:px-5 sm:py-3 sm:text-sm"
            >
              Siguiente
            </button>
          </div>
        )}

      {/* Modal */}
      {selectedTestDrive && (
        <TestDriveModal
          testDrive={
            selectedTestDrive
          }
          actionId={actionId}
          onCerrar={() =>
            setSelectedTestDrive(null)
          }
          onStatusChange={(
            nextStatus
          ) =>
            updateStatus(
              selectedTestDrive._id,
              nextStatus
            )
          }
        />
      )}
    </div>
  );
}

/* ========================================================================= */
/* DESKTOP ROW                                                               */
/* ========================================================================= */

function DesktopTestDriveRow({
  testDrive,
  busy,
  onOpen,
  onStatusChange,
}) {
  return (
    <tr className="border-b border-black/10 last:border-0">
      {/* Cliente */}
      <td className="px-6 py-5 align-top">
        <button
          type="button"
          onClick={onOpen}
          className="text-left"
        >
          <p className="font-semibold transition hover:text-black/55">
            {testDrive.customerName}
          </p>

          <p className="mt-1 text-xs text-black/45">
            {testDrive.phone}
          </p>

          {testDrive.email && (
            <p className="mt-1 max-w- truncate text-xs text-black/35">
              {testDrive.email}
            </p>
          )}
        </button>
      </td>

      {/* Vehículo */}
      <td className="px-6 py-5 align-top">
        {testDrive.carId ? (
          <Link
            href={`/cars/${testDrive.carId._id}`}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-3"
          >
            <CarThumbnail
              image={
                testDrive.carId
                  .images?.[0]?.url
              }
              alt={`${testDrive.carId.make} ${testDrive.carId.model}`}
              size="desktop"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold group-hover:underline">
                {testDrive.carId.make}{" "}
                {testDrive.carId.model}
              </p>

              <p className="mt-1 text-xs text-black/40">
                {testDrive.carId.year}
              </p>
            </div>
          </Link>
        ) : (
          <span className="text-sm text-black/40">
            Vehículo no disponible
          </span>
        )}
      </td>

      {/* Cita */}
      <td className="px-6 py-5 align-top">
        <p className="text-sm font-semibold">
          {formatFechaOnly(
            testDrive.date
          )}
        </p>

        <p className="mt-1 text-xs text-black/45">
          {formatHora(
            testDrive.time
          )}
        </p>
      </td>

      {/* Estado */}
      <td className="px-6 py-5 align-top">
        <EstadoSelect
          value={testDrive.status}
          disabled={busy}
          onChange={onStatusChange}
        />
      </td>

      {/* Acción */}
      <td className="px-6 py-5 text-right align-top">
        <button
          type="button"
          onClick={onOpen}
          className="rounded-lg border border-black/10 px-4 py-2 text-xs font-semibold transition hover:bg-black hover:text-white"
        >
          Ver
        </button>
      </td>
    </tr>
  );
}

/* ========================================================================= */
/* MOBILE CARD                                                               */
/* ========================================================================= */

function MobileTestDriveCard({
  testDrive,
  busy,
  onOpen,
  onStatusChange,
}) {
  return (
    <article className="p-4 sm:p-5">
      {/* Cliente + status */}
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate text-sm font-semibold sm:text-base">
            {testDrive.customerName}
          </p>

          <p className="mt-1 text-xs text-black/45">
            {testDrive.phone}
          </p>

          {testDrive.email && (
            <p className="mt-1 truncate text-xs text-black/35">
              {testDrive.email}
            </p>
          )}
        </button>

        <EstadoSelect
          value={testDrive.status}
          disabled={busy}
          onChange={onStatusChange}
          compact
        />
      </div>

      {/* Vehículo */}
      <div className="mt-4 rounded-2xl bg-black/[0.035] p-3 sm:p-4">
        {testDrive.carId ? (
          <Link
            href={`/cars/${testDrive.carId._id}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3"
          >
            <CarThumbnail
              image={
                testDrive.carId
                  .images?.[0]?.url
              }
              alt={`${testDrive.carId.make} ${testDrive.carId.model}`}
              size="mobile"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {testDrive.carId.make}{" "}
                {testDrive.carId.model}
              </p>

              <p className="mt-1 text-xs text-black/40">
                {testDrive.carId.year}
              </p>
            </div>
          </Link>
        ) : (
          <p className="text-sm text-black/40">
            Vehículo no disponible
          </p>
        )}
      </div>

      {/* Fecha / hora */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <InfoBlock
          label="Fecha"
          value={formatFechaOnly(
            testDrive.date
          )}
          compact
        />

        <InfoBlock
          label="Hora"
          value={formatHora(
            testDrive.time
          )}
          compact
        />
      </div>

      {/* Acciones */}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
        >
          Ver detalles
        </button>

        <a
          href={`tel:${testDrive.phone}`}
          className="rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold transition hover:bg-black hover:text-white"
        >
          Llamar
        </a>
      </div>
    </article>
  );
}

/* ========================================================================= */
/* STATUS SELECT                                                             */
/* ========================================================================= */

function EstadoSelect({
  value,
  disabled,
  onChange,
  compact = false,
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className={[
        "border border-black/10 bg-white text-xs font-semibold outline-none transition focus:border-black disabled:cursor-not-allowed disabled:opacity-40",
        compact
          ? "max-w- rounded-lg px-2.5 py-2"
          : "rounded-lg px-3 py-2",
      ].join(" ")}
    >
      {STATUS_OPTIONS.map(
        (status) => (
          <option
            key={status}
            value={status}
          >
            {status}
          </option>
        )
      )}
    </select>
  );
}

/* ========================================================================= */
/* MODAL                                                                     */
/* ========================================================================= */

function TestDriveModal({
  testDrive,
  actionId,
  onCerrar,
  onStatusChange,
}) {
  const busy =
    actionId === testDrive._id;

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onCerrar();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onCerrar]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-2 backdrop-blur- sm:items-center sm:p-5"
      onMouseDown={onCerrar}
      role="presentation"
    >
      <div
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h- sm:rounded-3xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="test-drive-modal-title"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-5 border-b border-black/10 px-5 py-5 sm:px-8 sm:py-6">
          <div className="min-w-0">
            <p className="text- font-semibold uppercase tracking-[0.18em] text-black/35 sm:text-xs">
              Solicitud de prueba de manejo
            </p>

            <h2
              id="test-drive-modal-title"
              className="mt-2 truncate text-xl font-semibold tracking-tight sm:text-2xl"
            >
              {testDrive.customerName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar modal"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-lg transition hover:bg-black hover:text-white"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-5 sm:px-8 sm:py-7">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <InfoBlock
              label="Teléfono"
              value={testDrive.phone}
            />

            <InfoBlock
              label="Correo electrónico"
              value={
                testDrive.email ||
                "No indicado"
              }
            />

            <InfoBlock
              label="Fecha"
              value={formatFechaOnly(
                testDrive.date
              )}
            />

            <InfoBlock
              label="Hora"
              value={formatHora(
                testDrive.time
              )}
            />
          </div>

          {/* Vehículo */}
          {testDrive.carId && (
            <div className="mt-5 rounded-2xl bg-black/[0.035] p-4 sm:mt-6 sm:p-5">
              <p className="text- font-semibold uppercase tracking-[0.15em] text-black/35 sm:text-xs">
                Vehículo
              </p>

              <div className="mt-3 flex items-center justify-between gap-3 sm:mt-4 sm:gap-4">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <CarThumbnail
                    image={
                      testDrive.carId
                        .images?.[0]
                        ?.url
                    }
                    alt={`${testDrive.carId.make} ${testDrive.carId.model}`}
                    size="modal"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold sm:text-base">
                      {testDrive.carId.make}{" "}
                      {testDrive.carId.model}
                    </p>

                    <p className="mt-1 text-xs text-black/45 sm:text-sm">
                      {testDrive.carId.year}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/cars/${testDrive.carId._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold transition hover:bg-black hover:text-white"
                >
                  Ver
                </Link>
              </div>
            </div>
          )}

          {/* Mensaje */}
          <div className="mt-5 sm:mt-6">
            <p className="text- font-semibold uppercase tracking-[0.15em] text-black/35 sm:text-xs">
              Mensaje del cliente
            </p>

            <div className="mt-3 rounded-2xl border border-black/10 p-4 sm:p-5">
              <p className="whitespace-pre-line text-sm leading-7 text-black/60">
                {testDrive.message ||
                  "Sin mensaje adicional."}
              </p>
            </div>
          </div>

          {/* Estado */}
          <div className="mt-5 sm:mt-6">
            <p className="mb-3 text- font-semibold uppercase tracking-[0.15em] text-black/35 sm:text-xs">
              Estado
            </p>

            <EstadoSelect
              value={
                testDrive.status
              }
              disabled={busy}
              onChange={
                onStatusChange
              }
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-wrap gap-2 border-t border-black/10 bg-white px-5 py-4 sm:gap-3 sm:px-8 sm:py-5">
          <a
            href={`tel:${testDrive.phone}`}
            className="rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black/80 sm:px-5 sm:py-3"
          >
            Llamar al cliente
          </a>

          {testDrive.email && (
            <a
              href={`mailto:${testDrive.email}`}
              className="rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-black hover:text-white sm:px-5 sm:py-3"
            >
              Enviar correo al cliente
            </a>
          )}

          <button
            type="button"
            onClick={onCerrar}
            className="rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold sm:px-5 sm:py-3"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* CAR THUMBNAIL                                                             */
/* ========================================================================= */

function CarThumbnail({
  image,
  alt,
  size = "desktop",
}) {
  const sizes = {
    desktop:
      "h-12 w-14 rounded-lg",
    mobile:
      "h-14 w-20 rounded-xl",
    modal:
      "h-14 w-20 rounded-xl sm:h-16 sm:w-20",
  };

  return (
    <div
      className={`shrink-0 overflow-hidden bg-black/[0.05] ${sizes[size]}`}
    >
      {image ? (
        <img
          src={image}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full bg-black/[0.04]" />
      )}
    </div>
  );
}

/* ========================================================================= */
/* INFO BLOCK                                                                */
/* ========================================================================= */

function InfoBlock({
  label,
  value,
  compact = false,
}) {
  return (
    <div
      className={`rounded-xl border border-black/10 ${
        compact
          ? "p-3"
          : "p-4"
      }`}
    >
      <p className="text- uppercase tracking-[0.12em] text-black/35 sm:text-xs">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-medium sm:mt-2">
        {value}
      </p>
    </div>
  );
}

/* ========================================================================= */
/* LOADING                                                                   */
/* ========================================================================= */

function LoadingRows() {
  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-5 border-b border-black/10 px-6 py-5 last:border-0"
          >
            <div className="h-12 w-14 animate-pulse rounded-lg bg-black/[0.05]" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-black/[0.05]" />

              <div className="h-3 w-28 animate-pulse rounded bg-black/[0.05]" />
            </div>

            <div className="h-10 w-28 animate-pulse rounded-lg bg-black/[0.05]" />

            <div className="h-10 w-20 animate-pulse rounded-lg bg-black/[0.05]" />
          </div>
        ))}
      </div>

      {/* Mobile */}
      <div className="divide-y divide-black/10 lg:hidden">
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <div
            key={index}
            className="p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 flex-1 animate-pulse rounded bg-black/[0.05]" />

              <div className="h-9 w-24 animate-pulse rounded-lg bg-black/[0.05]" />
            </div>

            <div className="mt-4 h-20 animate-pulse rounded-2xl bg-black/[0.05]" />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="h-16 animate-pulse rounded-xl bg-black/[0.05]" />

              <div className="h-16 animate-pulse rounded-xl bg-black/[0.05]" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ========================================================================= */
/* EMPTY                                                                     */
/* ========================================================================= */

function EmptyState() {
  return (
    <div className="px-5 py-16 text-center sm:px-6 sm:py-20">
      <h3 className="text-lg font-semibold">
        No se encontraron solicitudes de prueba de manejo
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-black/45">
        Las solicitudes de prueba de manejo aparecerán aquí cuando envíen el
        formulario.
      </p>
    </div>
  );
}

/* ========================================================================= */
/* DATE FORMAT                                                               */
/* ========================================================================= */

function formatFechaOnly(value) {
  if (!value) {
    return "—";
  }

  const parts = value.split("-");

  if (parts.length !== 3) {
    return value;
  }

  const [year, month, day] =
    parts;

  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "es-ES",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(
    new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    )
  );
}

/* ========================================================================= */
/* TIME FORMAT                                                               */
/* ========================================================================= */

function formatHora(value) {
  if (!value) {
    return "—";
  }

  const [hour, minute] =
    value.split(":");

  const numericHour = Number(hour);

  if (
    !Number.isInteger(
      numericHour
    ) ||
    !minute
  ) {
    return value;
  }

  const period =
    numericHour >= 12
      ? "PM"
      : "AM";

  const displayHour =
    numericHour % 12 || 12;

  return `${displayHour}:${minute} ${period}`;
}