
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
    staleTime?: number;
    cacheKey?: string;
  } = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [count, setCount] = useState<number>(0);
  const { loading, setLoading, error, setError, resetState } = useSupabaseState();
  const { isAuthenticated } = useAuth();
  const [lastFetched, setLastFetched] = useState<number>(0);
  const [cache, setCache] = useState<Map<string, {data: T[], timestamp: number, count: number}>>(new Map());

  const {
    columns = '*',
    filters = {},
    orderBy,
    limit = 100,
    page = 0,
    foreignTable,
    enabled = true,
    staleTime = 60000, // 1 minute cache by default
    cacheKey
  } = options;

  const generateCacheKey = useCallback(() => {
    return cacheKey || `${tableName}-${JSON.stringify(filters)}-${orderBy?.column}-${orderBy?.ascending}-${limit}-${page}-${foreignTable}-${columns}`;
  }, [tableName, filters, orderBy, limit, page, foreignTable, columns, cacheKey]);

  const fetchData = useCallback(async (options = { force: false }) => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const currentCacheKey = generateCacheKey();
    const now = Date.now();
    const cachedData = cache.get(currentCacheKey);
    
    // Return cached data if it's not stale and we're not forcing a refresh
    if (!options.force && cachedData && (now - cachedData.timestamp) < staleTime) {
      setData(cachedData.data);
      setCount(cachedData.count);
      setLoading(false);
      return;
    }

    resetState();

    try {
      console.log(`Fetching data from ${tableName} table with filters:`, filters);
      
      // Check connection before proceeding with retry mechanism
      const isConnected = await checkConnection(tableName, 2);
      if (!isConnected) {
        throw new Error(`Unable to connect to Supabase table: ${tableName}`);
      }
      
      // Get count first - only when needed
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

      // Apply filters with performance optimizations
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
      
      // Update the cache
      cache.set(currentCacheKey, {
        data: fetchedData as T[],
        timestamp: now,
        count: totalCount || 0
      });
      setCache(new Map(cache));
      
      setData(fetchedData as T[]);
      setLastFetched(now);
    } catch (err: any) {
      handleSupabaseError(err as Error, 'query');
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, tableName, JSON.stringify(filters), orderBy?.column, orderBy?.ascending, limit, page, foreignTable, enabled, columns, cache, staleTime, generateCacheKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Provide a function to clear the cache
  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  return { 
    data, 
    count, 
    loading, 
    error, 
    refetch: (options = { force: true }) => fetchData(options),
    clearCache,
    lastFetched
  };
}
