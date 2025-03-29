
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  TableName, 
  checkConnection, 
  handleSupabaseError, 
  useSupabaseState,
  applyFilters 
} from './useSupabaseUtils';

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
  const { loading, setLoading, error, setError, resetState } = useSupabaseState();
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
    if (!enabled) {
      setLoading(false);
      return;
    }

    resetState();

    try {
      console.log(`Fetching data from ${tableName} table with filters:`, filters);
      
      // Check connection before proceeding
      const isConnected = await checkConnection(tableName);
      if (!isConnected) {
        throw new Error(`Unable to connect to Supabase table: ${tableName}`);
      }
      
      // Get count first
      const countQuery = supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      // Apply filters to count query
      const filteredCountQuery = applyFilters(countQuery, filters);
      
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
      let filteredQuery = applyFilters(query, filters);

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
      handleSupabaseError(err as Error, 'query');
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, tableName, JSON.stringify(filters), orderBy?.column, orderBy?.ascending, limit, page, foreignTable, enabled, columns]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, count, loading, error, refetch: fetchData };
}
