'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { userService } from '@/services/user.service'
import type { UserItem } from '@/types/user.types'
import { Plus, Loader2, Edit, X, CheckCircle2, XCircle, KeyRound, Shield } from 'lucide-react'

const AVAILABLE_ROLES = ['ADMIN', 'RECEPTIONIST', 'DENTIST']

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [form, setForm] = useState({ username: '', email: '', password: '', roles: [] as string[] })
  const [submitting, setSubmitting] = useState(false)

  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(null)
  const [newPassword, setNewPassword] = useState('')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await userService.getAll()
      if (res.success) setUsers(res.data || [])
    } catch { /* empty */ } finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingUser) {
        await userService.update(editingUser.id, {
          email: form.email,
          roles: form.roles,
        })
      } else {
        await userService.create({
          username: form.username,
          email: form.email,
          password: form.password,
          roles: form.roles,
        })
      }
      setShowForm(false)
      setEditingUser(null)
      setForm({ username: '', email: '', password: '', roles: [] })
      fetchUsers()
    } catch { /* empty */ } finally { setSubmitting(false) }
  }

  const handleDeactivate = async (id: number) => {
    if (!confirm('Disable this user?')) return
    try { await userService.remove(id); fetchUsers() } catch { /* empty */ }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetPasswordUserId || !newPassword) return
    setSubmitting(true)
    try {
      await userService.resetPassword(resetPasswordUserId, { newPassword })
      setShowResetPassword(false)
      setResetPasswordUserId(null)
      setNewPassword('')
    } catch { /* empty */ } finally { setSubmitting(false) }
  }

  const toggleRole = (role: string) => {
    setForm(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role],
    }))
  }

  const roleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-700'
      case 'DENTIST': return 'bg-blue-100 text-blue-700'
      case 'RECEPTIONIST': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <DashboardLayout title="User Management">
      <div className="mb-6 flex justify-end">
        <Button onClick={() => {
          setEditingUser(null)
          setForm({ username: '', email: '', password: '', roles: ['RECEPTIONIST'] })
          setShowForm(true)
        }}>
          <Plus className="mr-2 size-4" />Add User
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">{editingUser ? 'Edit User' : 'New User'}</CardTitle>
            <button onClick={() => { setShowForm(false); setEditingUser(null) }}>
              <X className="size-4" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              {!editingUser && (
                <input
                  placeholder="Username"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required
                  className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              )}
              <input
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              {!editingUser && (
                <input
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              )}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium">Roles</label>
                <div className="flex gap-3">
                  {AVAILABLE_ROLES.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        form.roles.includes(role)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      <Shield className="size-3" />
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingUser(null) }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || form.roles.length === 0}>
                  {submitting ? 'Saving...' : editingUser ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showResetPassword && (
        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Reset Password</CardTitle>
            <button onClick={() => { setShowResetPassword(false); setResetPasswordUserId(null); setNewPassword('') }}>
              <X className="size-4" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="mb-1.5 block text-sm font-medium">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Enter new password"
                  className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <Button type="submit" disabled={submitting || !newPassword}>
                {submitting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>USERNAME</th>
                    <th>EMAIL</th>
                    <th>ROLES</th>
                    <th>STATUS</th>
                    <th>CREATED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="font-medium">{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          {u.roles.map(role => (
                            <span key={role} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeColor(role)}`}>
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {u.enabled
                          ? <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="size-3" />Active</span>
                          : <span className="flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="size-3" />Disabled</span>
                        }
                      </td>
                      <td className="text-xs text-muted-foreground">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingUser(u)
                            setForm({ username: u.username, email: u.email, password: '', roles: u.roles })
                            setShowForm(true)
                          }}
                          className="rounded p-1 text-muted-foreground hover:bg-accent"
                          title="Edit"
                        >
                          <Edit className="size-4" />
                        </button>
                        <button
                          onClick={() => {
                            setResetPasswordUserId(u.id)
                            setNewPassword('')
                            setShowResetPassword(true)
                          }}
                          className="rounded p-1 text-muted-foreground hover:bg-accent"
                          title="Reset Password"
                        >
                          <KeyRound className="size-4" />
                        </button>
                        {u.enabled && (
                          <button
                            onClick={() => handleDeactivate(u.id)}
                            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            title="Disable"
                          >
                            <XCircle className="size-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!users.length && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
