
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

// Use string literal type for tables that match the Supabase database schema
export type TableName = 'profiles' | 'patients' | 'clinics' | 'follow_ups' | 'settings';

// Utility function to check connection to Supabase with improved error handling and retry logic
export const checkConnection = async (tableName: TableName, retryCount = 1): Promise<boolean> => {
  try {
    console.log(`Checking connection to ${tableName} table...`);
    
    const connectionTest = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .limit(1);
    
    if (connectionTest.error) {
      console.error(`Connection error to table ${tableName}:`, connectionTest.error);
      
      // Retry logic for transient errors
      if (retryCount > 0 && (connectionTest.error.code === 'PGRST116' || connectionTest.error.code === '409')) {
        console.log(`Retrying connection to ${tableName}...`);
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(checkConnection(tableName, retryCount - 1));
          }, 1000);
        });
      }
      
      return false;
    }
    
    console.log(`Successfully connected to ${tableName} table.`);
    return true;
  } catch (err) {
    console.error("Supabase connection error:", err);
    return false;
  }
};

// Improved error handling function with better user feedback
export const handleSupabaseError = (error: Error, operation: string): void => {
  console.error(`Supabase ${operation} error:`, error);
  
  // Provide more user-friendly error messages based on error codes
  let userMessage = error.message || 'Unknown error';
  
  if (error.message?.includes('JWT')) {
    userMessage = 'Authentication error. Please log in again.';
  } else if (error.message?.includes('network')) {
    userMessage = 'Network error. Please check your internet connection.';
  } else if (error.message?.includes('timeout')) {
    userMessage = 'Request timed out. Please try again.';
  }
  
  toast.error(`Error ${operation}: ${userMessage}`);
};

// Hook for loading and error state management with performance optimizations
export function useSupabaseState() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  return {
    loading,
    setLoading,
    error,
    setError,
    resetState: () => {
      setLoading(true);
      setError(null);
    }
  };
}

// Apply filters to a Supabase query with improved performance
export function applyFilters(query: any, filters: Record<string, any>) {
  if (!filters || Object.keys(filters).length === 0) {
    return query;
  }
  
  let filteredQuery = query;
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          filteredQuery = filteredQuery.in(key, value);
        }
      } else if (typeof value === 'string' && value.includes('%')) {
        filteredQuery = filteredQuery.ilike(key, value);
      } else {
        filteredQuery = filteredQuery.eq(key, value);
      }
    }
  });
  
  return filteredQuery;
}
