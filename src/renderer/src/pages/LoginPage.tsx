import { JSX, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const LoginPage = (): JSX.Element => {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleSubmit = async (): Promise<void> => {
    if (!password || isVerifying) return

    setIsVerifying(true)
    setHasError(false)

    try {
      const isValid = await window.api.verifyAdminPassword(password)

      if (isValid) {
        navigate('/', { replace: true })
        return
      }

      setHasError(true)
      setPassword('')
      inputRef.current?.focus()
    } catch {
      setHasError(true)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background mashrabiya-overlay p-6">
      <div className="w-full max-w-md">
        {/* Marca */}
        <div className="text-center mb-stack-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-primary/30 bg-primary/5 mb-stack-md">
            <span className="material-symbols-outlined text-primary text-4xl">restaurant</span>
          </div>
          <h1 className="font-h1 text-primary text-h1">Syriana</h1>
          <p className="font-label-caps text-label-caps text-on-surface-variant mt-2">
            PAINEL GERENCIAL
          </p>
        </div>

        {/* Card de login */}
        <div className="gold-glass rounded-xl p-card-padding shadow-md">
          <div className="flex items-center gap-2 mb-stack-sm">
            <span className="material-symbols-outlined text-primary">lock</span>
            <h2 className="font-h3 text-h3 text-on-surface">Área restrita</h2>
          </div>
          <p className="font-body-md text-sm text-on-surface-variant opacity-80 mb-stack-md">
            Digite a senha de administrador para acessar o dashboard.
          </p>

          <label className="font-label-caps text-label-caps text-on-surface-variant block mb-stack-sm">
            SENHA DE ADMINISTRADOR
          </label>

          <div
            className={`relative flex items-center rounded-lg border bg-surface-container-low transition-colors ${
              hasError
                ? 'border-error'
                : 'border-outline-variant focus-within:border-primary'
            }`}
          >
            <input
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              autoFocus
              onChange={(e) => {
                setPassword(e.target.value)
                setHasError(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit()
              }}
              placeholder="••••••••"
              className="flex-1 bg-transparent px-4 py-3 text-on-surface outline-none font-body-md placeholder:text-on-surface-variant/40"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((value) => !value)}
              className="px-3 text-on-surface-variant hover:text-primary transition-colors"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <span className="material-symbols-outlined text-xl">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          {hasError && (
            <div className="flex items-center gap-1 mt-stack-sm text-error">
              <span className="material-symbols-outlined text-base">error_outline</span>
              <span className="font-body-md text-xs">Senha incorreta. Tente novamente.</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!password || isVerifying}
            className="w-full mt-stack-lg bg-primary text-on-primary font-bold py-3 rounded-lg hover:bg-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <span className="material-symbols-outlined animate-spin-gold text-xl">
                progress_activity
              </span>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">login</span>
                Entrar
              </>
            )}
          </button>
        </div>

        <p className="text-center font-body-md text-xs text-on-surface-variant opacity-40 mt-stack-lg">
          © 2026 Restaurante Syriana
        </p>
      </div>
    </div>
  )
}
