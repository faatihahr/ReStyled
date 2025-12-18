import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string;
  name?: string;
  username?: string;
  email: string;
  profile_picture?: string;
  header_image?: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  username: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) throw error

      // Use Supabase Auth user data directly
      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || '',
        username: data.user.user_metadata?.username || '',
        profile_picture: data.user.user_metadata?.profile_picture || '',
        header_image: data.user.user_metadata?.header_image || '',
        created_at: data.user.created_at
      }

      return {
        success: true,
        message: 'Login successful',
        user,
        token: data.session.access_token
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed')
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
            username: credentials.username
          }
        }
      })

      if (error) throw error

      // Create user profile in metadata
      if (data.user) {
        try {
          await supabase.auth.updateUser({
            data: {
              user_metadata: {
                name: credentials.name,
                username: credentials.username
              }
            }
          })
        } catch (profileError) {
          console.log('Profile update error:', profileError)
        }
      }

      const user: User = {
        id: data.user!.id,
        email: data.user!.email!,
        name: credentials.name,
        username: credentials.username,
        profile_picture: '',
        header_image: '',
        created_at: data.user!.created_at
      }

      return {
        success: true,
        message: 'Registration successful',
        user,
        token: data.session?.access_token || ''
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Registration failed')
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null

      // Use Supabase Auth user data directly
      return {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split('@')[0] || '',
        username: user.user_metadata?.username || '',
        profile_picture: user.user_metadata?.profile_picture || '',
        header_image: user.user_metadata?.header_image || '',
        created_at: user.created_at
      }
    } catch (error) {
      return null
    }
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut()
  },

  storeToken(token: string): void {
    // Supabase handles token storage automatically
  },

  async getToken(): Promise<string | null> {
    // Get token from Supabase session
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  },

  removeToken(): void {
    // Supabase handles token removal automatically
  },

  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  },

  // Listen to auth changes
  onAuthChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  },

  // Verify JWT token and return user
  async verifyToken(token: string): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) {
        return null
      }

      return {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split('@')[0] || '',
        username: user.user_metadata?.username || '',
        profile_picture: user.user_metadata?.profile_picture || '',
        header_image: user.user_metadata?.header_image || '',
        created_at: user.created_at
      }
    } catch (error) {
      return null
    }
  }
};
