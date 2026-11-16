import type { Access, FieldAccess, PayloadRequest } from 'payload'

export type Role = 'admin' | 'editor' | 'build'

type UserLike = { role?: Role | null } | null | undefined

export const hasRole = (user: unknown, ...roles: Role[]): boolean => {
  const role = (user as UserLike)?.role
  return Boolean(role && roles.includes(role))
}

export const roleIs =
  (...roles: Role[]) =>
  ({ req }: { req: PayloadRequest }): boolean =>
    hasRole(req.user, ...roles)

/** Users who may sign in to the admin UI. */
export const canUseAdmin = roleIs('admin', 'editor')
export const isAdmin: Access = roleIs('admin')
export const isEditor: Access = roleIs('admin', 'editor')
/** Content readers: editors plus the read-only build key. The public has no REST access. */
export const isContentReader: Access = roleIs('admin', 'editor', 'build')
export const isAdminField: FieldAccess = ({ req }) => hasRole(req.user, 'admin')
export const nobody = () => false
export const anyone = () => true
