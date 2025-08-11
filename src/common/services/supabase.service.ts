import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );

    this.supabaseAdmin = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
  }

  // Cliente público (para operaciones del usuario)
  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Cliente admin (para operaciones del servidor)
  getAdminClient(): SupabaseClient {
    return this.supabaseAdmin;
  }

  // Métodos específicos para PostgREST
  async queryTable(table: string, query: any = {}) {
    const { data, error } = await this.supabase
      .from(table)
      .select('*')
      .match(query);
    
    if (error) throw error;
    return data;
  }

  async insertRecord(table: string, record: any) {
    const { data, error } = await this.supabase
      .from(table)
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateRecord(table: string, id: number, updates: any) {
    const { data, error } = await this.supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteRecord(table: string, id: number) {
    const { error } = await this.supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Métodos para Supabase Storage
  async uploadImage(
    bucket: string,
    path: string,
    file: Buffer | string,
    contentType: string = 'image/webp'
  ): Promise<string> {
    const { data, error } = await this.supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: false
      });

    if (error) throw error;

    // Obtener URL pública
    const { data: urlData } = this.supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);

    return urlData.publicUrl;
  }

  async uploadBase64Image(
    bucket: string,
    path: string,
    base64Data: string
  ): Promise<string> {
    // Remover prefijo data:image/...;base64, si está presente
    const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Convertir base64 a buffer
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    return this.uploadImage(bucket, path, imageBuffer);
  }

  async deleteImage(bucket: string, path: string): Promise<boolean> {
    const { error } = await this.supabaseAdmin.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return true;
  }

  async listImages(bucket: string, folder?: string): Promise<string[]> {
    const { data, error } = await this.supabaseAdmin.storage
      .from(bucket)
      .list(folder || '');

    if (error) throw error;
    
    return data.map(item => item.name);
  }

  // Método para generar nombre único de archivo
  generateUniqueFileName(originalName: string, prefix: string = ''): string {
    const timestamp = Date.now();
    const cleanName = originalName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    return `${prefix}${timestamp}_${cleanName}`;
  }
} 