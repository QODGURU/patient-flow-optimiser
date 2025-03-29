
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

// Use string literal type for tables 
export type TableName = 'profiles' | 'patients' | 'clinics' | 'follow_ups' | 'settings';

// Utility function to check connection to Supabase
export const checkConnection = async (tableName: TableName): Promise<boolean> => {
  try {
    const connectionTest = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (connectionTest.error) {
      console.error(`Connection error to table ${tableName}:`, connectionTest.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase connection error:", err);
    return false;
  }
};

// Shared error handling function
export const handleSupabaseError = (error: Error, operation: string): void => {
  console.error(`Supabase ${operation} error:`, error);
  toast.error(`Error ${operation}: ${error.message || 'Unknown error'}`);
};

// Hook for loading and error state management
export function useSupabaseState() {
  const [loading, setLoading] = useState<boolean>(true);
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

// Apply filters to a Supabase query
export function applyFilters(query: any, filters: Record<string, any>) {
  let filteredQuery = query;
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        filteredQuery = filteredQuery.in(key, value);
      } else {
        filteredQuery = filteredQuery.eq(key, value);
      }
    }
  });
  
  return filteredQuery;
}
