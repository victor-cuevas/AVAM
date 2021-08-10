export enum AmmMassnahmenCode {
    AZ = '1',
    EAZ = '2',
    PEWO = '3',
    FSE = '4',
    KURS = '5',
    INDIVIDUELL_AP = '6',
    BP = '7',
    PVB = '8',
    UEF = '9',
    SEMO = '10',
    INDIVIDUELL_BP = '11',
    INDIVIDUELL_KURS = '12',
    INDIVIDUELL_KURS_IM_ANGEBOT = '13',
    INFOTAG = '14',
    AP = '15'
}

export enum AmmMassnahmenStrukturElCode {
    AMM_MASSNAHMENTYP_AMM_CODE = '1000',
    AMM_MASSNAHMENTYP_BILDUNG_CODE = '1100',
    AMM_MASSNAHMENTYP_BESCHAEFTIGUNG_CODE = '1200',
    AMM_MASSNAHMENTYP_SPEZIELLE_CODE = '1300',
    AMM_MASSNAHMENTYP_KURS_CODE = '1110',
    AMM_MASSNAHMENTYP_UF_CODE = '1120',
    AMM_MASSNAHMENTYP_AP_CODE = '1130',
    AMM_MASSNAHMENTYP_PVB_CODE = '1210',
    AMM_MASSNAHMENTYP_SEMO_CODE = '1220',
    AMM_MASSNAHMENTYP_BP_CODE = '1230',
    AMM_MASSNAHMENTYP_EAZ_CODE = '1310',
    AMM_MASSNAHMENTYP_AZ_CODE = '1320',
    AMM_MASSNAHMENTYP_PEWO_CODE = '1330',
    AMM_MASSNAHMENTYP_FSE_CODE = '1340',
    AMM_MASSNAHMENTYP_INFOTAG_CODE = '2000'
}

export function getMassnahmenStrukturElCode(ammMassnahmenType: AmmMassnahmenCode | string) {
    let ammMassnahmenStukturElCode = '';

    switch (ammMassnahmenType) {
        case AmmMassnahmenCode.INDIVIDUELL_KURS:
            ammMassnahmenStukturElCode = AmmMassnahmenStrukturElCode.AMM_MASSNAHMENTYP_KURS_CODE;
            break;
        case AmmMassnahmenCode.INDIVIDUELL_BP:
            ammMassnahmenStukturElCode = AmmMassnahmenStrukturElCode.AMM_MASSNAHMENTYP_BP_CODE;
            break;
        case AmmMassnahmenCode.INDIVIDUELL_AP:
            ammMassnahmenStukturElCode = AmmMassnahmenStrukturElCode.AMM_MASSNAHMENTYP_AP_CODE;
            break;
    }

    return ammMassnahmenStukturElCode;
}
