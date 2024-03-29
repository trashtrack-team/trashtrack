import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@trashtrack/utils";

export const useGetPelaporQuery = (nik: number | undefined, isEnabled: boolean) => {
    return useQuery({
        queryKey: ["getPelaporData"],
        queryFn: () => fetch(API_URL + `/report/nik/${nik}`).then((res) => res.json()),
        enabled: isEnabled,
    });
};
