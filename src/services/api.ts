/**
 * API Service
 * 
 * This service handles all API calls to the backend.
 * It provides methods for CRUD operations on documents and other resources.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Document, DocumentElement } from '../types/document';

// API base URL
const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';

/**
 * API Service class
 */
class ApiService {
  private api: AxiosInstance;
  
  /**
   * Constructor
   */
  constructor() {
    // Create axios instance
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle specific error cases
        if (error.response) {
          // Server responded with an error status
          if (error.response.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Get all documents
   * 
   * @returns {Promise<Document[]>} Array of documents
   */
  async getDocuments(): Promise<Document[]> {
    try {
      const response = await this.api.get<Document[]>('/documents');
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }
  
  /**
   * Get a document by ID
   * 
   * @param {string} id - Document ID
   * @returns {Promise<Document>} Document
   */
  async getDocument(id: string): Promise<Document> {
    try {
      const response = await this.api.get<Document>(`/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching document ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new document
   * 
   * @param {Partial<Document>} document - Document data
   * @returns {Promise<Document>} Created document
   */
  async createDocument(document: Partial<Document>): Promise<Document> {
    try {
      const response = await this.api.post<Document>('/documents', document);
      return response.data;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }
  
  /**
   * Update a document
   * 
   * @param {string} id - Document ID
   * @param {Partial<Document>} document - Document data
   * @returns {Promise<Document>} Updated document
   */
  async updateDocument(id: string, document: Partial<Document>): Promise<Document> {
    try {
      const response = await this.api.put<Document>(`/documents/${id}`, document);
      return response.data;
    } catch (error) {
      console.error(`Error updating document ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a document
   * 
   * @param {string} id - Document ID
   * @returns {Promise<void>}
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      await this.api.delete(`/documents/${id}`);
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Export a document to PDF
   * 
   * @param {string} id - Document ID
   * @returns {Promise<Blob>} PDF blob
   */
  async exportDocumentToPdf(id: string): Promise<Blob> {
    try {
      const response = await this.api.get(`/documents/${id}/export/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Error exporting document ${id} to PDF:`, error);
      throw error;
    }
  }
  
  /**
   * Upload an image
   * 
   * @param {File} file - Image file
   * @returns {Promise<string>} Image URL
   */
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await this.api.post<{ url: string }>('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
  
  /**
   * Get user profile
   * 
   * @returns {Promise<any>} User profile
   */
  async getUserProfile(): Promise<any> {
    try {
      const response = await this.api.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
  
  /**
   * Update user profile
   * 
   * @param {any} profile - User profile data
   * @returns {Promise<any>} Updated user profile
   */
  async updateUserProfile(profile: any): Promise<any> {
    try {
      const response = await this.api.put('/user/profile', profile);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
  
  /**
   * Login user
   * 
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{ token: string }>} Authentication token
   */
  async login(email: string, password: string): Promise<{ token: string }> {
    try {
      const response = await this.api.post<{ token: string }>('/auth/login', {
        email,
        password
      });
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }
  
  /**
   * Register user
   * 
   * @param {string} name - User name
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{ token: string }>} Authentication token
   */
  async register(name: string, email: string, password: string): Promise<{ token: string }> {
    try {
      const response = await this.api.post<{ token: string }>('/auth/register', {
        name,
        email,
        password
      });
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      return response.data;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  }
  
  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('token');
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export default for convenience
export default apiService;
