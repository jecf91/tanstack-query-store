import { useQueryClient } from "@tanstack/react-query";
import { productActions } from "..";

export const usePrefetchProduct = () => {
  const queryClient = useQueryClient();
  const prefetchProduct = async (id: number) => {
    queryClient.prefetchQuery({
      queryKey: ["products", { id }],
      queryFn: () => productActions.getProductById(id),
    });
  };
  return prefetchProduct;
};
