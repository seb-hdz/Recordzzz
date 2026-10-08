// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks } from '@generouted/solid-router/client'

export type Path =
  | `/`
  | `/items`
  | `/items/new-item`
  | `/records`
  | `/records/:id`
  | `/records/new`
  | `/reports`
  | `/settings`
  | `/waves`
  | `/waves/new-wave`

export type Params = {
  '/records/:id': { id: string }
}

export type ModalPath = never

export const { A, Navigate } = components<Path, Params>()
export const { useMatch, useModals, useNavigate, useParams } = hooks<Path, Params, ModalPath>()
