import { supabase } from './supabase'

// Types
export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  style_preferences?: Record<string, any>
  body_measurements?: Record<string, any>
  climate_zone?: string
  created_at: string
  updated_at: string
}

export interface ClothingItem {
  id: string
  user_id: string
  name: string
  category: string
  subcategory?: string
  colors: string[]
  pattern?: string
  style?: string
  seasons: string[]
  material?: string
  brand?: string
  size?: string
  purchase_date?: string
  purchase_price?: number
  image_url: string
  ai_analysis?: Record<string, any>
  wear_count: number
  last_worn?: string
  is_favorite: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Outfit {
  id: string
  user_id: string
  name: string
  description?: string
  occasion?: string
  season?: string
  weather_suitable: string[]
  style_tags: string[]
  clothing_item_ids: string[]
  canvas_image?: string
  ai_generated: boolean
  confidence_score: number
  favorite_count: number
  is_public: boolean
  is_favorite: boolean
  created_at: string
  updated_at: string
}

// User functions - using Supabase Auth instead of custom users table
export async function createUser(userData: Partial<User>) {
  // User creation handled by Supabase Auth
  console.log('User creation handled by Supabase Auth')
  return null
}

export async function getUserById(userId: string) {
  // Use Supabase Auth user data
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || user.id !== userId) {
    throw new Error('User not found')
  }
  
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.email?.split('@')[0] || '',
    username: user.user_metadata?.username || '',
    created_at: user.created_at
  }
}

// Clothing items functions
export async function getClothingItems(userId: string) {
  const { data, error } = await supabase
    .from('clothing_items')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createClothingItem(itemData: Partial<ClothingItem>) {
  const { data, error } = await supabase
    .from('clothing_items')
    .insert(itemData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateClothingItem(itemId: string, updates: Partial<ClothingItem>) {
  const { data, error } = await supabase
    .from('clothing_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteClothingItem(itemId: string) {
  const { error } = await supabase
    .from('clothing_items')
    .update({ is_active: false })
    .eq('id', itemId)

  if (error) throw error
}

// Outfits functions
export async function getOutfits(userId: string) {
  const { data, error } = await supabase
    .from('outfits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createOutfit(outfitData: Partial<Outfit>) {
  const { data, error } = await supabase
    .from('outfits')
    .insert(outfitData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateOutfit(outfitId: string, updates: Partial<Outfit>) {
  const { data, error } = await supabase
    .from('outfits')
    .update(updates)
    .eq('id', outfitId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteOutfit(outfitId: string) {
  const { error } = await supabase
    .from('outfits')
    .delete()
    .eq('id', outfitId)

  if (error) throw error
}

// Outfit logs functions
export async function logOutfitUsage(logData: {
  user_id: string
  outfit_id?: string
  worn_date: string
  occasion?: string
  weather?: string
  temperature?: number
  user_rating?: number
  notes?: string
}) {
  const { data, error } = await supabase
    .from('outfit_logs')
    .insert(logData)
    .select()
    .single()

  if (error) throw error
  return data
}

// Style preferences functions
export async function getStylePreferences(userId: string) {
  const { data, error } = await supabase
    .from('style_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateStylePreferences(userId: string, preferences: Partial<any>) {
  const { data, error } = await supabase
    .from('style_preferences')
    .upsert({ user_id: userId, ...preferences })
    .select()
    .single()

  if (error) throw error
  return data
}

// Analytics functions
export async function getWardrobeStats(userId: string) {
  const { data, error } = await supabase
    .from('wardrobe_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

// Recommendations functions
export async function getRecommendations(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*, outfits(*)')
    .eq('user_id', userId)
    .order('confidence_score', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function recordRecommendationFeedback(
  recommendationId: string,
  feedback: boolean,
  notes?: string
) {
  const { data, error } = await supabase
    .from('recommendations')
    .update({ user_feedback: feedback, feedback_notes: notes })
    .eq('id', recommendationId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Storage functions
export async function uploadClothingImage(file: File, userId: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('clothing-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('clothing-images')
    .getPublicUrl(fileName)

  return publicUrl
}

export async function deleteClothingImage(imageUrl: string) {
  const fileName = imageUrl.split('/').pop()
  if (!fileName) return

  const { error } = await supabase.storage
    .from('clothing-images')
    .remove([fileName])

  if (error) throw error
}
