
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

// Define valid table names as a literal type
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

  const fetchData = async () => {
    if (!isAuthenticated || !enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching data from ${tableName} table with filters:`, filters);
      
      // Get count first
      const countQuery = supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      // Apply filters to count query
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
      
      if (countError) {
        console.error("Error getting count:", countError);
        throw countError;
      }
      
      if (totalCount !== null) {
        setCount(totalCount);
        console.log(`Total count for ${tableName}:`, totalCount);
      }

      // Build main query
      let query = supabase
        .from(tableName)
        .select(foreignTable ? `${columns}, ${foreignTable}(*)` : columns);

      // Apply filters
      let filteredQuery: any = query;
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            filteredQuery = filteredQuery.in(key, value);
          } else {
            filteredQuery = filteredQuery.eq(key, value);
          }
        }
      });

      // Apply ordering
      if (orderBy) {
        filteredQuery = filteredQuery.order(orderBy.column, {
          ascending: orderBy.ascending ?? true
        });
      }

      // Apply pagination
      if (limit) {
        filteredQuery = filteredQuery.range(page * limit, (page + 1) * limit - 1).limit(limit);
      }

      const { data: fetchedData, error: fetchError } = await filteredQuery;

      if (fetchError) {
        console.error("Error fetching data:", fetchError);
        throw fetchError;
      }
      
      console.log(`Retrieved ${fetchedData?.length || 0} rows from ${tableName}:`, fetchedData);
      setData(fetchedData as T[]);
    } catch (err: any) {
      console.error("Supabase query error:", err);
      setError(err as Error);
      toast.error(`Error fetching data: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated, tableName, JSON.stringify(filters), orderBy?.column, orderBy?.ascending, limit, page, foreignTable, enabled]);

  return { data, count, loading, error, refetch: fetchData };
}

export function useMutateSupabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const insert = async <T>(tableName: TableName, data: Partial<T>) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Inserting data into ${tableName}:`, data);
      
      if (!data) {
        throw new Error("No data provided for insert");
      }
      
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data as any)
        .select();

      if (error) {
        console.error(`Error inserting into ${tableName}:`, error);
        throw error;
      }
      
      console.log(`Successfully inserted into ${tableName}:`, result);
      return result;
    } catch (err: any) {
      console.error("Insert error:", err);
      setError(err as Error);
      toast.error(`Error inserting data: ${err.message || 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async <T>(tableName: TableName, id: string, data: Partial<T>) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Updating data in ${tableName} for id ${id}:`, data);
      
      if (!id) {
        throw new Error("No ID provided for update");
      }
      
      if (!data) {
        throw new Error("No data provided for update");
      }
      
      const { data: result, error } = await supabase
        .from(tableName)
        .update(data as any)
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error updating ${tableName}:`, error);
        throw error;
      }
      
      console.log(`Successfully updated ${tableName}:`, result);
      return result;
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err as Error);
      toast.error(`Error updating data: ${err.message || 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (tableName: TableName, id: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Deleting data from ${tableName} for id ${id}`);
      
      if (!id) {
        throw new Error("No ID provided for delete");
      }
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting from ${tableName}:`, error);
        throw error;
      }
      
      console.log(`Successfully deleted from ${tableName} for id ${id}`);
      return true;
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err as Error);
      toast.error(`Error deleting data: ${err.message || 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { insert, update, remove, loading, error };
}
