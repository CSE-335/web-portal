/** @jest-environment node */
import { POST } from "./route";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

jest.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: jest.fn(),
}));

type SupabaseResult = { data?: unknown; error: { message: string } | null };

const mockedGetSupabaseAdmin = getSupabaseAdmin as jest.MockedFunction<typeof getSupabaseAdmin>;

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/feedback", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function buildAdminClient({
  settingsResult,
  insertResult,
}: {
  settingsResult: SupabaseResult;
  insertResult: SupabaseResult;
}) {
  return {
    from: jest.fn((table: string) => {
      if (table === "app_settings") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn(async () => settingsResult),
            })),
          })),
        };
      }

      if (table === "feedback") {
        return {
          insert: jest.fn(async () => insertResult),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    }),
  };
}

describe("POST /api/feedback", () => {
  const originalEnv = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FEEDBACK_FROM_EMAIL: process.env.FEEDBACK_FROM_EMAIL,
    FEEDBACK_RECIPIENT_EMAIL: process.env.FEEDBACK_RECIPIENT_EMAIL,
    FEEDBACK_SETTINGS_KEY: process.env.FEEDBACK_SETTINGS_KEY,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RESEND_API_KEY = "test-resend-key";
    process.env.FEEDBACK_FROM_EMAIL = "onboarding@resend.dev";
    process.env.FEEDBACK_RECIPIENT_EMAIL = "fallback@example.com";
    process.env.FEEDBACK_SETTINGS_KEY = "feedback_recipient_email";
    global.fetch = jest.fn(async () => ({ ok: true } as Response));
  });

  afterAll(() => {
    process.env.RESEND_API_KEY = originalEnv.RESEND_API_KEY;
    process.env.FEEDBACK_FROM_EMAIL = originalEnv.FEEDBACK_FROM_EMAIL;
    process.env.FEEDBACK_RECIPIENT_EMAIL = originalEnv.FEEDBACK_RECIPIENT_EMAIL;
    process.env.FEEDBACK_SETTINGS_KEY = originalEnv.FEEDBACK_SETTINGS_KEY;
  });

  it("saves feedback and sends email when everything succeeds", async () => {
    const adminClient = buildAdminClient({
      settingsResult: { data: { value: "team@example.com" }, error: null },
      insertResult: { error: null },
    });
    mockedGetSupabaseAdmin.mockReturnValue(
      adminClient as unknown as ReturnType<typeof getSupabaseAdmin>
    );

    const response = await POST(
      makeRequest({
        name: "Nat",
        email: "nat@example.com",
        issues: "Great app",
        futureIdeas: "Add more games",
        returnLikelihood: "likely",
        comments: "Thanks!",
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      emailSent: true,
      message: "Feedback submitted successfully.",
    });

    expect(adminClient.from).toHaveBeenCalledWith("feedback");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("returns user-facing error when email fails to send", async () => {
    const adminClient = buildAdminClient({
      settingsResult: { data: { value: "team@example.com" }, error: null },
      insertResult: { error: null },
    });
    mockedGetSupabaseAdmin.mockReturnValue(
      adminClient as unknown as ReturnType<typeof getSupabaseAdmin>
    );
    global.fetch = jest.fn(async () => ({
      ok: false,
      text: async () => "resend rejected",
    } as Response));

    const response = await POST(
      makeRequest({
        name: "Nat",
        email: "nat@example.com",
        issues: "Great app",
      })
    );
    const json = await response.json();

    expect(response.status).toBe(502);
    expect(json).toEqual({
      success: false,
      emailSent: false,
      error: "There was an error submitting your feedback. Please contact the team for further help.",
    });
  });

  it("returns 500 when feedback cannot be inserted", async () => {
    const adminClient = buildAdminClient({
      settingsResult: { data: { value: "team@example.com" }, error: null },
      insertResult: { error: { message: "insert failed" } },
    });
    mockedGetSupabaseAdmin.mockReturnValue(
      adminClient as unknown as ReturnType<typeof getSupabaseAdmin>
    );

    const response = await POST(
      makeRequest({
        name: "Nat",
        email: "nat@example.com",
        issues: "Great app",
      })
    );
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({
      error: "Failed to save feedback to database.",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
