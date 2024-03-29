import { IonContent, IonPage } from "@ionic/react";
import { Card, CardHeader, CardContent, CardTitle, Button, Input, Label, Separator, Skeleton } from "@trashtrack/ui";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import Fuse from "fuse.js";

import { useTrashBinQuery } from "../../../queries/get-trash-bin-query";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

interface TrashBin {
    id: number;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    createdAt: string;
}

export function ComplainFormTempatSampah() {
    const { data, isLoading } = useTrashBinQuery();
    const history = useHistory();
    const [searchTerm, setSearchTerm] = useState("");
    const { t } = useTranslation();

    const fuseOptions = {
        keys: ["name"],
        threshold: 0.4,
    };

    function filterAndSortLatest(data: TrashBin[]) {
        return data
            .filter((trashbin) => dayjs(trashbin.createdAt))
            .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
    }

    const fuse = new Fuse(!isLoading ? (filterAndSortLatest(data.data) as TrashBin[]) : [], fuseOptions);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredData: any[] =
        !isLoading && searchTerm === ""
            ? filterAndSortLatest(data.data)
            : fuse.search(searchTerm).map((result) => result.item);

    return (
        <IonPage>
            <IonContent className="complain-form-tempat-sampah ion-padding" fullscreen>
                <div className="pt-12">
                    <h1 className="font-bold text-left text-xl">TrashTrack</h1>
                    <p className="text-xs text-left text-slate-600">{t("complain.form.tempat-sampah.title")}</p>
                </div>
                <div className="flex flex-col pt-8 gap-4">
                    <div className="flex flex-col">
                        <Label className="mb-2" htmlFor="search">
                            {t("complain.form.tempat-sampah.search")}
                        </Label>
                        <Input
                            id="search"
                            type="text"
                            placeholder={t("complain.form.tempat-sampah.search-input")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Separator className="my-4" />
                    {isLoading ? (
                        <Card className="flex flex-col">
                            <CardHeader>
                                <Skeleton className="h-4 w-20" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-4 w-40" />
                            </CardContent>
                        </Card>
                    ) : filteredData.length === 0 && searchTerm !== "" ? (
                        <Card className="flex flex-col">
                            <CardHeader className="text-left">
                                <CardTitle className="text-lg">{t("complain.form.tempat-sampah.no-results")}</CardTitle>
                            </CardHeader>
                        </Card>
                    ) : (
                        filteredData.map((trashBin) => (
                            <Card className="flex flex-col" key={trashBin.id}>
                                <CardContent className="pt-8">
                                    <p className="text-left text-xs">{trashBin.name}</p> <br />
                                    <p className="text-left text-xs">{trashBin.description}</p>
                                    <div className="mt-4">
                                        <Button
                                            className="font-bold text-xs w-full"
                                            variant={"secondary"}
                                            onClick={() => history.push(`/complain/tabs/form/laporan/${trashBin.id}`)}
                                        >
                                            {t("complain.form.tempat-sampah.button.report")}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
}

export default ComplainFormTempatSampah;
