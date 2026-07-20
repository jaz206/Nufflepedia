import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">Entrar</h1>
        <p className="text-center text-zinc-500 mb-8">
          Sin contraseña: te mandamos un enlace de acceso al correo.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
