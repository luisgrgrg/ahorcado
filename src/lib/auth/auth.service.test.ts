import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/client";
import { AuthService } from "./auth.service";

vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));

const mockedCreateClient = vi.mocked(createClient);
const user = { id: "user-1", email: "jugador@example.com", user_metadata: { display_name: "Luna" } };
const session = { user };

function clientWithAuth(overrides: Record<string, unknown> = {}) {
  return {
    auth: {
      signUp: vi.fn().mockResolvedValue({ data: { session }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { session }, error: null }),
      signInAnonymously: vi.fn().mockResolvedValue({ data: { session: { user: { ...user, is_anonymous: true } } }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
      onAuthStateChange: vi.fn(),
      ...overrides,
    },
  };
}

describe("AuthService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("QA-AUTH-001 registra con correo, contraseña y nombre", async () => {
    const client = clientWithAuth();
    mockedCreateClient.mockReturnValue(client as never);
    await new AuthService().signUp({ email: "jugador@example.com", password: "secret123", displayName: "Luna" });
    expect(client.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({ email: "jugador@example.com", options: { data: { display_name: "Luna" } } }));
  });

  it("QA-AUTH-002 inicia sesión y crea el perfil de jugador", async () => {
    mockedCreateClient.mockReturnValue(clientWithAuth() as never);
    await expect(new AuthService().signIn({ email: "jugador@example.com", password: "secret123" })).resolves.toMatchObject({ mode: "authenticated", displayName: "Luna" });
  });

  it("QA-AUTH-003 propaga un login incorrecto", async () => {
    mockedCreateClient.mockReturnValue(clientWithAuth({ signInWithPassword: vi.fn().mockResolvedValue({ data: { session: null }, error: { message: "Credenciales inválidas" } }) }) as never);
    await expect(new AuthService().signIn({ email: "x@example.com", password: "badpass" })).rejects.toThrow("Credenciales inválidas");
  });

  it("QA-AUTH-004 recupera la sesión existente", async () => {
    mockedCreateClient.mockReturnValue(clientWithAuth() as never);
    await expect(new AuthService().getSession()).resolves.toMatchObject({ userId: "user-1", email: "jugador@example.com" });
  });

  it("QA-AUTH-005 cierra la sesión", async () => {
    const client = clientWithAuth();
    mockedCreateClient.mockReturnValue(client as never);
    await new AuthService().signOut();
    expect(client.auth.signOut).toHaveBeenCalledOnce();
  });

  it("QA-AUTH-006 crea una identidad anónima para las salas", async () => {
    const client = clientWithAuth({ getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }) });
    mockedCreateClient.mockReturnValue(client as never);
    await expect(new AuthService().ensureAnonymousSession("Invitado 482")).resolves.toMatchObject({ mode: "guest", userId: "user-1" });
    expect(client.auth.signInAnonymously).toHaveBeenCalledWith({ options: { data: { display_name: "Invitado 482" } } });
  });
});
