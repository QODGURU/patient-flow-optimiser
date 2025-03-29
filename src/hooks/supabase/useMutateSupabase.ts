
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { 
  TableName, 
  checkConnection, 
  handleSupabaseError,
  useSupabaseState
} from './useSupabaseUtils';

export function useMutateSupabase() {
  const { loading, setLoading, error, setError, resetState } = useSupabaseState();

  const insert = async <T>(tableName: TableName, data: T) => {
    resetState();

    try {
      console.log(`Inserting data into ${tableName}:`, data);
      
      if (!data) {
        throw new Error("No data provided for insert");
      }
      
      // First verify connection
      const isConnected = await checkConnection(tableName);
      if (!isConnected) {
        throw new Error(`Database connection error: Unable to connect to ${tableName}`);
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
      handleSupabaseError(err as Error, 'insert');
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async <T>(tableName: TableName, id: string, data: Partial<T>) => {
    resetState();

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
      handleSupabaseError(err as Error, 'update');
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (tableName: TableName, id: string) => {
    resetState();

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
      handleSupabaseError(err as Error, 'delete');
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { insert, update, remove, loading, error };
}
