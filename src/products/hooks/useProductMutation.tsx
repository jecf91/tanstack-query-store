import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, productActions } from "..";

export const useProductMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: productActions.createProduct,
    onMutate: (data) => {
      console.log("mutate - optimistic update");
      //Optimistic Product
      console.log(data);
      const optimisticProduct = { id: Math.random(), ...data };
      //store optimistic product in query client cache
      queryClient.setQueryData<Product[]>(
        ["products", { filterKey: optimisticProduct.category }],
        (oldState) => {
          if (!oldState) {
            return [optimisticProduct];
          }
          return [...oldState, optimisticProduct];
        }
      );
      //CONTEXT FOR ON SUCCESS
      return { optimisticProduct };
    },
    onSuccess: (result, variables, context) => {
      console.log("product created");
      console.log({ result, variables, context });

      //INVALIDATE QUERY EXAMPLE
      //   queryClient.invalidateQueries({
      //     queryKey: ["products", { filterKey: result.category }],
      //   });

      //REMOVE PREFETCH QUERY FOR OPTIMISTIC PRODUCT
      queryClient.removeQueries({
        queryKey: ["products", context?.optimisticProduct?.id],
      });

      queryClient.setQueryData<Product[]>(
        ["products", { filterKey: result.category }],
        (oldState) => {
          if (!oldState) {
            return [result];
          }

          return oldState.map((cachedState) => {
            return cachedState.id === context?.optimisticProduct?.id
              ? result
              : cachedState;
          });
        }
      );
    },

    //OPTMISTIC ERROR FALLBACK
    onError: (error, variables, context) => {
      console.log({ error, variables, context });

      queryClient.removeQueries({
        queryKey: ["products", context?.optimisticProduct?.id],
      });

      queryClient.setQueryData<Product[]>(
        ["products", { filterKey: variables.category }],
        (oldState) => {
          if (!oldState) {
            return [];
          }

          return oldState.filter((cachedState) => {
            return cachedState.id !== context?.optimisticProduct?.id;
          });
        }
      );
    },
  });

  return mutation;
};
