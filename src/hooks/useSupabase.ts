import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

// Use string literal type for tables instead of using api_configurations which isn't in the database schema
type TableName = 'profiles' | 'patients' | 'clinics' | 'follow_ups' | 'settings';

export function useSupabaseQuery<T>(
  tableName: TableName,
  options: {
    columns?: string;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    page?: number;
    foreignTable?: string;
    enabled?: boolean;
  } = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated } = useAuth();

  const {
    columns = '*',
    filters = {},
    orderBy,
    limit = 100,
    page = 0,
    foreignTable,
    enabled = true
  } = options;

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get count first
      const countQuery = supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      let filteredCountQuery: any = countQuery;
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            filteredCountQuery = filteredCountQuery.in(key, value);
          } else {
            filteredCountQuery = filteredCountQuery.eq(key, value);
          }
        }
      });
      
      const { count: totalCount, error: countError } = await filteredCountQuery;
      
      if (countError) throw countError;
      
      if (totalCount !== null) {
        setCount(totalCount);
      }

      // Build main query
      let query = supabase
        .from(tableName)
        .select(foreignTable ? `${columns}, ${foreignTable}(*)` : columns);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, {
          ascending: orderBy.ascending ?? true
        });
      }

      // Apply pagination
      if (limit) {
        query = query.range(page * limit, (page + 1) * limit - 1);
      }

      const { data: fetchedData, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      setData(fetchedData as T[]);
    } catch (err: any) {
      console.error("Supabase query error:", err);
      setError(err);
      if (err.message.includes("JWT expired")) {
        toast.error("Your session has expired. Please log in again.");
      } else if (err.message.includes("row-level security")) {
        toast.error("You don't have permission to access this data.");
      } else {
        toast.error(`Error fetching data: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, tableName, JSON.stringify(filters), orderBy?.column, orderBy?.ascending, limit, page, foreignTable, enabled, columns]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, count, loading, error, refetch: fetchData };
}

export function useMutateSupabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated } = useAuth();

  const insert = async <T>(tableName: TableName, data: T) => {
    if (!isAuthenticated) {
      throw new Error("Authentication required");
    }

    setLoading(true);
    setError(null);

    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data as any)
        .select();

      if (error) throw error;
      
      toast.success("Data saved successfully");
      return result;
    } catch (err: any) {
      console.error("Insert error:", err);
      setError(err);
      toast.error(`Error saving data: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async <T>(tableName: TableName, id: string, data: Partial<T>) => {
    if (!isAuthenticated) {
      throw new Error("Authentication required");
    }

    setLoading(true);
    setError(null);

    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(data as any)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      toast.success("Data updated successfully");
      return result;
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err);
      toast.error(`Error updating data: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (tableName: TableName, id: string) => {
    if (!isAuthenticated) {
      throw new Error("Authentication required");
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Data deleted successfully");
      return true;
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err);
      toast.error(`Error deleting data: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { insert, update, remove, loading, error };
}
