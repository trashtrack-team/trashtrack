import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@trashtrack/utils";

export const useGetUsersQuery = () => {
    return useQuery({
        queryKey: ["getUsers1"],
        queryFn: () => fetch(API_URL + `/user`).then((res) => res.json()),
    });
};
