import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import logoHub from "../../assets/logoHUB.png";
import { isAuthenticated, login } from "../lib/auth";

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const ok = login(username, password);
    if (!ok) {
      setError("Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.");
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">

          {/* Left panel */}
          <div className="flex flex-col justify-center bg-gradient-to-br from-emerald-600 to-cyan-700 p-8 text-white sm:p-10 lg:p-12">
            {/* Logo giữ nguyên tỉ lệ vuông */}
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 p-2 shadow-md">
              <img
                src={logoHub}
                alt="Logo HUB"
                className="h-full w-full object-contain"
              />
            </div>

            <h1 className="mt-8 text-3xl font-bold tracking-tight">HealthLink HUB</h1>
            <p className="mt-3 text-sm leading-6 text-emerald-50 sm:text-base">
              Hệ thống quản lý phòng khám giúp theo dõi bệnh nhân, lịch hẹn và vận hành hằng ngày một cách tập trung.
            </p>

            <div className="mt-8 rounded-xl border border-white/20 bg-white/10 p-4 text-sm space-y-1">
              <p className="font-semibold">Tài khoản quản trị</p>
              <p className="text-emerald-100">Username: nhom7</p>
              <p className="text-emerald-100">Nhóm 7 — ITS326_252_1_D01</p>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex items-center p-8 sm:p-10 lg:p-12">
            <div className="w-full">
              <h2 className="text-2xl font-semibold text-slate-900">Đăng nhập</h2>
              <p className="mt-2 text-sm text-slate-500">
                Nhập thông tin để truy cập hệ thống HealthLink.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-700">
                    Tài khoản
                  </label>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Nhập tài khoản"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                    Mật khẩu
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Nhập mật khẩu"
                    required
                  />
                </div>

                {error ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="h-11 w-full rounded-lg bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-700 active:bg-emerald-800"
                >
                  Đăng nhập
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
