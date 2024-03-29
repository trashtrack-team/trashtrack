import {
    IonContent,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    RefresherEventDetail,
    useIonViewDidEnter,
} from "@ionic/react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Separator, Skeleton } from "@trashtrack/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useHistory, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { useState } from "react";
import { useGetHistories } from "./get-history.query";
import { useTranslation } from "react-i18next";

interface InterfaceHistory {
    id: number;
    subTrashBinId: number;
    maxCapacity: number;
    currentCapacity: number;
    createdAt: string;
}

export function TrashPage() {
    const history = useHistory();
    const queryClient = useQueryClient();
    const { trashbin_id, subtrashbin_id } = useParams<{ trashbin_id: string; subtrashbin_id: string }>();
    const [filterType, setFilterType] = useState<"latest" | "oldest" | "none">("latest");

    const { data: historyData, isLoading, isFetching, isError, error, refetch } = useGetHistories();

    useIonViewDidEnter(() => {
        queryClient.invalidateQueries({
            queryKey: ["useGetHistories"],
        });

        refetch();
    });
    const { t } = useTranslation();

    const filteredDataForId = !isLoading
        ? historyData.data.filter((trash: InterfaceHistory) => trash.subTrashBinId === Number(subtrashbin_id))
        : [];

    const applyDateFilter = (trashItems: InterfaceHistory[]) => {
        if (filterType === "latest") {
            return trashItems.sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
        } else if (filterType === "oldest") {
            return trashItems.sort((a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf());
        } else {
            return trashItems;
        }
    };

    const sortedData = applyDateFilter(filteredDataForId);

    function handleFilterClick(type: "latest" | "oldest") {
        setFilterType(type);
    }

    function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
        queryClient.invalidateQueries({
            queryKey: ["useGetHistories"],
        });

        refetch();
        event.detail.complete();
    }

    return (
        <IonPage>
            <IonContent className="ion-padding" fullscreen>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent>
                        <p className="text-xs text-center">Refreshing...</p>
                    </IonRefresherContent>
                </IonRefresher>
                <div className="pt-12">
                    <h1 className="font-bold text-left text-xl">TrashTrack</h1>
                    <p className="text-xs text-left text-slate-600">{t("operator.subtrashbin.history.subtitle")}</p>
                </div>
                <div className="flex flex-col pt-8 gap-2">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2">
                            <Button variant="secondary" className="w-full" onClick={() => handleFilterClick("latest")}>
                                {t("operator.subtrashbin.history.filter_newest")}
                            </Button>
                            <Button variant="secondary" className="w-full" onClick={() => handleFilterClick("oldest")}>
                                {t("operator.subtrashbin.history.filter_oldest")}
                            </Button>
                        </div>
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => history.push(`/trash-bin/tabs/trashbin/subtrashbin/${trashbin_id}`)}
                        >
                            {t("operator.subtrashbin.history.back")}
                        </Button>
                    </div>
                    <Separator className="my-4" />

                    {isLoading || isFetching
                        ? Array.from({ length: 5 }).map((_, index) => (
                              <Card key={index} className="flex flex-col mt-4">
                                  <CardContent className="pt-4">
                                      <CardHeader>
                                          <Skeleton className="h-4 w-40" />
                                      </CardHeader>
                                      <CardContent className="flex flex-col gap-2">
                                          <Skeleton className="h-4 w-full" />
                                          <Skeleton className="h-4 w-full" />
                                          <Skeleton className="h-4 w-full" />
                                      </CardContent>
                                  </CardContent>
                              </Card>
                          ))
                        : sortedData.map((subtrashbin: InterfaceHistory) => (
                              <Card key={subtrashbin.id} className="flex flex-col mt-4">
                                  <CardContent className="pt-4">
                                      <div className="flex flex-col gap-2">
                                          <p className="text-xs text-left">
                                              {subtrashbin?.currentCapacity === 0
                                                  ? "0.00% / 100%"
                                                  : (
                                                        100 -
                                                        ((subtrashbin?.currentCapacity as number) /
                                                            (subtrashbin?.maxCapacity ?? 0)) *
                                                            100
                                                    ).toFixed(2) + "% / 100%"}
                                          </p>
                                          <p className="text-xs text-left">
                                              {dayjs(subtrashbin.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                                          </p>
                                      </div>
                                  </CardContent>
                              </Card>
                          ))}
                    {isError && (
                        <Card className="flex flex-col mt-4">
                            <CardContent className="pt-4">
                                <p className="text-center text-xs">{JSON.stringify(error)}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
}

export default TrashPage;
