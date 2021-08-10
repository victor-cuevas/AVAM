import { Injectable } from '@angular/core';
import { AmmBewirtschaftungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { NavigationService } from '@app/shared/services/navigation-service';
import { AmmZulassungstypCode } from '@app/shared/enums/domain-code/amm-zulassungstyp-code.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { PlanwerttypEnum } from '@app/shared/enums/domain-code/planwerttyp.enum';

@Injectable()
export class AmmBewirtschaftungNavigationHelper {
    constructor(private navigationService: NavigationService) {}

    public setProduktDynamicNavigation(inPlanungSichtbar: boolean) {
        if (inPlanungSichtbar) {
            this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_PRODUKT_PLANWERTE);
        } else {
            this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_PRODUKT_PLANWERTE);
        }
    }

    public setMassnahmeStaticNavigation(massnahmeId: number, durchfuehrungseinheitType: MassnahmeDTO.DurchfuehrungseinheitTypeEnum, zulassungstypObject: CodeDTO) {
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_MASSNAHMEN, {
            massnahmeId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_GRUNDDATEN, {
            massnahmeId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_BESCHREIBUNG, {
            massnahmeId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_DURCHFUEHRUNGSORT, {
            massnahmeId
        });
        if (durchfuehrungseinheitType === MassnahmeDTO.DurchfuehrungseinheitTypeEnum.SESSION) {
            this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_KURSE, {
                massnahmeId
            });
        } else {
            this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_STANDORTE, {
                massnahmeId
            });
        }
        if (zulassungstypObject.code === AmmZulassungstypCode.INDIV_AB_MASSNAHME) {
            this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_KOSTEN, {
                massnahmeId
            });
            this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_TEILNEHMERLISTE, {
                massnahmeId
            });
        }
    }

    public setMassnahmeDynamicNavigation(massnahmeId: number, inPlanungAkquisitionSichtbar: boolean, zulassungstypObject: CodeDTO) {
        if (inPlanungAkquisitionSichtbar) {
            this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_PLANWERTE, {
                massnahmeId
            });

            if (zulassungstypObject.code !== AmmZulassungstypCode.INDIV_AB_MASSNAHME) {
                this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_VERTRAGSWERTE, {
                    massnahmeId
                });
            } else {
                this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_VERTRAGSWERTE);
            }
        } else {
            this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_PLANWERTE);
            this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_VERTRAGSWERTE);
        }

        if (zulassungstypObject.code === AmmZulassungstypCode.INDIV_AB_MASSNAHME) {
            this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_KOSTEN, {
                massnahmeId
            });
            this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_TEILNEHMERLISTE, {
                massnahmeId
            });
        } else {
            this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_KOSTEN);
            this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_TEILNEHMERLISTE);
        }
    }

    public setKurseDynamicNavigation(massnahmeId: number, dfeId: number, inPlanungAkquisitionSichtbar: boolean, showWartelisteSideNav: boolean, isMassnahmeKollektiv: boolean) {
        if (isMassnahmeKollektiv) {
            this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS_RESERVIERTE_PLAETZE, {
                massnahmeId,
                dfeId
            });
        } else {
            this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS_RESERVIERTE_PLAETZE);
        }

        if (inPlanungAkquisitionSichtbar) {
            this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS_PLANWERTE, {
                massnahmeId,
                dfeId
            });
            this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS_VERTRAGSWERTEE, {
                massnahmeId,
                dfeId
            });
        } else {
            this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS_PLANWERTE);
            this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS_VERTRAGSWERTEE);
        }

        if (showWartelisteSideNav) {
            this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS_WARTELISTE, {
                massnahmeId,
                dfeId
            });
        } else {
            this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS_WARTELISTE);
        }
    }

    public setKurseStaticNavigation(massnahmeId: number, dfeId: number) {
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS, {
            massnahmeId,
            dfeId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS_GRUNDDATEN, {
            massnahmeId,
            dfeId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS_BESCHREIBUNG, {
            massnahmeId,
            dfeId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS_DURCHFUEHRUNGSORT, {
            massnahmeId,
            dfeId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS_TEILNEHMERLISTE, {
            massnahmeId,
            dfeId
        });
    }

    public setStandortDynamicNavigation(massnahmeId: number, dfeId: number, apkPraktikumsstelleVerwalten: boolean, isApBp: boolean, inPlanungAkquisitionSichtbar: boolean) {
        if (!apkPraktikumsstelleVerwalten) {
            this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_TEILNEHMER_PLAETZE, {
                massnahmeId,
                dfeId
            });
        } else {
            this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_TEILNEHMER_PLAETZE);
        }

        if (!isApBp && apkPraktikumsstelleVerwalten) {
            this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_ABREITSKATEGORIEN, {
                massnahmeId,
                dfeId
            });
        } else {
            this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_ABREITSKATEGORIEN);
        }

        if (isApBp && apkPraktikumsstelleVerwalten) {
            this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_PRAKTIKUMSSTELLEN, {
                massnahmeId,
                dfeId
            });
        } else {
            this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_PRAKTIKUMSSTELLEN);
        }

        if (inPlanungAkquisitionSichtbar) {
            this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_PLANWERTE, {
                massnahmeId,
                dfeId
            });
            this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_VERTRAGSWERTE, {
                massnahmeId,
                dfeId
            });
        } else {
            this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_PLANWERTE);
            this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_VERTRAGSWERTE);
        }
    }

    public setStandortStaticNavigation(massnahmeId: number, dfeId: number) {
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT, {
            massnahmeId,
            dfeId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_GRUNDDATEN, {
            massnahmeId,
            dfeId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_BESCHREIBUNG, {
            massnahmeId,
            dfeId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_DURCHFUEHRUNGSORT, {
            massnahmeId,
            dfeId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_TEILNEHMERLISTE, {
            massnahmeId,
            dfeId
        });
    }

    public setArbeitsplatzkategorieStaticNavigation(massnahmeId: number, dfeId: number, beId: number) {
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_ABREITSKATEGORIE, {
            massnahmeId,
            dfeId,
            beId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_ABREITSKATEGORIE_GRUNDDATEN, {
            massnahmeId,
            dfeId,
            beId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_ABREITSKATEGORIE_BESCHREIBUNG, {
            massnahmeId,
            dfeId,
            beId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_ABREITSKATEGORIE_DURCHFUEHRUNGSORT, {
            massnahmeId,
            dfeId,
            beId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_ABREITSKATEGORIE_TEILNEHMERLISTE, {
            massnahmeId,
            dfeId,
            beId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_ABREITSKATEGORIE_TEILNEHMERPLAETZE, {
            massnahmeId,
            dfeId,
            beId
        });
    }

    public setPraktikumsstelleStaticNavigation(massnahmeId: number, dfeId: number, beId: number) {
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_PRAKTIKUMSSTELLE, {
            massnahmeId,
            dfeId,
            beId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_PRAKTIKUMSSTELLE_GRUNDDATEN, {
            massnahmeId,
            dfeId,
            beId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_PRAKTIKUMSSTELLE_BESCHREIBUNG, {
            massnahmeId,
            dfeId,
            beId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_PRAKTIKUMSSTELLE_DURCHFUEHRUNGSORT, {
            massnahmeId,
            dfeId,
            beId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_PRAKTIKUMSSTELLE_TEILNEHMERLISTE, {
            massnahmeId,
            dfeId,
            beId
        });
        this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_PRAKTIKUMSSTELLE_TEILNEHMERPLAETZE, {
            massnahmeId,
            dfeId,
            beId
        });
    }

    public setPlanwertStaticNavigation(type: string, planwertId: number, massnahmeId?: number, dfeId?: number) {
        switch (type) {
            case PlanwerttypEnum.PRODUKT:
                this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_PRODUKT_PLANWERT, { planwertId });
                this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_PRODUKT_PLANWERT_DETAIL, { planwertId });
                this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_PRODUKT_PLANWERT_CONTROLLINGWERTE, { planwertId });
                break;
            case PlanwerttypEnum.MASSNAHME:
                this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_PLANWERT, { massnahmeId, planwertId });
                this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_PLANWERT_DETAIL, { massnahmeId, planwertId });
                this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_PLANWERT_CONTROLLINGWERTE, { massnahmeId, planwertId });
                break;
            case PlanwerttypEnum.KURS:
                this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS_PLANWERT, { massnahmeId, dfeId, planwertId });
                this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS_PLANWERT_DETAIL, { massnahmeId, dfeId, planwertId });
                this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS_PLANWERT_CONTROLLINGWERTE, { massnahmeId, dfeId, planwertId });
                break;
            case PlanwerttypEnum.STANDORT:
                this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_PLANWERT, { massnahmeId, dfeId, planwertId });
                this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_PLANWERT_DETAIL, { massnahmeId, dfeId, planwertId });
                this.navigationService.showNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_PLANWERT_CONTROLLINGWERTE, { massnahmeId, dfeId, planwertId });
                break;
            default:
                break;
        }
    }

    public hidePlanwertStaticNavigation(type: string) {
        switch (type) {
            case PlanwerttypEnum.PRODUKT:
                this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_PRODUKT_PLANWERT);
                break;
            case PlanwerttypEnum.MASSNAHME:
                this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_MASSNAHME_PLANWERT);
                break;
            case PlanwerttypEnum.KURS:
                this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS_PLANWERT);
                break;
            case PlanwerttypEnum.STANDORT:
                this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_STANDORT_PLANWERT);
                break;
            default:
                break;
        }
    }
}
