import type { CommunityPost } from '@/types/community'

const STORAGE_KEY = 'localhub:community-posts'

function sortPosts(posts: CommunityPost[]): CommunityPost[] {
  return [...posts].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
}

export function readCommunityPosts(): CommunityPost[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as CommunityPost[]
    return sortPosts(parsed)
  } catch {
    return []
  }
}

export function writeCommunityPosts(posts: CommunityPost[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sortPosts(posts)))
}

export function createCommunityPost(input: {
  title: string
  content: string
  password: string
}): CommunityPost {
  const now = new Date().toISOString()

  const post: CommunityPost = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title.trim(),
    content: input.content.trim(),
    password: input.password,
    createdAt: now,
    updatedAt: now
  }

  const posts = readCommunityPosts()
  writeCommunityPosts([post, ...posts])

  return post
}

export function getCommunityPostById(id: string): CommunityPost | null {
  return readCommunityPosts().find((post) => post.id === id) ?? null
}

export function updateCommunityPost(
  id: string,
  input: {
    title: string
    content: string
    password: string
  }
): CommunityPost | null {
  const posts = readCommunityPosts()
  const target = posts.find((post) => post.id === id)

  if (!target) return null
  if (target.password !== input.password) return null

  target.title = input.title.trim()
  target.content = input.content.trim()
  target.updatedAt = new Date().toISOString()

  writeCommunityPosts(posts)
  return target
}

export function deleteCommunityPost(id: string, password: string): boolean {
  const posts = readCommunityPosts()
  const target = posts.find((post) => post.id === id)

  if (!target) return false
  if (target.password !== password) return false

  const nextPosts = posts.filter((post) => post.id !== id)
  writeCommunityPosts(nextPosts)
  return true
}