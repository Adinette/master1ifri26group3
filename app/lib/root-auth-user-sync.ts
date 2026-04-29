import bcrypt from 'bcrypt'

import { prisma } from '@/app/lib/prisma'

type CreateRootAuthUserInput = {
  name: string
  email: string
  password: string
}

type UpdateRootAuthUserInput = {
  name?: string
  email?: string
  password?: string
}

export async function findRootAuthUserByEmail(email: string) {
  return prisma.users.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  })
}

export async function createRootAuthUser(input: CreateRootAuthUserInput) {
  const hashedPassword = await bcrypt.hash(input.password, 10)

  return prisma.users.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
    },
    select: { id: true, email: true, name: true },
  })
}

export async function updateRootAuthUserByEmail(currentEmail: string, input: UpdateRootAuthUserInput) {
  const existingUser = await prisma.users.findUnique({
    where: { email: currentEmail },
    select: { id: true },
  })

  if (!existingUser) {
    return null
  }

  const data: {
    name?: string
    email?: string
    password?: string
  } = {}

  if (typeof input.name === 'string' && input.name.trim()) {
    data.name = input.name.trim()
  }

  if (typeof input.email === 'string' && input.email.trim()) {
    data.email = input.email.trim()
  }

  if (typeof input.password === 'string' && input.password.trim()) {
    data.password = await bcrypt.hash(input.password, 10)
  }

  if (Object.keys(data).length === 0) {
    return prisma.users.findUnique({
      where: { id: existingUser.id },
      select: { id: true, email: true, name: true },
    })
  }

  return prisma.users.update({
    where: { id: existingUser.id },
    data,
    select: { id: true, email: true, name: true },
  })
}