"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonTableRows } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/lib/toast-context";
import { ApiError } from "@/lib/api";
import {
  getAdminPickupCities,
  createPickupCity,
  updatePickupCity,
  deletePickupCity,
  createPickupWindow,
  updatePickupWindow,
  deletePickupWindow,
  type AdminPickupCity,
  type AdminPickupWindow,
  type PickupDeleteResult,
} from "@/lib/admin";

/** Matches the backend's limit on how far ahead scheduled pickups can be booked. */
const MAX_HORIZON_DAYS = 14;

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

type CityForm = { id: string | null; name: string; timezone: string; horizon: string; active: boolean };
type WindowForm = {
  id: string | null;
  cityId: string;
  cityName: string;
  startTime: string;
  endTime: string;
  sortOrder: string;
  active: boolean;
};

export default function AdminPickupWindowsPage() {
  const [data, setData] = React.useState<AdminPickupCity[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [cityForm, setCityForm] = React.useState<CityForm | null>(null);
  const [windowForm, setWindowForm] = React.useState<WindowForm | null>(null);
  const [formError, setFormError] = React.useState<string | undefined>(undefined);
  const [saving, setSaving] = React.useState(false);
  const toast = useToast();

  // IANA zone names for the time-zone field's suggestions.
  const zones = React.useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return [];
    }
  }, []);

  const fetchCities = React.useCallback(
    () =>
      getAdminPickupCities()
        .then((d) => {
          setData(d);
          setError(null);
        })
        .catch((err) => setError(errorMessage(err, "Couldn't load pickup cities. Try again.")))
        .finally(() => setLoading(false)),
    [],
  );

  const load = React.useCallback(() => {
    setLoading(true);
    void fetchCities();
  }, [fetchCities]);

  React.useEffect(() => {
    void fetchCities();
  }, [fetchCities]);

  async function run(id: string, action: () => Promise<unknown>, success: string) {
    setBusyId(id);
    try {
      await action();
      load();
      toast(success, "success");
    } catch (err) {
      toast(errorMessage(err, "That didn't work. Try again."), "error");
    } finally {
      setBusyId(null);
    }
  }

  function deletedMessage(what: string, r: PickupDeleteResult) {
    return r.deleted
      ? `${what} deleted.`
      : `${what} is used by ${r.deliveries} ${r.deliveries === 1 ? "delivery" : "deliveries"}, so it was deactivated instead.`;
  }

  async function removeCity(city: AdminPickupCity) {
    const note = city.deliveries > 0 ? " It has bookings, so it will be deactivated instead." : "";
    if (!window.confirm(`Delete ${city.name} and its pickup windows?${note}`)) return;
    setBusyId(city.id);
    try {
      const r = await deletePickupCity(city.id);
      load();
      toast(deletedMessage(city.name, r), "success");
    } catch (err) {
      toast(errorMessage(err, "Couldn't delete the city."), "error");
    } finally {
      setBusyId(null);
    }
  }

  async function removeWindow(city: AdminPickupCity, w: AdminPickupWindow) {
    const note = w.deliveries > 0 ? " It has bookings, so it will be deactivated instead." : "";
    if (!window.confirm(`Delete the ${w.startTime}–${w.endTime} window in ${city.name}?${note}`)) return;
    setBusyId(w.id);
    try {
      const r = await deletePickupWindow(w.id);
      load();
      toast(deletedMessage("Window", r), "success");
    } catch (err) {
      toast(errorMessage(err, "Couldn't delete the window."), "error");
    } finally {
      setBusyId(null);
    }
  }

  function openCity(city?: AdminPickupCity) {
    setFormError(undefined);
    setCityForm(
      city
        ? { id: city.id, name: city.name, timezone: city.timezone, horizon: String(city.bookingHorizonDays), active: city.active }
        : { id: null, name: "", timezone: "", horizon: String(MAX_HORIZON_DAYS), active: true },
    );
  }

  function openWindow(city: AdminPickupCity, w?: AdminPickupWindow) {
    setFormError(undefined);
    setWindowForm(
      w
        ? { id: w.id, cityId: city.id, cityName: city.name, startTime: w.startTime, endTime: w.endTime, sortOrder: String(w.sortOrder), active: w.active }
        : { id: null, cityId: city.id, cityName: city.name, startTime: "", endTime: "", sortOrder: String(city.windows.length), active: true },
    );
  }

  async function saveCity(e: React.FormEvent) {
    e.preventDefault();
    if (!cityForm) return;
    const horizon = Number(cityForm.horizon);
    if (!cityForm.name.trim() || !cityForm.timezone.trim()) {
      setFormError("Enter a city name and its time zone");
      return;
    }
    if (!Number.isInteger(horizon) || horizon < 0 || horizon > MAX_HORIZON_DAYS) {
      setFormError(`Booking horizon must be a whole number of days from 0 to ${MAX_HORIZON_DAYS}`);
      return;
    }
    const input = {
      name: cityForm.name.trim(),
      timezone: cityForm.timezone.trim(),
      bookingHorizonDays: horizon,
      active: cityForm.active,
    };
    setSaving(true);
    try {
      if (cityForm.id) await updatePickupCity(cityForm.id, input);
      else await createPickupCity(input);
      setCityForm(null);
      load();
      toast(cityForm.id ? "City updated." : "City added.", "success");
    } catch (err) {
      setFormError(errorMessage(err, "Couldn't save the city."));
    } finally {
      setSaving(false);
    }
  }

  async function saveWindow(e: React.FormEvent) {
    e.preventDefault();
    if (!windowForm) return;
    const sortOrder = Number(windowForm.sortOrder || 0);
    if (!windowForm.startTime || !windowForm.endTime) {
      setFormError("Enter a start and an end time");
      return;
    }
    if (windowForm.startTime >= windowForm.endTime) {
      setFormError("The window must end after it starts, on the same day");
      return;
    }
    const input = {
      startTime: windowForm.startTime,
      endTime: windowForm.endTime,
      sortOrder: Number.isInteger(sortOrder) && sortOrder >= 0 ? sortOrder : 0,
      active: windowForm.active,
    };
    setSaving(true);
    try {
      if (windowForm.id) await updatePickupWindow(windowForm.id, input);
      else await createPickupWindow(windowForm.cityId, input);
      setWindowForm(null);
      load();
      toast(windowForm.id ? "Window updated." : "Window added.", "success");
    } catch (err) {
      setFormError(errorMessage(err, "Couldn't save the window."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1120px]">
      <PageHeader
        title="Pickup windows"
        subtitle="Cities that take scheduled pickups, each with its own time zone and bookable windows. Customers see times in the city's local time."
        actions={
          <Button variant="primary" onClick={() => openCity()}>
            <Icon name="plus" size={14} /> New city
          </Button>
        }
      />

      {loading && !data && (
        <Table>
          <Tbody>
            <SkeletonTableRows rows={6} columns={5} />
          </Tbody>
        </Table>
      )}
      {error && <EmptyState icon="alert" title="Couldn't load pickup cities" description={error} />}

      {data && !error && data.length === 0 && (
        <EmptyState
          icon="calendar"
          title="No pickup cities yet"
          description="Scheduled deliveries can't be booked until a city has at least one active window."
        />
      )}

      {data && !error && data.length > 0 && (
        <div className="flex flex-col gap-8">
          {data.map((city) => (
            <section key={city.id} className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h2 className="text-base font-semibold m-0">{city.name}</h2>
                <Tag variant={city.active ? "success" : "neutral"}>{city.active ? "Active" : "Inactive"}</Tag>
                <span className="text-[13px] text-neutral-700">
                  {city.timezone} · bookable up to {city.bookingHorizonDays} {city.bookingHorizonDays === 1 ? "day" : "days"} ahead
                  {city.deliveries > 0 ? ` · ${city.deliveries} scheduled ${city.deliveries === 1 ? "delivery" : "deliveries"}` : ""}
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <Button variant="ghost" disabled={busyId === city.id} onClick={() => openCity(city)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={busyId === city.id}
                    onClick={() =>
                      run(
                        city.id,
                        () => updatePickupCity(city.id, { active: !city.active }),
                        city.active ? `${city.name} deactivated.` : `${city.name} activated.`,
                      )
                    }
                  >
                    {city.active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="ghost" disabled={busyId === city.id} onClick={() => removeCity(city)}>
                    Delete
                  </Button>
                  <Button variant="secondary" onClick={() => openWindow(city)}>
                    <Icon name="plus" size={14} /> Add window
                  </Button>
                </div>
              </div>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Window ({city.name} time)</Th>
                    <Th>Status</Th>
                    <Th>Order</Th>
                    <Th>Bookings</Th>
                    <Th>&nbsp;</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {city.windows.length === 0 && (
                    <Tr>
                      <Td colSpan={5} className="text-neutral-600">
                        No windows yet. Add one so customers can book scheduled pickups in {city.name}.
                      </Td>
                    </Tr>
                  )}
                  {city.windows.map((w) => (
                    <Tr key={w.id}>
                      <Td className="font-medium">
                        {w.startTime}–{w.endTime}
                      </Td>
                      <Td>
                        <Tag variant={w.active ? "success" : "neutral"}>{w.active ? "Active" : "Inactive"}</Tag>
                      </Td>
                      <Td className="text-neutral-700">{w.sortOrder}</Td>
                      <Td className="text-neutral-700">{w.deliveries}</Td>
                      <Td>
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" disabled={busyId === w.id} onClick={() => openWindow(city, w)}>
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            disabled={busyId === w.id}
                            onClick={() =>
                              run(
                                w.id,
                                () => updatePickupWindow(w.id, { active: !w.active }),
                                w.active ? "Window deactivated." : "Window activated.",
                              )
                            }
                          >
                            {w.active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button variant="ghost" disabled={busyId === w.id} onClick={() => removeWindow(city, w)}>
                            Delete
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </section>
          ))}
        </div>
      )}

      <Modal open={!!cityForm} onClose={() => setCityForm(null)}>
        <ModalHeader title={cityForm?.id ? "Edit city" : "New pickup city"} onClose={() => setCityForm(null)} />
        {cityForm && (
          <form onSubmit={saveCity}>
            <ModalBody className="flex flex-col gap-4">
              <Field label="City" htmlFor="pickup-city-name" required>
                <Input
                  id="pickup-city-name"
                  value={cityForm.name}
                  onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
                  placeholder="Lagos"
                />
              </Field>
              <Field
                label="Time zone"
                htmlFor="pickup-city-zone"
                required
                hint="IANA name. Pickup windows in this city are read in this zone's local time."
              >
                <Input
                  id="pickup-city-zone"
                  list="pickup-city-zones"
                  value={cityForm.timezone}
                  onChange={(e) => setCityForm({ ...cityForm, timezone: e.target.value })}
                  placeholder="Africa/Lagos"
                />
                <datalist id="pickup-city-zones">
                  {zones.map((z) => (
                    <option key={z} value={z} />
                  ))}
                </datalist>
              </Field>
              <Field
                label="Booking horizon (days)"
                htmlFor="pickup-city-horizon"
                required
                hint={`How many days after today (city time) customers can book. 0 means today only; at most ${MAX_HORIZON_DAYS}.`}
              >
                <Input
                  id="pickup-city-horizon"
                  type="number"
                  min="0"
                  max={MAX_HORIZON_DAYS}
                  step="1"
                  value={cityForm.horizon}
                  onChange={(e) => setCityForm({ ...cityForm, horizon: e.target.value })}
                />
              </Field>
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={cityForm.active}
                  onChange={(e) => setCityForm({ ...cityForm, active: e.target.checked })}
                />
                Offer scheduled pickups in this city
              </label>
              {formError && <p className="text-sm text-error m-0">{formError}</p>}
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="secondary" onClick={() => setCityForm(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </ModalFooter>
          </form>
        )}
      </Modal>

      <Modal open={!!windowForm} onClose={() => setWindowForm(null)}>
        <ModalHeader
          title={windowForm?.id ? `Edit window · ${windowForm.cityName}` : `New window · ${windowForm?.cityName ?? ""}`}
          onClose={() => setWindowForm(null)}
        />
        {windowForm && (
          <form onSubmit={saveWindow}>
            <ModalBody className="flex flex-col gap-4">
              <p className="text-[13px] text-neutral-700 m-0">
                Times are {windowForm.cityName} local time. Customers book the window&apos;s start time.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Starts" htmlFor="pickup-window-start" required>
                  <Input
                    id="pickup-window-start"
                    type="time"
                    step="60"
                    value={windowForm.startTime}
                    onChange={(e) => setWindowForm({ ...windowForm, startTime: e.target.value })}
                  />
                </Field>
                <Field label="Ends" htmlFor="pickup-window-end" required>
                  <Input
                    id="pickup-window-end"
                    type="time"
                    step="60"
                    value={windowForm.endTime}
                    onChange={(e) => setWindowForm({ ...windowForm, endTime: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Display order" htmlFor="pickup-window-order" optional>
                <Input
                  id="pickup-window-order"
                  type="number"
                  min="0"
                  step="1"
                  value={windowForm.sortOrder}
                  onChange={(e) => setWindowForm({ ...windowForm, sortOrder: e.target.value })}
                />
              </Field>
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={windowForm.active}
                  onChange={(e) => setWindowForm({ ...windowForm, active: e.target.checked })}
                />
                Customers can book this window
              </label>
              {formError && <p className="text-sm text-error m-0">{formError}</p>}
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="secondary" onClick={() => setWindowForm(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </ModalFooter>
          </form>
        )}
      </Modal>
    </div>
  );
}
