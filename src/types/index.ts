
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_favorite: boolean;
  tags?: string[];
}

export interface NoteFormData {
  title: string;
  content: string;
  tags?: string[];
}
