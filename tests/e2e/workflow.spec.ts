import { test, expect, type Browser, type BrowserContext } from "@playwright/test";

const password = process.env.TECHFLOW_E2E_PASSWORD;

async function signedIn(browser: Browser, email: string): Promise<BrowserContext> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/(citizen|admin|worker)\/dashboard/);
  return context;
}

test("four roles can submit, review, assign, start, and track a complaint", async ({ browser, request }) => {
  test.skip(!password, "Set TECHFLOW_E2E_PASSWORD after migrating and seeding a test database");
  const email = `citizen-${Date.now()}@techflow.example`;
  const registration = await request.post("/api/auth/register", { data: { name: "Workflow Citizen", email, password } });
  expect(registration.status()).toBe(201);
  const citizen = await signedIn(browser, email);
  const categoriesResponse = await citizen.request.get("/api/categories");
  const categories = (await categoriesResponse.json()).data as { id: string; name: string }[];
  const roads = categories.find(c => c.name === "Damaged Roads & Potholes");
  expect(roads).toBeTruthy();
  const created = await citizen.request.post("/api/complaints", { data: { title: "Pothole at the test junction", description: "A large pothole is making this junction unsafe for vehicles.", categoryId: roads!.id, address: "Test Junction, Main Road", latitude: 12.9716, longitude: 77.5946, images: [] } });
  expect(created.status()).toBe(201);
  const { complaint } = (await created.json()).data as { complaint: { id: string; ticketNumber: string } };
  expect(complaint.ticketNumber).toMatch(/^TF-\d{4}-\d{6,}$/);
  expect((await citizen.request.get(`/api/complaints/${complaint.id}`)).status()).toBe(200);
  expect((await citizen.request.patch(`/api/complaints/${complaint.id}`, { data: { title: "Large pothole at the test junction" } })).status()).toBe(200);
  const duplicate = await citizen.request.get(`/api/complaints/duplicates?categoryId=${roads!.id}&latitude=12.9716&longitude=77.5946`);
  expect((await duplicate.json()).data.some((x: { id: string }) => x.id === complaint.id)).toBe(true);

  const admin = await signedIn(browser, "superadmin@techflow.example");
  expect((await admin.request.patch(`/api/complaints/${complaint.id}/status`, { data: { status: "UNDER_REVIEW", remarks: "Reviewed in workflow test" } })).status()).toBe(200);
  const workersResponse = await admin.request.get("/api/workers");
  const workers = (await workersResponse.json()).data as { id: string; email: string }[];
  const worker = workers.find(w => w.email === "worker@techflow.example");
  expect(worker).toBeTruthy();
  const departmentAdmin = await signedIn(browser, "roadsadmin@techflow.example");
  expect((await departmentAdmin.request.get(`/api/complaints/${complaint.id}`)).status()).toBe(200);
  expect((await departmentAdmin.request.post(`/api/complaints/${complaint.id}/assign`, { data: { workerId: worker!.id } })).status()).toBe(201);
  const overview = (await (await admin.request.get("/api/analytics/overview")).json()).data as { total: number };
  expect(overview.total).toBeGreaterThan(0);

  const fieldWorker = await signedIn(browser, "worker@techflow.example");
  expect((await fieldWorker.request.patch(`/api/complaints/${complaint.id}/status`, { data: { status: "IN_PROGRESS" } })).status()).toBe(200);
  const track = (await (await request.get(`/api/track/${complaint.ticketNumber}`)).json()).data as { status: string };
  expect(track.status).toBe("IN_PROGRESS");

  await Promise.all([citizen.close(), admin.close(), departmentAdmin.close(), fieldWorker.close()]);
});
