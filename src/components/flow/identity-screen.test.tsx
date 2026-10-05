import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdentityScreen } from "./identity-screen";

const { replaceMock, getSessionMock, startGuestSessionMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  getSessionMock: vi.fn(),
  startGuestSessionMock: vi.fn((name: string) => ({
    mode: "guest",
    userId: null,
    displayName: name,
    email: null,
  })),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: replaceMock,
  }),
}));

vi.mock("@/lib/session/guest-session", () => ({
  createGuestName: vi.fn(() => "Invitado 742"),
  getGuestSession: vi.fn(() => null),
  startGuestSession: startGuestSessionMock,
}));

vi.mock("@/lib/auth/auth.service", () => ({
  AuthService: class {
    isAvailable() {
      return true;
    }

    async getSession() {
      return getSessionMock();
    }

    async ensureAnonymousSession(name: string) {
      return { mode: "guest", userId: "user-1", displayName: name, email: null };
    }
  },
}));

describe("IdentityScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    replaceMock.mockReset();
  });

  it("continúa a la pantalla de inicio cuando ya hay una sesión autenticada", async () => {
    getSessionMock.mockResolvedValue({
      mode: "authenticated",
      userId: "user-1",
      displayName: "Luna",
      email: "luna@example.com",
    });

    render(<IdentityScreen />);

    await waitFor(() => {
      expect(startGuestSessionMock).toHaveBeenCalledWith("Luna");
      expect(replaceMock).toHaveBeenCalledWith("/inicio");
    });
  });
});
