import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import logo from '../assets/logotipo.svg';
import { Link } from 'react-router-dom';

export default function Cuenta() {
  const { register, login, logout, deleteAccount, user, loading, error, updateProfile } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) await register(email, password, nombre);
    else await login(email, password);
  };

  const [editing, setEditing] = useState(false);
  const [newNombre, setNewNombre] = useState(user?.nombre || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  if (loading) return <p className="text-center text-gray-600 mt-10">Cargando...</p>;

  if (user) {
    const initial = (user.nombre || user.email || '?').trim().charAt(0).toUpperCase();

  const onSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      await updateProfile({ nombre: newNombre !== user.nombre ? newNombre : undefined, photoFile: avatarFile });
      setSaving(false);
      setEditing(false);
      setAvatarFile(null);
    };
    return (
      <div className="container-max py-12 animate-fade-in">
        <div className="max-w-xl mx-auto p-8 md:p-10 bg-white rounded-3xl border border-slate-200/80 shadow-sm text-gray-900 animate-slide-up text-center">
          <div className="flex flex-col items-center mb-6 md:mb-8">
            <div className="relative mb-4">
              <div className="account-avatar relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center ring-2 ring-yellow-300/60 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-yellow-300/30 shadow-sm overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <span aria-hidden className="text-lg md:text-xl font-extrabold text-slate-800 select-none leading-none">{initial}</span>
                )}
              </div>
            </div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight">
              Hola {user.nombre?.split(' ')[0] || 'Usuario'}
            </h2>
            <p className="text-slate-600 text-xs md:text-sm mt-1">{user.email}</p>
            <p className="text-slate-500 text-[11px] md:text-xs leading-relaxed mt-2 max-w-sm mx-auto">Gestiona tu cuenta, revisa tus pedidos y mantén tu información siempre actualizada.</p>
            <div className="pt-3">
              <button type="button" onClick={() => setEditing(v => !v)} className="inline-flex items-center gap-2 text-[10px] md:text-[11px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-md bg-yellow-400 text-slate-900 hover:bg-yellow-300 transition focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {editing ? 'Cancelar' : 'Editar perfil'}
              </button>
            </div>
          </div>

          {editing && (
            <form onSubmit={onSave} className="mb-8 bg-slate-50/70 border border-slate-200 rounded-xl p-6 flex flex-col gap-6 animate-slide-up items-center">
              <div className="w-full grid md:grid-cols-2 gap-6 text-left">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Nombre</label>
                  <input value={newNombre} onChange={(e) => setNewNombre(e.target.value)} className="input-modern bg-slate-900/70" placeholder="Tu nombre" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Avatar</label>
                  <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="text-sm" />
                  {avatarFile && <p className="text-xs text-slate-500 text-center">{avatarFile.name}</p>}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <button type="submit" disabled={saving} className="btn-modern-primary sm:w-48 disabled:opacity-60">{saving ? 'Guardando...' : 'Guardar cambios'}</button>
                <button type="button" onClick={() => { setEditing(false); setAvatarFile(null); setNewNombre(user.nombre || ''); }} className="btn-modern-secondary sm:w-40">Cancelar</button>
              </div>
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            </form>
          )}

          {/* Acciones rápidas */}
          <div className="mt-6 md:mt-8">
            <h3 className="uppercase tracking-wide text-[11px] font-semibold text-slate-500 mb-4">Acciones rápidas</h3>
            <div className="flex flex-wrap justify-center -m-1">
              <Link to="/pedidos" className="m-1 inline-flex items-center justify-center px-4 py-2 rounded-full bg-yellow-400 text-slate-900 font-semibold text-sm shadow-sm hover:bg-yellow-300 transition focus:outline-none focus:ring-2 focus:ring-yellow-400">Mis pedidos</Link>
              <Link to="/carrito" className="m-1 inline-flex items-center justify-center px-4 py-2 rounded-full bg-yellow-400 text-slate-900 font-semibold text-sm shadow-sm hover:bg-yellow-300 transition focus:outline-none focus:ring-2 focus:ring-yellow-400">Carrito</Link>
              <Link to="/catalogo" className="m-1 inline-flex items-center justify-center px-4 py-2 rounded-full bg-yellow-400 text-slate-900 font-semibold text-sm shadow-sm hover:bg-yellow-300 transition focus:outline-none focus:ring-2 focus:ring-yellow-400">Catálogo</Link>
            </div>
          </div>

          <div className="mt-12 md:mt-14 flex flex-col sm:flex-row sm:justify-center gap-6">
            <button onClick={logout} className="btn-modern-primary sm:w-52">Cerrar sesión</button>
            <button
              onClick={() => { if (confirm('\u00BFSeguro que deseas borrar la cuenta? Esta acción no se puede deshacer.')) deleteAccount(); }}
              className="btn-modern-secondary sm:w-52"
            >
              Borrar cuenta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-max py-12 animate-fade-in">
      <div className="max-w-xl mx-auto p-10 bg-white rounded-2xl border border-slate-200 shadow-sm text-center animate-slide-up">
        <img src={logo} alt="Logotipo Click&Go" className="w-24 h-24 object-contain mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold mb-2 tracking-tight">{isRegister ? 'Crea tu cuenta' : 'Inicia sesión'}</h1>
        <p className="text-slate-600 mb-8 text-sm">Accede a tus pedidos, direcciones y métodos de pago.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" className="input-modern bg-slate-900/70" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Correo electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" className="input-modern bg-slate-900/70" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className="input-modern bg-slate-900/70" />
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <div className="flex flex-col gap-4">
            <button type="submit" disabled={loading} className="btn-modern-primary disabled:opacity-50">
              {loading ? 'Cargando...' : (isRegister ? 'Crear cuenta' : 'Iniciar sesión')}
            </button>
            <button type="button" onClick={() => setIsRegister(!isRegister)} className="btn-modern-secondary">
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Crea una'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

}