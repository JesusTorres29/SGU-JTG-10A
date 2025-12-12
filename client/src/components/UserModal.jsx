import { useEffect, useState } from "react";

export default function UserModal({
  show,
  mode = "create",
  initialData = { name: "", email: "", phone: "" },
  onClose,
  onSubmit,
  saving = false,
}) {
  const [form, setForm] = useState(initialData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initialData);
    setErrors({});
  }, [initialData, show]);

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Requerido";
    if (!form.email?.trim()) e.email = "Requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (!form.phone?.trim()) e.phone = "Requerido";
    else if (!/^[0-9]{7,15}$/.test(form.phone.replace(/\D/g, ''))) e.phone = "Teléfono inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className="modal-panel">
        <div className="modal-header">
          <div>
            <h5 className="modal-title">
              {mode === "create" ? "✨ Nuevo usuario" : "✏️ Editar usuario"}
            </h5>
            <div style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem'}}>
              {mode === 'create' ? 'Completa el formulario para crear un nuevo usuario' : 'Modifica la información del usuario'}
            </div>
          </div>
          <button 
            className="icon-btn" 
            onClick={onClose} 
            aria-label="Cerrar" 
            disabled={saving}
            style={{width: '36px', height: '36px'}}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">
                <span style={{marginRight: '0.5rem'}}>👤</span>
                Nombre completo
              </label>
              <input
                type="text"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                placeholder="Ingresa el nombre completo"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={saving}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">
                <span style={{marginRight: '0.5rem'}}>📧</span>
                Correo electrónico
              </label>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                placeholder="usuario@ejemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={saving}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">
                <span style={{marginRight: '0.5rem'}}>📱</span>
                Teléfono
              </label>
              <input
                type="text"
                className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                placeholder="1234567890"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={saving}
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>
          </div>

          <div className="modal-footer">
            <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>
              {mode === 'create' ? '💡 El usuario será agregado al sistema' : '💾 Los cambios se guardarán permanentemente'}
            </div>
            <div style={{display: 'flex', gap: '0.75rem'}}>
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={onClose} 
                disabled={saving}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span style={{marginRight: '0.5rem'}}>⏳</span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span style={{marginRight: '0.5rem'}}>
                      {mode === 'create' ? '✨' : '💾'}
                    </span>
                    {mode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

